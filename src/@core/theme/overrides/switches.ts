// ** MUI Imports
import { Theme } from '@mui/material/styles'

const Switch = (theme: Theme) => {
  return {
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-track': {
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.grey[400],
            transition: theme.transitions.create(['background-color'], {
              duration: theme.transitions.duration.shortest,
            }),
          },

          '& .MuiSwitch-switchBase': {
            '&:not(.Mui-checked)': {
              '& .MuiSwitch-thumb': {
                color: theme.palette.grey[50],
              },
              '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.grey[600],
              },
            },
          },

          '& .Mui-disabled + .MuiSwitch-track': {
            backgroundColor: theme.palette.grey[500],
            opacity: 0.5,
          }
        }
      }
    }
  }
}

export default Switch
