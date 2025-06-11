import { hugoShortcodeFromMarkdown } from "./lib/index.js";
import { fromMarkdown } from "mdast-util-from-markdown";
import { hugoShortcode } from "micromark-extension-md-hugo-marker";

const options = {
  noSelfClosingElements: ['ref','mtf-wiki','telephone'],
}

const ast = fromMarkdown("{{< shields/qq 717099350 \"https://jq.qq.com/?_wv=1027&k=byC0cbS4\" />}}", {
  extensions: [hugoShortcode()],
  mdastExtensions: [hugoShortcodeFromMarkdown(options)],
})

console.log(JSON.stringify(ast, null, 2))