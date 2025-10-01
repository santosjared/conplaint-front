import { Box, Button, Dialog, DialogActions, DialogContent, FormControl, FormHelperText, Grid, IconButton, TextField, Typography } from "@mui/material"
import { forwardRef, useEffect } from "react";
import Fade, { FadeProps } from '@mui/material/Fade'
import { ReactElement, Ref } from "react";
import Icon from "src/@core/components/icon";
import { UserType } from "src/types/types";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup'

interface User {
    cargo?: string
    user: UserType
}

interface Services {
    name: string;
    otros: string;
    users: User[];
}
interface HourRange {
    name: string;
    hrs_i: string;
    hrs_s: string;
    services: Services[];
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
    indexService: number;
}

const defaultValues: Services = {
    name: '',
    otros: '',
    users: []
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Fade ref={ref} {...props} />
})

const schema = yup.object().shape({
    name: yup.string().required('El nombre del servicio es requerido'),
    otros: yup.string().optional(),
    user: yup.array().of(yup.object()).optional()
})

const EditServices = ({ open, toggle, shift, setShift, indexHr, indexService }: Props) => {

    const hrs = shift?.hrs?.[indexHr] || { hrs_i: '', hrs_s: '' };
    const values = shift?.hrs?.[indexHr]?.services?.[indexService] || defaultValues

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<Services>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    useEffect(() => {
        reset(values);
    }, [values, reset]);

    const onSubmit = (data: Services) => {
        const updatedHrs = [...(shift.hrs || [])];

        const updatedServices = [...(updatedHrs[indexHr].services || [])];
        updatedServices[indexService] = data;

        updatedHrs[indexHr] = {
            ...updatedHrs[indexHr],
            services: updatedServices
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
                            Editar el servicio al horario {hrs?.name || 'No definido'}
                        </Typography>
                        <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
                            {hrs?.hrs_i || 'No definido'} - {hrs?.hrs_s || 'No definido'}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <Controller
                                        name='name'
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                autoComplete='off'
                                                onChange={e => field.onChange(e.target.value.toUpperCase())}
                                                value={field.value || ''}
                                                label='Servicio'
                                                placeholder='VEHICULO DE SERVICIO'
                                            />
                                        )}
                                    />
                                    {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <Controller
                                        name='otros'
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                autoComplete='off'
                                                onChange={e => field.onChange(e.target.value.toUpperCase())}
                                                value={field.value || ''}
                                                label='Otros'
                                                placeholder='ZONA - BAJA C-6'
                                            />
                                        )}
                                    />
                                    {errors.otros && <FormHelperText sx={{ color: 'error.main' }}>{errors.otros.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'center' }}>
                    <Button variant='contained' color='error' sx={{ mr: 2 }} onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant='contained'>
                        Actualizar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
export default EditServices