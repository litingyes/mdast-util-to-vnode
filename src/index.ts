import type {
  Code,
  Heading,
  Html,
  Image,
  InlineCode,
  Link,
  List,
  ListItem,
  Node,
  Nodes,
  Parent,
  Root,
  Table,
  Text,
  Yaml,
} from 'mdast'
import type {
  Component,
  VNode,
} from 'vue'
import {
  pick,
} from 'usexx'
import {
  h,
  Text as VText,
} from 'vue'

export interface ToVNodeOptions {
  components?: Partial<Record<Nodes['type'], Component>>
}

export function toVNode(node: Root, options: ToVNodeOptions = {}) {
  return createVNode(node, options)
}

export function createVNode(node: Node, options: ToVNodeOptions = {}): VNode {
  const customComponent = options.components?.[node.type as Nodes['type']]

  switch (node.type as Nodes['type']) {
    case 'blockquote': {
      return h(
        customComponent ?? 'blockquote',
        createVNodes(node as Parent),
      )
    }
    case 'break': {
      return h(
        customComponent ?? 'br',
      )
    }
    case 'code': {
      return customComponent
        ? h(
            customComponent,
            pick(node as Code, ['lang', 'meta', 'value']),
          )
        : h(
            'pre',
            {
              dataLang: (node as Code).lang,
              dataMeta: (node as Code).meta,
            },
            h('code', (node as Code).value),
          )
    }
    case 'delete': {
      return h(
        customComponent ?? 's',
        createVNodes(node as Parent),
      )
    }
    case 'emphasis': {
      return h(
        customComponent ?? 'em',
        createVNodes(node as Parent),
      )
    }
    case 'heading': {
      return customComponent
        ? h(
            customComponent,
            pick(node as Heading, ['depth']),
          )
        : h(
            `h${(node as Heading).depth}`,
            createVNodes(node as Parent),
          )
    }
    case 'html': {
      return customComponent
        ? h(
            customComponent,
            pick(node as Html, ['value']),
          )
        : h(
            'div',
            {
              innerHTML: (node as Html).value,
            },
          )
    }
    case 'image': {
      return customComponent
        ? h(
            customComponent,
            pick(node as Image, ['url', 'alt', 'title']),
          )
        : h(
            'img',
            {
              src: (node as Image).url,
              alt: (node as Image).alt,
              title: (node as Image).title,
            },
          )
    }
    case 'inlineCode': {
      return customComponent
        ? h(
            customComponent,
            pick(node as InlineCode, ['value']),
          )
        : h(
            'code',
            (node as InlineCode).value,
          )
    }
    case 'link': {
      return customComponent
        ? h(
            customComponent,
            pick(node as Link, ['url', 'title']),
            createVNodes(node as Parent),
          )
        : h(
            'a',
            {
              href: (node as Link).url,
            },
            createVNodes(node as Parent),
          )
    }
    case 'list': {
      return customComponent
        ? h(
            customComponent,
            pick(node as List, ['ordered', 'spread', 'start']),
            createVNodes(node as Parent),
          )
        : h(
            (node as List).ordered ? 'ol' : 'ul',
            createVNodes(node as Parent),
          )
    }
    case 'listItem': {
      return customComponent
        ? h(
            customComponent,
            pick(node as ListItem, ['checked', 'spread']),
            createVNodes(node as Parent),
          )
        : h(
            'li',
            createVNodes(node as Parent),
          )
    }
    case 'paragraph': {
      return h(
        customComponent ?? 'p',
        createVNodes(node as Parent),
      )
    }
    case 'root': {
      return h(
        customComponent ?? 'div',
        createVNodes(node as Parent),
      )
    }
    case 'strong': {
      return h(
        customComponent ?? 'strong',
        createVNodes(node as Parent),
      )
    }
    case 'table': {
      return h(
        customComponent ?? 'table',
        pick(node as Table, ['align']),
        createVNodes(node as Parent),
      )
    }
    case 'tableCell': {
      return h(
        customComponent ?? 'td',
        createVNodes(node as Parent),
      )
    }
    case 'tableRow': {
      return h(
        customComponent ?? 'th',
        createVNodes(node as Parent),
      )
    }
    case 'text': {
      return h(
        VText,
        (node as Text).value,
      )
    }
    case 'thematicBreak': {
      return h(
        customComponent ?? 'hr',
      )
    }
    case 'yaml': {
      return customComponent
        ? h(
            customComponent,
            {
              lang: 'yaml',
              value: (node as Yaml).value,
            },
          )
        : h(
            'pre',
            {
              dataLang: 'yaml',
            },
            h('code', (node as Code).value),
          )
    }
    default: {
      return h(Comment)
    }
  }
}

function createVNodes(node: Parent, options: ToVNodeOptions = {}): VNode[] {
  return node.children?.map(child => createVNode(child, options)) ?? []
}
