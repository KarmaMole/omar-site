'use client'

import { useField } from '@payloadcms/ui'
import { useCallback, useEffect, useRef, useState } from 'react'

interface MediaDoc {
  id: string
  url?: string
  alt?: string
  filename?: string
  sizes?: {
    thumbnail?: { url?: string }
    card?: { url?: string }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GalleryUploadField(props: any) {
  const { value, setValue } = useField<string[]>({ path: props.path ?? props.field?.name ?? 'gallery' })
  const [mediaDocs, setMediaDocs] = useState<MediaDoc[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 })
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch media docs for current IDs
  useEffect(() => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      setMediaDocs([])
      return
    }

    const ids = value.map((v: unknown) => (typeof v === 'object' && v !== null ? (v as MediaDoc).id : String(v)))

    Promise.all(
      ids.map((id) =>
        fetch(`/api/media/${id}`, { credentials: 'include' })
          .then((r) => r.json())
          .catch(() => null)
      )
    ).then((docs) => {
      setMediaDocs(docs.filter(Boolean))
    })
  }, [value])

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (fileArr.length === 0) return

      setUploading(true)
      setError(null)
      setUploadCount({ done: 0, total: fileArr.length })

      const newIds: string[] = []
      const newDocs: MediaDoc[] = []

      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i]
        const formData = new FormData()
        formData.append('file', file)
        const alt = file.name
          .replace(/\.[^.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        formData.append('_payload', JSON.stringify({ alt }))

        try {
          const res = await fetch('/api/media', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          })
          if (!res.ok) {
            const text = await res.text()
            console.error(`Upload failed for ${file.name}: ${res.status}`, text)
            setError(`Upload failed for ${file.name} (${res.status})`)
            continue
          }
          const data = await res.json()
          if (data?.doc?.id) {
            newIds.push(data.doc.id)
            newDocs.push(data.doc)
          } else {
            console.error(`Upload response missing doc.id for ${file.name}:`, data)
          }
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err)
          setError(`Failed to upload ${file.name}`)
        }

        setUploadCount({ done: i + 1, total: fileArr.length })
      }

      if (newIds.length > 0) {
        const currentIds = Array.isArray(value)
          ? value.map((v: unknown) => (typeof v === 'object' && v !== null ? (v as MediaDoc).id : v))
          : []
        setValue([...currentIds, ...newIds])
        // Show thumbnails immediately without waiting for useField value to update
        setMediaDocs((prev) => [...prev, ...newDocs])
      }

      setUploading(false)
    },
    [value, setValue]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [uploadFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFiles(e.target.files)
        e.target.value = ''
      }
    },
    [uploadFiles]
  )

  const removeImage = useCallback(
    (idToRemove: string) => {
      const currentIds = Array.isArray(value)
        ? value.map((v: unknown) => String(typeof v === 'object' && v !== null ? (v as MediaDoc).id : v))
        : []
      setValue(currentIds.filter((id) => id !== idToRemove))
      setMediaDocs((prev) => prev.filter((doc) => doc.id !== idToRemove))
    },
    [value, setValue]
  )

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        Image Gallery
      </label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#00d9ff' : '#333'}`,
          borderRadius: '4px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragOver ? 'rgba(0, 217, 255, 0.05)' : 'transparent',
          transition: 'all 0.2s',
          marginBottom: '1rem',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>
              Uploading {uploadCount.done} of {uploadCount.total}...
            </div>
            <div
              style={{
                marginTop: '0.5rem',
                height: '4px',
                background: '#222',
                borderRadius: '2px',
                overflow: 'hidden',
                maxWidth: '200px',
                margin: '0.5rem auto 0',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(uploadCount.done / uploadCount.total) * 100}%`,
                  background: '#00d9ff',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Drop images here</div>
            <div style={{ fontSize: '0.8rem', color: '#999' }}>or click to browse</div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{error}</div>
      )}

      {/* Thumbnail grid */}
      {mediaDocs.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {mediaDocs.map((doc) => (
            <div
              key={doc.id}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #333',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.sizes?.thumbnail?.url ?? doc.url}
                alt={doc.alt ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(doc.id)
                }}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
