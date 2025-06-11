import type {
  Break,
  Html,
  Node,
  Parent,
  PhrasingContent,
  Root,
  RootContent,
} from "mdast";
import { visit } from "unist-util-visit";
import { fromHtml } from "hast-util-from-html";

export default function remarkHtmlContent() {
  return (tree: Root) => {
    visit(tree, "html", (node: Html, index, parent) => {
      const nodes: Node[] = [];
      const tree = fromHtml(node.value, { fragment: true });
      for (const child of tree.children) {
        if (child.type === "element" && child.tagName === "br") {
          const newNode: Break = {
            type: "break",
          };
          nodes.push(newNode);
        }
      }
      if (parent && typeof index === "number" && "children" in parent) {
        if (nodes.length > 1) {
          (parent as Parent).children[index] = {
            type: "paragraph",
            children: nodes as unknown as PhrasingContent[],
          };
        } else if (nodes.length === 1) {
          (parent as Parent).children[index] =
            nodes[0] as unknown as RootContent;
        }
      }
    });
  };
}
