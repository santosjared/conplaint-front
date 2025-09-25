import { Box, Button, Card, CardHeader, Grid, IconButton, TextField, Typography } from '@mui/material'
import CustomChip from 'src/@core/components/mui/chip'
import Icon from 'src/@core/components/icon'

interface PatrolType {
    vehiculo: string
    placa: string
    code: string
    status: 'Activo' | 'Inactivo'
    description: string
}

interface CellType {
    row: PatrolType
}

const RowOptions = ({ row }: { row: PatrolType }) => {

    return (
        <div>
            <IconButton size='small' >
                <Icon icon='mdi:dots-vertical' />
            </IconButton>
        </div>
    )
}

const columns = [
    {
        flex: 0.2,
        minWidth: 90,
        field: 'vehiculo',
        headerName: 'Vehiculo',
        renderCell: ({ row }: CellType) => {
            return <Typography variant="body2" noWrap>{row.vehiculo}</Typography>
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'placa',
        headerName: 'Placa de Control',
        renderCell: ({ row }: CellType) => {
            return <Typography variant="body2" noWrap>{row.placa} </Typography>
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'code',
        headerName: 'Codigo',
        renderCell: ({ row }: CellType) => {
            return <Typography variant="body2" noWrap>{row.code}</Typography>
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'status',
        headerName: 'Estado',
        renderCell: ({ row }: CellType) => {
            return <CustomChip
                skin='light'
                size='small'
                label={row.status}
                color={row.status === 'Activo' ? 'success' : 'error'}
            />
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'description',
        headerName: 'Descripcion',
        renderCell: ({ row }: CellType) => {
            return <Typography variant='body2' noWrap>{row.description}</Typography>
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'actions',
        headerName: 'Acciones',
        renderCell: ({ row }: CellType) => <RowOptions row={row} />
    }
]

const Patrols = () => {

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Administracion de los vehiculos radio patrulla' />
                    <Box
                        sx={{
                            p: 5,
                            pb: 3,
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                                alignItems: 'center'
                            }}
                        >
                            <TextField
                                label='Buscar'
                                variant='outlined'
                                name='search'
                                autoComplete='off'
                                value={''}
                                onChange={(e) => { }}
                                InputProps={{
                                    endAdornment: <Icon icon='mdi:search' />
                                }}
                            />
                            <Button
                                variant='outlined'
                                onClick={() => { }}
                                sx={{ p: 3.5 }}
                            >
                                Buscar
                            </Button>
                            <Button
                                variant='outlined'
                                sx={{
                                    ml: 2,
                                    pb: 3.2
                                }}
                                onClick={() => { }}
                            >Todos</Button>
                        </Box>
                        <Button
                            sx={{
                                mt: {
                                    xs: 2,
                                    sm: 0
                                },
                                p: 3.2
                            }}
                            onClick={() => { }}
                        >
                            Nuevo Patrulla
                        </Button>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    )
}

Patrols.acl = {
    action: 'read',
    subject: 'patrols'
}

export default Patrols;