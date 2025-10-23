import { Badge, Box, Button, Card, CardHeader, FormControl, Grid, IconButton, Menu, MenuItem, Tab, TabProps, TextField, Typography } from "@mui/material";
import { Fragment, SyntheticEvent, useEffect, useState, MouseEvent } from "react";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList'
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import { useSelector } from "react-redux";
import { fetchData } from "src/store/clients/complaints";
import Swal from 'sweetalert2';
import { styled } from '@mui/material/styles'
import { DataGrid } from "@mui/x-data-grid";
import { format } from 'date-fns';
import CustomChip from 'src/@core/components/mui/chip'
// import DetailsReceived from "./details";
import Icon from "src/@core/components/icon";
import { useRouter } from "next/router";

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
interface CellType {
    row: DataType
}

const ItemTab = styled(Tab)<TabProps>(({ theme }) => ({
    color: 'white',
    '&.Mui-selected': {
        background: `linear-gradient(0deg, ${theme.palette.primary.main} 10%, ${theme.palette.primary.light} 90%)`,
        color: theme.palette.primary.contrastText
    },
    textTransform: 'none'
}));

const Asigned = () => {

    const [activeTab, setActiveTab] = useState<string>('all')
    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [field, setField] = useState<string>('')
    const [date, setDate] = useState<string>('')
    const [openDetails, setOpenDetails] = useState<boolean>(false)
    const [dataDetails, setDataDetails] = useState<DataType | null>(null)

    const toggleDetails = () => setOpenDetails(!openDetails)

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.complaintsClient)

    useEffect(() => {
        dispatch(fetchData({ status: activeTab !== 'all' ? activeTab : '', skip: page * pageSize, limit: pageSize }))
    }, [activeTab, page])

    const handleChange = (event: SyntheticEvent, value: string) => {
        setActiveTab(value)
    }
    const search = (data: string) => {
        dispatch(fetchData({ status: activeTab !== 'all' ? activeTab : '', field: data, skip: page * pageSize, limit: pageSize }))
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
                return (
                    <Box>
                        <Typography variant='body2' noWrap>{row.userId?.name} {row.userId?.lastName}</Typography>
                        <Typography variant='caption' color='text.secondary' noWrap>{row.userId?.email}</Typography>
                        <Typography variant='caption' color='text.secondary' noWrap>{row.userId?.phone}</Typography>
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
                return (
                    <Typography variant='body2' noWrap>{row.otherComplaints || row.complaints?.name}</Typography>
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
                return (
                    <Typography variant='body2' noWrap>{row.otherAggressor || row.aggressor?.name}</Typography>
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
                return (
                    <Typography variant='body2' noWrap>{row.otherVictim || row.victim?.name}</Typography>
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
                return (
                    <Typography variant='body2' noWrap>{row.place}</Typography>
                )
            }
        },
    ]

    return (
        <Fragment>
            {openDetails && dataDetails ? (<Box></Box>)
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
                                                onChange={(e) => { setDate(e.target.value); search(e.target.value) }}
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
                                onCellClick={(params, event) => {
                                    if (params.field === 'actions') {
                                        return
                                    }
                                    setDataDetails(params.row)
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
        </Fragment>

    );
}
Asigned.acl = {
    action: 'read',
    subject: 'dashboard'
}

Asigned.authGuard = true;

export default Asigned