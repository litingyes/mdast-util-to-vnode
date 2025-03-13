# mdast-util-to-vnode

mdast utility to get the vue vnode

## What is this?

This package is a utility that takes [mdast](https://github.com/syntax-tree/mdast) input and turns it into an [Vue.js](https://github.com/vuejs/core) VNode.

## When should I use this?

If you want to use Vue.js to render mdast, use it. It is especially useful when you want to render streamed MarkDown strings in AI application development.

## Install

```bash
npm install mdast-util-to-vnode
```

## Use

Say we have the following markdown file `example.md`:

```md
# Heading

`mdast-util-to-vnode` is a mdast utility to get the vue vnode.
```

And our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toVNode } from 'mdast-util-to-vnode'

const doc = await fs.readFile('example.md')
const vnode = toVNode(fromMarkdown(doc))

console.log(vnode)
```

Now running node example.js yields (some info removed for brevity):

```json
{
  "type": "div",
  "props": null,
  "key": null,
  "children": [
    {
      "type": "h1",
      "props": null,
      "key": null,
      "children": [
        {
          "props": null,
          "key": null,
          "children": "Heading"
        }
      ]
    },
    {
      "type": "p",
      "props": null,
      "key": null,
      "children": [
        {
          "type": "code",
          "props": null,
          "key": null,
          "children": "mdast-util-to-vnode"
        },
        {
          "props": null,
          "key": null,
          "children": " is a mdast utility to get the vue vnode."
        }
      ]
    }
  ]
}
```

## API

This package exports the identifier `toVNode`. There is no default export.

### toVNode(mdast[, options])

#### options

Support passing in custom Vue components to override mdast nodes.

```ts
interface ToVNodeOptions {
  components?: Partial<Record<Nodes['type'], Component>>
}
```
