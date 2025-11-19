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
import { createMongoAbility } from '@casl/ability'

interface AclGuardProps {
  children: ReactNode
  guestGuard: boolean
  aclAbilities: ACLObj
}

const AclGuard = ({ children, guestGuard, aclAbilities }: AclGuardProps) => {
  const [ability, setAbility] = useState<AppAbility | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const emptyAbility = createMongoAbility<AppAbility>([])

  useEffect(() => {
    if (user?.rol.permissions) {
      const newAbility = buildAbilityFor(user.rol.permissions)
      setAbility(newAbility)
    }
    setLoading(false)
  }, [user])


  return (
    <AbilityContext.Provider value={ability || emptyAbility}>
      {guestGuard || ['/404', '/500', '/'].includes(router.route) ? (
        <>{children}</>
      ) : loading ? (
        <BlankLayout>
          <Spinner />
        </BlankLayout>
      ) : ability?.can(aclAbilities.action, aclAbilities.subject) ? (
        <>{children}</>
      ) : (
        <BlankLayout>
          <NotAuthorized />
        </BlankLayout>
      )}
    </AbilityContext.Provider>
  )
}

export default AclGuard
