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
  TableRow,
  Text,
  Yaml,
} from 'mdast'
import type {
  Component,
  VNode,
} from 'vue'
import {
  isArray,
  isFunction,
  merge,
  pick,
} from 'usexx'
import {
  Comment,
  h,
  Text as VText,
} from 'vue'

export type ComponentReturn = Component | [Component, Record<string, any> | undefined]

export interface ToVNodeOptions {
  components?: Partial<Record<Nodes['type'], ComponentReturn |
  ((node: Node) => ComponentReturn)>>
}

export function toVNode(node: Root, options: ToVNodeOptions = {}) {
  return createVNode(node, options, {
    index: 0,
    parent: null,
  })
}

export interface CreateVNodeContext {
  index: number
  parent: Node | null
}

export function createVNode(node: Node, options: ToVNodeOptions = {}, context: CreateVNodeContext): VNode {
  let nodeComponent = options.components?.[node.type as Nodes['type']]
  let nodeComponentProps: Record<string, any> = {}

  if (isFunction(nodeComponent)) {
    nodeComponent = (nodeComponent as ((node: Node) => ComponentReturn))(node)
  }
  if (isArray(nodeComponent)) {
    nodeComponentProps = nodeComponent[1] ?? {}
    nodeComponent = nodeComponent[0]
  }

  switch (node.type as Nodes['type']) {
    case 'blockquote': {
      return h(
        nodeComponent ?? 'blockquote',
        nodeComponentProps,
        createVNodes(node as Parent, options),
      )
    }
    case 'break': {
      return h(
        nodeComponent ?? 'br',
        nodeComponentProps,
      )
    }
    case 'code': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as Code, ['lang', 'meta', 'value']), nodeComponentProps),
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
        nodeComponent ?? 's',
        nodeComponentProps,
        createVNodes(node as Parent, options),
      )
    }
    case 'emphasis': {
      return h(
        nodeComponent ?? 'em',
        nodeComponentProps,
        createVNodes(node as Parent, options),
      )
    }
    case 'heading': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as Heading, ['depth']), nodeComponentProps),
          )
        : h(
            `h${(node as Heading).depth}`,
            createVNodes(node as Parent, options),
          )
    }
    case 'html': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as Html, ['value']), nodeComponentProps),
          )
        : h(
            'div',
            {
              innerHTML: (node as Html).value,
            },
          )
    }
    case 'image': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as Image, ['url', 'alt', 'title']), nodeComponentProps),
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
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as InlineCode, ['value']), nodeComponentProps),
          )
        : h(
            'code',
            (node as InlineCode).value,
          )
    }
    case 'link': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as Link, ['url', 'title']), nodeComponentProps),
            createVNodes(node as Parent, options),
          )
        : h(
            'a',
            {
              href: (node as Link).url,
            },
            createVNodes(node as Parent, options),
          )
    }
    case 'list': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as List, ['ordered', 'spread', 'start']), nodeComponentProps),
            createVNodes(node as Parent, options),
          )
        : h(
            (node as List).ordered ? 'ol' : 'ul',
            createVNodes(node as Parent, options),
          )
    }
    case 'listItem': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as ListItem, ['checked', 'spread']), nodeComponentProps),
            createVNodes(node as Parent, options),
          )
        : h(
            'li',
            createVNodes(node as Parent, options),
          )
    }
    case 'paragraph': {
      return h(
        nodeComponent ?? 'p',
        nodeComponentProps,
        createVNodes(node as Parent, options),
      )
    }
    case 'root': {
      return h(
        nodeComponent ?? 'div',
        nodeComponentProps,
        createVNodes(node as Parent, options),
      )
    }
    case 'strong': {
      return h(
        nodeComponent ?? 'strong',
        nodeComponentProps,
        createVNodes(node as Parent, options),
      )
    }
    case 'table': {
      return h(
        nodeComponent ?? 'table',
        nodeComponentProps,
        createVNodes(node as Parent, options),
      )
    }
    case 'tableRow': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(nodeComponentProps, {
              index: context.index,
              align: (context.parent as Table).align?.[context.index] ?? 'left',
            }),
            createVNodes(node as Parent, options),
          )
        : h('tr', {
            align: (context.parent as Table).align?.[context.index] ?? 'left',
          }, createVNodes(node as Parent, options))
    }
    case 'tableCell': {
      const isHeader = (context.parent as TableRow).position?.start?.offset === 0

      return h(
        nodeComponent ?? (isHeader ? 'th' : 'td'),
        nodeComponentProps,
        createVNodes(node as Parent, options),
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
        nodeComponent ?? 'hr',
        nodeComponentProps,
      )
    }
    case 'yaml': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(
              {
                lang: 'yaml',
                value: (node as Yaml).value,
              },
              nodeComponentProps,
            ),
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
      return h(Comment, JSON.stringify(node))
    }
  }
}

function createVNodes(node: Parent, options: ToVNodeOptions = {}): VNode[] {
  return node.children?.map((child, i) => createVNode(child, options, {
    index: i,
    parent: node,
  })) ?? []
}
