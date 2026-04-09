import React from 'react'

export default function AdminAvatar(props: Record<string, unknown>) {
  const user = props?.user as { email?: string; avatar?: unknown } | null | undefined
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
