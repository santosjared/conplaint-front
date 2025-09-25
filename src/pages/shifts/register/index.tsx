import {
    Autocomplete,
    Box,
    Button,
    FormControl,
    Grid,
    IconButton,
    TextField,
    Typography,
    useTheme
} from '@mui/material'

import { Fragment, useEffect, useState } from 'react'
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'src/store'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { UserType } from 'src/types/types'
import { instance } from 'src/configs/axios'
import { addShit, updateShit } from 'src/store/shits'

interface HourRange {
    name: string
    hrs_i: string
    hrs_s: string
}

interface ShiftsType {
    _id?: string
    date: string
    supervisor: UserType | null
    hrs: HourRange[]
}

interface Props {
    toggle: () => void
    page: number
    pageSize: number
    mode?: 'create' | 'edit'
    defaultValues?: ShiftsType
}

const showErrors = (field: string, valueLen: number, min: number) => {
    if (valueLen === 0) return `El campo ${field} es requerido`
    if (valueLen > 0 && valueLen < min) return `El campo ${field} debe tener al menos ${min} caracteres`
    return ''
}

const schema = yup.object().shape({
    date: yup
        .string()
        .required('El campo fecha es requerido'),
    supervisor: yup
        .object()
        .nullable()
        .required('El campo supervisor es requerido'),
    hrs: yup
        .array()
        .of(
            yup.object().shape({
                name: yup
                    .string()
                    .required('El nombre del rango es requerido')
                    .min(3, obj => showErrors('nombre del rango', obj.value.length, obj.min)),
                hrs_i: yup
                    .string()
                    .required('Hora de entrada requerida'),
                hrs_s: yup
                    .string()
                    .required('Hora de salida requerida')
            })
        )
        .min(1, 'Debe agregar al menos un rango horario')
})

const AddShifts = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {
    const theme = useTheme()
    const dispatch = useDispatch<AppDispatch>()
    const [user, setUser] = useState<UserType[]>([])
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await instance.get('/shits/users')
                const data = response.data || []
                if (Array.isArray(data)) {
                    setUser(data)
                } else {
                    console.error('/shits/users no devolvió un array:', data)
                    setUser([])
                }
            } catch (error) {
                console.error('Error obteniendo usuarios:', error)
                setUser([])
            }
        }
        fetchUsers()
    }, [mode])

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<ShiftsType>({
        defaultValues: defaultValues || { date: '', supervisor: null, hrs: [] },
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'hrs'
    })

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues)
        } else {
            reset({ date: '', supervisor: null, hrs: [] })
        }
    }, [defaultValues, mode, reset])

    const onSubmit = (data: ShiftsType) => {
        const newData = {
            date: data.date,
            supervisor: data.supervisor?._id || '',
            hrs: data.hrs
        }
        if (mode === 'edit' && defaultValues?._id) {
            dispatch(
                updateShit({
                    data: newData,
                    id: defaultValues._id,
                    filtrs: { skip: page * pageSize, limit: pageSize }
                })
            )
        } else {
            dispatch(
                addShit({
                    data: newData,
                    filtrs: { skip: page * pageSize, limit: pageSize }
                })
            )
        }
        toggle()
        reset()
    }

    const handleAdd = () => {
        append({ name: '', hrs_i: '08:00', hrs_s: '12:00' })
    }

    const handleCancel = () => {
        reset()
        toggle()
    }

    return (
        <Box>
            <form autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
                <fieldset
                    style={{
                        border: `1.5px solid ${theme.palette.primary.main}`,
                        borderRadius: 10,
                        paddingTop: 20
                    }}
                >
                    <legend style={{ textAlign: 'center' }}>
                        <Typography variant='subtitle2'>Agregar / Editar Horario</Typography>
                    </legend>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name='supervisor'
                                    control={control}
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <Autocomplete
                                            disablePortal
                                            options={Array.isArray(user) ? user : []}
                                            getOptionLabel={(option: UserType) =>
                                                `${option.firstName} ${option.paternalSurname || ''} ${option.maternalSurname || ''}`.trim()
                                            }
                                            value={value || null}
                                            isOptionEqualToValue={(option, value) => option._id === value?._id}
                                            onChange={(_, newValue) => onChange(newValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label='Supervisor'
                                                    error={!!error}
                                                    helperText={error?.message}
                                                />
                                            )}
                                        />
                                    )}
                                />

                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name='date'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label='Fecha de horario'
                                            type='date'
                                            error={!!errors.date}
                                            helperText={errors.date?.message}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        {fields.map((item, index) => (
                            <Fragment key={item.id}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <Controller
                                            name={`hrs.${index}.name`}
                                            control={control}
                                            defaultValue={item.name} // importante
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                    value={field.value}
                                                    label={`Nombre del rango ${index + 1}`}
                                                    placeholder='Ej: Turno Mañana'
                                                    error={!!(errors.hrs && errors.hrs[index]?.name)}
                                                    helperText={errors.hrs && errors.hrs[index]?.name?.message}
                                                />
                                            )}

                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={5.5}>
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <Controller
                                            name={`hrs.${index}.hrs_i`}
                                            control={control}
                                            defaultValue={item.hrs_i}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label='Hora de entrada'
                                                    type='time'
                                                    fullWidth
                                                    error={!!(errors.hrs && errors.hrs[index]?.hrs_i)}
                                                    helperText={errors.hrs && errors.hrs[index]?.hrs_i?.message}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={5.5}>
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <Controller
                                            name={`hrs.${index}.hrs_s`}
                                            control={control}
                                            defaultValue={item.hrs_s}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label='Hora de salida'
                                                    type='time'
                                                    fullWidth
                                                    error={!!(errors.hrs && errors.hrs[index]?.hrs_s)}
                                                    helperText={errors.hrs && errors.hrs[index]?.hrs_s?.message}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton onClick={() => remove(index)} sx={{ mt: 1 }}>
                                        <Icon icon='ic:baseline-clear' />
                                    </IconButton>
                                </Grid>
                            </Fragment>
                        ))}
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <IconButton
                            onClick={handleAdd}
                            size='small'
                            sx={{ color: theme.palette.primary.main }}
                        >
                            <Icon icon='zondicons:add-outline' fontSize={25} />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            variant='contained'
                            color='error'
                            startIcon={<Icon icon='mdi:cancel-circle' />}
                            onClick={handleCancel}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type='submit'
                            variant='contained'
                            color='primary'
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

export default AddShifts
