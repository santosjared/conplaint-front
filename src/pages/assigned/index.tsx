import { Box, Button, Card, CardContent, CardHeader, CardMedia, Divider, Grid, IconButton, Menu, MenuItem, Pagination, TextField, Typography, useTheme } from "@mui/material";
import { useEffect, useState, MouseEvent, Fragment } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import Icon from "src/@core/components/icon";
import AddDraw from "src/components/draw";
import { AppDispatch, RootState } from "src/store";
import { deleteComplaints, fetchData } from "src/store/complaints";
// import AddComplaints from "./register";
import Swal from 'sweetalert2';
import getConfig from 'src/configs/environment'

interface ComplaintsModel {
    _id?: string
    name: string
    image: string
    description: string
}
const defaultValues: ComplaintsModel = {
    name: '',
    image: '',
    description: ''
}

interface props {
    complaint: ComplaintsModel
    setValue: (data: ComplaintsModel) => void
    toggle: () => void
    setMode: (data: 'create' | 'edit') => void
}

const Options = ({ complaint, setValue, toggle, setMode }: props) => {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const rowOptionsOpen = Boolean(anchorEl)

    const dispatch = useDispatch<AppDispatch>()

    const theme = useTheme()

    const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleRowOptionsClose = () => {
        setAnchorEl(null)
    }
    const handleEdit = () => {
        setValue(complaint)
        setMode('edit')
        setAnchorEl(null)
        toggle()
    }
    const handleDelete = async () => {
        setAnchorEl(null)
        const confirme = await Swal.fire({
            title: '¿Estas seguro de eliminar?',
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#3085d6",
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ff4040',
            confirmButtonText: 'Eliminar',
        }).then(async (result) => { return await result.isConfirmed });
        if (confirme) {
            dispatch(deleteComplaints({ id: complaint._id }))
        }
    }

    return (
        <Fragment>
            <IconButton size='small' onClick={handleRowOptionsClick}>
                <Icon icon='mdi:dots-vertical' color={theme.palette.primary.contrastText} />
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
                    <Icon icon='mdi:pencil-outline' fontSize={20} color='#00a0f4' />
                    Editar
                </MenuItem>
                <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleDelete}>
                    <Icon icon='ic:outline-delete' fontSize={20} color='#ff4040' />
                    Eliminar
                </MenuItem>
            </Menu>
        </Fragment>
    )
}


const Assigned = () => {
    const [name, setName] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [complaintData, setComplaintData] = useState<ComplaintsModel>(defaultValues)
    const [page, setPage] = useState<number>(1)
    const limit = 6;

    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.complaints)

    useEffect(() => {
        dispatch(fetchData({ skip: (page - 1) * limit, limit }))
    }, [page])

    const toggleDrawer = () => setDrawOpen(!drawOpen)

    const handleFilters = () => {
        dispatch(fetchData({ name, skip: (page - 1) * limit, limit }))
    }
    const handleSearchAll = () => {
        dispatch(fetchData({ skip: (page - 1) * limit, limit }))
    }
    const handleCreate = () => {
        setMode('create')
        setComplaintData(defaultValues)
        toggleDrawer()
    }
    return (
        <Card>
            <CardHeader title='Lista de denuncias' />
            <Box
                sx={{
                    p: 5,
                    pb: 3,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        label="Buscar"
                        variant="outlined"
                        name="search"
                        autoComplete="off"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        InputProps={{
                            endAdornment: <Icon icon="mdi:search" />,
                        }}
                    />

                    <Button
                        variant="outlined"
                        onClick={handleFilters}
                        sx={{ p: 3.5 }}
                    >
                        Reportes de denuncias
                    </Button>
                </Box>
            </Box>
            <Grid container spacing={3}>
                {store.data.map((complient: ComplaintsModel) => (
                    <Grid item xs={12} sm={4} lg={4} key={complient._id} >
                        <Card>
                            <CardHeader
                                action={
                                    <Options complaint={complient} setValue={setComplaintData} toggle={toggleDrawer} setMode={setMode} />
                                }
                                title={complient.name}
                            />
                            <CardMedia
                                component="img"
                                height="194"
                                image={`${getConfig().backendURI}/images/${complient.image}`}
                                alt="img"
                            />
                            <CardContent>
                                <Typography sx={{ fontSize: 14, fontWeight: 'bold' }}>Descripción:</Typography>
                                <Typography variant="body1">{complient.description}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 3, pt: 3 }}>
                        <Pagination count={Math.ceil(store.total / limit)} page={page} onChange={(envet, value) => { setPage(value) }} color="primary" />
                    </Box>
                </Grid>
                <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro de la denuncia' : 'Editar denuncia'}>
                    {/* <AddComplaints
                        toggle={toggleDrawer}
                        defaultValues={complaintData}
                        mode={mode}
                    /> */}
                </AddDraw>
            </Grid>
        </Card>
    );
}
Assigned.acl = {
    action: 'read',
    subject: 'complaints'
}

Assigned.authGuard = true;
export default Assigned;