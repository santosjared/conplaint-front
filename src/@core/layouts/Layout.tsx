import { useEffect, useRef } from 'react'
import { LayoutProps } from 'src/@core/layouts/types'
import VerticalLayout from './VerticalLayout'

const Layout = (props: LayoutProps) => {
  const { hidden, children, settings, saveSettings } = props
  const isCollapsed = useRef(settings.navCollapsed)

  useEffect(() => {
    if (hidden) {
      if (settings.navCollapsed) {
        saveSettings({ ...settings, navCollapsed: false })
        isCollapsed.current = true
      }
    } else {
      if (isCollapsed.current) {
        saveSettings({ ...settings, navCollapsed: true })
        isCollapsed.current = false
      }
    }
  }, [hidden])

  return <VerticalLayout {...props}>{children}</VerticalLayout>
}

export default Layout
