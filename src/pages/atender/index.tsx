import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Button, ButtonGroup, Card, CardContent, Divider, Grid, IconButton, Tab, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Icon from 'src/@core/components/icon'
import AddDraw from "src/components/draw";
import { ImageContainer } from 'src/components/image-container';
import { instance } from "src/configs/axios";
import getConfig from 'src/configs/environment'
import { RootState } from "src/store";
import AddDenuncias from "./register";
import { UserType } from "src/types/types";
import CustomChip from 'src/@core/components/mui/chip'

interface Infractor {
    apellido_paterno: string
    apellido_materno: string
    nombres: string
    ci: string
    edad: number
    ocupation: string
    alias: string
}

interface ComplaintType {
    name: string
    image: string
    description: string
    _id: string
}

interface DenunciaType {
    sigla: string
    encargado: UserType | null
    fecha_hecho: string
    hora_hecho: string
    lugar_hecho: string
    tipo_denuncia: ComplaintType | null
    infractores: Infractor[]
    description: string
    otra_denuncia: string
    _id?: string
}

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

interface Atendidos {
    complaint: DataType
    createdAt: string
    confirmed: DenunciaType
    status: 'error' | 'warning' | 'success'
    _id: string
}

const MapLocation = (dynamic(() => import('src/components/maps'), {
    loading: () => <p>Cargando la mapa...</p>,
    ssr: false,
}))

const DetailsReceived = () => {

    const [value, setValue] = useState('1');
    const [atendidos, setAtendidos] = useState<Atendidos | null>(null)
    const [openRegister, setOpenRegister] = useState<boolean>(false)

    const toggleAdd = () => setOpenRegister(!openRegister)

    const { user } = useSelector((state: RootState) => state.auth)

    const fetch = async () => {
        try {
            const response = await instance.get(`/atendidos/${user._id}`)
            setAtendidos(response.data || null)
            console.log(response.data)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        fetch();
    }, [])

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    return (
        <Box sx={{ backgroundColor: theme => theme.palette.background.paper, p: 4, borderRadius: 2 }}>
            {atendidos ?
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Typography variant="h6">{atendidos?.complaint?.userId?.name || 'Usuario'} {atendidos?.complaint?.userId?.lastName || ''}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h5" >Detalles</Typography>
                                    <CustomChip
                                        skin='light'
                                        size='small'
                                        label={atendidos.status === 'error' ? 'Sin Atender' : 'En espera de confirmación'}
                                        color={atendidos.status}
                                    />
                                </Box>
                                <Divider />
                                <Typography variant="overline"><strong>Información del usuario que reporta</strong></Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Icon icon="mdi:email-outline" />
                                    <Typography variant="body2">
                                        <strong>email:</strong> {atendidos?.complaint?.userId?.email || 'No tiene'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Icon icon="mdi:phone-outline" />
                                    <Typography variant="body2">
                                        <strong>Teléfono:</strong> {atendidos?.complaint?.userId?.phone || 'No tiene'}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Typography variant="overline"><strong>Información de la denuncia</strong></Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Tipo de denuncia:</strong> {atendidos?.complaint?.otherComplaints || atendidos?.complaint?.complaints?.name || 'No definido'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Agresor:</strong> {atendidos?.complaint?.otherAggressor || atendidos?.complaint?.aggressor?.name || 'Desconocido'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Víctima:</strong> {atendidos?.complaint?.otherVictim || atendidos?.complaint?.victim?.name || 'Desconocido'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 5 }}>
                                    <Typography variant="body2">
                                        <strong>Lugar del hecho:</strong> {atendidos?.complaint?.place || 'Desconocido'}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Typography variant="overline"><strong>Descripción de los hechos</strong></Typography>
                                <Typography variant="body2">{atendidos?.complaint?.description || ''}</Typography>
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
                                        {atendidos?.complaint?.latitude && atendidos?.complaint?.longitude ?
                                            <MapLocation
                                                center={[parseFloat(atendidos?.complaint?.latitude), parseFloat(atendidos?.complaint?.longitude)]}
                                            /> : <Box sx={{ display: 'flex', justifyContent: 'center' }}><Typography variant="body2">Ubicación no disponible</Typography></Box>}
                                    </TabPanel>
                                    <TabPanel value="2">
                                        {atendidos?.complaint?.images && atendidos?.complaint?.images?.length > 0 ? (
                                            <Grid container spacing={2}>
                                                {atendidos?.complaint.images.map((img, index) => (
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
                                        {atendidos?.complaint?.video ? (
                                            <video width="100%" height="auto" controls>
                                                <source src={atendidos?.complaint.video} type="video/mp4" />
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
                        <Button variant="contained" color={atendidos.status === 'error' ? 'success' : 'warning'} onClick={toggleAdd} >{atendidos.status === 'error' ? 'Registrar denuncia' : 'Editar denuncia'}</Button>
                    </Grid>
                </Grid> :
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 500
                    }}
                >
                    <Typography variant="h4">
                        No tiene denuncias asignadas
                    </Typography>
                </Box>

            }
            <AddDraw open={openRegister} toggle={toggleAdd} title={atendidos?.status === 'error' ? 'Registrar denuncia' : 'Editar Denuncia'}>
                <AddDenuncias toggle={toggleAdd} atendido={atendidos} fetch={fetch} />
            </AddDraw>
        </Box>
    )
}

export default DetailsReceived;