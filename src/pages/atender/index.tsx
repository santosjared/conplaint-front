import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Button, ButtonGroup, Card, CardContent, Divider, Grid, IconButton, Tab, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Icon from 'src/@core/components/icon'
import { ImageContainer } from 'src/components/image-container';
import { instance } from "src/configs/axios";
import getConfig from 'src/configs/environment'

interface Client {
    name: string
    lastName: string
    email: string
    phone: string
}
interface Kin {
    name: string
}
interface Typecomplaints {
    name: string
}
interface DataType {
    complaints: Typecomplaints
    aggressor?: Kin
    victim?: Kin
    place?: string
    description?: string
    latitude?: string
    longitude?: string
    images?: Array<string>
    video?: string
    otherComplaints?: string
    otherAggressor?: string
    otherVictim?: string
    status?: string
    createdAt: string
    userId: Client
    _id?: string
}

const MapLocation = (dynamic(() => import('src/components/maps'), {
    loading: () => <p>Cargando la mapa...</p>,
    ssr: false,
}))

const DetailsReceived = () => {

    const [value, setValue] = useState('1');
    const [complaint, setComplaint] = useState<DataType | null>(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await instance.get('')
                setComplaint(response.data || null)
            } catch (error) {
                console.log(error)
            }
        }
        fetch();
    }, [])

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    return (
        <Box sx={{ backgroundColor: theme => theme.palette.background.paper, p: 4, borderRadius: 2 }}>
            {complaint ?
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Typography variant="h6">{complaint?.userId?.name || 'Usuario'} {complaint?.userId?.lastName || ''}</Typography>
                                </Box>
                                <Typography variant="h5" >Detalles</Typography>
                                <Divider />
                                <Typography variant="overline"><strong>Información del usuario que reporta</strong></Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Icon icon="mdi:email-outline" />
                                    <Typography variant="body2">
                                        <strong>email:</strong> {complaint?.userId?.email || 'No tiene'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Icon icon="mdi:phone-outline" />
                                    <Typography variant="body2">
                                        <strong>Teléfono:</strong> {complaint?.userId?.phone || 'No tiene'}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Typography variant="overline"><strong>Información de la denuncia</strong></Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Tipo de denuncia:</strong> {complaint?.otherComplaints || complaint?.complaints?.name || 'No definido'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Agresor:</strong> {complaint?.otherAggressor || complaint?.aggressor?.name || 'Desconocido'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Víctima:</strong> {complaint?.otherVictim || complaint?.victim?.name || 'Desconocido'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 5 }}>
                                    <Typography variant="body2">
                                        <strong>Lugar del hecho:</strong> {complaint?.place || 'Desconocido'}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Typography variant="overline"><strong>Descripción de los hechos</strong></Typography>
                                <Typography variant="body2">{complaint?.description || ''}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <Card>
                            <Box sx={{ width: '100%', typography: 'body1' }}>
                                <TabContext value={value}>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <TabList onChange={handleChange} aria-label="lab API tabs example" variant="fullWidth" >
                                            <Tab label="Ubicación maps" value="1" />
                                            <Tab label="Fotos" value="2" />
                                            <Tab label="Videos" value="3" />
                                        </TabList>
                                    </Box>
                                    <TabPanel value="1">
                                        {complaint?.latitude && complaint?.longitude ?
                                            <MapLocation
                                                center={[parseFloat(complaint?.latitude), parseFloat(complaint?.longitude)]}
                                            /> : <Box sx={{ display: 'flex', justifyContent: 'center' }}><Typography variant="body2">Ubicación no disponible</Typography></Box>}
                                    </TabPanel>
                                    <TabPanel value="2">
                                        {complaint?.images && complaint?.images?.length > 0 ? (
                                            <Grid container spacing={2}>
                                                {complaint.images.map((img, index) => (
                                                    <Grid item xs={12} key={index}>
                                                        <ImageContainer src={`${getConfig().backendURI}/images/${value}`} alt='img' />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}><Typography variant="body2">No hay imágenes disponibles</Typography></Box>
                                        )}
                                    </TabPanel>
                                    <TabPanel value="3">
                                        {complaint?.video ? (
                                            <video width="100%" height="auto" controls>
                                                <source src={complaint.video} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}><Typography variant="body2">No hay videos disponibles</Typography></Box>
                                        )}
                                    </TabPanel>
                                </TabContext>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="info" >Aceptar</Button>
                    </Grid>
                </Grid> :
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center', // centra horizontalmente
                        alignItems: 'center',     // centra verticalmente
                        height: 500
                    }}
                >
                    <Typography variant="h4">
                        No tiene denuncias asignadas
                    </Typography>
                </Box>

            }
        </Box>
    )
}

export default DetailsReceived;