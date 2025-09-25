import { useState } from 'react'
import Fab from '@mui/material/Fab'
import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'
import Icon from 'src/@core/components/icon'
import themeConfig from 'src/configs/themeConfig'
import { LayoutProps } from 'src/@core/layouts/types'
import AppBar from './components/vertical/appBar'
import Navigation from './components/vertical/navigation'
import Footer from './components/shared-components/footer'
import ScrollToTop from 'src/@core/components/scroll-to-top'

const VerticalLayoutWrapper = styled('div')({
  height: '100%',
  display: 'flex'
})

const MainContentWrapper = styled(Box)<BoxProps>({
  flexGrow: 1,
  minWidth: 0,
  display: 'flex',
  minHeight: '100vh',
  maxHeight: '100vh',
  flexDirection: 'column',
})

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  padding: theme.spacing(6),
  backgroundImage: `radial-gradient(${theme.palette.customColors.circularBg} 10px, transparent 1px)`,
  backgroundSize: '35px 35px',
  transition: 'padding .25s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

const VerticalLayout = (props: LayoutProps) => {

  const { children, scrollToTop, verticalLayoutProps } = props
  const { navigationSize, collapsedNavigationSize } = themeConfig
  const navWidth = navigationSize
  const navigationBorderWidth = 1
  const collapsedNavWidth = collapsedNavigationSize

  const [navVisible, setNavVisible] = useState<boolean>(false)

  const toggleNavVisibility = () => setNavVisible(!navVisible)

  return (
    <>
      <VerticalLayoutWrapper className='layout-wrapper'>
        <Navigation
          navWidth={navWidth}
          navVisible={navVisible}
          setNavVisible={setNavVisible}
          collapsedNavWidth={collapsedNavWidth}
          toggleNavVisibility={toggleNavVisibility}
          navigationBorderWidth={navigationBorderWidth}
          navMenuContent={verticalLayoutProps.navMenu.content}
          navMenuBranding={verticalLayoutProps.navMenu.branding}
          menuLockedIcon={verticalLayoutProps.navMenu.lockedIcon}
          verticalNavItems={verticalLayoutProps.navMenu.navItems}
          navMenuProps={verticalLayoutProps.navMenu.componentProps}
          menuUnlockedIcon={verticalLayoutProps.navMenu.unlockedIcon}
          afterNavMenuContent={verticalLayoutProps.navMenu.afterContent}
          beforeNavMenuContent={verticalLayoutProps.navMenu.beforeContent}
          {...props}
        />
        <MainContentWrapper
          className='layout-content-wrapper'
        >
          <AppBar
            toggleNavVisibility={toggleNavVisibility}
            appBarContent={verticalLayoutProps.appBar?.content}
            appBarProps={verticalLayoutProps.appBar?.componentProps}
            {...props}
          />

          <ContentWrapper
            className='layout-page-content'
            sx={{
              mx: 'auto',
              '@media (min-width:1440px)': { maxWidth: 1440 },
              '@media (min-width:1200px)': { maxWidth: '100%' }
            }}
          >
            {children}
          </ContentWrapper>
          <Footer />
        </MainContentWrapper>
      </VerticalLayoutWrapper>
      {scrollToTop ? (
        scrollToTop(props)
      ) : (
        <ScrollToTop className='mui-fixed'>
          <Fab color='primary' size='small' aria-label='scroll back to top'>
            <Icon icon='mdi:arrow-up' />
          </Fab>
        </ScrollToTop>
      )}
    </>
  )
}

export default VerticalLayout
