import { defineField, defineType, defineArrayMember } from 'sanity'

export default defineType({
  name: 'work',
  title: 'Work',
  type: 'document',
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' as const }],
    },
    {
      title: 'Date, Newest First',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' as const }],
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt Text' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt Text' }),
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'AI & Production', value: 'AI & Production' },
          { title: 'Video Production', value: 'Video Production' },
          { title: 'AI Films', value: 'AI Films' },
          { title: 'Music', value: 'Music' },
          { title: 'Comics & Writing', value: 'Comics & Writing' },
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Vimeo', value: 'vimeo' },
                  { title: 'SoundCloud', value: 'soundcloud' },
                  { title: 'Spotify', value: 'spotify' },
                ],
              },
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            }),
          ],
          preview: {
            select: { title: 'url', subtitle: 'type' },
          },
        }),
      ],
    }),
    defineField({
      name: 'externalLink',
      title: 'External Link',
      type: 'url',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'client',
      media: 'coverImage',
    },
  },
})
