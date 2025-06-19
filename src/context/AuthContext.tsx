import { createContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import authConfig from 'src/configs/auth'
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType, Tokens } from './types'
import { instance } from 'src/configs/axios'

const defaultTokens: Tokens = {
  accesToken: '',
  refreshToken: ''
}

const defaultProvider: AuthValuesType = {
  tokens: defaultTokens,
  loadingRefresh: false,
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  refresh: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)
  const [tokens, setTokens] = useState<Tokens>(defaultTokens);
  const [loadingRefresh, setLoadingRefresh] = useState<boolean>(defaultProvider.loadingRefresh)

  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem(authConfig.onTokenExpiration);
      if (storedToken && !user) {
        setLoading(true)
        await instance
          .post('/auth/refresh-token', {
            token: storedToken
          })
          .then(async response => {
            setLoading(false)
            console.log('refresh token')
            const rememberMe = JSON.parse(localStorage.getItem(authConfig.rememberMe) ?? 'false');
            setTokens({ ...tokens, accesToken: response.data.access_token, refreshToken: response.data.refresh_token });
            setUser({ ...response.data.userData, rememberMe })
            window.localStorage.setItem(authConfig.onTokenExpiration, response.data.refresh_token)
          })
          .catch(() => {
            console.log('falield in token')
            localStorage.removeItem(authConfig.onTokenExpiration);
            window.localStorage.removeItem(authConfig.rememberMe);
            setUser(null)
            setLoading(false)
            if (!router.pathname.includes('login')) {
              router.replace('/login')
            }
          })
      } else {
        console.log('mana')
        setLoading(false)
      }
    }
    initAuth();
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    instance
      .post('/auth', { email: params.email, password: params.password })
      .then(async response => {
        if (params.rememberMe) {
          window.localStorage.setItem(authConfig.rememberMe, JSON.stringify(params.rememberMe));
          window.localStorage.setItem(authConfig.onTokenExpiration, response.data.refresh_token);
        }
        const returnUrl = router.query.returnUrl
        setTokens({ ...tokens, accesToken: response.data.access_token, refreshToken: response.data.refresh_token });
        setUser({ ...response.data.userData, rememberMe: params.rememberMe })

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    if (user) {
      instance.delete(`/auth/logout/${user.userId}`);
    } else {
      console.error('No se encontró el ID de usuario en localStorage');
    }
    setUser(null)
    setTokens(defaultTokens)
    window.localStorage.removeItem(authConfig.onTokenExpiration)
    window.localStorage.removeItem(authConfig.rememberMe)
    router.push('/login')
  }


  const handleRefresh = async (): Promise<void> => {
    console.log('llamadas al refresh')
    setLoadingRefresh(true);
    try {
      const response = await instance
        .post('/auth/refresh-token', {
          token: tokens.refreshToken
        })
      const rememberMe = user?.rememberMe ?? JSON.parse(localStorage.getItem(authConfig.rememberMe) ?? 'false');
      if (rememberMe) {
        window.localStorage.setItem(authConfig.rememberMe, JSON.stringify(rememberMe));
        window.localStorage.setItem(authConfig.onTokenExpiration, response.data.refresh_token);
      }
      setTokens({ ...tokens, accesToken: response.data.access_token, refreshToken: response.data.refresh_token });
      setUser({ ...response.data.userData, rememberMe })
      setLoadingRefresh(false);
    } catch (e) {
      console.error(e);
      localStorage.removeItem(authConfig.onTokenExpiration);
      window.localStorage.removeItem(authConfig.rememberMe);
      setLoadingRefresh(false);
    }
  };


  const values = {
    user,
    loading,
    loadingRefresh,
    tokens,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    refresh: handleRefresh,
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
