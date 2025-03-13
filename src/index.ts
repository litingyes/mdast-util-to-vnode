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
  isArray,
  isFunction,
  merge,
  pick,
} from 'usexx'
import {
  h,
  Text as VText,
} from 'vue'

export type ComponentReturn = [Component, Record<string, any> | undefined]

export interface ToVNodeOptions {
  components?: Partial<Record<Nodes['type'], Component |
  ComponentReturn |
  ((node: Node) => ComponentReturn)>>
}

export function toVNode(node: Root, options: ToVNodeOptions = {}) {
  return createVNode(node, options)
}

export function createVNode(node: Node, options: ToVNodeOptions = {}): VNode {
  let nodeComponent = options.components?.[node.type as Nodes['type']]
  let nodeComponentProps: ComponentReturn[1] = {}

  if (isFunction(nodeComponent)) {
    const [component, props] = (nodeComponent as ((node: Node) => ComponentReturn))(node)
    nodeComponent = component
    nodeComponentProps = props ?? {}
  }
  else if (isArray(nodeComponent)) {
    nodeComponentProps = nodeComponent[1] ?? {}
    nodeComponent = nodeComponent[0]
  }

  switch (node.type as Nodes['type']) {
    case 'blockquote': {
      return h(
        nodeComponent ?? 'blockquote',
        nodeComponentProps,
        createVNodes(node as Parent),
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
        createVNodes(node as Parent),
      )
    }
    case 'emphasis': {
      return h(
        nodeComponent ?? 'em',
        nodeComponentProps,
        createVNodes(node as Parent),
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
            createVNodes(node as Parent),
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
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as List, ['ordered', 'spread', 'start']), nodeComponentProps),
            createVNodes(node as Parent),
          )
        : h(
            (node as List).ordered ? 'ol' : 'ul',
            createVNodes(node as Parent),
          )
    }
    case 'listItem': {
      return nodeComponent
        ? h(
            nodeComponent,
            merge(pick(node as ListItem, ['checked', 'spread']), nodeComponentProps),
            createVNodes(node as Parent),
          )
        : h(
            'li',
            createVNodes(node as Parent),
          )
    }
    case 'paragraph': {
      return h(
        nodeComponent ?? 'p',
        nodeComponentProps,
        createVNodes(node as Parent),
      )
    }
    case 'root': {
      return h(
        nodeComponent ?? 'div',
        nodeComponentProps,
        createVNodes(node as Parent),
      )
    }
    case 'strong': {
      return h(
        nodeComponent ?? 'strong',
        nodeComponentProps,
        createVNodes(node as Parent),
      )
    }
    case 'table': {
      return h(
        nodeComponent ?? 'table',
        merge(pick(node as Table, ['align']), nodeComponentProps),
        createVNodes(node as Parent),
      )
    }
    case 'tableCell': {
      return h(
        nodeComponent ?? 'td',
        nodeComponentProps,
        createVNodes(node as Parent),
      )
    }
    case 'tableRow': {
      return h(
        nodeComponent ?? 'th',
        nodeComponentProps,
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
      return h(Comment)
    }
  }
}

function createVNodes(node: Parent, options: ToVNodeOptions = {}): VNode[] {
  return node.children?.map(child => createVNode(child, options)) ?? []
}
