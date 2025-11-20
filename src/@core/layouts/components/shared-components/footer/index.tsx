import Box from '@mui/material/Box'
import Watermark from 'src/@core/components/watermark'

const Footer = () => {
  return (
    <Box
      component='footer'
      className='layout-footer'
      sx={{
        zIndex: 10,
        bottom: -1,
        position: 'sticky',
        px: [4, 6],
      }}
    >
      <Box
        component='img'
        src='/images/pages/footer.jpeg'
        alt='footer'
        sx={{
          height: { xs: 31, sm: 51 },
          width: '100%',
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          display: 'block',
          position: 'relative',
        }}
      />
      <Watermark />
    </Box>
  )
}

export default Footer
