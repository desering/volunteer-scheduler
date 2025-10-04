'use server'

import { logout } from '@/actions/auth/logout'

export default async function Page() {
  logout()
}
