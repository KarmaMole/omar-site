import React from 'react'

type AvatarMedia = {
  url?: string
  sizes?: { thumbnail?: { url?: string } }
}

export default function AdminAvatar({ user }: { user?: { email?: string; avatar?: AvatarMedia | number | null } | null }) {
  const avatarField = user?.avatar
  const src =
    typeof avatarField === 'object' && avatarField
      ? avatarField.sizes?.thumbnail?.url ?? avatarField.url
      : undefined

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
