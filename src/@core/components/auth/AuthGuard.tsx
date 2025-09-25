import { ReactNode, ReactElement, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter()

  useEffect(
    () => {
      if (!router.isReady) {
        return
      }
      if (!user && !auth.loading) {
        if (router.asPath !== '/') {
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          })
        } else {
          router.replace('/login')
        }
      }
    },
    [router.route, auth.loading, user]
  )

  if (auth.loading || !user) {
    return fallback
  }

  return <Fragment>{children}</Fragment>
}

export default AuthGuard
