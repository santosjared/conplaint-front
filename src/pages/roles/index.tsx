import { Box, Button, Card, CardHeader, Grid, IconButton, Menu, MenuItem, TextField, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import React, { useState, MouseEvent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'src/@core/components/icon';
import AddDraw from 'src/components/draw';
import { AppDispatch, RootState } from 'src/store';
import { deleteRol, fetchData, setRoles } from 'src/store/role';
import AddRol from './register';
import { RolType } from 'src/types/types';
import Swal from 'sweetalert2';
import Permissions from './permissions';
import { useApi } from 'src/hooks/useApi';

interface CellType {
    row: RolType
}



const defaultValues: RolType = {
    name: '',
    description: ''
}

const Roles = () => {

    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [filters, setFilters] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [rolData, setRolData] = useState<RolType>(defaultValues)
    const [openPermissons, setOpenPermissions] = useState<boolean>(false)

    const RowOptions = ({ rol }: { rol: RolType }) => {

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
            setRolData(rol)
            setMode('edit')
            setAnchorEl(null)
            toggleDrawer()
        }
        const handlePermissions = () => {
            setRolData(rol)
            setAnchorEl(null)
            togglePermissions()
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
                dispatch(deleteRol({ filters: { filter: '', skip: page * pageSize, limit: pageSize }, id: rol._id }))
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
                    <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handlePermissions}>
                        <Icon icon='material-symbols:key-vertical-rounded' fontSize={20} color='#6D788D' />
                        Permisos
                    </MenuItem>
                </Menu>
            </>
        )
    }
    const columns = [
        {
            flex: 0.2,
            minWidth: 90,
            field: 'rol',
            sortable: false,
            headerName: 'Rol',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'decription',
            sortable: false,
            headerName: 'Descripcion',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.description}</Typography>
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
                return (<RowOptions rol={row} />)
            }
        }
    ]

    const api = useApi()
    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.rol)
    useEffect(() => {
        const initApi = async () => {
            const response = await api.get('/roles', { filter: '', skip: page * pageSize, limit: pageSize });
            console.log(response);
            dispatch(setRoles(response))
        }
        // initApi();
        dispatch(fetchData({ filter: '', skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    const toggleDrawer = () => setDrawOpen(!drawOpen)

    const togglePermissions = () => setOpenPermissions(!openPermissons)

    const handleCreate = () => {
        setMode('create')
        setRolData(defaultValues)
        toggleDrawer()
    }

    const handleFilters = () => {
        dispatch(fetchData({ filter: filters, skip: page * pageSize, limit: pageSize }))
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Registro de roles y permisos' sx={{ pb: 0, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }} />
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
                            Nuevo Rol
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
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro del rol' : 'Editar rol'}>
                <AddRol
                    toggle={toggleDrawer}
                    page={page}
                    pageSize={pageSize}
                    defaultValues={rolData}
                    mode={mode}
                />
            </AddDraw>
            <Permissions open={openPermissons} toggle={togglePermissions} rol={rolData} />
        </Grid>
    )
}

Roles.acl = {
    action: 'read',
    subject: 'roles'
}

Roles.authGuard = true;
export default Roles;