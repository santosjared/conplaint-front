import { Box, Button, Card, CardContent, CardHeader, CardMedia, Grid, IconButton, Menu, MenuItem, Pagination, TextField, Typography, useTheme } from "@mui/material";
import { useEffect, useState, MouseEvent, Fragment } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import Icon from "src/@core/components/icon";
import AddDraw from "src/components/draw";
import { AppDispatch, RootState } from "src/store";
import { deleteComplaints, fetchData } from "src/store/complaints";
import Swal from 'sweetalert2';
import getConfig from 'src/configs/environment'
import Can from "src/layouts/components/acl/Can";
import AddComplaints from "src/views/pages/complaints/Register";

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
    page: number
    limit: number
    setValue: (data: ComplaintsModel) => void
    toggle: () => void
    setMode: (data: 'create' | 'edit') => void
}

const Options = ({ complaint, setValue, toggle, setMode, page, limit }: props) => {

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
            cancelButtonColor: theme.palette.info.main,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: theme.palette.error.main,
            confirmButtonText: 'Eliminar',
        }).then(async (result) => { return result.isConfirmed });
        if (confirme) {
            dispatch(deleteComplaints({ id: complaint._id, filters: { skip: (page - 1) * limit, limit } }))
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
                <Can I='update' a='complaints'>
                    <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleEdit}>
                        <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                        Editar
                    </MenuItem>
                </Can>
                <Can I='delete' a='complaints'>
                    <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleDelete}>
                        <Icon icon='ic:outline-delete' fontSize={20} color={theme.palette.error.main} />
                        Eliminar
                    </MenuItem>
                </Can>
            </Menu>
        </Fragment>
    )
}


const Complaints = () => {
    const [field, setField] = useState<string>('')
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

    const handleFilters = (filter: string) => {
        dispatch(fetchData({ filter, skip: (page - 1) * limit, limit }))
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
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        InputProps={{
                            endAdornment: <Icon icon="mdi:search" />,
                        }}
                    />

                    <Button
                        variant="outlined"
                        onClick={() => handleFilters(field)}
                        sx={{ p: 3.5 }}
                    >
                        Buscar
                    </Button>
                    <Button variant="contained" sx={{ ml: 2, p: 3.2 }} onClick={() => handleFilters('')}>
                        Todos
                    </Button>
                </Box>
                <Can I='create' a='complaints'>
                    <Button
                        sx={{ mt: { xs: 2, sm: 0 }, p: 3.5 }}
                        onClick={handleCreate}
                        variant="contained"
                    >
                        Nuevo denuncia
                    </Button>
                </Can>
            </Box>
            <Grid container spacing={3}>
                {store.data.map((complient: ComplaintsModel) => (
                    <Grid item xs={12} sm={4} lg={4} key={complient._id} >
                        <Card>
                            <CardHeader
                                action={
                                    <Options
                                        complaint={complient}
                                        setValue={setComplaintData}
                                        toggle={toggleDrawer}
                                        setMode={setMode}
                                        page={page}
                                        limit={limit}
                                    />
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
                    <AddComplaints
                        toggle={toggleDrawer}
                        defaultValues={complaintData}
                        mode={mode}
                        page={page}
                        limit={limit}
                    />
                </AddDraw>
            </Grid>
        </Card>
    );
}
Complaints.acl = {
    action: 'read',
    subject: 'complaints'
}

Complaints.authGuard = true;
export default Complaints;