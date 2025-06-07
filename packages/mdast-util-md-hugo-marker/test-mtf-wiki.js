import { hugoShortcodeFromMarkdown } from "./lib/index.js";
import { fromMarkdown } from "mdast-util-from-markdown";
import { hugoShortcode } from "micromark-extension-md-hugo-marker";

const options = {
  noSelfClosingElements: ['ref','mtf-wiki','telephone'],
}

const ast = fromMarkdown("{{< telephone \"021-54237559 345\" >}}", {
  extensions: [hugoShortcode()],
  mdastExtensions: [hugoShortcodeFromMarkdown(options)],
})

console.log(JSON.stringify(ast, null, 2))