import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ReactNode, useEffect, useRef, useState } from "react";
import { styled } from '@mui/material/styles';
import { IconButton } from "@mui/material";
import Icon from "src/@core/components/icon";

interface PropsMap {
    center: [number, number];
}

const MapBox = styled('div')(({ theme }) => ({
    margin: 0,
    padding: 0,
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: 10,
    width: '100%',
    height: 300,
}))

const Map = ({ center }: PropsMap) => {

    const mapRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleFullscreen = () => {
        if (mapRef.current) {
            if (!document.fullscreenElement) {
                mapRef.current.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);


    const styleMap = {
        width: '100%',
        height: '100%',
        borderRadius: 10
    };

    return (
        <MapBox ref={mapRef}>
            <MapContainer center={center} zoom={16} style={styleMap} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center}>
                    <Popup>Ubicación del hecho</Popup>
                </Marker>
            </MapContainer>
            <IconButton
                onClick={handleFullscreen}
                sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    zIndex: 1000,
                }}
            >
                <Icon icon='mdi:fullscreen' />
            </IconButton>
        </MapBox>
    );
};


export default Map;