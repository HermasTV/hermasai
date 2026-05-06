// dotenv MUST be loaded before payload config is imported
// Using dynamic import to ensure env vars are set first
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

dotenvConfig({ path: resolve(process.cwd(), '.env.local') })

// Verify env loaded
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found. Make sure .env.local exists in project root.')
  process.exit(1)
}
console.log('✅ Env loaded. MongoDB URI:', process.env.MONGODB_URI.substring(0, 40) + '...')

// Dynamic import AFTER env is set
const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload/payload.config.js')

async function resetAdmin() {
  const payload = await getPayload({ config })

  const { docs: users } = await payload.find({ collection: 'users', limit: 10 })
  console.log('Existing users:', users.map(u => ({ id: u.id, email: u.email, name: (u as { name?: string }).name })))

  if (users.length === 0) {
    const user = await payload.create({
      collection: 'users',
      data: { email: 'admin@hermasai.com', password: 'NewPassword123!', name: 'Admin' },
    })
    console.log('✅ Created new admin:', user.email)
    console.log('   Password: NewPassword123!')
  } else {
    const target = users[0]
    await payload.update({
      collection: 'users',
      id: target.id,
      data: { password: 'NewPassword123!' },
    })
    console.log(`✅ Password reset for: ${target.email}`)
    console.log('   New password: NewPassword123!')
  }

  process.exit(0)
}

resetAdmin().catch(e => { console.error(e); process.exit(1) })
