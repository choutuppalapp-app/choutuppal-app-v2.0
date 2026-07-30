import { getCurrentUser, isAgentRole } from '@/lib/session'
import { AgentPanel } from '@/components/agent/agent-panel'
import { AgentLoginForm } from '@/components/agent/agent-login-form'

export const dynamic = 'force-dynamic'

export default async function AgentPage() {
  const user = await getCurrentUser()
  if (!user || user.isBanned || !isAgentRole(user.role)) {
    return <AgentLoginForm />
  }

  return <AgentPanel agentName={user.name ?? user.username ?? 'Agent'} />
}
