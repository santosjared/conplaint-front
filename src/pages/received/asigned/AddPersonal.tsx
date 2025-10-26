import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    FadeProps,
    Fade,
    Checkbox,
} from '@mui/material'
import { forwardRef, ReactElement, Ref, useCallback, useEffect, useMemo, useState } from 'react'
import { instance } from 'src/configs/axios'
import { UserType } from 'src/types/types'
import Icon from 'src/@core/components/icon'

interface User {
    cargo?: string
    user: UserType
    _id: string
}

interface ZoneType {
    _id?: string
    name: string
}

interface Services {
    _id?: string
    name: string
}

interface GgradeType {
    _id?: string
    name: string
}

interface UserService {
    services: Services
    zone: ZoneType
    otherService: string
    otherZone: string
    users: User[]
}

interface HourRange {
    name: string
    hrs_i: string
    hrs_s: string
    services: UserService[]
}

interface ShiftsType {
    _id?: string
    date: string
    grade?: GgradeType
    supervisor: string
    hrs: HourRange[]
}

interface AddPersonalType {
    toggle: () => void
    open: boolean
    onSelect: (users: User[]) => void
    tabs: { user?: User[] }[]
    currentIndex: number
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Fade ref={ref} {...props} />
})

const AddPersonal = ({ open, toggle, onSelect, tabs, currentIndex }: AddPersonalType) => {
    const [shifts, setShifts] = useState<ShiftsType[]>([])
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

    const assignedUsers = useMemo(() => {
        return new Set(
            tabs
                .filter((_, i) => i !== currentIndex)
                .flatMap(tab => tab.user || [])
                .map(user => user._id)
                .filter((id): id is string => typeof id === 'string')
        )
    }, [tabs, currentIndex])

    const currentUsers = useMemo(() => {
        return new Set(
            (tabs[currentIndex]?.user || [])
                .map(user => user._id)
                .filter((id): id is string => typeof id === 'string')
        )
    }, [tabs, currentIndex])

    const fetchShifts = async () => {
        try {
            const response = await instance.get('/atendidos/shifts')
            setShifts(response.data || [])
            setSelectedUsers(currentUsers)
        } catch (error) {
            console.error('Error al extraer turnos', error)
        }
    }

    useEffect(() => {
        if (open) {
            fetchShifts()
        }
    }, [open])

    const handleToggleUser = (userId: string) => {
        setSelectedUsers(prev => {
            const newSet = new Set(prev)
            newSet.has(userId) ? newSet.delete(userId) : newSet.add(userId)
            return newSet
        })
    }

    const handleSelect = useCallback(() => {
        const selectedUserList: User[] = []

        shifts.forEach(shift => {
            shift.hrs.forEach(hour => {
                hour.services.forEach(service => {
                    service.users.forEach((user) => {
                        if (selectedUsers.has(user._id || '')) {
                            selectedUserList.push(user)
                        }
                    })
                })
            })
        })

        onSelect(selectedUserList)
        setSelectedUsers(new Set())
    }, [shifts, selectedUsers, onSelect, toggle])

    const handleCancel = () => {
        setSelectedUsers(new Set())
        toggle()
    }

    return (
        <Dialog fullWidth open={open} maxWidth='lg' scroll='body' onClose={toggle} TransitionComponent={Transition}>
            <DialogContent>
                <IconButton size='small' onClick={handleCancel} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
                    <Icon icon='mdi:close' />
                </IconButton>

                <Grid container spacing={6}>
                    {shifts.map((shift, index) => (
                        <Grid item xs={12} key={index}>
                            <Box sx={{ mt: 4 }}>
                                <Typography variant='h6' gutterBottom>
                                    Supervisor: {`${shift?.grade?.name || ''} ${shift?.supervisor || 'No asignado'}`}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                {shift?.hrs?.map((hourRange, indexHrs) => (
                                    <Card variant='outlined' elevation={0} key={indexHrs} sx={{ mb: 4 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography variant='h6' gutterBottom>
                                                    {hourRange.name}
                                                </Typography>
                                                <Typography variant='body2' color='text.secondary'>
                                                    {hourRange.hrs_i} - {hourRange.hrs_s}
                                                </Typography>
                                            </Box>

                                            {hourRange?.services?.map((service, indexService) => (
                                                <Grid container spacing={2} sx={{ mt: 2 }} key={indexService}>
                                                    <Grid item xs={service?.zone?.name ? 5 : 11}>
                                                        <Typography variant='subtitle1'>
                                                            {service?.otherService || service?.services?.name || 'No definido'}
                                                        </Typography>
                                                    </Grid>

                                                    {service?.zone?.name && (
                                                        <Grid item xs={6}>
                                                            <Typography variant='subtitle1'>
                                                                {service?.otherZone || service?.zone?.name}
                                                            </Typography>
                                                        </Grid>
                                                    )}

                                                    <Grid item xs={12}>
                                                        {service?.users
                                                            ?.filter((user) => !assignedUsers.has(user._id || ''))
                                                            ?.map((user, idx) => {
                                                                const userId = user._id || ''
                                                                return (
                                                                    <Grid container spacing={1} key={idx}>
                                                                        <Grid item xs={1}>
                                                                            <Checkbox
                                                                                checked={selectedUsers.has(userId)}
                                                                                onChange={() => handleToggleUser(userId)}
                                                                            />
                                                                        </Grid>
                                                                        {service?.zone?.name && (
                                                                            <Grid item xs={4.5}>
                                                                                <Typography variant='subtitle2'>
                                                                                    {user.cargo || user?.user?.post?.name || 'Sin cargo'}
                                                                                </Typography>
                                                                            </Grid>
                                                                        )}
                                                                        <Grid item xs={service?.zone?.name ? 5 : 11}>
                                                                            <Typography variant='subtitle2'>
                                                                                {user?.user?.grade?.name || ''} {user?.user?.firstName || ''}{' '}
                                                                                {user?.user?.lastName || ''} {user?.user?.paternalSurname || ''}{' '}
                                                                                {user?.user?.maternalSurname || ''}
                                                                            </Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                )
                                                            })}
                                                    </Grid>
                                                </Grid>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </Grid>
                    ))}

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant='contained'
                                color='error'
                                onClick={handleCancel}
                                startIcon={<Icon icon='mdi:cancel-circle' />}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={handleSelect}
                                startIcon={<Icon icon='mdi:content-save' />}
                            >
                                Guardar
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}

export default AddPersonal
