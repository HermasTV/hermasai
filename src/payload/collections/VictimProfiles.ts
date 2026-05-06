import type { CollectionConfig } from 'payload'

export const VictimProfiles: CollectionConfig = {
  slug: 'victim-profiles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'arabicName', 'dataIndex', 'causeOfDeath', 'verified', 'featured'],
    description: 'Individual memorial profiles for victims. The dataIndex field links a profile to its particle in the visualization.',
    group: 'I Am Not a Number',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Auto-generate slug from name + dataIndex if not set
        if (data && data.name && data.dataIndex !== undefined && !data.slug) {
          const nameSlug = String(data.name)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
          data.slug = `${nameSlug}-${data.dataIndex}`
        }
        return data
      },
    ],
  },
  fields: [
    // ── Identification ──────────────────────────────────────────────────
    {
      name: 'dataIndex',
      type: 'number',
      required: true,
      unique: true,
      admin: {
        description: 'The exact array index of this person in data.json (0-based). This links the profile to the correct particle in the visualization.',
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        description: 'URL slug for the profile page. Auto-generated from name + dataIndex if left empty.',
        position: 'sidebar',
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Profile has been verified against primary sources.',
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this profile on the main page.',
        position: 'sidebar',
      },
    },

    // ── Personal details ────────────────────────────────────────────────
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: { description: 'English name (matches data.json n field)' },
            },
            {
              name: 'arabicName',
              type: 'text',
              admin: { description: 'Arabic name (matches data.json a field)' },
            },
            {
              name: 'age',
              type: 'text',
              admin: { description: 'Age string as it appears in data.json (e.g. "5", "2 months")' },
            },
            {
              name: 'birthDate',
              type: 'text',
              admin: { description: 'Birth date from data.json (b field)' },
            },
            {
              name: 'sex',
              type: 'select',
              options: [
                { label: 'Male', value: 'm' },
                { label: 'Female', value: 'f' },
              ],
            },
            {
              name: 'picture',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Portrait photo of the victim' },
            },
            {
              name: 'occupation',
              type: 'text',
              admin: { description: 'Profession or role (e.g. Doctor, Teacher, Student, Child)' },
            },
            {
              name: 'neighborhood',
              type: 'text',
              admin: { description: 'Neighborhood or camp where they lived' },
            },
          ],
        },
        {
          label: 'Story',
          fields: [
            {
              name: 'story',
              type: 'richText',
              admin: { description: 'The full story of this person — their life, their family, who they were.' },
            },
          ],
        },
        {
          label: 'Circumstances of Death',
          fields: [
            {
              name: 'killDate',
              type: 'date',
              admin: {
                description: 'Date of death',
                date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' },
              },
            },
            {
              name: 'location',
              type: 'text',
              admin: { description: 'Where they were killed (city, area, specific site)' },
            },
            {
              name: 'causeOfDeath',
              type: 'select',
              options: [
                { label: 'Airstrike', value: 'airstrike' },
                { label: 'Artillery / Shelling', value: 'shelling' },
                { label: 'Gunshot', value: 'gunshot' },
                { label: 'Explosion / IED', value: 'explosion' },
                { label: 'Targeted Killing', value: 'targeted' },
                { label: 'Torture', value: 'torture' },
                { label: 'Medical Neglect', value: 'medical-neglect' },
                { label: 'Starvation', value: 'starvation' },
                { label: 'Other', value: 'other' },
              ],
              admin: { description: 'Primary cause of death' },
            },
            {
              name: 'circumstances',
              type: 'textarea',
              admin: { description: 'Detailed description of how and where the killing occurred.' },
            },
          ],
        },
        {
          label: 'Family',
          fields: [
            {
              name: 'relativesKilledCount',
              type: 'number',
              min: 0,
              admin: { description: 'Number of family members also killed in the genocide' },
            },
            {
              name: 'relatedVictims',
              type: 'relationship',
              relationTo: 'victim-profiles',
              hasMany: true,
              admin: { description: 'Other victims in this database who are family members' },
            },
            {
              name: 'familyNote',
              type: 'textarea',
              admin: { description: 'Additional context about the family — who else was lost, survivors, etc.' },
            },
          ],
        },
        {
          label: 'Sources',
          fields: [
            {
              name: 'sources',
              type: 'array',
              admin: { description: 'Links to primary sources documenting this person' },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: { description: 'Source name (e.g. "Al Jazeera", "Guardian", "Airwars")' },
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  admin: { description: 'Full URL to the source' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
