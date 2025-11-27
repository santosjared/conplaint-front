import { Box, Button, Dialog, DialogContent, FormControl, FormHelperText, Grid, IconButton, TextField } from "@mui/material";
import { forwardRef } from "react";
import Icon from "src/@core/components/icon";
import Fade, { FadeProps } from '@mui/material/Fade'
import { ReactElement, Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup'
import { confirmarDenuncia } from "src/store/asignes";
import { useDispatch } from "react-redux";
import { AppDispatch } from "src/store";

interface DescriptionType {
    description: string
}

const defaultValues: DescriptionType = {
    description: ''
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Fade ref={ref} {...props} />
})

const schema = yup.object().shape({
    description: yup
        .string()
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(1000, 'La descripción no debe pasar de los 1000 caracteres')
})

interface Props {
    open: boolean;
    toggle: () => void;
    id: string
    page: number
    pageSize: number
}

const Description = ({ open, toggle, id, page, pageSize }: Props) => {

    const dispatch = useDispatch<AppDispatch>()
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<DescriptionType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    const onSubmit = (data: DescriptionType) => {
        dispatch(confirmarDenuncia({ id, description: data, filters: { skip: page * pageSize, limit: pageSize } }));
        handleCancel();
    }
    const handleCancel = () => {
        reset(defaultValues);
        toggle();
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
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent >
                    <Box sx={{ mb: 8 }}>
                        <IconButton size='small' onClick={toggle} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
                            <Icon icon='mdi:close' />
                        </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} >
                            <FormControl fullWidth>
                                <FormControl fullWidth sx={{ mb: 6 }}>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                label='Descripción de denuncia atendida'
                                                placeholder='Descripción'
                                                onChange={onChange}
                                                error={Boolean(errors.description)}
                                                value={value}
                                                multiline
                                                minRows={5}
                                            />
                                        )}
                                    />
                                    {errors.description && <FormHelperText sx={{ color: 'error.main' }}>{errors.description.message}</FormHelperText>}
                                </FormControl>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 4, pt: 0 }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        type="submit"
                    >
                        Confirmar
                    </Button>
                </Box>
            </form>

        </Dialog>
    )
};

export default Description;