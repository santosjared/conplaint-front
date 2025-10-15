import { styled } from '@mui/material/styles';
import { Avatar, Box, Card, CardActions, CardContent, CardHeader, Collapse, Divider, duration, Grid, IconButton, IconButtonProps, Menu, MenuItem, Pagination, Typography } from "@mui/material"
import { useState, MouseEvent, Fragment, ChangeEvent } from "react"
import Icon from "src/@core/components/icon";
import Swal from 'sweetalert2';
import { getInitials } from 'src/@core/utils/get-initials';
import { ImageContainer } from 'src/components/image-container';
import getConfig from 'src/configs/environment'
import dynamic from 'next/dynamic';
import { format, isToday, isYesterday } from 'date-fns';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { refusedComplaints } from 'src/store/clients/complaints';

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
interface data {
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

interface Props {
    complaints: Array<data>
    pageSize: number
    limit: number
    status?: string
    page: number
    setPage: (value: number) => void
}

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpanMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props
    return (
        <Box sx={{ color: 'primary.main', borderRadius: 2 }}>
            <Typography variant="h5" >Archivos adjuntados</Typography>
            <IconButton {...other} />
        </Box>
    );
})<ExpandMoreProps>(({ theme, expand }) => ({
    marginLeft: 'auto',
    transform: expand ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

function getGroupLabel(date: Date): string {
    if (isToday(date)) return 'De hoy'
    if (isYesterday(date)) return 'De ayer'
    return `De ${format(date, 'dd/MM/yyyy')}`
}

function groupByDate(complaints: data[]): Record<string, data[]> {
    return complaints.reduce((groups, complaint) => {
        const date = new Date(complaint.createdAt)
        const label = getGroupLabel(date)

        if (!groups[label]) {
            groups[label] = []
        }
        groups[label].push(complaint)

        return groups
    }, {} as Record<string, data[]>)
}
interface OptionsProps {
    skip: number
    limit: number
    status: string
    _id: string
}

const Options = ({ skip, limit, status, _id }: OptionsProps) => {

    const dispatch = useDispatch<AppDispatch>()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const rowOptionsOpen = Boolean(anchorEl)

    const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleRowOptionsClose = () => {
        setAnchorEl(null)
    }
    const handleEdit = () => {
        // setValue(complaint)
        // setMode('edit')
        setAnchorEl(null)
        // toggle()
    }
    const handleRefuse = async () => {
        setAnchorEl(null)
        const confirme = await Swal.fire({
            title: '¿Estas seguro de rechazar la denuncia?',
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#3085d6",
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ff4040',
            confirmButtonText: 'Si',
        }).then(async (result) => { return result.isConfirmed });
        if (confirme) {
            dispatch(refusedComplaints({ skip, limit, status, _id }))
        }
    }

    return (
        <>
            <IconButton size='small' onClick={handleRowOptionsClick}>
                <Icon icon='mdi:dots-vertical' />
            </IconButton>
            <Menu
                keepMounted
                anchorEl={anchorEl}
                open={rowOptionsOpen}
                onClose={handleRowOptionsClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                PaperProps={{ style: { minWidth: '8rem' } }}
            >
                <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleEdit}>
                    <Icon icon='mdi:account-hard-hat' fontSize={20} color='#00a0f4' />
                    Atender denuncia
                </MenuItem>
                {status !== 'refused' && <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleRefuse}>
                    <Icon icon='mdi:remove-bold' fontSize={20} color='#ff4040' />
                    Rechazar denuncia
                </MenuItem>}
            </Menu>
        </>
    )
}

const MapLocation = (dynamic(() => import('src/components/maps'), {
    loading: () => <p>Cargando la mapa...</p>,
    ssr: false,
}))

interface ComplaitType {
    [key: string]: { status: string, color: string }
}

const complaitStatusObject: ComplaitType = {
    acepted: { status: 'Atendido', color: 'success.main' },
    waiting: { status: 'En espera', color: 'warning.main' },
    refused: { status: 'Rechazado', color: 'error.main' }
}

const ComplaintsClient = ({ complaints, page, pageSize, setPage, limit, status }: Props) => {

    const [expanded, setExpanded] = useState<number | null>(null);

    const groupedComplaints = groupByDate(complaints)

    const handleExpandClick = (index: number) => {
        setExpanded(prev => (prev === index ? null : index));
    };
    if (complaints.length === 0) {
        return (<Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <Typography variant='body1'>No hay resultados</Typography>
        </Box>)
    }
    return (
        <Grid container spacing={4}>
            {
                Object.entries(groupedComplaints).map(([label, group]) => (
                    <Fragment key={label}>
                        <Grid item xs={12}>
                            <Divider>{label}</Divider>
                        </Grid>
                        {group.map((complaint, index) =>
                        (
                            <Grid item xs={12} sm={6} lg={6} key={index}>
                                <Card>
                                    <CardHeader
                                        sx={{ backgroundColor: theme => theme.palette.primary.main }}
                                        avatar={
                                            <Avatar sx={{ bgcolor: 'success.main' }} aria-label="recipe">
                                                {getInitials(complaint?.userId?.name || 'No definido', complaint?.userId?.lastName || 'No definido')}
                                            </Avatar>
                                        }
                                        action={complaint?.status !== 'acepted' ? <Options skip={page} limit={limit} status={status || ''} _id={complaint?._id || ''} /> : null}
                                        title={
                                            <Typography variant="h6" sx={{ color: 'white' }}>
                                                {`${complaint?.userId?.name} ${complaint?.userId?.lastName}`}
                                            </Typography>
                                        }
                                        subheader={<Box>
                                            <Typography variant='body1' sx={{ color: complaitStatusObject[complaint?.status || ''].color }}>{complaint?.userId?.email} - cel.:{complaint?.userId?.phone}</Typography>
                                            <Typography variant='body1' sx={{ color: complaitStatusObject[complaint?.status || ''].color }}>
                                                {complaitStatusObject[complaint?.status || ''].status} - envio a las: {format(new Date(complaint?.createdAt), 'HH:mm')}
                                            </Typography>
                                        </Box>
                                        }
                                    />
                                    <CardContent>
                                        <Typography variant="h6">Tipo de denuncia</Typography>
                                        <Typography variant="body1">{complaint?.complaints ? complaint?.complaints?.name : complaint?.otherComplaints}</Typography>
                                        <Divider />
                                        {(complaint?.aggressor || complaint?.victim || complaint?.otherAggressor || complaint?.otherVictim) &&
                                            <Box><Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                {(complaint?.aggressor || complaint?.otherAggressor) &&
                                                    <Box>
                                                        <Typography variant="h6">Agresor</Typography>
                                                        <Typography variant="body1">{complaint?.aggressor && complaint?.aggressor?.name !== 'Otro' ? complaint?.aggressor?.name : complaint?.otherAggressor}</Typography>
                                                    </Box>
                                                }
                                                {(complaint?.victim || complaint?.otherVictim) &&
                                                    <Box>
                                                        <Typography variant="h6">Victima</Typography>
                                                        <Typography variant="body1">{complaint?.victim && complaint?.victim?.name !== 'Otro' ? complaint?.victim?.name : complaint?.otherVictim}</Typography>
                                                    </Box>
                                                }
                                            </Box>
                                                <Divider />
                                            </Box>}
                                        {complaint?.description && (<Box>
                                            <Typography variant="h6">Descripcion</Typography>
                                            <Typography variant="body1">{complaint?.description}</Typography>
                                            <Divider />
                                        </Box>)}
                                        {complaint?.place && (
                                            <Box>
                                                <Typography variant="h6">Lugar del hecho</Typography>
                                                <Typography variant="body1">{complaint?.place}</Typography>
                                            </Box>
                                        )}
                                        {(complaint?.images!.length > 0 || complaint?.video || (complaint?.latitude && complaint?.longitude)) &&
                                            <Fragment><CardActions>
                                                <ExpanMore
                                                    expand={expanded === index}
                                                    onClick={() => handleExpandClick(index)}
                                                    aria-expanded={expanded === index}
                                                    aria-label="show more"
                                                >
                                                    <Icon icon='mdi:expand-more' />
                                                </ExpanMore>
                                            </CardActions>
                                                <Collapse in={expanded === index} timeout='auto' unmountOnExit>
                                                    <CardContent>
                                                        {complaint?.images!.length > 0 && (
                                                            <Fragment key={index}>
                                                                {complaint?.images?.map((value) => (
                                                                    <Box sx={{ mb: 3 }} key={value}>
                                                                        <ImageContainer src={`${getConfig().backendURI}/images/${value}`} alt='img' />
                                                                    </Box>
                                                                ))}
                                                            </Fragment>
                                                        )}
                                                        {complaint?.video && (
                                                            <Box sx={{ mb: 3 }}>
                                                                <video
                                                                    src={`${getConfig().backendURI}/videos/${complaint?.video}`}
                                                                    controls
                                                                    style={{
                                                                        width: '100%',
                                                                        height: 300,
                                                                        objectFit: 'cover',
                                                                        borderRadius: 8,
                                                                        backgroundColor: 'black'
                                                                    }}
                                                                />
                                                            </Box>
                                                        )}
                                                        {complaint?.latitude && complaint?.longitude && (
                                                            <Box sx={{ mb: 3 }}>
                                                                <MapLocation
                                                                    center={[parseFloat(complaint?.latitude), parseFloat(complaint?.longitude)]}
                                                                />
                                                            </Box>
                                                        )}

                                                    </CardContent>
                                                </Collapse>
                                            </Fragment>
                                        }
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Fragment>
                ))
            }
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Pagination count={pageSize} page={page} onChange={(envet, value) => { setPage(value) }} color="primary" />
                </Box>
            </Grid>
        </Grid>

    )
}
export default ComplaintsClient;