import { Box, Button, Card, CardHeader, FormControl, Grid, TextField, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import { useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { format } from 'date-fns';
import CustomChip from 'src/@core/components/mui/chip'
import Icon from "src/@core/components/icon";
import { UserType } from "src/types/types";
import DetailAsigned from "../../views/pages/asignados/details";
import Denuncia from "../../views/pages/asignados/denuncia";
import { fetchData } from "src/store/asignes";
import Can from "src/layouts/components/acl/Can";
import Swal from 'sweetalert2';
import { instance } from "src/configs/axios";
import { PDFReporte } from "src/utils/pdf-reporte";
import Description from "src/views/pages/asignados/description";

interface ComplaintType {
    name: string
    image: string
    description: string
    _id: string
}

interface Infractor {
    apellido_paterno: string
    apellido_materno: string
    nombres: string
    ci: string
    edad: number
    ocupation: string
    alias: string
}

interface DenunciaType {
    sigla: string
    encargado: UserType | null
    fecha_hecho: string
    hora_hecho: string
    lugar_hecho: string
    tipo_denuncia: ComplaintType | null
    isNegative: boolean
    infractores: Infractor[]
    description: string
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
interface CompalintType {
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
    status: string
    createdAt: string
    userId: Client
    _id?: string
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

interface User {
    cargo?: string
    user: UserType
    _id: string
}

interface UserPatrolsType {
    patrols: VehicleType
    user: User[]
}

interface AtendidosType {
    complaint: CompalintType
    createdAt: string
    status: string
    userpatrol: UserPatrolsType[]
    confirmed: DenunciaType
    _id: string
}

interface CellType {
    row: AtendidosType
}

const today = new Date().toISOString().split('T')[0]
const Asigned = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [field, setField] = useState<string>('')
    const [date, setDate] = useState<string>(today)
    const [openDetails, setOpenDetails] = useState<boolean>(false)
    const [dataDetails, setDataDetails] = useState<UserPatrolsType[]>([])
    const [confirmed, setConfirmed] = useState<DenunciaType | null>(null)
    const [openConfirmed, setOpenonfirmed] = useState<boolean>(false)
    const [openDescription, setOpenDescription] = useState<boolean>(false)
    const [id, setId] = useState<string>('')

    const toggleDetails = () => setOpenDetails(!openDetails)
    const toggleConfirmed = () => setOpenonfirmed(!openConfirmed)
    const toggleDescription = () => setOpenDescription(!openDescription)

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.asignados);
    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [page, pageSize])

    const search = (data: string) => {
        dispatch(fetchData({ field: data, skip: page * pageSize, limit: pageSize }))
    }

    const handleConfirmed = async (id: string) => {
        setId(id)
        toggleDescription()
    }

    const handleDenuncia = (confirmed: DenunciaType) => {
        setConfirmed(confirmed)
        toggleConfirmed()
    }

    const handlePrint = async () => {
        try {
            const response = await instance.get('/asignados/print', {
                params: { date }
            })
            if (response.data.length === 0) {
                Swal.fire("No hay reportes aun para esta fecha");

                return;
            }
            const sup = await instance.get('/users/sup', { params: { grade: 'CNL. MSc. CAD.' } })
            const { result, despachadores } = response.data
            PDFReporte(result, despachadores, sup.data, date)
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar imprimir el reporte. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }
    }

    const columns = [
        {
            flex: 0.2,
            minWidth: 90,
            field: 'date',
            sortable: false,
            headerName: ' Fecha y hora de asignación',
            renderCell: ({ row }: CellType) => {

                return (
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography variant="h6" noWrap>
                            {format(new Date(row?.createdAt), 'HH:mm')}
                        </Typography>
                        <Typography variant="body2" noWrap>
                            {format(new Date(row?.createdAt), 'dd/MM/yyyy')}
                        </Typography>
                    </Box>
                )

            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'user',
            sortable: false,
            headerName: 'Usuario que reportó',
            renderCell: ({ row }: CellType) => {
                const { complaint } = row

                return (
                    <Box>
                        <Typography variant='body2' noWrap>{complaint?.userId?.name} {complaint?.userId?.lastName}</Typography>
                        <Typography variant='caption' color='text.secondary' noWrap>{complaint?.userId?.email}</Typography>
                        <Typography variant='caption' color='text.secondary' noWrap>{complaint?.userId?.phone}</Typography>
                    </Box>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'complaint',
            sortable: false,
            headerName: 'Tipo de denuncia',
            renderCell: ({ row }: CellType) => {
                const { complaint } = row

                return (
                    <Typography variant='body2' noWrap>{complaint?.otherComplaints || complaint?.complaints?.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'aggressor',
            sortable: false,
            headerName: 'Agresor',
            renderCell: ({ row }: CellType) => {
                const { complaint } = row

                return (
                    <Typography variant='body2' noWrap>{complaint?.otherAggressor || complaint?.aggressor?.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'victim',
            sortable: false,
            headerName: 'Víctima',
            renderCell: ({ row }: CellType) => {
                const { complaint } = row

                return (
                    <Typography variant='body2' noWrap>{complaint?.otherVictim || complaint?.victim?.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'place',
            sortable: false,
            headerName: 'Lugar del hecho',
            renderCell: ({ row }: CellType) => {
                const { complaint } = row

                return (
                    <Typography variant='body2' noWrap>{complaint.place}</Typography>
                )
            }
        },
        {
            flex: 0.15,
            field: 'status',
            minWidth: 150,
            headerName: 'Estado',
            renderCell: ({ row }: CellType) => (
                <CustomChip
                    skin='light'
                    size='small'
                    label={row.status === 'success' ? 'Confirmado' : row.status === 'warning' ? 'Atendido' : 'Sin Atender'}
                    color={row.status === 'success' ? 'success' : row.status === 'warning' ? 'warning' : 'error'}
                    sx={{ textTransform: 'capitalize' }}
                />
            )
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'actions',
            sortable: false,
            headerName: 'Acciones',
            renderCell: ({ row }: CellType) => {

                return (
                    <>
                        {row.status === 'success' ?
                            <Can I="look" a="asignes">
                                <Button variant="text" color="info" onClick={() => handleDenuncia(row.confirmed)}>Denuncia</Button>
                            </Can>
                            :
                            <Can I="confirmed" a="asignes">
                                <Button
                                    disabled={row.status !== 'warning'}
                                    variant="contained" color="success"
                                    onClick={() => handleConfirmed(row._id)}>
                                    Confirmar
                                </Button>
                            </Can>
                        }
                    </>)
            }
        }
    ]

    return (
        <Fragment>
            {openDetails && dataDetails ? (<DetailAsigned toggle={toggleDetails} userpatrol={dataDetails} />)
                :
                (<Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title='Denuncias asignadas' />
                            <Box sx={{ p: 5 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth sx={{ mb: 1 }}>
                                            <TextField
                                                label="Buscar"
                                                placeholder="Buscar"
                                                value={field}
                                                onChange={(e) => setField(e.target.value)}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth sx={{ mb: 1 }}>
                                            <TextField
                                                label="Buscar por fecha"
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Button variant="outlined" sx={{ p: 3.5 }} onClick={() => search(field || date || '')}>
                                            Buscar
                                        </Button>
                                        <Button variant="contained" sx={{ ml: 3, p: 3.5 }} onClick={() => search('')}>
                                            Todos
                                        </Button>
                                        <Can I="print" a="asignes">
                                            <Button
                                                variant="contained"
                                                color="error"
                                                sx={{ ml: 3, p: 3.5 }}
                                                onClick={handlePrint}
                                                startIcon={
                                                    <Icon icon='mdi:printer-outline'
                                                    />}>
                                                Reporte
                                            </Button>
                                        </Can>
                                    </Grid>
                                </Grid>
                            </Box>
                            <DataGrid
                                autoHeight
                                rows={store.data}
                                columns={columns}
                                getRowId={(row: any) => row._id}
                                pagination
                                pageSize={pageSize}
                                disableSelectionOnClick
                                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                rowsPerPageOptions={[10, 25, 50]}
                                rowCount={store.total}
                                paginationMode="server"
                                onPageChange={(newPage) => setPage(newPage)}
                                onCellClick={(params) => {
                                    if (params.field === 'actions') {

                                        return
                                    }
                                    setDataDetails(params.row.userpatrol)
                                    toggleDetails()
                                }}
                                sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                                localeText={{
                                    MuiTablePagination: {
                                        labelRowsPerPage: 'Filas por página:',
                                    },
                                }}
                            />

                        </Card>
                    </Grid>
                </Grid>)
            }
            <Denuncia confirmed={confirmed} open={openConfirmed} toggle={toggleConfirmed} />
            <Description open={openDescription} toggle={toggleDescription} id={id} page={page} pageSize={pageSize} />
        </Fragment>

    );
}
Asigned.acl = {
    action: 'read',
    subject: 'asignes'
}

Asigned.authGuard = true;

export default Asigned