import React, { useRef, useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Icon from 'src/@core/components/icon';

interface ImageContainerProps {
    src: string;
    alt: string;
}

const StyledBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    height: 200,
    cursor: 'pointer',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
}));

export const ImageContainer = ({ src, alt }: ImageContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const onChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', onChange);

        return () => document.removeEventListener('fullscreenchange', onChange);

    }, []);

    return (
        <StyledBox ref={containerRef}>
            <img
                src={src}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: isFullscreen ? 'contain' : 'cover',
                    objectPosition: 'center',
                    backgroundColor: 'black',
                }}
            />
            <IconButton
                onClick={handleFullscreen}
                sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                }}
            >
                <Icon icon='mdi:fullscreen' />
            </IconButton>
        </StyledBox>
    );
};


