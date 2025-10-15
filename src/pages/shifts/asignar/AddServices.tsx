import { Box, Button, Dialog, DialogActions, DialogContent, FormControl, FormHelperText, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import { forwardRef, useEffect, useState } from "react";
import Fade, { FadeProps } from '@mui/material/Fade'
import { ReactElement, Ref } from "react";
import Icon from "src/@core/components/icon";
import { UserType } from "src/types/types";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup'
import { instance } from "src/configs/axios";

interface User {
    cargo?: string
    user: UserType
}

interface ZoneType {
    _id?: string
    name: string
}

interface Services {
    _id?: string
    name: string;
}

interface UserService {
    services: Services,
    zone: ZoneType,
    otherService: string,
    otherZone: string
    users: User[]
}

interface HourRange {
    name: string;
    hrs_i: string;
    hrs_s: string;
    services: UserService[];
}

interface ShiftsType {
    _id?: string;
    date: string;
    supervisor: UserType | null;
    hrs: HourRange[];
}

interface Props {
    open: boolean;
    toggle: () => void;
    shift: ShiftsType
    setShift: (data: ShiftsType) => void;
    indexHr: number;
}

const defaultValues: UserService = {
    services: { name: '', _id: '' },
    zone: { name: '', _id: '' },
    otherService: '',
    otherZone: '',
    users: []
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Fade ref={ref} {...props} />
})

const schema = yup.object().shape({
    services: yup.object().shape({
        name: yup.string().required('El nombre del servicio es requerido'),
        _id: yup.string().optional(),
    }),
    zone: yup.object().shape({
        name: yup.string().optional(),
        _id: yup.string().optional(),
    }).optional(),
    otherService: yup
        .string()
        .when('services', {
            is: (val: unknown) => (val as Services)?.name === 'OTRO',
            then: schema =>
                schema
                    .required('El campo otro servicio es requerido')
                    .min(3, 'Debe tener al menos 3 caracteres'),
            otherwise: schema => schema.notRequired()
        }),
    otherZone: yup.string()
        .when('zone', {
            is: (val: unknown) => (val as ZoneType)?.name === 'OTRO',
            then: schema =>
                schema
                    .required('El campo otro zona es requerido')
                    .min(3, 'Debe tener al menos 3 caracteres'),
            otherwise: schema => schema.notRequired()
        }),
    users: yup.array().of(yup.object()).optional()
});
const AddServices = ({ open, toggle, shift, setShift, indexHr }: Props) => {

    const [services, setServices] = useState<Services[]>([]);
    const [zone, setZone] = useState<ZoneType[]>([])

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await instance.get('/shits/services');
                setServices([...response.data, { name: 'OTRO', _id: 'OTRO' }])
            } catch (error) {
                console.log('error al realizar la peticion de servicios', error)
            }
        }
        fetchServices();
    }, [open, shift, indexHr])


    useEffect(() => {
        const fetchZone = async () => {
            try {
                const response = await instance.get('/shits/zones')
                setZone([...response.data, { name: 'OTRO', _id: 'OTRO' }])
            } catch (error) {
                console.log('error al realizar la peticion de zonas', error)
            }
        }
        fetchZone();
    }, [open, shift, indexHr])

    const hrs = shift?.hrs?.[indexHr] || { hrs_i: '', hrs_s: '' };

    const {
        reset,
        watch,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<UserService>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    const otherService = watch('services');
    const otherZone = watch('zone');

    const onSubmit = (data: UserService) => {
        const updatedHrs = [...(shift.hrs || [])];
        updatedHrs[indexHr] = {
            ...updatedHrs[indexHr],
            services: [...(updatedHrs[indexHr].services || []), data]
        };
        setShift({ ...shift, hrs: updatedHrs });
        reset();
        toggle();
    }

    const handleCancel = () => {
        reset()
        toggle()
    }

    return (
        <Dialog
            fullWidth
            open={open}
            maxWidth='sm'
            scroll='body'
            onClose={toggle}
            TransitionComponent={Transition}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ pb: 6, px: { xs: 8, sm: 15 }, pt: { xs: 8, sm: 12.5 }, position: 'relative' }}>
                    <IconButton size='small' onClick={toggle} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
                        <Icon icon='mdi:close' />
                    </IconButton>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant='h4' sx={{ lineHeight: '2rem' }}>
                            Agregar nuevo servicio al horario {hrs?.name || 'No definido'}
                        </Typography>
                        <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
                            {hrs?.hrs_i || 'No definido'} - {hrs?.hrs_s || 'No definido'}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 6 }}>
                                    <InputLabel id="services-select">Servicios</InputLabel>
                                    <Controller
                                        name="services"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Select
                                                labelId="services-select"
                                                id="select-services"
                                                label="Servicios"
                                                value={value?._id ?? ''}
                                                error={Boolean(errors.services)}
                                                onChange={(e) => {
                                                    const selectedId = e.target.value as string
                                                    const selectedService = services.find((serv) => serv._id === selectedId) || null
                                                    onChange(selectedService)
                                                }}
                                            >
                                                {services.map((serv, index) => (
                                                    <MenuItem value={serv._id || ''} key={index}>{serv.name}</MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    {errors.services && <FormHelperText sx={{ color: 'error.main' }}>{errors.services?.message || errors.services.name?.message || errors.services._id?.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            {otherService?.name == 'OTRO' &&
                                <Grid item xs={6}>
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <Controller
                                            name="otherService"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field: { value, onChange } }) => (
                                                <TextField
                                                    label='Especifica otro servicio'
                                                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                                                    error={Boolean(errors.otherService)}
                                                    value={value}
                                                />
                                            )}
                                        />
                                        {errors.otherService && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherService.message}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                            }
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 6 }}>
                                    <InputLabel id="zona-select">Zona</InputLabel>
                                    <Controller
                                        name="zone"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Select
                                                labelId="zona-select"
                                                id="select-zona"
                                                label="Zona"
                                                value={value?._id ?? ''}
                                                error={Boolean(errors.zone)}
                                                onChange={(e) => {
                                                    const selectedId = e.target.value as string
                                                    const selectedZone = zone.find((zon) => zon._id === selectedId) || null
                                                    onChange(selectedZone)
                                                }}
                                            >
                                                {zone.map((zon, index) => (
                                                    <MenuItem value={zon._id || ''} key={index}>{zon.name}</MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    {errors.zone && <FormHelperText sx={{ color: 'error.main' }}>{errors.zone?.message || errors.zone.name?.message || errors.zone._id?.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            {otherZone?.name == 'OTRO' &&
                                <Grid item xs={6}>
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <Controller
                                            name="otherZone"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field: { value, onChange } }) => (
                                                <TextField
                                                    label='Especifica otra zona'
                                                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                                                    error={Boolean(errors.otherZone)}
                                                    value={value}
                                                />
                                            )}
                                        />
                                        {errors.otherZone && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherZone.message}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                            }
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'center' }}>
                    <Button variant='contained' color='error' sx={{ mr: 2 }} onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant='contained'>
                        Agregar servicio
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
export default AddServices