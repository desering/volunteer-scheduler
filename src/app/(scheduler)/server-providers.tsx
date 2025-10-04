import { getUser } from '@/lib/services/get-user'
import { AuthProvider } from '@/providers/auth'

export const ServerProviders = async ({ children }: { children: React.ReactNode }) => {
  const { user } = await getUser()
  return <AuthProvider initialUser={user ?? undefined}>{children}</AuthProvider>
}
