import { Box } from "@mui/material"

const Watermark = () => {
    return (
        <Box
            component="img"
            src="/images/pages/watermarker.png"
            alt="Marca de agua"
            sx={{
                position: 'sticky',
                bottom: { xs: 10, sm: 60 },
                height: { xs: 35, sm: 70 },
                left: '85%',
                zIndex: 100
            }}
        />
    );
}

export default Watermark;