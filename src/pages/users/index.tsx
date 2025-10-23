import React, { useState, MouseEvent, useEffect, ChangeEvent } from 'react'
import { Box, Button, Card, CardHeader, FormControl, Grid, IconButton, TextField, Typography } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import AddDraw from 'src/components/draw'
import { RootState, AppDispatch } from 'src/store'
import { dowUser, fetchData, upUser } from 'src/store/user'
import { useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import AddUser from './register'
import { UserType } from 'src/types/types'
import Swal from 'sweetalert2'

interface CellType {
    row: UserType
}
interface UserRoleType {
    [key: string]: { icon: string; color: string }
}
const userRoleObj: UserRoleType = {
    admin: { icon: 'mdi:laptop', color: 'error.main' },
    user: { icon: 'mdi:user', color: 'warning.main' },
    other: { icon: 'mdi:account-outline', color: 'info.main' }
}

const defaultValues: UserType = {
    lastName: '',
    gender: '',
    email: '',
    ci: '',
    phone: '',
    address: '',
    password: '',
    rol: { name: '', description: '' },
    grade: { name: '', _id: '' },
    paternalSurname: '',
    maternalSurname: '',
    exp: '',
    firstName: '',
    post: { name: '', _id: '' },
    otherPost: '',
    otherGrade: '',
}
const Users = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [filters, setFilters] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [userData, setUserData] = useState<UserType>(defaultValues)

    const columns = [
        {
            flex: 0.2,
            minWidth: 90,
            field: 'grade',
            sortable: false,
            headerName: 'Grado',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.grade?.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'paternalSurname',
            sortable: false,
            headerName: 'Apellidos Paterno',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.paternalSurname}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'motherSurname',
            sortable: false,
            headerName: 'Apellidos Materno',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.maternalSurname}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'firstName',
            sortable: false,
            headerName: '1er. Nombre',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.firstName}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'lastName',
            sortable: false,
            headerName: '2do. Nombre',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.lastName}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'ci',
            sortable: false,
            headerName: 'C.I.',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.ci}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'exp',
            sortable: false,
            headerName: 'Exp.',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.exp}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'gender',
            sortable: false,
            headerName: 'Género',
            renderCell: ({ row }: CellType) => {
                return (<Typography noWrap variant='body2'>{row.gender}</Typography>)
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'post',
            sortable: false,
            headerName: 'Cargo actual',
            renderCell: ({ row }: CellType) => {
                return (<Typography noWrap variant='body2'>{row.post?.name}</Typography>)
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'address',
            sortable: false,
            headerName: 'Dirección',
            renderCell: ({ row }: CellType) => {
                return (<Typography variant='body2' noWrap>{row.address}</Typography>)
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'phone',
            sortable: false,
            headerName: 'Celular',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography noWrap variant='body2'>{row.phone}</Typography>
                )
            }
        },

        {
            flex: 0.15,
            field: 'rol',
            minWidth: 150,
            headerName: 'Rol',
            renderCell: ({ row }: CellType) => {
                return (
                    <Box>
                        {!row.rol ? 'Niguno' :
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                '& svg': { mr: 3, color: userRoleObj[row.rol.name == 'Admin' ? 'admin' : row.rol.name == 'User' ? 'user' : 'other'].color }
                            }}>
                                <Icon icon={userRoleObj[row.rol.name == 'Admin' ? 'admin' : row.rol.name == 'User' ? 'user' : 'other'].icon} fontSize={20} />
                                <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                                    {row.rol.name}
                                </Typography>
                            </Box>
                        }
                    </Box>
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
                    label={row.status}
                    color={row.status === 'activo' ? 'success' : 'secondary'}
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
                return (<RowOptions user={row} />)
            }
        }
    ]
    const RowOptions = ({ user }: { user: UserType }) => {

        const dispatch = useDispatch<AppDispatch>()
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
        const rowOptionsOpen = Boolean(anchorEl)

        const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget)
        }
        const handleRowOptionsClose = () => {
            setAnchorEl(null)
        }

        const handleDow = async () => {
            setAnchorEl(null)
            const confirme = await Swal.fire({
                title: `¿Estas seguro dar de baja a ${user.firstName} ${user.lastName}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#ff4040',
                confirmButtonText: 'Dar de baja',
            }).then(async (result) => { return await result.isConfirmed });
            if (confirme) {
                dispatch(dowUser({ filters: { filter: '', skip: page * pageSize, limit: pageSize }, id: user._id }))
            }
        }

        const handleUp = async () => {
            setAnchorEl(null)
            const confirme = await Swal.fire({
                title: `¿Estas seguro de reincorporar ${user.firstName} ${user.lastName}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#72E128',
                confirmButtonText: 'reincorporar',
            }).then(async (result) => { return result.isConfirmed });
            if (confirme) {
                dispatch(upUser({ filters: { filter: '', skip: page * pageSize, limit: pageSize }, id: user._id }))
            }
        }


        const handleEdit = () => {
            setUserData({ ...user, otherGrade: '', otherPost: '' })
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
                        <Icon icon='mdi:pencil-outline' fontSize={20} color='#00a0f4' />
                        Editar
                    </MenuItem>
                    {user.status === 'activo' ?
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleDow}>
                            <Icon icon='mdi:arrow-down-thick' fontSize={20} color='#ff4040' />
                            Dar de baja
                        </MenuItem> :
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleUp}>
                            <Icon icon='mdi:arrow-up-thick' fontSize={20} color='#72E128' />
                            Reincorporar
                        </MenuItem>
                    }

                </Menu>
            </>
        )
    }

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.user)

    useEffect(() => {
        dispatch(fetchData({ filter: '', skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    const handleCreate = () => {
        setMode('create')
        setUserData(defaultValues)
        toggleDrawer()
    }


    const toggleDrawer = () => setDrawOpen(!drawOpen)
    const handleFilters = () => {
        dispatch(fetchData({ filter: filters, skip: page * pageSize, limit: pageSize }))
    }
    const handleSearchAll = () => {
        dispatch(fetchData({ filter: '', skip: page * pageSize, limit: pageSize }));
    }
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Registro de usuarios' />
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
                                    endAdornment: <Icon icon="mdi:search" />,
                                }}
                            />

                            <Button
                                variant="outlined"
                                onClick={handleFilters}
                                sx={{ p: 3.5 }}
                            >
                                Buscar
                            </Button>
                            <Button variant="contained" sx={{ ml: 2, p: 3.2 }} onClick={handleSearchAll}>
                                Todos
                            </Button>
                        </Box>

                        <Button
                            sx={{ mt: { xs: 2, sm: 0 }, p: 3.2 }}
                            onClick={handleCreate}
                            variant="contained"
                        >
                            Nuevo usuario
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
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro del usuario' : 'Editar usuario'}>
                <AddUser
                    toggle={toggleDrawer}
                    page={page}
                    pageSize={pageSize}
                    defaultValues={userData}
                    mode={mode}
                />
            </AddDraw>
        </Grid>
    )
}
Users.acl = {

    action: 'read',
    subject: 'users'
}

Users.authGuard = true;
export default Users