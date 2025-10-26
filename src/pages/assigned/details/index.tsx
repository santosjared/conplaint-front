import { useState } from 'react'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
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
import { UserType } from 'src/types/types'
import baseUrl from 'src/configs/environment'
import Paper from '@mui/material/Paper'

interface User {
    cargo?: string
    user: UserType
    _id: string
}

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

interface UserPatrolsType {
    patrols: VehicleType
    user: User[]
}

interface PropsType {
    toggle: () => void
    userpatrol: UserPatrolsType[]
}

const DetailAsigned = ({ toggle, userpatrol }: PropsType) => {

    const [activeTab, setActiveTab] = useState('0')

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue)
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
                        {userpatrol.map((tab, index) => (
                            <Tab
                                key={index}
                                value={String(index)}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">{`Patrulla ${index + 1}`}</Typography>
                                    </Box>
                                }
                            />


                        ))}
                    </TabList>
                </Box>

                {userpatrol.map((tab, index) => (
                    <TabPanel key={index} value={String(index)}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Card>
                                    <CardHeader title='Vehículo radio patrulla' />
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', m: 2 }}>
                                            <img
                                                src={`${baseUrl().backendURI}/images/${tab.patrols?.imageUrl}`}
                                                alt="img"
                                                width={60}
                                                height={60}
                                            />
                                        </Box>
                                        <Typography variant="h5">Detalles</Typography>
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
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={8}>
                                <Card>
                                    <CardHeader title='Personal asignado' />
                                    <CardContent>
                                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                                                        {tab.user.map(({ user }, index) => (
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
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>
                ))}
            </TabContext>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Button variant='contained' color='success' onClick={toggle}>
                    Aceptar
                </Button>
            </Box>
        </Box>
    )
}

export default DetailAsigned
