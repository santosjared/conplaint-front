import { useEffect, useState } from 'react'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    IconButton,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Icon from 'src/@core/components/icon'
import AddPatrols from './AddPatrols'
import AddPersonal from './AddPersonal'
import { UserType } from 'src/types/types'
import baseUrl from 'src/configs/environment'
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";
import Paper from '@mui/material/Paper'
import Swal from 'sweetalert2'
import { instance } from 'src/configs/axios'
import { useRouter } from 'next/router'

interface MarkerType {
    _id?: string
    name: string
}

interface TypeType {
    _id?: string
    name: string
}

interface VehicleType {
    _id?: string
    plaque: string
    code: string
    marker: MarkerType
    type: TypeType
    imageUrl: string
}

interface TabsType {
    label: string
    patrols?: VehicleType
    user?: UserType[]
}

const defaultValue: TabsType = {
    label: 'Patrulla 1',
    patrols: undefined,
    user: []
}

const MenuAsigned = () => {
    const [tabs, setTabs] = useState<TabsType[]>([defaultValue])
    const [activeTab, setActiveTab] = useState('0')
    const [addPatrols, setAddPatrols] = useState<boolean>(false)
    const [addPersonal, setAddPersonal] = useState<boolean>(false)
    const [currentIndex, setCurrentIndex] = useState<number>(0)

    const router = useRouter();
    const { id } = router.query

    const togglePatrols = () => setAddPatrols(prev => !prev)
    const togglePersonal = () => setAddPersonal(prev => !prev)

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        if (newValue === 'add') {
            const newIndex = tabs.length
            const newTab: TabsType = { label: `Patrulla ${newIndex + 1}` }
            setTabs(prev => [...prev, newTab])
            setActiveTab(String(newIndex))
            setCurrentIndex(newIndex)
        } else {
            setActiveTab(newValue)
            setCurrentIndex(parseInt(newValue, 10))
        }
    }


    const handleRemoveTab = async (index: number) => {

        const confirme = await Swal.fire({
            title: `¿Estas seguro de eliminar ${tabs[index].label}?`,
            text: `Se perderan las configuraciones del tab ${tabs[index].label}`,
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#3085d6",
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ff4040',
            confirmButtonText: 'Eliminar',
        }).then(async (result) => { return result.isConfirmed });
        if (confirme) {
            const newTabs = [...tabs]
            newTabs.splice(index, 1)
            setTabs(newTabs)

            if (newTabs.length === 0) {
                setActiveTab('0')
                setTabs([defaultValue])
            } else if (String(index) === activeTab) {
                const newActiveIndex = index === 0 ? 0 : index - 1
                setActiveTab(String(newActiveIndex))
            } else if (parseInt(activeTab) > index) {
                setActiveTab(String(parseInt(activeTab) - 1))
            }
        }
    }

    const handleSelectPatrol = (patrol: VehicleType) => {
        const index = parseInt(activeTab)
        const newTabs = [...tabs]
        newTabs[index] = { ...newTabs[index], patrols: patrol }
        setTabs(newTabs)
        togglePatrols()
    }

    const handleSelectUsers = (users: UserType[]) => {
        const index = parseInt(activeTab)
        const newTabs = [...tabs]
        newTabs[index] = { ...newTabs[index], user: users }
        setTabs(newTabs)
        togglePersonal()
    }

    const handleSave = async () => {
        let errores = false;

        const newdata = [];

        for (const tab of tabs) {
            if (!tab.user || tab.user.length <= 0) {
                await Swal.fire({
                    title: '¡Error!',
                    text: `Debe asignar personal al vehículo patrullero en el tab ${tab.label}`,
                    icon: "error"
                });
                errores = true;
                break;
            }

            if (!tab.patrols) {
                await Swal.fire({
                    title: '¡Error!',
                    text: `Debe asignar una patrulla al tab ${tab.label}`,
                    icon: "error"
                });
                errores = true;
                break;
            }

            const usersId = tab.user.map(user => user._id);
            newdata.push({
                user: usersId,
                patrols: tab.patrols._id
            });
        }

        if (!errores) {
            try {
                const data = {
                    complaint: id,
                    patrols: newdata
                };
                const response = await instance.post('/complait/asigned', data);
                await Swal.fire({
                    title: '¡Guardado exitosamente!',
                    text: 'Las patrullas fueron asignadas correctamente.',
                    icon: 'success',
                });
            } catch (error) {
                console.error('Error al guardar:', error);
                Swal.fire({
                    title: 'Error al guardar',
                    text: 'Ocurrió un error al asignar las patrullas. Intenta de nuevo.',
                    icon: 'error'
                });
            }

        }
    }

    const handleCancel = async () => {
        const result = await Swal.fire({
            title: '¿Deseas cancelar?',
            text: 'Perderás los cambios no guardados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No',
        });

        if (result.isConfirmed) {
            router.back();
        }
    }
    return (
        <Box
            sx={{
                width: '100%',
                typography: 'body1',
                backgroundColor: theme => theme.palette.background.paper,
                borderRadius: 1,
            }}
        >
            <TabContext value={activeTab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} variant='scrollable' scrollButtons='auto'>
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                value={String(index)}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">{tab.label}</Typography>
                                        <Box
                                            onClick={e => {
                                                e.stopPropagation()
                                                handleRemoveTab(index)
                                            }}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                                color: theme => theme.palette.error.main,
                                                width: 24,
                                                height: 24,
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s ease-in-out',
                                                '&:hover': {
                                                    backgroundColor: theme => hexToRGBA(theme.palette.error.light, 0.2),
                                                }
                                            }}
                                        >
                                            <Icon icon="mdi:close" fontSize={16} />
                                        </Box>
                                    </Box>
                                }
                            />


                        ))}
                        <Tab label={<Icon icon='mdi:add-bold' />} value='add' />
                    </TabList>
                </Box>

                {tabs.map((tab, index) => (
                    <TabPanel key={index} value={String(index)}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Card>
                                    <CardHeader title='Vehículo radio patrulla' />
                                    <CardContent>
                                        {tab.patrols ? (
                                            <>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', m: 2 }}>
                                                    <img
                                                        src={`${baseUrl().backendURI}/images/${tab.patrols?.imageUrl}`}
                                                        alt="img"
                                                        width={60}
                                                        height={60}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="h5">Detalles</Typography>
                                                    <Button variant='outlined' onClick={togglePatrols} color='success'>Editar</Button>
                                                </Box>
                                                <Divider sx={{ my: 2, mb: 3 }} />
                                                <Typography variant="body2" sx={{ mb: 3 }}>
                                                    <strong>Placa del vehículo:</strong> {tab.patrols?.plaque}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 3 }}>
                                                    <strong>Código:</strong> {tab.patrols?.code}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 3 }}>
                                                    <strong>Marca:</strong> {tab.patrols?.marker?.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 3 }}>
                                                    <strong>Tipo de vehículo:</strong> {tab.patrols?.type?.name}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Box
                                                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                            >
                                                <IconButton onClick={togglePatrols}>
                                                    <Icon icon='mdi:add-bold' />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={8}>
                                <Card>
                                    <CardHeader title='Personal asignado' />
                                    <CardContent>
                                        {tab.user && tab.user.length > 0 ? (
                                            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'end', pt: 3, pr: 3 }}>
                                                    <Button variant='outlined' onClick={togglePersonal} color='success'>Editar</Button>
                                                </Box>
                                                <TableContainer>
                                                    <Table sx={{ minWidth: 650 }}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell align='center'><strong>Grado</strong></TableCell>
                                                                <TableCell align='center'><strong>Apellido Paterno</strong></TableCell>
                                                                <TableCell align='center'><strong>Apellido Materno</strong></TableCell>
                                                                <TableCell align='center'><strong>1er. Nombre</strong></TableCell>
                                                                <TableCell align='center'><strong>2do. Nombre</strong></TableCell>
                                                                <TableCell align='center'><strong>Cargo Actual</strong></TableCell>
                                                                <TableCell align='center'><strong>Celular</strong></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {tab.user.map((user, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell align='center'>{user.grade?.name}</TableCell>
                                                                    <TableCell align='center'>{user.paternalSurname}</TableCell>
                                                                    <TableCell align='center'>{user.maternalSurname}</TableCell>
                                                                    <TableCell align='center'>{user.firstName}</TableCell>
                                                                    <TableCell align='center'>{user.lastName}</TableCell>
                                                                    <TableCell align='center'>{user.post?.name}</TableCell>
                                                                    <TableCell align='center'>{user.phone}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Paper>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <IconButton onClick={togglePersonal}>
                                                    <Icon icon='mdi:add-bold' />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>
                ))}
            </TabContext>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 5 }}>
                <Button variant='contained' color='error' onClick={handleCancel}>
                    Cancelar
                </Button>
                <Button variant='contained' color='success' onClick={handleSave}>
                    Guardar
                </Button>
            </Box>

            <AddPatrols open={addPatrols} toggle={togglePatrols} onSelect={handleSelectPatrol} tabs={tabs} currentIndex={currentIndex} />
            <AddPersonal open={addPersonal} toggle={togglePersonal} onSelect={handleSelectUsers} tabs={tabs} currentIndex={currentIndex} />
        </Box>
    )
}

export default MenuAsigned
