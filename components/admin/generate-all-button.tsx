'use client'

import { useState, useRef, useCallback } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

type GenerateResponse = {
  excerpt: string
  categories: string[]
  tags: string
  seoTitle: string
  description: string
  coverImageId: string
  imagePrompt: string
}

type Snapshot = {
  excerpt: unknown
  categories: unknown
  tags: unknown
  'meta.title': unknown
  'meta.description': unknown
  coverImage: unknown
  'meta.image': unknown
}

const FIELDS_TO_POPULATE = ['excerpt', 'categories', 'tags', 'meta.title', 'meta.description', 'coverImage', 'meta.image'] as const

export default function GenerateAllButton() {
  const [fields, dispatchFields] = useAllFormFields()
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [showUndo, setShowUndo] = useState(false)
  const snapshotRef = useRef<Snapshot | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getFieldValue = useCallback(
    (path: string): unknown => {
      return fields[path]?.value ?? null
    },
    [fields],
  )

  const setFieldValue = useCallback(
    (path: string, value: unknown) => {
      dispatchFields({
        type: 'UPDATE',
        path,
        value,
      })
    },
    [dispatchFields],
  )

  const handleGenerate = async () => {
    const title = getFieldValue('title') as string
    const body = getFieldValue('body') as string

    if (!title || !body) {
      setStatus('error')
      setErrorMsg('Title and body are required before generating.')
      return
    }

    // Snapshot current values for undo
    snapshotRef.current = {
      excerpt: getFieldValue('excerpt'),
      categories: getFieldValue('categories'),
      tags: getFieldValue('tags'),
      'meta.title': getFieldValue('meta.title'),
      'meta.description': getFieldValue('meta.description'),
      coverImage: getFieldValue('coverImage'),
      'meta.image': getFieldValue('meta.image'),
    }

    setStatus('generating')
    setErrorMsg('')

    try {
      const res = await fetch('/api/generate-dispatch-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, body }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const data: GenerateResponse = await res.json()

      // Populate fields
      setFieldValue('excerpt', data.excerpt)
      setFieldValue('categories', data.categories)
      setFieldValue('tags', data.tags)
      setFieldValue('meta.title', data.seoTitle)
      setFieldValue('meta.description', data.description)
      setFieldValue('coverImage', data.coverImageId)
      setFieldValue('meta.image', data.coverImageId)

      setStatus('done')
      setShowUndo(true)

      // Auto-hide undo after 8 seconds
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(() => {
        setShowUndo(false)
        snapshotRef.current = null
      }, 8000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Generation failed')
    }
  }

  const handleUndo = () => {
    if (!snapshotRef.current) return
    for (const path of FIELDS_TO_POPULATE) {
      setFieldValue(path, snapshotRef.current[path])
    }
    setShowUndo(false)
    setStatus('idle')
    snapshotRef.current = null
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      {status === 'idle' && (
        <button
          type="button"
          onClick={handleGenerate}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            background: 'rgba(0, 217, 255, 0.12)',
            border: '1px solid rgba(0, 217, 255, 0.4)',
            borderRadius: '4px',
            color: '#00d9ff',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 217, 255, 0.22)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 217, 255, 0.12)'
          }}
        >
          Generate All
        </button>
      )}

      {status === 'generating' && (
        <div
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            background: 'rgba(0, 217, 255, 0.08)',
            border: '1px solid rgba(0, 217, 255, 0.25)',
            borderRadius: '4px',
            color: '#00d9ff',
            textAlign: 'center',
          }}
        >
          Generating...
        </div>
      )}

      {status === 'done' && showUndo && (
        <div
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            background: 'rgba(0, 217, 255, 0.08)',
            border: '1px solid rgba(0, 217, 255, 0.25)',
            borderRadius: '4px',
            color: '#00d9ff',
            textAlign: 'center',
          }}
        >
          Generated!{' '}
          <button
            type="button"
            onClick={handleUndo}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b6b',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              padding: 0,
            }}
          >
            Undo?
          </button>
        </div>
      )}

      {status === 'done' && !showUndo && (
        <button
          type="button"
          onClick={() => setStatus('idle')}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            background: 'rgba(0, 217, 255, 0.12)',
            border: '1px solid rgba(0, 217, 255, 0.4)',
            borderRadius: '4px',
            color: '#00d9ff',
            cursor: 'pointer',
          }}
        >
          Re-generate All
        </button>
      )}

      {status === 'error' && (
        <div>
          <div
            style={{
              padding: '0.5rem',
              fontSize: '0.8rem',
              color: '#ff6b6b',
              marginBottom: '0.4rem',
            }}
          >
            {errorMsg}
          </div>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '4px',
              color: '#ff6b6b',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
