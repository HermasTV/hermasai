'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

// Code Block Component
function CodeBlock({ block }: { block: any }) {
  const [highlighted, setHighlighted] = useState('')

  useEffect(() => {
    // Load Prism dynamically on client side
    import('prismjs').then((Prism) => {
      import('prismjs/themes/prism-tomorrow.css')
      import(`prismjs/components/prism-${block.language}`).catch(() => {
        // Language not found, use javascript as fallback
      })

      const code = Prism.default.highlight(
        block.code,
        Prism.default.languages[block.language] || Prism.default.languages.javascript,
        block.language
      )
      setHighlighted(code)
    })
  }, [block.code, block.language])

  if (!highlighted) {
    return (
      <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <code>{block.code}</code>
      </pre>
    )
  }

  return (
    <div className="my-8">
      {block.filename && (
        <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-mono rounded-t-lg border-b border-gray-700">
          {block.filename}
        </div>
      )}
      <pre
        className={`language-${block.language} ${!block.filename ? 'rounded-lg' : 'rounded-b-lg'} overflow-x-auto`}
      >
        <code
          className={`language-${block.language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  )
}

// Video Embed Component
function VideoEmbed({ block }: { block: any }) {
  const getEmbedUrl = () => {
    if (block.platform === 'youtube') {
      const videoId = block.videoUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
      )?.[1]
      return `https://www.youtube.com/embed/${videoId}`
    } else if (block.platform === 'vimeo') {
      const videoId = block.videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]
      return `https://player.vimeo.com/video/${videoId}`
    }
    return null
  }

  const embedUrl = getEmbedUrl()

  if (!embedUrl) return null

  return (
    <div className="my-8">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {block.caption && (
        <p className="text-center text-sm text-gray-400 mt-2">{block.caption}</p>
      )}
    </div>
  )
}

// Image Block Component
function ImageBlock({ block }: { block: any }) {
  if (!block.image || typeof block.image !== 'object') return null

  return (
    <div className="my-8">
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
        <Image
          src={block.image.url}
          alt={block.image.alt || block.caption || ''}
          fill
          className="object-cover"
        />
      </div>
      {block.caption && (
        <p className="text-center text-sm text-gray-400 mt-2">{block.caption}</p>
      )}
    </div>
  )
}

// Callout Component
function Callout({ block }: { block: any }) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
    success: 'bg-green-500/10 border-green-500/30 text-green-200',
    error: 'bg-red-500/10 border-red-500/30 text-red-200',
  }

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌',
  }

  return (
    <div
      className={`my-8 p-4 rounded-lg border-l-4 ${styles[block.type as keyof typeof styles]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[block.type as keyof typeof icons]}</span>
        <p className="flex-1">{block.content}</p>
      </div>
    </div>
  )
}

// Rich Text Component (renders Lexical editor output)
function RichText({ block }: { block: any }) {
  // Recursively render Lexical JSON nodes
  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null

    // Handle text nodes
    if (node.type === 'text') {
      let text = node.text
      let className = ''

      // Handle text formatting
      if (node.format === 1) className += 'font-bold ' // Bold
      if (node.format === 2) className += 'italic ' // Italic
      if (node.format === 4) className += 'line-through ' // Strikethrough
      if (node.format === 8) className += 'underline ' // Underline
      if (node.format === 16) className += 'font-mono text-sm bg-gray-800 px-1 rounded ' // Code

      return className ? <span key={index} className={className}>{text}</span> : text
    }

    // Handle paragraph nodes
    if (node.type === 'paragraph') {
      return (
        <p key={index} className="mb-4">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </p>
      )
    }

    // Handle heading nodes
    if (node.type === 'heading') {
      const Tag = `h${node.tag}` as keyof JSX.IntrinsicElements
      const headingClasses = {
        h1: 'text-4xl font-bold mb-6 mt-8',
        h2: 'text-3xl font-bold mb-5 mt-7',
        h3: 'text-2xl font-bold mb-4 mt-6',
        h4: 'text-xl font-bold mb-3 mt-5',
        h5: 'text-lg font-bold mb-2 mt-4',
        h6: 'text-base font-bold mb-2 mt-3',
      }
      return (
        <Tag key={index} className={headingClasses[Tag as keyof typeof headingClasses]}>
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </Tag>
      )
    }

    // Handle list nodes
    if (node.type === 'list') {
      const Tag = node.tag === 'ol' ? 'ol' : 'ul'
      const listClass = node.listType === 'check' ? 'space-y-2' :
                       Tag === 'ol' ? 'list-decimal list-inside space-y-2' :
                       'list-disc list-inside space-y-2'
      return (
        <Tag key={index} className={`${listClass} mb-4`}>
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </Tag>
      )
    }

    // Handle list item nodes
    if (node.type === 'listitem') {
      return (
        <li key={index} className="ml-4">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </li>
      )
    }

    // Handle link nodes
    if (node.type === 'link') {
      return (
        <a
          key={index}
          href={node.url}
          className="text-blue-400 hover:text-blue-300 underline"
          target={node.newTab ? '_blank' : '_self'}
          rel={node.newTab ? 'noopener noreferrer' : undefined}
        >
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </a>
      )
    }

    // Handle quote nodes
    if (node.type === 'quote') {
      return (
        <blockquote key={index} className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-300">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </blockquote>
      )
    }

    // Handle code block nodes
    if (node.type === 'code') {
      return (
        <pre key={index} className="bg-gray-900 rounded-lg p-4 overflow-x-auto my-4">
          <code>{node.children?.map((child: any, i: number) => renderNode(child, i))}</code>
        </pre>
      )
    }

    // Fallback: try to render children
    if (node.children) {
      return (
        <div key={index}>
          {node.children.map((child: any, i: number) => renderNode(child, i))}
        </div>
      )
    }

    return null
  }

  // Start rendering from the root
  const content = block.content?.root || block.content
  if (!content || !content.children) {
    return <div className="text-gray-400 my-4">No content</div>
  }

  return (
    <div className="prose prose-invert prose-lg max-w-none my-4">
      {content.children.map((node: any, index: number) => renderNode(node, index))}
    </div>
  )
}

// Main Block Renderer
export function BlockRenderer({ blocks }: { blocks: any[] }) {
  return (
    <div>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'codeBlock':
            return <CodeBlock key={index} block={block} />
          case 'videoEmbed':
            return <VideoEmbed key={index} block={block} />
          case 'imageBlock':
            return <ImageBlock key={index} block={block} />
          case 'callout':
            return <Callout key={index} block={block} />
          case 'richText':
            return <RichText key={index} block={block} />
          default:
            return null
        }
      })}
    </div>
  )
}
