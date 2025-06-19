import { Box, Button, Card, CardContent, CardHeader, CardMedia, Divider, Grid, IconButton, Menu, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect, useState, MouseEvent } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import Icon from "src/@core/components/icon";
import AddDraw from "src/components/draw";
import { AppDispatch, RootState } from "src/store";
import { deleteComplaints, fetchData } from "src/store/complaints";
import AddComplaints from "./register";
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
                    <Icon icon='mdi:pencil-outline' fontSize={20} color='#00a0f4' />
                    Editar
                </MenuItem>
                <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleDelete}>
                    <Icon icon='ic:outline-delete' fontSize={20} color='#ff4040' />
                    Eliminar
                </MenuItem>
            </Menu>
        </>
    )
}


const Complaints = () => {
    const [filters, setFilters] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [complaintData, setComplaintData] = useState<ComplaintsModel>(defaultValues)

    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.complaints)

    useEffect(() => {
        dispatch(fetchData({ filter: '' }))
    }, [])

    const toggleDrawer = () => setDrawOpen(!drawOpen)

    const handleFilters = () => {
        dispatch(fetchData({ filter: filters }))
    }
    const handleCreate = () => {
        setMode('create')
        setComplaintData(defaultValues)
        toggleDrawer()
    }
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box sx={{
                    p: 5,
                    pb: 3,
                    pt: 0
                }}><Typography variant="h4">Lista de denuncias</Typography></Box>
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
                            value={filters}
                            onChange={(e) => setFilters(e.target.value)}
                            InputProps={{
                                startAdornment: <Icon icon="mdi:search" />,
                            }}
                        />

                        <Button
                            variant="outlined"
                            onClick={handleFilters}
                        >
                            Buscar
                        </Button>
                    </Box>
                    <Button
                        sx={{ mt: { xs: 2, sm: 0 } }}
                        onClick={handleCreate}
                        variant="contained"
                    >
                        Nuevo denuncia
                    </Button>
                </Box>
            </Grid>
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
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro de la denuncia' : 'Editar denuncia'}>
                <AddComplaints
                    toggle={toggleDrawer}
                    defaultValues={complaintData}
                    mode={mode}
                />
            </AddDraw>
        </Grid>
    );
}
Complaints.acl = {
    action: 'read',
    subject: 'complaints'
}

Complaints.authGuard = true;
export default Complaints;