import { Box, Button, Card, CardHeader, Grid, IconButton, Menu, MenuItem, TextField, Typography, useTheme } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import React, { useState, MouseEvent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'src/@core/components/icon';
import AddDraw from 'src/components/draw';
import { AppDispatch, RootState } from 'src/store';
import { deleteRol, fetchData } from 'src/store/role';
import Swal from 'sweetalert2';
import { Rol } from 'src/context/types';
import AddRol from 'src/views/pages/roles/Register';
import Permissions from 'src/views/pages/roles/Permissions';
import Can from 'src/layouts/components/acl/Can';

interface CellType {
    row: Rol
}



const defaultValues: Rol = {
    name: '',
    description: '',
    permissions: [],
    _id: '',
    __v: ''
}

const Roles = () => {

    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [field, setField] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [rolData, setRolData] = useState<Rol>(defaultValues)
    const [openPermissons, setOpenPermissions] = useState<boolean>(false)

    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.rol)
    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    const toggleDrawer = () => setDrawOpen(!drawOpen)

    const theme = useTheme()

    const togglePermissions = () => setOpenPermissions(!openPermissons)

    const handleCreate = () => {
        setMode('create')
        setRolData(defaultValues)
        toggleDrawer()
    }

    const handleFilters = (filter: string) => {
        dispatch(fetchData({ field: filter, skip: page * pageSize, limit: pageSize }))
    }

    const RowOptions = ({ rol }: { rol: Rol }) => {

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
                cancelButtonColor: theme.palette.info.main,
                cancelButtonText: 'Cancelar',
                confirmButtonColor: theme.palette.error.main,
                confirmButtonText: 'Eliminar',
            }).then(async (result) => { return result.isConfirmed });
            if (confirme) {
                dispatch(deleteRol({ filters: { skip: page * pageSize, limit: pageSize }, id: rol._id }))
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
                    <Can I='update' a='roles'>
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleEdit}>
                            <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                            Editar
                        </MenuItem>
                    </Can>
                    <Can I='delete' a='roles'>
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleDelete}>
                            <Icon icon='ic:outline-delete' fontSize={20} color={theme.palette.error.main} />
                            Eliminar
                        </MenuItem>
                    </Can>
                    <Can I='permissions' a='roles'>
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handlePermissions}>
                            <Icon icon='material-symbols:key-vertical-rounded' fontSize={20} color={theme.palette.secondary.main} />
                            Permisos
                        </MenuItem>
                    </Can>
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
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Registro de roles y permisos' />
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

                        <Can I='create' a='roles'>
                            <Button
                                sx={{ mt: { xs: 2, sm: 0 }, p: 3.5 }}
                                onClick={handleCreate}
                                variant="contained"
                            >
                                Nuevo Rol
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
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro del Rol' : 'Editar Rol'}>
                <AddRol
                    toggle={toggleDrawer}
                    page={page}
                    pageSize={pageSize}
                    defaultValues={rolData}
                    mode={mode}
                />
            </AddDraw>
            <Permissions open={openPermissons} toggle={togglePermissions} rol={rolData} page={page} pageSize={pageSize} />
        </Grid>
    )
}

Roles.acl = {
    action: 'read',
    subject: 'roles'
}

Roles.authGuard = true;
export default Roles;