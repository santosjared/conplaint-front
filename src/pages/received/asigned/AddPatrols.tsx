import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Fade,
    FadeProps,
    IconButton,
    Radio,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import Paper from '@mui/material/Paper'
import { forwardRef, ReactElement, Ref, useCallback, useEffect, useState } from 'react'
import { instance } from 'src/configs/axios'
import baseUrl from 'src/configs/environment'
import { UserType } from 'src/types/types'

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

interface TabsType {
    label: string
    patrols?: VehicleType
    user?: UserType[]
}

interface AddVehicleType {
    toggle: () => void
    tabs: TabsType[]
    open: boolean
    onSelect: (vehicle: VehicleType) => void
    currentIndex: number
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Fade ref={ref} {...props} />
})

const AddPatrols = ({ open, toggle, onSelect, tabs, currentIndex }: AddVehicleType) => {
    const [rows, setRows] = useState<VehicleType[]>([])
    const [field, setField] = useState<string>('')
    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [total, setTotal] = useState<number>(0)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const fecth = async (filters: { [key: string]: any }) => {
        try {
            const response = await instance.get('/atendidos/patrols', {
                params: filters
            })

            const allPatrols: VehicleType[] = response.data.result || []

            const currentPatrolId = tabs[currentIndex]?.patrols?._id

            const assignedPatrolIds = tabs
                .map((tab, index) => index !== currentIndex ? tab.patrols?._id : null)
                .filter((id): id is string => !!id)

            const filtered = allPatrols.filter(patrol =>
                !assignedPatrolIds.includes(patrol._id!) || patrol._id === currentPatrolId
            )

            setRows(filtered)
            setTotal(filtered.length) // <-- importante si quieres que la paginación sea correcta
        } catch (error) {
            console.error('Error al extraer patrullas', error)
        }
    }


    useEffect(() => {
        if (open) {
            const currentPatrol = tabs[currentIndex]?.patrols

            // Solo preselecciona si ya existe (modo edición)
            if (currentPatrol?._id) {
                setSelectedId(currentPatrol._id)
            } else {
                setSelectedId(null)
            }

            fecth({ field, skip: page * pageSize, limit: pageSize })
        }
    }, [open, page, pageSize])


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPageSize(+event.target.value)
        setPage(0)
    }

    const handleSelect = useCallback(() => {
        const selectedVehicle = rows.find(row => row._id === selectedId)
        if (selectedVehicle) {
            onSelect(selectedVehicle)
            setSelectedId(null)
        }
    }, [rows, selectedId, onSelect])

    const handleCancel = () => {
        setSelectedId(null)
        toggle()
    }

    return (
        <Dialog fullWidth open={open} maxWidth='lg' scroll='body' onClose={toggle} TransitionComponent={Transition}>
            <DialogContent>
                <IconButton size='small' onClick={handleCancel} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
                    <Icon icon='mdi:close' />
                </IconButton>

                <Box sx={{ backgroundColor: theme => theme.palette.background.paper, p: 4, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
                        <TextField
                            label='Buscar'
                            variant='outlined'
                            value={field}
                            onChange={e => setField(e.target.value)}
                            InputProps={{
                                endAdornment: <Icon icon='mdi:search' />,
                            }}
                        />
                        <Button variant='outlined' onClick={() => fecth({ field, skip: page * pageSize, limit: pageSize })}>
                            Buscar
                        </Button>
                        <Button variant='contained' onClick={() => { setField(''); fecth({ field: '', skip: 0, limit: pageSize }) }}>
                            Todos
                        </Button>
                    </Box>

                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align='center'></TableCell>
                                        <TableCell align='center'><strong>Placa</strong></TableCell>
                                        <TableCell align='center'><strong>Código</strong></TableCell>
                                        <TableCell align='center'><strong>Marca</strong></TableCell>
                                        <TableCell align='center'><strong>Tipo</strong></TableCell>
                                        <TableCell align='center'><strong>Foto</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell align='center'>
                                                <Radio
                                                    checked={selectedId === row._id}
                                                    onChange={() => setSelectedId(row._id!)}
                                                />
                                            </TableCell>
                                            <TableCell align='center'>{row.plaque}</TableCell>
                                            <TableCell align='center'>{row.code}</TableCell>
                                            <TableCell align='center'>{row.marker?.name}</TableCell>
                                            <TableCell align='center'>{row.type?.name}</TableCell>
                                            <TableCell align='center'>
                                                {row.imageUrl ? (
                                                    <img src={`${baseUrl().backendURI}/images/${row.imageUrl}`} alt='Vehículo' width={50} height={50} style={{ borderRadius: 4 }} />
                                                ) : (
                                                    'Sin imagen'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component='div'
                            count={total}
                            rowsPerPage={pageSize}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 5 }}>
                        <Button variant='contained' color='error' onClick={handleCancel}>
                            Cancelar
                        </Button>
                        <Button variant='contained' disabled={!selectedId} onClick={handleSelect}>
                            Seleccionar
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default AddPatrols
