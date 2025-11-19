import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { useEffect, useRef, useState } from "react"
import { styled } from '@mui/material/styles'
import { Button, IconButton } from "@mui/material"
import Icon from "src/@core/components/icon"

interface PropsMap {
    center: [number, number]
}

const MapBox = styled('div')(({ theme }) => ({
    position: 'relative',
    margin: 0,
    padding: 0,
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: 10,
    width: '100%',
    height: 400
}))

const Map = ({ center }: PropsMap) => {
    const mapRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${center[0]},${center[1]}`

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Ubicación del hecho',
                    text: 'Aquí está la ubicación del hecho reportado:',
                    url: mapsUrl
                })
            } catch (error) {
                console.error('Error al compartir la ubicación:', error)
            }
        } else {
            alert('La función de compartir no está soportada en este navegador. Por favor, copie el siguiente enlace:\n' + mapsUrl)
        }
    }

    const handleFullscreen = () => {
        if (!mapRef.current) return

        if (!document.fullscreenElement) {
            if (mapRef.current.requestFullscreen) {
                mapRef.current.requestFullscreen().catch(err => {
                    console.error('Error al activar pantalla completa:', err)
                })
            }
        } else {
            document.exitFullscreen().catch(err => {
                console.error('Error al salir de pantalla completa:', err)
            })
        }
    }

    useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleChange)

        }
    }, [])

    const styleMap = {
        width: '100%',
        height: '100%',
        borderRadius: 10
    }

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
                aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
                sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    zIndex: 1000,
                    '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.7)'
                    }
                }}
            >
                <Icon icon={isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'} />
            </IconButton>
            <Button endIcon={<Icon icon="mdi:share-variant" />} sx={{ position: 'absolute', bottom: 10, left: 10, zIndex: 1000 }} variant="contained" color="primary" onClick={handleShare}>
                Compartir ubicación
            </Button>
        </MapBox>
    )
}

export default Map
