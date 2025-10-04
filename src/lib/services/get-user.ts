import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

export const getUser = cache(async () => {
  const headers = await getHeaders()
  const payload = await getPayload({ config })

  return await payload.auth({ headers: headers })
})
