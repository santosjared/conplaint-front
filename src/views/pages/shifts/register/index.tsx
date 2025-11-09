import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
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
import { instance } from 'src/configs/axios'
import { addShit, updateShit } from 'src/store/shits'

interface HourRange {
    name: string
    hrs_i: string
    hrs_s: string
}

interface GradeType {
    name: string;
    _id: string;
}

interface ShiftsType {
    _id?: string
    date: string
    grade: GradeType
    otherGrade: string
    supervisor: string
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
    grade: yup.object({
        _id: yup.string().required('El campo grado es requerido'),
        name: yup.string().required('El campo grado es requerido'),
    }).required('El campo grado es requerido'),
    otherGrade: yup
        .string()
        .when('grade', {
            is: (val: GradeType | null) => val?.name === 'Otro',
            then: schema => schema.required('Debe especificar otro tipo de grado'),
            otherwise: schema => schema.notRequired()
        }),
    date: yup
        .string()
        .required('El campo fecha es requerido'),
    supervisor: yup.string()
        .transform(value => (value === '' ? undefined : value))
        .required('El campo supervisor es requerido')
        .min(4, 'El campo supervisor debe tener al menos 4 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo supervisor solo debe contener letras'),
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
    const [grades, setGrades] = useState<GradeType[]>([])

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await instance.get('/users/grades');
                setGrades([...response.data, { name: 'Otro', _id: 'other' }]);
            } catch (e) {
                console.log(e)
            }

        }
        fetchGrades();
    }, [mode, defaultValues, toggle]);

    const {
        reset,
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<ShiftsType>({
        defaultValues: defaultValues || { date: '', supervisor: '', otherGrade: '', hrs: [] },
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    const otherGrade = watch('grade');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'hrs'
    })

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues)
        } else {
            reset({ date: '', supervisor: '', hrs: [] })
        }
    }, [defaultValues, mode, reset])

    const onSubmit = (data: ShiftsType) => {
        const newData = { ...data, grade: data.grade._id || '' }
        delete newData._id
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
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="grade-select">Grado del supervisor</InputLabel>
                                <Controller
                                    name="grade"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <Select
                                            labelId="grade-select"
                                            id="select-grade"
                                            label="Grado del supervisor"
                                            error={Boolean(errors.grade)}
                                            value={value?._id ?? ''}
                                            onChange={(e) => {
                                                const selectedId = e.target.value as string
                                                const selectedGrade = grades.find((grade) => grade._id === selectedId) || null
                                                onChange(selectedGrade)
                                            }}
                                        >
                                            {grades.map((value) => (<MenuItem
                                                value={value._id || ''}
                                                key={value._id}
                                            >{value.name}</MenuItem>))}
                                        </Select>
                                    )}
                                />
                                {errors.grade && <FormHelperText sx={{ color: 'error.main' }}>{errors.grade?.message || errors.grade.name?.message || errors.grade._id?.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        {otherGrade?.name == 'Otro' &&
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <Controller
                                        name="otherGrade"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                label='Especifica otro grado'
                                                onChange={(e) => onChange(e.target.value.toUpperCase())}
                                                error={Boolean(errors.otherGrade)}
                                                value={value}
                                            />
                                        )}
                                    />
                                    {errors.otherGrade && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherGrade.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        }
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name='supervisor'
                                    rules={{ required: true }}
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label='Supervisor'
                                            placeholder='Jhon Doh'
                                            error={Boolean(errors.supervisor)}
                                        />
                                    )}
                                />
                                {errors.supervisor && <FormHelperText sx={{ color: 'error.main' }}>{errors.supervisor.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name='date'
                                    control={control}
                                    render={({ field }) => {
                                        return (
                                            <TextField
                                                {...field}
                                                label='Fecha de horario'
                                                type='date'
                                                error={Boolean(errors.date)}
                                            />
                                        )
                                    }}
                                />
                                {errors.date && <FormHelperText sx={{ color: 'error.main' }}>{errors.date.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        {fields.map((item, index) => (
                            <Fragment key={item.id}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <Controller
                                            name={`hrs.${index}.name`}
                                            control={control}
                                            defaultValue={item.name}
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <IconButton
                            onClick={handleAdd}
                            size='small'
                            sx={{ color: theme.palette.primary.main }}
                        >
                            <Icon icon='zondicons:add-outline' fontSize={25} />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        {errors.hrs && <FormHelperText sx={{ color: 'error.main' }}>{errors.hrs.message}</FormHelperText>}
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
