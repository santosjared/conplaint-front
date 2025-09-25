import { ReactNode, ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'

interface GuestGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const GuestGuard = (props: GuestGuardProps) => {
  const { children, fallback } = props
  const { loading } = useAuth()
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (user) {
      router.replace('/')
    }

  }, [router.route])

  if (loading || (!loading && user)) {
    return fallback
  }

  return <>{children}</>
}

export default GuestGuard
