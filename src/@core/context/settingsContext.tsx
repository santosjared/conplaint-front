import { createContext, useState, ReactNode, useEffect } from 'react'
import { Direction } from '@mui/material'
import themeConfig from 'src/configs/themeConfig'
import { Mode, ThemeColor, VerticalNavToggle } from 'src/@core/layouts/types'

export type Settings = {
  mode: Mode
  navHidden?: boolean
  navCollapsed: boolean
  themeColor: ThemeColor
  verticalNavToggleType: VerticalNavToggle
  toastPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

export type PageSpecificSettings = {
  mode?: Mode
  navHidden?: boolean // navigation menu
  appBarBlur?: boolean
  direction?: Direction
  navCollapsed?: boolean
  themeColor?: ThemeColor
  verticalNavToggleType?: VerticalNavToggle
  toastPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}
export type SettingsContextValue = {
  settings: Settings
  saveSettings: (updatedSettings: Settings) => void
}

interface SettingsProviderProps {
  children: ReactNode
  pageSettings?: PageSpecificSettings | void
}

const initialSettings: Settings = {
  themeColor: 'primary',
  mode: themeConfig.mode,
  navHidden: themeConfig.navHidden,
  navCollapsed: themeConfig.navCollapsed,
  toastPosition: themeConfig.toastPosition,
  verticalNavToggleType: themeConfig.verticalNavToggleType,
}

const staticSettings = {
  navHidden: initialSettings.navHidden,
  toastPosition: initialSettings.toastPosition
}

const restoreSettings = (): Settings | null => {
  let settings = null

  try {
    const storedData: string | null = window.localStorage.getItem('settings')

    if (storedData) {
      settings = { ...JSON.parse(storedData), ...staticSettings }
    } else {
      settings = initialSettings
    }
  } catch (err) {
    console.error(err)
  }

  return settings
}
const storeSettings = (settings: Settings) => {
  const initSettings = Object.assign({}, settings)
  delete initSettings.navHidden
  delete initSettings.toastPosition
  window.localStorage.setItem('settings', JSON.stringify(initSettings))
}

export const SettingsContext = createContext<SettingsContextValue>({
  saveSettings: () => null,
  settings: initialSettings
})

export const SettingsProvider = ({ children, pageSettings }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>({ ...initialSettings })

  useEffect(() => {
    const restoredSettings = restoreSettings()

    if (restoredSettings) {
      setSettings({ ...restoredSettings })
    }
    if (pageSettings) {
      setSettings({ ...settings, ...pageSettings })
    }

  }, [pageSettings])

  const saveSettings = (updatedSettings: Settings) => {
    storeSettings(updatedSettings)
    setSettings(updatedSettings)
  }

  return <SettingsContext.Provider value={{ settings, saveSettings }}>{children}</SettingsContext.Provider>
}

export const SettingsConsumer = SettingsContext.Consumer
