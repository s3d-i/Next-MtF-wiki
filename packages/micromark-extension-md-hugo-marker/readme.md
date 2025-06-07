# micromark-extension-hugo-shortcode

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]
[![Size][badge-size-image]][badge-size-url]

[micromark][github-micromark] extension to support [Hugo][hugo] shortcodes
(`{{< figure src="/image.jpg" >}}`).

## Contents

* [What is this?](#what-is-this)
* [When to use this](#when-to-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`hugoShortcode(options?)`](#hugoshortcodeoptions)
  * [`Options`](#options)
* [Authoring](#authoring)
* [Syntax](#syntax)
* [Tokens](#tokens)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package contains an extension that adds support for Hugo shortcode syntax to
[`micromark`][github-micromark]. Hugo shortcodes are a way to include reusable
content snippets in markdown files.

Hugo supports two notations for shortcodes:
- **Standard notation**: `{{< shortcode >}}...{{< /shortcode >}}` or `{{< shortcode />}}`
- **Markdown notation**: `{{% shortcode %}}...{{% /shortcode %}}` or `{{% shortcode /%}}`

## When to use this

This project is useful when you want to support Hugo shortcodes in markdown.

You can use this extension when you are working with
[`micromark`][github-micromark].

When you need a syntax tree, combine this package with an mdast utility
(to be developed).

## Install

This package is [ESM only][github-gist-esm].
In Node.js (version 16+), install with [npm][npmjs-install]:

```sh
npm install micromark-extension-hugo-shortcode
```

## Use

```js
import {micromark} from 'micromark'
import {hugoShortcode} from 'micromark-extension-hugo-shortcode'

const output = micromark('{{< figure src="/images/test.jpg" alt="Test" >}}', {
  extensions: [hugoShortcode()]
})

console.log(output)
```

## API

This package exports the identifier [`hugoShortcode`][api-hugo-shortcode].
There is no default export.

### `hugoShortcode(options?)`

Create an extension for `micromark` to enable Hugo shortcode syntax.

###### Parameters

* `options` ([`Options`][api-options], optional) — configuration

###### Returns

Extension for `micromark` that can be passed in `extensions` to enable Hugo
shortcode syntax ([`Extension`][github-micromark-extension]).

### `Options`

Configuration (TypeScript type).

###### Fields

* `acorn` ([`Acorn`][github-acorn], optional) — acorn parser to use
* `acornOptions` ([`AcornOptions`][github-acorn-options], default:
  `{ecmaVersion: 2024, locations: true, sourceType: 'module'}`) — configuration
  for acorn; all fields except `locations` can be set
* `addResult` (`boolean`, default: `false`) — whether to add `estree` fields to
  tokens with results from acorn

## Authoring

When authoring markdown with Hugo shortcodes, you can use either standard or
markdown notation:

### Standard notation (`{{< >}}`)

Standard notation preserves the content inside the shortcode as-is:

```markdown
{{< highlight js >}}
const greeting = "Hello, World!"
console.log(greeting)
{{< /highlight >}}
```

### Markdown notation (`{{% %}}`)

Markdown notation processes the content as markdown:

```markdown
{{% details summary="Click to expand" %}}
This is **bold** text inside the details shortcode.
{{% /details %}}
```

### Self-closing shortcodes

Both notations support self-closing syntax:

```markdown
{{< figure src="/images/test.jpg" alt="A test image" />}}

{{% youtube id="dQw4w9WgXcQ" /%}}
```

### Arguments

Shortcodes can accept both positional and named arguments:

```markdown
{{< instagram CxOWiQNP2MO >}}

{{< figure src="/images/test.jpg" alt="Test" caption="This is a test image" >}}
```

## Syntax

Hugo shortcodes follow this syntax:

* Opening marker: `{{<` or `{{% `
* Optional closing marker: `/` before the shortcode name
* Shortcode name: alphanumeric characters, hyphens, and underscores
* Arguments: space-separated, can be:
  * Positional: unquoted values
  * Named: `key=value` or `key="quoted value"`
* Self-closing marker: `/` before the closing marker (optional)
* Closing marker: `>}}` or `%}}`

## Tokens

Many tokens are used to represent different parts of Hugo shortcodes:

* `hugoShortcodeFlow` / `hugoShortcodeText` — for the whole shortcode
* `hugoShortcodeFlowMarker` / `hugoShortcodeTextMarker` — for `{{<`, `>}}`, etc.
* `hugoShortcodeFlowClosingMarker` / `hugoShortcodeTextClosingMarker` — for the `/` in closing tags
* `hugoShortcodeFlowSelfClosingMarker` / `hugoShortcodeTextSelfClosingMarker` — for the `/` in self-closing tags
* `hugoShortcodeFlowName` / `hugoShortcodeTextName` — for the shortcode name
* `hugoShortcodeFlowNotation` / `hugoShortcodeTextNotation` — for `<` or `%` notation markers
* Various tokens for arguments and their components

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

## Security

This package is safe.

## Related

* [`micromark`][github-micromark] — parse markdown
* [Hugo documentation on shortcodes][hugo-shortcodes]

## Contribute

See [`contributing.md` in `micromark/.github`][health-contributing] for ways
to get started. See [`support.md`][health-support] for ways to get help.

This project has a [code of conduct][health-coc]. By interacting with this
repository, organization, or community you agree to abide by its terms.

## License

[MIT][file-license] © [Titus Wormer][wooorm]

<!-- Definitions -->

[api-hugo-shortcode]: #hugoshortcodeoptions

[api-options]: #options

[badge-build-image]: https://github.com/micromark/micromark-extension-hugo-shortcode/workflows/main/badge.svg

[badge-build-url]: https://github.com/micromark/micromark-extension-hugo-shortcode/actions

[badge-coverage-image]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-hugo-shortcode.svg

[badge-coverage-url]: https://codecov.io/github/micromark/micromark-extension-hugo-shortcode

[badge-downloads-image]: https://img.shields.io/npm/dm/micromark-extension-hugo-shortcode.svg

[badge-downloads-url]: https://downloads.npmjs.com/micromark-extension-hugo-shortcode

[badge-size-image]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=micromark-extension-hugo-shortcode

[badge-size-url]: https://bundlejs.com/?q=micromark-extension-hugo-shortcode

[file-license]: license

[github-acorn]: https://github.com/acornjs/acorn

[github-acorn-options]: https://github.com/acornjs/acorn/blob/master/acorn/README.md#interface

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[github-micromark]: https://github.com/micromark/micromark

[github-micromark-extension]: https://github.com/micromark/micromark#syntaxextension

[health-coc]: https://github.com/micromark/.github/blob/main/code-of-conduct.md

[health-contributing]: https://github.com/micromark/.github/blob/main/contributing.md

[health-support]: https://github.com/micromark/.github/blob/main/support.md

[hugo]: https://gohugo.io/

[hugo-shortcodes]: https://gohugo.io/content-management/shortcodes/

[npmjs-install]: https://docs.npmjs.com/cli/install

[typescript]: https://www.typescriptlang.org

[wooorm]: https://wooorm.com
