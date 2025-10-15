import React, { useState, MouseEvent, useEffect } from 'react'
import { Box, Button, Card, CardHeader, Grid, IconButton, TextField, Typography, useTheme } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import AddDraw from 'src/components/draw'
import { RootState, AppDispatch } from 'src/store'
import baseUrl from 'src/configs/environment'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import AddVehicle from './register'
import { deletePatrols, fetchData } from 'src/store/patrols'


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
    otherMarker: string
    otherType: string
    image: File | null
    imageUrl: string
}


interface CellType {
    row: VehicleType
}

const defaultValues: VehicleType = {
    plaque: '',
    code: '',
    marker: { _id: '', name: '' },
    type: { _id: '', name: '' },
    otherMarker: '',
    otherType: '',
    image: null,
    imageUrl: ''
}
const Patrols = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [field, setField] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [vehicle, setVehicle] = useState<VehicleType>(defaultValues)

    const columns = [
        {
            flex: 0.2,
            minWidth: 90,
            field: 'plaque',
            sortable: false,
            headerName: 'Placa del vehiculo',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.plaque}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'code',
            sortable: false,
            headerName: 'Codigo',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.code}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'marker',
            sortable: false,
            headerName: 'Marca',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.marker?.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'type',
            sortable: false,
            headerName: 'Tipo de vehiculo',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.type?.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'photo',
            sortable: false,
            headerName: 'Foto',
            renderCell: ({ row }: CellType) => {
                return (
                    <Box sx={{ width: 40, height: 40, borderRadius: '3px' }}>
                        <img
                            src={`${baseUrl().backendURI}/images/${row.imageUrl}`}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '3px'
                            }}
                            alt="im"
                        />
                    </Box>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'actions',
            sortable: false,
            headerName: 'Acciones',
            renderCell: ({ row }: CellType) => {
                return (<RowOptions vehicle={row} />)
            }
        }
    ]
    const RowOptions = ({ vehicle }: { vehicle: VehicleType }) => {

        const dispatch = useDispatch<AppDispatch>()
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
        const rowOptionsOpen = Boolean(anchorEl)
        const theme = useTheme()

        const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget)
        }
        const handleRowOptionsClose = () => {
            setAnchorEl(null)
        }

        const handleDelete = async () => {
            setAnchorEl(null)
            const confirme = await Swal.fire({
                title: `¿Estas seguro de eliminar el horario ?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#ff4040',
                confirmButtonText: 'Eliminar',
            }).then(async (result) => { return result.isConfirmed });
            if (confirme) {
                dispatch(deletePatrols({ filters: { field, skip: page * pageSize, limit: pageSize }, id: vehicle._id }))
            }
        }

        const handleEdit = () => {
            setVehicle({ ...vehicle, otherMarker: '', otherType: '' })
            setMode('edit')
            setAnchorEl(null)
            toggleDrawer()
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
                        <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                        Editar
                    </MenuItem>
                    <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleDelete}>
                        <Icon icon='ic:outline-delete' fontSize={20} color={theme.palette.error.main} />
                        Eliminar
                    </MenuItem>
                </Menu>
            </>
        )
    }

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.patrols)

    useEffect(() => {
        dispatch(fetchData({ field, skip: page * pageSize, limit: pageSize }))
    }, [page, pageSize])

    const handleCreate = () => {
        setMode('create')
        setVehicle(defaultValues)
        toggleDrawer()
    }


    const toggleDrawer = () => setDrawOpen(!drawOpen)
    const handleFilters = async () => {
        dispatch(fetchData({ field, skip: page * pageSize, limit: pageSize }))
    }
    const allData = async () => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Registro de vehiculos' />
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
                                onClick={handleFilters}
                                sx={{ height: 50 }}
                            >
                                Buscar
                            </Button>
                            <Button
                                variant="contained"
                                onClick={allData}
                                sx={{ height: 50 }}
                            >
                                Todos
                            </Button>
                        </Box>

                        <Button
                            sx={{ height: 50 }}
                            onClick={handleCreate}
                            variant="contained"
                        >
                            Nuevo vehiculo
                        </Button>
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
                        sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                        localeText={{
                            MuiTablePagination: {
                                labelRowsPerPage: 'Filas por página:',
                            },
                        }
                        }
                    />
                </Card>
            </Grid>
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro de Vehiculos' : 'Editar Vehiculo'}>
                <AddVehicle
                    toggle={toggleDrawer}
                    page={page}
                    pageSize={pageSize}
                    defaultValues={vehicle}
                    mode={mode}
                />
            </AddDraw>
        </Grid>
    )
}
Patrols.acl = {
    action: 'read',
    subject: 'turnos'
}

Patrols.authGuard = true;
export default Patrols