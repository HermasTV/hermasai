import { defineType, defineArrayMember } from 'sanity';

export default defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'URL',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
    defineArrayMember({
      type: 'code',
      title: 'Code Block',
      options: {
        language: 'typescript',
        languageAlternatives: [
          { title: 'TypeScript', value: 'typescript' },
          { title: 'JavaScript', value: 'javascript' },
          { title: 'Python', value: 'python' },
          { title: 'Bash', value: 'bash' },
          { title: 'JSON', value: 'json' },
          { title: 'CSS', value: 'css' },
          { title: 'HTML', value: 'html' },
        ],
        withFilename: true,
      },
    }),
  ],
});
