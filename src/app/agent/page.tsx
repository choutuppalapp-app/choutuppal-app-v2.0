import { redirect } from 'next/navigation'
import { getCurrentUser, isAgentRole } from '@/lib/session'
import { AgentPanel } from '@/components/agent/agent-panel'

export const dynamic = 'force-dynamic'

export default async function AgentPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.isBanned) redirect('/')
  if (!isAgentRole(user.role)) redirect('/dashboard')

  return <AgentPanel agentName={user.name ?? user.username ?? 'Agent'} />
}
