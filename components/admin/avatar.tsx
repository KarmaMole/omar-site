'use client'

import { useAuth } from '@payloadcms/ui'

export default function AdminAvatar() {
  const { user } = useAuth()
  const avatar = user?.avatar as { url?: string; sizes?: { thumbnail?: { url?: string } } } | undefined
  const src = avatar?.sizes?.thumbnail?.url ?? avatar?.url

  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{
          width: 25,
          height: 25,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    )
  }

  // Fallback: first letter of email
  const initial = (user?.email ?? 'U').charAt(0).toUpperCase()
  return (
    <div
      style={{
        width: 25,
        height: 25,
        borderRadius: '50%',
        background: '#00d9ff',
        color: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  )
}
