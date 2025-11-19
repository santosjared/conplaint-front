import Drawer from "@mui/material/Drawer"
import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import Icon from "src/@core/components/icon"
import { ReactNode } from "react"

interface SidebarAddUserType {
  open: boolean
  toggle: () => void
  title: string
  children?: ReactNode
}

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.primary.main
}))

const AddDraw = (props: SidebarAddUserType) => {
  const { open, toggle, title, children } = props

  const handleClose = () => {
    toggle()
  }


  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 600 } } }}
    >
      <Header>
        <Typography variant='h6' sx={{ color: theme => theme.palette.primary.contrastText }}>{title}</Typography>
        <IconButton size='small' onClick={handleClose} sx={{ color: theme => theme.palette.primary.contrastText }}>
          <Icon icon='mdi:close' fontSize={20} />
        </IconButton>
      </Header>
      <Box sx={{ p: 5 }}>
        {children}
      </Box>
    </Drawer>
  )
}
export default AddDraw