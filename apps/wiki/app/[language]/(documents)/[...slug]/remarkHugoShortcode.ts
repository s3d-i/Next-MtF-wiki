import { visit, SKIP } from "unist-util-visit";
import type { Plugin } from "unified";
import type {
  Root,
  Node,
  Parent,
  Image,
  Html,
  Text,
  RootContent,
  Nodes,
  Link,
  PhrasingContent,
} from "mdast";
import {
  hugoShortcodeFromMarkdown,
  hugoShortcodeToMarkdown,
} from "mdast-util-md-hugo-marker";
import { hugoShortcode } from "micromark-extension-md-hugo-marker";
import type {
  HugoShortcodeArgument,
  HugoShortcodeElement,
} from "mdast-util-md-hugo-marker";
import { getNonSelfClosingElements } from "./utils";
import {
  type DocItem,
  getNavigationForOriginalSlug,
  } from "@/service/directory-service";
import { compact } from "mdast-util-compact";
import { getLocalImagePath } from "@/service/directory-service";

// 定义MDX JSX节点类型
interface MdxJsxFlowElement extends Node {
  type: "mdxJsxFlowElement";
  name: string | null;
  attributes: MdxJsxAttribute[];
  children: Node[];
}

interface MdxJsxTextElement extends Node {
  type: "mdxJsxTextElement";
  name: string | null;
  attributes: MdxJsxAttribute[];
  children: Node[];
}

interface MdxJsxLiteral {
  type: "Literal";
  value: string;
  raw: string;
}

interface MdxJsxLiteralArrayExpression {
  type: "ArrayExpression";
  elements: MdxJsxLiteral[];
}

interface MdxJsxLiteralArrayExpressionStatement {
  type: "ExpressionStatement";
  expression: MdxJsxLiteralArrayExpression;
}

interface MdxJsxFlowExpression {
  type: "mdxFlowExpression";
  data?: {
    estree: {
      type: "Program";
      body: unknown[];
      sourceType: "module";
      comments: unknown[];
    };
  };
}

interface MdxJsxAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value: MdxJsxFlowExpression | string | null;
}

interface RemarkTextElement {
  type: "text";
  value: string;
}

// 转换Hugo shortcode参数为MDX JSX属性
function convertHugoArgumentsToMdxAttributes(
  arguments_: HugoShortcodeArgument[]
) {
  const attributes = [];

  for (let i = 0; i < arguments_.length; i++) {
    const arg = arguments_[i];

    if (arg.type === "hugoShortcodeArgumentNamed") {
      // 命名参数
      attributes.push({
        type: "mdxJsxAttribute",
        name: arg.name,
        value: arg.value || null,
      });
    } else if (arg.type === "hugoShortcodeArgumentPositional") {
      // 位置参数，使用索引作为属性名
      attributes.push({
        type: "mdxJsxAttribute",
        name: `arg${i}`,
        value: arg.value || null,
      });
    }
  }

  return attributes;
}

// 转换Hugo shortcode节点为MDX JSX节点
function convertHugoShortcodeToMdxJsx(
  node: HugoShortcodeElement,
  currentLanguage: string,
  navigationItems?: DocItem[]
): MdxJsxFlowElement | MdxJsxTextElement | RemarkTextElement {
  if (
    node.name === "ref" &&
    currentLanguage &&
    navigationItems &&
    node.arguments.length > 0 &&
    node.arguments[0].value
  ) {
    const slug =
      getNavigationForOriginalSlug(
        currentLanguage,
        node.arguments[0].value,
        navigationItems
      )?.displayPath || "";
    // console.log("node.arguments[0].value: ", node.arguments[0].value, currentLanguage, slug);
    return {
      type: "text",
      value: slug || "",
    };
  }

  const isFlow =
    (node as unknown as HugoShortcodeElement).type ===
    "hugoShortcodeFlowElement";
  const targetType = isFlow ? "mdxJsxFlowElement" : "mdxJsxTextElement";

  // 为位置参数和命名参数创建attrs表达式属性
  const positionalArgs = node.arguments
    .filter((arg) => arg.type === "hugoShortcodeArgumentPositional")
    .map((arg) => arg.value || "");

  const namedArgs = node.arguments
    .filter((arg) => arg.type === "hugoShortcodeArgumentNamed")
    .reduce((acc, arg) => {
      if (arg.name) {
        acc[arg.name] = arg.value || "";
      }
      return acc;
    }, {} as Record<string, string>);

  // 构建 attrs 数组：[["key","value"],["key","value"]]，位置参数的 key 为 null
  const attrsArray = [
    // 位置参数，key 为 null
    ...positionalArgs.map((value) => [null, value]),
    // 命名参数，key 为参数名
    ...Object.entries(namedArgs),
  ];

  // console.log("attrsArray: ", JSON.stringify(attrsArray, null, 2));

  // 创建 mdxFlowExpression 节点作为 attrs 属性值
  const attrsExpression: MdxJsxFlowExpression = {
    type: "mdxFlowExpression",
    data: {
      estree: {
        type: "Program",
        body: [
          {
            type: "ExpressionStatement",
            expression: {
              type: "ArrayExpression",
              elements: attrsArray.map(([key, value]) => ({
                type: "ArrayExpression",
                elements: [
                  key === null
                    ? {
                        type: "Literal",
                        value: null,
                        raw: "null",
                      }
                    : {
                        type: "Literal",
                        value: key,
                        raw: `"${key}"`,
                      },
                  {
                    type: "Literal",
                    value: value,
                    raw: `"${value}"`,
                  },
                ],
              })),
            },
          },
        ],
        sourceType: "module",
        comments: [],
      },
    },
  };

  // 添加 attrs 属性，使用 AST 节点
  const attrs = [
    {
      type: "mdxJsxAttribute",
      name: "compName",
      value: node.name || "fragment",
    },
    {
      type: "mdxJsxAttribute",
      name: "attrs",
      value: attrsExpression,
    },
  ];

  // 创建新的MDX JSX节点
  const result = {
    type: targetType,
    name: "ShortCodeComp",
    attributes: attrs,
    children: node.children || [],
  } as MdxJsxFlowElement | MdxJsxTextElement;

  return result;
}

/**
 * 处理 <URL> 格式的链接
 */
function transformAngleBracketLinks(node: Node): void {
  if (node.type === "html" && "value" in node) {
    const htmlNode = node as Html;
    if (htmlNode.value) {
      htmlNode.value = htmlNode.value.replace(
        /<(https?:\/\/)([^>]+)>/g,
        (_, protocol: string, path: string) => {
          return `[${path}](${protocol}${path})`;
        }
      );
    }
  }
}

/**
 * 处理 <email@example.com> 格式的邮件地址
 */
function transformAngleBracketEmails(node: Node): void {
  if (node.type === "html" && "value" in node) {
    const htmlNode = node as Html;
    if (htmlNode.value) {
      htmlNode.value = htmlNode.value.replace(
        /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g,
        (_, email: string) => {
          return `[${email}](mailto:${email})`;
        }
      );
    }
  }
}

/**
 * 处理 Markdown 链接中的 shortcode
 */
function transformMarkdownLinksWithShortcodes(node: Node): void {
  if (node.type === "html" && "value" in node) {
    const htmlNode = node as Html;
    if (htmlNode.value) {
      htmlNode.value = htmlNode.value.replace(
        /\[([^\]]+)\]\(\{\{<\s*([^\s>]+)([^>]*)\s*>}}\)/g,
        (_, linkText: string, refName: string) => {
          return `[${linkText}](/${refName})`;
        }
      );
    }
  }
}

/**
 * 处理 {#id} 格式
 */
function transformHashIds(node: Node): void {
  if (node.type === "html" && "value" in node) {
    const htmlNode = node as Html;
    if (htmlNode.value) {
      htmlNode.value = htmlNode.value.replace(
        /\{(#[a-zA-Z0-9_-]+)\}/g,
        (_, hashId: string) => {
          const id = hashId.substring(1);
          return `[${hashId}](#${id})`;
        }
      );
    }
  }
}

/**
 * 转换自闭合HTML标签为JSX格式
 */
function transformSelfClosingTags(node: Node): void {
  if (node.type === "html" && "value" in node) {
    const htmlNode = node as Html;
    if (htmlNode.value) {
      htmlNode.value = htmlNode.value.replace(
        /<(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)(\s[^>]*)?(?<!\/)>/gi,
        (match: string, tagName: string, attributes = "") => {
          return `<${tagName}${attributes} />`;
        }
      );
    }
  }
}

/**
 * 转义普通文本中的花括号
 */
function escapeRegularBraces(node: Node): void {
  if (node.type === "text" && "value" in node) {
    const textNode = node as { value: string };
    textNode.value = textNode.value.replace(
      /\{(?![<%])([^{}]*)\}/g,
      (match: string, content: string) => {
        return `\\{${content}\\}`;
      }
    );
  }
}

/**
 * 转义普通文本中的小于号
 */
function escapeRegularLessThan(node: Node): void {
  if (node.type === "text" && "value" in node) {
    const textNode = node as { value: string };
    // 简单的小于号转义，避免与HTML标签冲突
    textNode.value = textNode.value.replace(/<(?![a-zA-Z/])/g, "&lt;");
  }
}

/**
 * 配置选项
 */
export interface RemarkHugoShortcodeOptions {
  /**
   * 是否处理图片路径重定向
   */
  redirectImages?: boolean;
  /**
   * 是否移除HTML注释
   */
  removeComments?: boolean;
  /**
   * 是否转换class为className
   */
  transformClassNames?: boolean;
  /**
   * 是否处理角括号链接
   */
  handleAngleBracketLinks?: boolean;
  /**
   * 是否处理Hash ID
   */
  handleHashIds?: boolean;
  /**
   * 是否转义花括号
   */
  escapeBraces?: boolean;

  currentLanguage?: string;

  navigationItems?: DocItem[];

  currentSlug?: string;

  isCurrentSlugIndex?: boolean;
}

export function transformHugoShortcodeLinks(tree: Root): void {
  visit(tree, (node: Node, index?: number, parent?: Parent) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const hugoNode = node as any;
    //console.log("hugoNode: ", JSON.stringify(hugoNode, null, 2));
    if (
      hugoNode.type === "hugoShortcode-Link-Href" &&
      parent &&
      typeof index === "number"
    ) {
      // console.log("hugoNode: ", JSON.stringify(hugoNode, null, 2));

      const siblings = parent.children as unknown as Text[];
      const prevSibling = siblings[index - 1] as unknown as Text;
      const nextSibling = siblings[index + 1] as unknown as Text;

      const originalNextSiblingValue = nextSibling.value;
      const endBrackIndex = nextSibling.value?.indexOf(")") ?? -1;

      // 检查前后邻居是否为text节点且符合特定模式
      if (
        prevSibling?.type === "text" &&
        nextSibling?.type === "text" &&
        prevSibling.value?.endsWith("](") &&
        (endBrackIndex === 0 ||
          (nextSibling.value?.startsWith("#") && endBrackIndex > 0))
      ) {
        // 向前查找最近的包含"["的text节点
        let linkStartIndex = -1;
        for (let i = index - 1; i >= 0; i--) {
          const sibling = siblings[i];
          if (sibling.type === "text" && sibling.value?.includes("[")) {
            linkStartIndex = i;
            break;
          }
        }
        // console.log("linkStartIndex: ", linkStartIndex, index, JSON.stringify(siblings, null, 2));
        if (linkStartIndex !== -1) {
          // 提取链接部分
          const linkParts = [];
          for (let i = linkStartIndex; i <= index - 1; i++) {
            const textValue = siblings[i].value || "";
            // console.log("textValue: ", textValue);
            if (i === linkStartIndex && i === index - 1) {
              const parenIndex = textValue.lastIndexOf("[");
              const bracketIndex = textValue.lastIndexOf("](");
              if (parenIndex !== -1) {
                siblings[i].value = textValue.substring(0, parenIndex);
                linkParts.push({
                  type: "text",
                  value: textValue.substring(parenIndex + 1, bracketIndex),
                });
              }
            } else if (i === linkStartIndex) {
              const parenIndex = textValue.lastIndexOf("[");
              if (parenIndex !== -1) {
                siblings[i].value = textValue.substring(0, parenIndex);
                linkParts.push({
                  type: "text",
                  value: textValue.substring(parenIndex + 1),
                });
              } else {
                linkParts.push(siblings[i]);
              }
            } else if (i === index - 1) {
              const bracketIndex = textValue.lastIndexOf("](");
              if (bracketIndex !== -1) {
                linkParts.push({
                  type: "text",
                  value: textValue.substring(0, bracketIndex),
                });
              } else {
                linkParts.push(siblings[i]);
              }
            } else {
              linkParts.push(siblings[i]);
            }
          }

          nextSibling.value = nextSibling.value?.substring(endBrackIndex + 1);

          // 创建新的link节点
          const linkNode: MdxJsxTextElement = {
            type: "mdxJsxTextElement",
            name: "Link",
            attributes: [
              {
                type: "mdxJsxAttribute",
                name: "href",
                value: (hugoNode.value || "") + originalNextSiblingValue.substring(0, endBrackIndex),
              },
            ],
            children: [],
          };
          //console.log("linkParts: ", JSON.stringify(linkParts, null, 2));
          // 处理linkParts，提取链接文本内容
          for (const part of linkParts) {
            if (part.type === "text") {
              const textNode = part as Text;
              const textValue = textNode.value || "";

              // 只有在有有效文本内容时才添加
              if (textValue.trim()) {
                linkNode.children.push({
                  type: "text",
                  value: textValue,
                } as unknown as PhrasingContent);
              }
            } else {
              // 添加其他类型的内联元素
              linkNode.children.push(part as unknown as PhrasingContent);
            }
          }
          //console.log("linkNode: ", JSON.stringify(linkNode, null, 2));
          // 替换原始节点
          parent.children.splice(
            linkStartIndex + 1,
            linkParts.length,
            linkNode as unknown as RootContent
          );
          return [SKIP, linkStartIndex];
        }
      }
    }
  });
}

export function transformHugoShortcode(
  tree: Root,
  options: RemarkHugoShortcodeOptions = {}
): void {
  const {
    redirectImages = true,
    removeComments = false,
    transformClassNames = false,
    handleAngleBracketLinks = true,
    handleHashIds = false,
    currentLanguage = "zh",
    navigationItems,
    isCurrentSlugIndex = false,
  } = options;
  // 1. 转换Hugo shortcodes为MDX JSX
  visit(tree, (node: Node, index?: number, parent?: Parent) => {
    if (
      node.type === "hugoShortcodeFlowElement" ||
      node.type === "hugoShortcodeTextElement"
    ) {
      const transformed = convertHugoShortcodeToMdxJsx(
        node as unknown as HugoShortcodeElement,
        currentLanguage,
        navigationItems
      );

      if (parent && typeof index === "number") {
        (parent.children as Node[])[index] = transformed;
      }
    }
  });

  // 处理Hugo短代码链接
  transformHugoShortcodeLinks(tree);

  //2. 处理图片路径重定向
  if (redirectImages) {
    visit(tree, "image", (node: Image) => {
      node.url =
        getLocalImagePath(
          currentLanguage,
          options.currentSlug,
          node.url as string,
          isCurrentSlugIndex
        ) || node.url;
    });
  }

  // 3. 移除HTML注释
  if (removeComments) {
    visit(tree, "html", (node: Html, index?: number, parent?: Parent) => {
      if (node.value?.match(/^\s*<!--[\s\S]*?-->\s*$/)) {
        if (parent && typeof index === "number") {
          parent.children.splice(index, 1);
          return index;
        }
      }
    });
  }

  // 4. 处理各种文本转换
  visit(tree, (node: Node) => {
    // 转换class属性为className
    if (transformClassNames && node.type === "html") {
      const htmlNode = node as Html;
      if (htmlNode.value) {
        htmlNode.value = htmlNode.value.replace(
          /<([^>]*?)\sclass=(['"][^'"]*['"]|[^\s>]+)([^>]*?)>/g,
          (
            match: string,
            before: string,
            classValue: string,
            after: string
          ) => {
            return `<${before} className=${classValue}${after}>`;
          }
        );
      }
    }

    // 处理角括号链接和邮箱
    if (handleAngleBracketLinks) {
      transformAngleBracketLinks(node);
      transformAngleBracketEmails(node);
      transformMarkdownLinksWithShortcodes(node);
    }

    // 处理Hash ID
    if (handleHashIds) {
      transformHashIds(node);
    }

    // 转换自闭合标签
    // transformSelfClosingTags(node);

    // // 转义花括号和小于号
    // if (escapeBraces) {
    //   escapeRegularBraces(node);
    //   escapeRegularLessThan(node);
    // }
  });
}

export function getRemarkHugoShortcodeOptions(
  options: RemarkHugoShortcodeOptions = {}
) {
  const options1 = {
    noSelfClosingElements: getNonSelfClosingElements(),
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    hugoShortcodeElementOnEnterTransform:
      options.currentLanguage && options.navigationItems
        ? (node: any) => {
            //console.log("node: ", JSON.stringify(node, null, 2));
            if (
              node.type === "hugoShortcodeTextElement" ||
              node.type === "hugoShortcodeFlowElement"
            ) {
              const element = node as HugoShortcodeElement;
              if (element.name === "ref") {
                const href =
                  (element.arguments[0].value as string) ||
                  element.arguments[0].name;
                // console.log("href: ", href, JSON.stringify(element.arguments));
                return {
                  type: "hugoShortcode-Link-Href",
                  value:
                    `/${options.currentLanguage}/docs/${
                      getNavigationForOriginalSlug(
                        options.currentLanguage!,
                        href,
                        options.navigationItems!
                      )?.displayPath
                    }` || "",
                } as unknown as Nodes;
              }
            }
            return node;
          }
        : undefined,
  };
  return options1;
}

/**
 * Remark插件：处理Hugo shortcodes和相关转换
 */

export function remarkHugoShortcode(
  this: unknown,
  options: RemarkHugoShortcodeOptions = {}
) {
  const self: unknown = this as unknown;
  const settings = options || {};
  const data = (
    self as {
      data(): {
        micromarkExtensions?: unknown[];
        fromMarkdownExtensions?: unknown[];
        toMarkdownExtensions?: unknown[];
      };
    }
  ).data();

  const micromarkExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(hugoShortcode());
  fromMarkdownExtensions.push(
    hugoShortcodeFromMarkdown(getRemarkHugoShortcodeOptions(options))
  );
  toMarkdownExtensions.push(hugoShortcodeToMarkdown());

  return (tree: Root) => {
    transformHugoShortcode(tree, settings);
  };
}

// 导出默认配置的插件函数
export function remarkHugoShortcodeDefault() {
  return remarkHugoShortcode();
}
