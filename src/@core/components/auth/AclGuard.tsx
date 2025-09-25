import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { ACLObj, AppAbility } from 'src/configs/acl'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { buildAbilityFor } from 'src/configs/acl'
import NotAuthorized from 'src/pages/401'
import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'

interface AclGuardProps {
  children: ReactNode
  guestGuard: boolean
  aclAbilities: ACLObj
}

const AclGuard = ({ children, guestGuard, aclAbilities }: AclGuardProps) => {
  const [ability, setAbility] = useState<AppAbility | null>(null)
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (user?.rol.permissions && !ability) {
      const newAbility = buildAbilityFor(user.rol.permissions)
      setAbility(newAbility)
    }
    setLoading(false);
  }, [user, ability])

  if (guestGuard || ['/404', '/500', '/'].includes(router.route)) {
    return <>{children}</>
  }
  if (ability && ability.can(aclAbilities.action, aclAbilities.subject)) {
    return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
  }

  return (
    <BlankLayout>
      {loading ? <Spinner /> : <NotAuthorized />}
    </BlankLayout>
  )
}
export default AclGuard
