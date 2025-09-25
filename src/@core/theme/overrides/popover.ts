
import { Theme } from '@mui/material/styles'

const Popover = (theme: Theme) => {
  return {
    MuiPopover: {
      styleOverrides: {
        root: {
          '& .MuiPopover-paper': {
            boxShadow: theme.shadows[6],
            border: `1px solid ${theme.palette.divider}`
          }
        }
      }
    }
  }
}

export default Popover
