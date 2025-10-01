import { Box, Button, Dialog, DialogActions, DialogContent, FormControl, FormHelperText, Grid, IconButton, TextField, Typography } from "@mui/material"
import { forwardRef } from "react";
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
    indexUser: number;
}

const defaultValues: { cargo: string } = {
    cargo: ''
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Fade ref={ref} {...props} />
})

const schema = yup.object().shape({
    cargo: yup.string().optional(),
})

const EditCargo = ({ open, toggle, shift, setShift, indexHr, indexService, indexUser }: Props) => {

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<{ cargo: string }>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    const onSubmit = (data: { cargo: string }) => {
        const updatedShift = { ...shift };
        const updatedHours = [...updatedShift.hrs];
        const updatedServices = [...updatedHours[indexHr].services];
        const updatedUsers = [...updatedServices[indexService].users];

        const updatedUser = { ...updatedUsers[indexUser], cargo: data.cargo };
        updatedUsers[indexUser] = updatedUser;
        updatedServices[indexService] = {
            ...updatedServices[indexService],
            users: updatedUsers
        };
        updatedHours[indexHr] = {
            ...updatedHours[indexHr],
            services: updatedServices
        };
        updatedShift.hrs = updatedHours;

        setShift(updatedShift);
        reset();
        toggle();
    };


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
                            Editar cargo de usuario {shift.hrs?.[indexHr]?.services?.[indexService]?.users?.[indexUser]?.user?.firstName || 'No definido'}
                        </Typography>
                        <FormControl fullWidth>
                            <Controller
                                name='cargo'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        autoComplete='off'
                                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                                        value={field.value || ''}
                                        label='Cargo'
                                        placeholder='Despachador'
                                    />
                                )}
                            />
                            {errors.cargo && <FormHelperText sx={{ color: 'error.main' }}>{errors.cargo.message}</FormHelperText>}
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'center' }}>
                    <Button variant='contained' color='error' sx={{ mr: 2 }} onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant='contained'>
                        Aceptar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
export default EditCargo