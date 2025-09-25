// ** MUI Imports
import { Theme } from '@mui/material/styles'

const Autocomplete = (theme: Theme) => {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          boxShadow: 'none', border: `1px solid ${theme.palette.divider}`
        }
      }
    }
  }
}

export default Autocomplete
