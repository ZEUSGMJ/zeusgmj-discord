import { findAndReplace } from 'mdast-util-find-and-replace'
import { visit } from 'unist-util-visit'
import type { Root, Strong, Paragraph, Image } from 'mdast'
import type { Plugin, Processor } from 'unified'

const DISABLED_CONSTRUCTS = [
  'headingAtx',
  'setextUnderline',
  'list',
  'thematicBreak',
  'codeIndented',
  'htmlFlow',
  'htmlText',
]

export const remarkDiscordConstructs: Plugin<[], Root> = function (this: Processor) {
  const data = this.data() as { micromarkExtensions?: unknown[] }
  const micromarkExtensions = data.micromarkExtensions ?? (data.micromarkExtensions = [])
  micromarkExtensions.push({ disable: { null: DISABLED_CONSTRUCTS } })
}

export function remarkDiscordUnderline(source: string): Plugin<[], Root> {
  return function () {
    return (tree: Root) => {
      visit(tree, 'strong', (node: Strong) => {
        const offset = node.position?.start.offset
        if (offset !== undefined && source[offset] === '_') {
          node.data = { ...node.data, hName: 'u' }
        }
      })
    }
  }
}

export const remarkDiscordSpoiler: Plugin<[], Root> = function () {
  return (tree: Root) => {
    findAndReplace(tree, [
      [
        /\|\|([^|]+)\|\|/g,
        (_match: string, content: string): Strong => ({
          type: 'strong',
          data: { hName: 'discord-spoiler' },
          children: [{ type: 'text', value: content }],
        }),
      ],
    ])
  }
}

export const remarkDiscordSubtext: Plugin<[], Root> = function () {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph) => {
      const [first] = node.children
      if (first?.type === 'text' && first.value.startsWith('-# ')) {
        first.value = first.value.slice(3)
        node.data = { ...node.data, hName: 'small' }
      }
    })
  }
}

export const remarkDiscordEmoji: Plugin<[], Root> = function () {
  return (tree: Root) => {
    findAndReplace(tree, [
      [
        /<(a?):(\w+):(\d+)>/g,
        (_match: string, animated: string, name: string, id: string): Image => ({
          type: 'image',
          url: `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'webp'}?size=32`,
          alt: `:${name}:`,
        }),
      ],
    ])
  }
}
