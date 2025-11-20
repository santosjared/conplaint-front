import { Box } from "@mui/material"

const Watermark = () => {
    return (
        <Box
            component="img"
            src="/images/pages/watermarker.png"
            alt="Marca de agua"
            sx={{
                position: 'absolute',
                bottom: { xs: 35, sm: 70 },
                right: 50,
                height: { xs: 35, sm: 70 },
                zIndex: 100,
                pointerEvents: 'none',
            }}
        />
    );
}

export default Watermark;