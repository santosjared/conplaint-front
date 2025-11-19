import Typography from '@mui/material/Typography'
import { Alert, Box, BoxProps, styled } from '@mui/material'

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const ACLPage = () => {

  return (
    <Box className='content-center'>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <BoxWrapper>
          <Typography variant='h1' sx={{ mb: 2.5 }}>
            401
          </Typography>
          <Typography variant='h5' sx={{ mb: 2.5, fontSize: '1.5rem !important' }}>
            You are not authorized! 🔐
          </Typography>
          <Alert severity="warning">
            <Typography variant='h6' sx={{ mb: 2, display: 'block' }}>
              No tienes ningun permiso para manejar este sistema porfavor solicite permisos
              al administrador de este sistema
            </Typography>
          </Alert>
        </BoxWrapper>
      </Box>
    </Box>
  )
}

ACLPage.acl = {
  action: 'read',
  subject: 'acl'
}

export default ACLPage
