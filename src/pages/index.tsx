import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Spinner from 'src/@core/components/spinner'
import navigation from 'src/navigation/vertical'
import { buildAbilityFor } from 'src/configs/acl'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter()
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!user) return

    const ability = buildAbilityFor(user?.rol?.permissions)
    if (!ability) return
    const navItems = navigation()
    const accessibleRoute: any = navItems.find(item => {
      return ability.can('read', item.subject || '')
    })
    if (accessibleRoute) {
      router.replace(accessibleRoute.path)
    } else {
      router.replace('/acl')
    }
  }, [user])

  return <Spinner />
}

export default Home
