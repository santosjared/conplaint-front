// ** MUI Imports
import { Theme } from '@mui/material/styles'

const Snackbar = (theme: Theme) => {
  return {
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: theme.spacing(1.75, 4),
          boxShadow: 'none',
          backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[900] : theme.palette.grey[100],
          '& .MuiSnackbarContent-message': {
            lineHeight: 1.429
          }
        }
      }
    }
  }
}

export default Snackbar
