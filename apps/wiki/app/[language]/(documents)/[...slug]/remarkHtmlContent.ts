import type {
  Element,
  Node as HastNode,
  Root as HastRoot,
  Text as HastText,
} from 'hast';
import { fromHtml } from 'hast-util-from-html';
import type {
  Break,
  Delete,
  Emphasis,
  Html,
  Image,
  Link,
  Node as MdastNode,
  Parent,
  PhrasingContent,
  Root,
  RootContent,
  Strong,
  Text,
} from 'mdast';
import { SKIP, visit } from 'unist-util-visit';

interface RemarkHtmlContentConfig {
  tags: {
    strong: boolean; // <b>, <strong>
    emphasis: boolean; // <i>, <em>
    delete: boolean; // <s>, <del>
    link: boolean; // <a>
    image: boolean; // <img>
    break: boolean; // <br>
  };
}

const defaultConfig: RemarkHtmlContentConfig = {
  tags: {
    strong: true,
    emphasis: true,
    delete: true,
    link: false,
    image: false,
    break: true,
  },
};

type TagsConfig = RemarkHtmlContentConfig['tags'];

// Helper to convert a HAST (HTML AST) to MDAST (Markdown AST)
function hastToMdast(
  node: HastNode,
  config: TagsConfig,
): MdastNode | MdastNode[] | null {
  if (node.type === 'root') {
    return (node as HastRoot).children
      .flatMap((child) => hastToMdast(child, config))
      .filter(Boolean) as MdastNode[];
  }

  if (node.type === 'text') {
    return { type: 'text', value: (node as HastText).value } as Text;
  }

  if (node.type === 'element') {
    const element = node as Element;
    const children = element.children
      .flatMap((child) => hastToMdast(child, config))
      .filter(Boolean) as PhrasingContent[];

    const tagName = element.tagName.toLowerCase();

    if (config.strong && (tagName === 'b' || tagName === 'strong')) {
      return { type: 'strong', children } as Strong;
    }
    if (config.emphasis && (tagName === 'i' || tagName === 'em')) {
      return { type: 'emphasis', children } as Emphasis;
    }
    if (config.delete && (tagName === 's' || tagName === 'del')) {
      return { type: 'delete', children } as Delete;
    }
    if (config.link && tagName === 'a') {
      return {
        type: 'link',
        url: String(element.properties?.href ?? ''),
        title: element.properties?.title
          ? String(element.properties.title)
          : null,
        children,
      } as Link;
    }
    if (config.image && tagName === 'img') {
      return {
        type: 'image',
        url: String(element.properties?.src ?? ''),
        title: element.properties?.title
          ? String(element.properties.title)
          : null,
        alt: String(element.properties?.alt ?? ''),
      } as Image;
    }
    if (config.break && tagName === 'br') {
      return { type: 'break' } as Break;
    }

    return children.length > 0 ? children : null;
  }

  return null;
}

// Main transformer function that can be called recursively
function transform(tree: Parent | Root, config: TagsConfig): void {
  visit(tree, 'html', (node: Html, index?: number, parent?: Parent) => {
    if (index === undefined || parent === undefined) {
      return;
    }

    // --- Case 1: Handle split tag pairs like `<s>...</s>` ---
    const startTagMatch = node.value.trim().match(/^<([a-zA-Z0-9]+)\s*>$/i);
    if (startTagMatch) {
      const tagName = startTagMatch[1].toLowerCase();

      let endIndex = -1;
      for (let j = index + 1; j < parent.children.length; j++) {
        const potentialEndNode = parent.children[j];
        if (potentialEndNode.type === 'html') {
          const endValue = potentialEndNode.value.trim();
          const endTagMatch = endValue.match(/^<\/([a-zA-Z0-9]+)\s*>$/i);
          const selfClosingMatch = endValue.match(/^<([a-zA-Z0-9]+)\s*\/>$/i);

          if (
            (endTagMatch && endTagMatch[1].toLowerCase() === tagName) ||
            (selfClosingMatch && selfClosingMatch[1].toLowerCase() === tagName)
          ) {
            endIndex = j;
            break;
          }
        }
      }

      if (endIndex !== -1) {
        const innerContent = parent.children.slice(
          index + 1,
          endIndex,
        ) as RootContent[];

        // Recursively transform the content *between* the tags
        const tempRoot: Root = { type: 'root', children: innerContent };
        transform(tempRoot, config);

        let newNode: Strong | Delete | Emphasis | undefined;
        const processedChildren = tempRoot.children as PhrasingContent[];

        if (config.strong && ['b', 'strong'].includes(tagName)) {
          newNode = { type: 'strong', children: processedChildren };
        } else if (config.delete && ['s', 'del'].includes(tagName)) {
          newNode = { type: 'delete', children: processedChildren };
        } else if (config.emphasis && ['i', 'em'].includes(tagName)) {
          newNode = { type: 'emphasis', children: processedChildren };
        }

        if (newNode) {
          parent.children.splice(index, endIndex - index + 1, newNode);
          return [SKIP, index];
        }
      }
    }

    // --- Case 2: Handle self-contained HTML like `<img>` or `<b>text</b>` ---
    const hastTree = fromHtml(node.value, { fragment: true });
    const mdastNodes = hastToMdast(hastTree, config);

    if (mdastNodes) {
      const nodesToInsert = (
        Array.isArray(mdastNodes) ? mdastNodes : [mdastNodes]
      ) as RootContent[];
      if (nodesToInsert.length > 0) {
        parent.children.splice(index, 1, ...nodesToInsert);
        return [SKIP, index];
      }
    }

    // If nothing was produced, remove the original html node.
    parent.children.splice(index, 1);
    return [SKIP, index];
  });
}

export default function remarkHtmlContent(
  options?: Partial<RemarkHtmlContentConfig>,
) {
  const config = {
    ...defaultConfig,
    ...options,
    tags: {
      ...defaultConfig.tags,
      ...options?.tags,
    },
  };
  return (tree: Root) => {
    transform(tree, config.tags);
  };
}
