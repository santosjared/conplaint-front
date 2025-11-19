import {
  Mode,
  VerticalNavToggle,
} from 'src/@core/layouts/types'

type ThemeConfig = {
  mode: Mode
  navHidden: boolean
  templateName: string
  navCollapsed: boolean
  routingLoader: boolean
  disableRipple: boolean
  navigationSize: number
  navSubItemIcon: string
  menuTextTruncate: boolean
  responsiveFontSizes: boolean
  collapsedNavigationSize: number
  verticalNavToggleType: VerticalNavToggle
  afterVerticalNavMenuContentPosition: 'fixed' | 'static'
  beforeVerticalNavMenuContentPosition: 'fixed' | 'static'
  toastPosition: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

const themeConfig: ThemeConfig = {
  templateName: 'Radio Patrulla 110',
  mode: 'light' as Mode,
  routingLoader: true,
  navHidden: false,
  menuTextTruncate: true,
  navSubItemIcon: 'mdi:circle',
  verticalNavToggleType: 'accordion',
  navCollapsed: false,
  navigationSize: 260,
  collapsedNavigationSize: 68,
  afterVerticalNavMenuContentPosition: 'fixed',
  beforeVerticalNavMenuContentPosition: 'fixed',
  responsiveFontSizes: true,
  disableRipple: false,
  toastPosition: 'top-right' /* top-left | top-center | top-right | bottom-left | bottom-center | bottom-right */
}

export default themeConfig
