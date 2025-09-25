import { PaletteMode } from '@mui/material'

const getRGBA = (rgb: number[], alpha: number) => `rgba(${rgb.join(', ')}, ${alpha})`

const DefaultPalette = (mode: PaletteMode) => {
  const RGB_LIGHT: number[] = [76, 78, 100]
  const RGB_DARK: number[] = [255, 255, 255]

  const mainColor = mode === 'light' ? RGB_LIGHT : RGB_DARK

  return {
    customColors: {
      dark: `rgb(${RGB_DARK.join(',')})`,
      main: `rgb(${mainColor.join(',')})`,
      light: `rgb(${RGB_LIGHT.join(',')})`,
      darkBg: '#282A42',
      lightBg: '#F7F7F9',
      bodyBg: mode === 'light' ? '#F7F7F9' : '#282A42',
      trackBg: mode === 'light' ? '#F2F2F4' : '#41435C',
      tooltipBg: mode === 'light' ? '#262732' : '#464A65',
      circularBg: mode === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(15, 15, 15, 0.05)',
      tableHeaderBg: mode === 'light' ? '#F5F5F7' : '#3A3E5B'
    },
    mode,
    common: {
      black: '#000000',
      white: '#ffffff'
    },
    primary: {
      light: '#a4d055ff',
      main: '#5f7200ff',
      dark: '#395500ff',
      contrastText: '#ffffff'
    },
    secondary: {
      light: '#7F889B',
      main: '#6D788D',
      dark: '#606A7C',
      contrastText: '#ffffff'
    },
    error: {
      light: '#FF625F',
      main: '#FF4D49',
      dark: '#E04440',
      contrastText: '#ffffff'
    },
    warning: {
      light: '#FDBE42',
      main: '#FDB528',
      dark: '#DF9F23',
      contrastText: '#ffffff'
    },
    info: {
      light: '#40CDFA',
      main: '#26C6F9',
      dark: '#21AEDB',
      contrastText: '#ffffff'
    },
    success: {
      light: '#81c784',
      main: '#4caf50',
      dark: '#388e3c',
      contrastText: '#ffffff'
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#F5F5F5',
      A200: '#EEEEEE',
      A400: '#BDBDBD',
      A700: '#616161'
    },
    text: {
      primary: getRGBA(mainColor, 0.87),
      secondary: getRGBA(mainColor, 0.6),
      disabled: getRGBA(mainColor, 0.38)
    },
    divider: getRGBA(mainColor, 0.12),
    background: {
      paper: mode === 'light' ? '#e6e6e6ff' : '#30334E',
      default: mode === 'light' ? '#cbcad0ff' : '#282A42'
    },
    action: {
      active: getRGBA(mainColor, 0.54),
      hover: getRGBA(mainColor, 0.05),
      hoverOpacity: 0.05,
      selected: getRGBA(mainColor, 0.08),
      disabled: getRGBA(mainColor, 0.26),
      disabledBackground: getRGBA(mainColor, 0.12),
      focus: getRGBA(mainColor, 0.12)
    }
  }
}

export default DefaultPalette
