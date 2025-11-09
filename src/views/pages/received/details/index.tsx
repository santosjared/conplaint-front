import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Button, ButtonGroup, Card, CardContent, Divider, Grid, IconButton, Tab, Typography, useTheme } from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Icon from 'src/@core/components/icon'
import { ImageContainer } from 'src/components/image-container';
import getConfig from 'src/configs/environment'
import { useSocket } from "src/hooks/useSocket";
import Can from "src/layouts/components/acl/Can";
import { AppDispatch } from "src/store";
import { refusedComplaints } from "src/store/received";
import Swal from 'sweetalert2';

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
    otherAggresor?: string
    otherVictim?: string
    status?: string
    createdAt: string
    userId: Client
    contact?: string,
    _id?: string
}

interface DetailsReceivedProps {
    data: DataType | null
    page: number
    pageSize: number
    activeTab: string
    toggle: () => void
}

const MapLocation = (dynamic(() => import('src/components/maps'), {
    loading: () => <p>Cargando la mapa...</p>,
    ssr: false,
}))

const DetailsReceived = ({ data, toggle, page, pageSize, activeTab }: DetailsReceivedProps) => {
    const [value, setValue] = useState('1');

    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()

    const theme = useTheme()
    const { getData } = useSocket()

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    const handleRefuse = async () => {
        const confirme = await Swal.fire({
            title: '¿Estas seguro de rechazar la denuncia?',
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: theme.palette.info.main,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: theme.palette.error.main,
            confirmButtonText: 'Si',
        }).then(async (result) => { return result.isConfirmed });
        if (confirme) {
            dispatch(
                refusedComplaints({
                    status: activeTab !== 'all' ? activeTab : '',
                    skip: page * pageSize,
                    limit: pageSize,
                    id: data?._id || ''
                }))
                .then(() => {
                    getData();
                    toggle();
                }
                )
        }
    }
    return (
        <Box sx={{ backgroundColor: theme => theme.palette.background.paper, p: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'end', mb: 4 }}>
                <IconButton size='small' onClick={toggle} color="secondary">
                    <Icon icon='mdi:close' fontSize={20} />
                </IconButton>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Typography variant="h6">{data?.userId?.name || 'Usuario'} {data?.userId?.lastName || ''}</Typography>
                            </Box>
                            <Typography variant="h5" >Detalles</Typography>
                            <Divider />
                            <Typography variant="overline"><strong>Información del usuario que reporta</strong></Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Icon icon="mdi:email-outline" />
                                <Typography variant="body2">
                                    <strong>email:</strong> {data?.userId?.email || 'No tiene'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon icon="mdi:phone-outline" />
                                <Typography variant="body2">
                                    <strong>Teléfono:</strong> {data?.contact || data?.userId?.phone || 'No tiene'}
                                </Typography>
                            </Box>
                            <Divider />
                            <Typography variant="overline"><strong>Información de la denuncia</strong></Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Tipo de denuncia:</strong> {data?.otherComplaints || data?.complaints?.name || 'No definido'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Agresor:</strong> {data?.otherAggresor || data?.aggressor?.name || 'Desconocido'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Víctima:</strong> {data?.otherVictim || data?.victim?.name || 'Desconocido'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 5 }}>
                                <Typography variant="body2">
                                    <strong>Lugar del hecho:</strong> {data?.place || 'Desconocido'}
                                </Typography>
                            </Box>
                            <Divider />
                            <Typography variant="overline"><strong>Descripción de los hechos</strong></Typography>
                            <Typography variant="body2">{data?.description || ''}</Typography>
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
                                    {data?.latitude && data?.longitude ?
                                        <MapLocation
                                            center={[parseFloat(data?.latitude), parseFloat(data?.longitude)]}
                                        /> : <Box sx={{ display: 'flex', justifyContent: 'center' }}><Typography variant="body2">Ubicación no disponible</Typography></Box>}
                                </TabPanel>
                                <TabPanel value="2">
                                    {data?.images && data?.images?.length > 0 ? (
                                        <Grid container spacing={2}>
                                            {data.images.map((img, index) => (
                                                <Grid item xs={12} key={index}>
                                                    <ImageContainer src={`${getConfig().backendURI}/images/${img}`} alt='img' />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}><Typography variant="body2">No hay imágenes disponibles</Typography></Box>
                                    )}
                                </TabPanel>
                                <TabPanel value="3">
                                    {data?.video ? (
                                        <video width="100%" height="200px" controls style={{ borderRadius: 5 }}>
                                            <source src={`${getConfig().backendURI}/videos/${data.video}`} type="video/mp4" />
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        {data?.status !== 'acepted' && <ButtonGroup variant="outlined" aria-label="Basic button group">
                            <Can I="refused" a="recibidos">
                                <Button color="error" disabled={data?.status === 'refused' || data?.status === 'acepted'} onClick={handleRefuse}>Rechazar</Button>
                            </Can>
                            <Can I="acepted" a="recibidos">
                                <Button color="success" disabled={data?.status === 'acepted'} onClick={() => router.push(`/received/asigned/${data?._id}`)}>Atender</Button>
                            </Can>
                        </ButtonGroup>}
                        <Button variant="contained" color="info" onClick={toggle}>Aceptar</Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default DetailsReceived;