import { Box, Button, FormControl, FormHelperText, Grid, TextField, Typography, useTheme } from "@mui/material"
import { useEffect } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useDispatch } from 'react-redux'
import { AppDispatch } from "src/store"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { addRol, updateRol } from "src/store/role"
import { Rol } from "src/context/types"

interface Props {
    toggle: () => void
    page: number
    pageSize: number
    mode?: 'create' | 'edit'
    defaultValues?: Rol
}

const AddRol = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {
    const schema = yup.object().shape({
        name: yup
            .string()
            .trim()
            .required('El campo nombre es requerido')
            .min(3, 'El campo nombre debe tener al menos 3 caracteres')
            .max(50, 'El campo nombre no puede tener más de 50 caracteres'),

        description: yup
            .string()
            .transform(value => (value?.trim() === '' ? undefined : value))
            .min(10, 'El campo descripción debe tener al menos 10 caracteres')
            .max(200, 'El campo descripción no puede tener más de 200 caracteres')
            .notRequired()
    });

    const theme = useTheme()

    const dispatch = useDispatch<AppDispatch>()

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, mode])

    const onSubmit = (data: Rol) => {

        const newData = {
            name: data.name,
            description: data.description,
        };

        if (mode === 'edit' && defaultValues?._id) {
            dispatch(updateRol({
                data: newData,
                id: defaultValues._id,
                filtrs: { skip: page * pageSize, limit: pageSize }
            }));
        } else {
            dispatch(addRol({
                data: newData,
                filtrs: { skip: page * pageSize, limit: pageSize }
            }));
        }

        toggle();
        reset();
    };

    const handleOnclickCancel = () => {
        reset()
        toggle()
    }

    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.primary.main}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}>
                        <Typography variant='subtitle2'>{mode === 'create' ? 'Agregar Nuevo Rol' : 'Editar Rol'}</Typography>
                    </legend>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Nombre'
                                            placeholder='Admin'
                                            onChange={onChange}
                                            error={Boolean(errors.name)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Descripción'
                                            placeholder='Descripción del rol (opcional)'
                                            onChange={onChange}
                                            error={Boolean(errors.description)}
                                            value={value}
                                            multiline
                                            minRows={4}
                                        />
                                    )}
                                />
                                {errors.description && <FormHelperText sx={{ color: 'error.main' }}>{errors.description.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            size='large'
                            variant='contained'
                            color='error'
                            onClick={handleOnclickCancel}
                            startIcon={<Icon icon='mdi:cancel-circle' />}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size='large'
                            type='submit'
                            variant='contained'
                            sx={{ mr: 3 }}
                            startIcon={<Icon icon='mdi:content-save' />}
                        >
                            Guardar
                        </Button>
                    </Box>
                </fieldset>
            </form>
        </Box>
    )
}

export default AddRol
