'use client'

import { useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CopyImageRef(props: any) {
  const [copied, setCopied] = useState(false)
  const path: string = props.path ?? ''

  // path looks like "images.0.copyRef" — extract the row index
  const match = path.match(/images\.(\d+)\./)
  if (!match) return null
  const index = Number(match[1]) + 1
  const snippet = `![](image-${index})`

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.6rem',
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          background: copied ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255,255,255,0.06)',
          border: '1px solid',
          borderColor: copied ? '#00d9ff' : '#444',
          borderRadius: '4px',
          color: copied ? '#00d9ff' : '#ccc',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {copied ? '✓ Copied!' : `📋 ${snippet}`}
      </button>
    </div>
  )
}
