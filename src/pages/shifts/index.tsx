import React, { useState, MouseEvent, useEffect } from 'react'
import { Box, Button, Card, CardHeader, Grid, IconButton, TextField, Typography, useTheme } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import AddDraw from 'src/components/draw'
import { RootState, AppDispatch } from 'src/store'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import AddShits from '../../views/pages/shifts/register'
import { deleteShit, fetchData } from 'src/store/shits'
import { useRouter } from 'next/router'
import Can from 'src/layouts/components/acl/Can'


const today = new Date().toISOString().split('T')[0]
interface HourRange {
    name: string
    hrs_i: string
    hrs_s: string
}

interface GradeType {
    name: string;
    _id: string;
}

interface ShiftsType {
    _id?: string
    date: string
    grade: GradeType
    otherGrade: string
    supervisor: string
    hrs: HourRange[]
}


interface CellType {
    row: ShiftsType
}

const defaultValues: ShiftsType = {
    date: today,
    grade: { name: '', _id: '' },
    otherGrade: '',
    supervisor: '',
    hrs: [],
}
const Shifts = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [field, setField] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [shitsData, setShitsData] = useState<ShiftsType>(defaultValues)
    const [dateFilter, setDateFilter] = useState<string>('')

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.shits)

    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [page, pageSize])

    const handleCreate = () => {
        setMode('create')
        setShitsData(defaultValues)
        toggleDrawer()
    }


    const toggleDrawer = () => setDrawOpen(!drawOpen)
    const handleFilters = async (filter: string) => {
        dispatch(fetchData({ field: filter, skip: page * pageSize, limit: pageSize }))
    }
    const filterDate = (date: string) => {
        setDateFilter(date)
        dispatch(fetchData({ field: date, skip: page * pageSize, limit: pageSize }))
    }

    const columns = [
        {
            flex: 0.2,
            minWidth: 90,
            field: 'grade',
            sortable: false,
            headerName: 'Grado del supervisor',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.grade?.name || ''} </Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'supervisor',
            sortable: false,
            headerName: 'Nombre del supervisor',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.supervisor || ''} </Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'date',
            sortable: false,
            headerName: 'Fecha',
            renderCell: ({ row }: CellType) => {
                const [year, month, day] = row.date.split('-');
                const formatted = `${day}/${month}/${year}`;
                return (
                    <Typography variant='body2' noWrap>{formatted}</Typography>
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
                return (<RowOptions shits={row} />)
            }
        }
    ]
    const RowOptions = ({ shits }: { shits: ShiftsType }) => {

        const dispatch = useDispatch<AppDispatch>()
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
        const rowOptionsOpen = Boolean(anchorEl)
        const theme = useTheme()
        const router = useRouter();

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
                cancelButtonColor: theme.palette.info.main,
                cancelButtonText: 'Cancelar',
                confirmButtonColor: theme.palette.error.main,
                confirmButtonText: 'Eliminar',
            }).then(async (result) => { return result.isConfirmed });
            if (confirme) {
                dispatch(deleteShit({ filters: { skip: page * pageSize, limit: pageSize }, id: shits._id }))
            }
        }

        const handleEdit = () => {
            setShitsData({ ...shits, otherGrade: '' })
            setMode('edit')
            setAnchorEl(null)
            toggleDrawer()
        }
        const handleAsigned = () => {
            setAnchorEl(null)
            router.push(`/shifts/asignar/${shits._id}`)
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
                    <Can I='update' a='shifts'>
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleEdit}>
                            <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                            Editar
                        </MenuItem>
                    </Can>
                    <Can I='delete' a='shifts'>
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleDelete}>
                            <Icon icon='ic:outline-delete' fontSize={20} color={theme.palette.error.main} />
                            Eliminar
                        </MenuItem>
                    </Can>
                    <Can I='personal' a='shifts'>
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleAsigned}>
                            <Icon icon='mdi:account-box-edit-outline' fontSize={20} color={theme.palette.primary.main} />
                            Asignar personal
                        </MenuItem>
                    </Can>
                    <Can I='print' a='shifts'>
                        <MenuItem sx={{ '& svg': { mr: 2 } }} >
                            <Icon icon='mdi:printer-outline' fontSize={20} color={theme.palette.secondary.main} />
                            Imprimir
                        </MenuItem>
                    </Can>
                </Menu>
            </>
        )
    }
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Registro de horarios' />
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
                            <TextField
                                label="Buscar por fecha"
                                variant="outlined"
                                type='date'
                                name="search_date"
                                autoComplete="off"
                                InputLabelProps={{ shrink: true }}
                                value={dateFilter}
                                onChange={(e) => filterDate(e.target.value)}
                            />

                            <Button
                                variant="outlined"
                                onClick={() => handleFilters(field || dateFilter)}
                                sx={{ height: 50 }}
                            >
                                Buscar
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => handleFilters('')}
                                sx={{ height: 50 }}
                            >
                                Todos
                            </Button>
                        </Box>

                        <Can I='create' a='shifts'>
                            <Button
                                sx={{ height: 50 }}
                                onClick={handleCreate}
                                variant="contained"
                            >
                                Nuevo horario
                            </Button>
                        </Can>
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
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro de turnos' : 'Editar turno'}>
                <AddShits
                    toggle={toggleDrawer}
                    page={page}
                    pageSize={pageSize}
                    defaultValues={shitsData}
                    mode={mode}
                />
            </AddDraw>
        </Grid>
    )
}
Shifts.acl = {
    action: 'read',
    subject: 'shifts'
}

Shifts.authGuard = true;
export default Shifts