import { defineField, defineType, defineArrayMember } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
    }),
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'string',
    }),
    defineField({
      name: 'heroBackground',
      title: 'Hero Background',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'aboutBio',
      title: 'About Bio',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'aboutPhoto',
      title: 'About Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt Text' }),
      ],
    }),
    defineField({
      name: 'profilePhoto',
      title: 'Profile Photo',
      type: 'image',
      description: 'Used in nav, footer, and as OG image fallback',
      options: { hotspot: true },
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'platform', title: 'Platform', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        }),
      ],
    }),
    defineField({
      name: 'googleAnalyticsId',
      title: 'Google Analytics ID',
      type: 'string',
      description: 'e.g. G-XXXXXXXXXX',
    }),
  ],
  preview: {
    select: {},
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
