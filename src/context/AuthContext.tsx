import { createContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { AuthValuesType, LoginParams, ErrCallbackType } from './types'
import { instance } from 'src/configs/axios'
import authConfig from 'src/configs/auth'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/store'
import { setUser } from 'src/store/auth'
import { useSelector } from 'react-redux'


const defaultProvider: AuthValuesType = {
  loading: true,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {

  const [loading, setLoading] = useState<boolean>(defaultProvider.loading);

  const router = useRouter();
  const store = useSelector((state: RootState) => state.auth)

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem(authConfig.onTokenExpiration);
      if (storedToken) {
        setLoading(true)
        await instance
          .post('/auth/refresh-token', {
            token: storedToken
          })
          .then(async response => {
            const rememberMe = JSON.parse(localStorage.getItem(authConfig.rememberMe) ?? 'false');
            const { user, access_token, refresh_token } = response.data;

            const newUser = { ...user, rememberMe };
            setLoading(false);
            dispatch(setUser({ user: newUser, token: access_token, refresh_token }));

            window.localStorage.setItem(authConfig.onTokenExpiration, refresh_token);

          })
          .catch(() => {
            window.localStorage.removeItem(authConfig.onTokenExpiration);
            window.localStorage.removeItem(authConfig.rememberMe);

            setLoading(false)
            if (!router.pathname.includes('login')) {
              router.replace('/login')
            }
          })
      } else {
        setLoading(false)
      }
    }
    initAuth();
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    instance
      .post('/auth', { email: params.email, password: params.password })
      .then(async response => {

        const { user, access_token, refresh_token } = response.data;

        if (params.rememberMe) {
          window.localStorage.setItem(authConfig.rememberMe, JSON.stringify(params.rememberMe));
          window.localStorage.setItem(authConfig.onTokenExpiration, refresh_token);
        }

        const newUser = { ...user, rememberMe: params.rememberMe }
        dispatch(setUser({ user: newUser, token: access_token, refresh_token }))

        const returnUrl = router.query.returnUrl
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {

    try {
      instance.delete(`/auth/logout/${store.user._id}`);
    } catch (e) {
      console.log(e)
    }
    dispatch(setUser({ user: null, token: null, refresh_token: null }));
    window.localStorage.removeItem(authConfig.onTokenExpiration);
    window.localStorage.removeItem(authConfig.rememberMe);
    router.push('/login')

  }

  const values = {
    loading,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
