import { Autocomplete, Box, Button, Card, FormControl, FormHelperText, Grid, IconButton, TextField, Typography, useTheme } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useSelector } from 'react-redux'
import { RootState } from "src/store"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { UserType } from "src/types/types"
import { instance } from "src/configs/axios"
import { createFilterOptions } from '@mui/material/Autocomplete'
import Swal from 'sweetalert2';
import { AbilityContext } from "src/layouts/components/acl/Can"

interface Infractor {
    apellido_paterno: string
    apellido_materno: string
    nombres: string
    ci: string
    edad: number
    ocupation: string
    alias: string
    _id?: string
}

interface ComplaintType {
    name: string
    image: string
    description: string
    _id: string
}

interface DenunciaType {
    sigla: string
    encargado: UserType | null
    fecha_hecho: string
    hora_hecho: string
    lugar_hecho: string
    tipo_denuncia: ComplaintType | null
    infractores: Infractor[]
    description: string
    otra_denuncia: string
    _id?: string
}

interface Client {
    name: string
    lastName: string
    email: string
    phone: string
}
interface Kin {
    name: string
}
interface Typecomplaints {
    name: string
}
interface DataType {
    complaints: Typecomplaints
    aggressor?: Kin
    victim?: Kin
    place?: string
    description?: string
    latitude?: string
    longitude?: string
    images?: Array<string>
    video?: string
    otherComplaints?: string
    otherAggressor?: string
    otherVictim?: string
    status?: string
    createdAt: string
    userId: Client
    _id?: string
}

interface Atendidos {
    complaint: DataType
    createdAt: string
    confirmed: DenunciaType
    status: 'error' | 'warning' | 'success'
    _id: string
}


const today = new Date().toISOString().split('T')[0]

const defaultValues: DenunciaType = {
    sigla: '',
    encargado: null,
    fecha_hecho: today,
    hora_hecho: '00:00',
    lugar_hecho: '',
    tipo_denuncia: null,
    infractores: [],
    description: '',
    otra_denuncia: ''
}

interface Props {
    toggle: () => void
    atendido: Atendidos | null
    fetch: () => void
}

const schema = yup.object().shape({
    sigla: yup
        .string()
        .trim()
        .required('El campo sigla es requerido')
        .min(2, 'La sigla debe tener al menos 2 caracteres')
        .max(32, 'La sigla no puede tener más de 32 caracteres'),

    fecha_hecho: yup
        .string()
        .required('La fecha del hecho es requerida')
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD'),

    hora_hecho: yup
        .string()
        .required('La hora del hecho es requerida')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'La hora debe tener el formato HH:mm'),

    lugar_hecho: yup
        .string()
        .trim()
        .required('El lugar del hecho es requerido')
        .min(4, 'El lugar debe tener al menos 4 caracteres')
        .max(150, 'El lugar no puede tener más de 150 caracteres'),

    tipo_denuncia: yup
        .object({
            _id: yup.string().required(),
            name: yup.string().required(),
            description: yup.string().nullable(),
            image: yup.string().nullable()
        })
        .nullable()
        .required('Debe seleccionar el tipo de denuncia'),

    otra_denuncia: yup
        .string()
        .trim()
        .when('tipo_denuncia', {
            is: (val: any) => val?.name === 'Otro',
            then: (schema) =>
                schema
                    .required('Debe especificar otro tipo de denuncia')
                    .min(3, 'El campo otra denuncia debe tener al menos 3 caracteres')
                    .max(100, 'El campo otra denuncia no puede exceder 100 caracteres'),
            otherwise: (schema) => schema.notRequired()
        }),

    description: yup
        .string()
        .transform(value => (value?.trim() === '' ? undefined : value))
        .min(10, 'El campo descripción debe tener al menos 10 caracteres')
        .max(500, 'El campo descripción no puede tener más de 500 caracteres')
        .notRequired(),

    infractores: yup
        .array()
        .of(
            yup.object().shape({
                apellido_paterno: yup
                    .string()
                    .transform(value => (value?.trim() === '' ? undefined : value))
                    .notRequired()
                    .min(2, 'El campo apellido paterno debe tener al menos 2 caracteres')
                    .max(50, 'El campo apellido paterno no puede tener más de 50 caracteres'),

                apellido_materno: yup
                    .string()
                    .transform(value => (value?.trim() === '' ? undefined : value))
                    .notRequired()
                    .min(2, 'El campo apellido materno debe tener al menos 2 caracteres')
                    .max(50, 'El campo apellido materno no puede tener más de 50 caracteres'),

                nombres: yup
                    .string()
                    .trim()
                    .required('El nombre del arrestado es requerido')
                    .min(2, 'El campo nombres debe tener al menos 2 caracteres')
                    .max(100, 'El campo nombres no puede tener más de 100 caracteres'),

                ci: yup
                    .string()
                    .trim()
                    .required('El número de cédula es requerido')
                    .matches(/^[0-9A-Za-z-]+$/, 'El número de cédula contiene caracteres inválidos')
                    .min(5, 'El número de cédula es demasiado corto')
                    .max(20, 'El número de cédula es demasiado largo'),

                edad: yup
                    .number()
                    .typeError('La edad debe ser un número')
                    .required('La edad es requerida')
                    .min(10, 'La edad mínima es 10 años')
                    .max(120, 'La edad máxima es 120 años'),

                ocupation: yup
                    .string()
                    .trim()
                    .required('La ocupación es requerida')
                    .min(2, 'El campo ocupación debe tener al menos 2 caracteres')
                    .max(100, 'El campo ocupación no puede tener más de 100 caracteres'),

                alias: yup
                    .string()
                    .transform(value => (value?.trim() === '' ? undefined : value))
                    .notRequired()
                    .min(2, 'El campo alias debe tener al menos 2 caracteres')
                    .max(50, 'El campo alias no puede tener más de 50 caracteres'),

                _id: yup
                    .string()
                    .trim()
                    .notRequired()
            })
        )
        .min(1, 'Debe registrar al menos un arrestado')
});


const AddDenuncias = ({ toggle, atendido, fetch }: Props) => {
    const theme = useTheme()

    const [denuncias, setDenuncias] = useState<ComplaintType[]>([])

    const { user } = useSelector((state: RootState) => state.auth)

    const ability = useContext(AbilityContext)

    const can = ability?.can('create', 'atender') || ability?.can('update', 'atender');

    const {
        reset,
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    const otherCompalint = watch('tipo_denuncia')

    useEffect(() => {
        if (atendido?.status === 'warning') {
            reset(atendido.confirmed)
        }
    }, [atendido])

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await instance.get('/confirmed/type-complaints');
                setDenuncias([...response.data, { name: 'Otro', image: '', _id: 'other', description: '' }])
            } catch (e) {
                console.log(e)
            }
        }
        fetch()
    }, [atendido])

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'infractores'
    })

    const handleAdd = () => {
        append({ apellido_paterno: '', apellido_materno: '', nombres: '', ci: '', edad: 30, ocupation: '', alias: '' })
    }

    const onSubmit = async (data: DenunciaType) => {
        try {
            const newData = {
                ...data,
                atendido: atendido?._id,
                tipo_denuncia: data.tipo_denuncia?._id,
                encargado: user._id
            }
            if (atendido?.status === 'warning' && data?._id) {
                delete newData._id
                await instance.put(`/confirmed/${data._id}`, newData).then(() => {
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Datos actualizada exitosamente',
                        icon: "success"
                    });
                })
            } else {
                await instance.post('confirmed', newData).then(() => {
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Datos guardados  exitosamente',
                        icon: "success"
                    });
                })
            }
            fetch()
        } catch (error) {
            console.log('error al registrar denuncia ', error)
        }

        toggle()
        reset()
    }

    const handleOnclickCancel = () => {
        reset()
        toggle()
    }

    const filter = createFilterOptions<ComplaintType>()

    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.primary.main}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}>
                        <Typography variant='subtitle2'>Agregar Denuncia</Typography>
                    </legend>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormHelperText sx={{ color: 'secondary.main' }}>Patrulla de Auxilio y Cooperación Ciudadana</FormHelperText>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="sigla"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Sigla'
                                            placeholder='JP LOBOS'
                                            onChange={onChange}
                                            error={Boolean(errors.sigla)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.sigla && <FormHelperText sx={{ color: 'error.main' }}>{errors.sigla.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="encargado"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Encargado'
                                            onChange={onChange}
                                            disabled
                                            error={Boolean(errors.encargado)}
                                            value={`${user.grade?.name || ''} ${user.firstName || ''} ${user.lastName || ''} ${user.paternalSurname || ''} ${user.maternalSurname || ''}`}
                                        />
                                    )}
                                />
                                {errors.encargado && <FormHelperText sx={{ color: 'error.main' }}>{errors.encargado.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="fecha_hecho"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Fecha del hecho'
                                            type="date"
                                            onChange={onChange}
                                            error={Boolean(errors.fecha_hecho)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.fecha_hecho && <FormHelperText sx={{ color: 'error.main' }}>{errors.fecha_hecho.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="hora_hecho"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Hora del hecho'
                                            type="time"
                                            onChange={onChange}
                                            error={Boolean(errors.hora_hecho)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.hora_hecho && <FormHelperText sx={{ color: 'error.main' }}>{errors.hora_hecho.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="lugar_hecho"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Lugar del hecho'
                                            placeholder='Calle 15 de abril'
                                            onChange={onChange}
                                            error={Boolean(errors.lugar_hecho)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.lugar_hecho && <FormHelperText sx={{ color: 'error.main' }}>{errors.lugar_hecho.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="tipo_denuncia"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <Autocomplete
                                            disablePortal
                                            options={denuncias}
                                            getOptionLabel={(option) => option.name || ''}
                                            isOptionEqualToValue={(option, value) => option._id === value?._id}
                                            value={value || null}
                                            onChange={(_, newValue) => onChange(newValue)}
                                            filterOptions={(options, params) => {
                                                const filtered = filter(options, params)
                                                if (!filtered.some((opt) => opt._id === 'other')) {
                                                    filtered.push({ name: 'Otro', image: '', description: '', _id: 'other' })
                                                }

                                                return filtered
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Naturaleza del hecho"
                                                    error={!!errors.tipo_denuncia}
                                                />
                                            )}
                                        />
                                    )}
                                />
                                {errors.tipo_denuncia && (<FormHelperText sx={{ color: 'error.main' }}>{errors.tipo_denuncia.message}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        {otherCompalint?.name == 'Otro' &&
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <Controller
                                        name="otra_denuncia"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                label='Especifica otro denuncia'
                                                onChange={(e) => onChange(e.target.value.toUpperCase())}
                                                error={Boolean(errors.otra_denuncia)}
                                                value={value}
                                            />
                                        )}
                                    />
                                    {errors.otra_denuncia && <FormHelperText sx={{ color: 'error.main' }}>{errors.otra_denuncia.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            {fields.map((item, index) => (
                                <Card key={index}
                                    elevation={0}
                                    sx={{
                                        borderColor: 'primary.main',
                                        borderRadius: 2,
                                        p: 3,
                                        mb: 2,
                                        backgroundColor: 'background.paper'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                                        <Typography variant="subtitle2" align="center" sx={{ mb: 2 }}>Arrestado {index + 1}</Typography>
                                        <IconButton onClick={() => remove(index)}>
                                            <Icon icon='ic:baseline-clear' />
                                        </IconButton>
                                    </Box>

                                    <Grid container spacing={2} key={item.id}>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <Controller
                                                    name={`infractores.${index}.apellido_paterno`}
                                                    control={control}
                                                    defaultValue={item?.apellido_paterno || ''}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={`Apellido Paterno de arrestado ${index + 1}`}
                                                            placeholder='Apellido paterno'
                                                            error={!!(errors.infractores && errors.infractores[index]?.apellido_paterno)}
                                                            helperText={errors.infractores && errors.infractores[index]?.apellido_paterno?.message}
                                                        />
                                                    )}

                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <Controller
                                                    name={`infractores.${index}.apellido_materno`}
                                                    control={control}
                                                    defaultValue={item?.apellido_materno || ''}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={`Apellido Materno de arrestado ${index + 1}`}
                                                            placeholder='Apellido materno'
                                                            error={!!(errors.infractores && errors.infractores[index]?.apellido_materno)}
                                                            helperText={errors.infractores && errors.infractores[index]?.apellido_materno?.message}
                                                        />
                                                    )}

                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <Controller
                                                    name={`infractores.${index}.nombres`}
                                                    control={control}
                                                    defaultValue={item?.nombres || ''}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={`Nombres del arrestado ${index + 1}`}
                                                            placeholder='nombres del arrestado'
                                                            error={!!(errors.infractores && errors.infractores[index]?.nombres)}
                                                            helperText={errors.infractores && errors.infractores[index]?.nombres?.message}
                                                        />
                                                    )}

                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <Controller
                                                    name={`infractores.${index}.ci`}
                                                    control={control}
                                                    defaultValue={item?.ci || ''}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={`Cédula de identidad del arrestado ${index + 1}`}
                                                            placeholder='cédula de identidad'
                                                            error={!!(errors.infractores && errors.infractores[index]?.ci)}
                                                            helperText={errors.infractores && errors.infractores[index]?.ci?.message}
                                                        />
                                                    )}

                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <Controller
                                                    name={`infractores.${index}.edad`}
                                                    control={control}
                                                    defaultValue={item?.edad || 30}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={`Edad del arrestado ${index + 1}`}
                                                            placeholder='30'
                                                            type="number"
                                                            error={!!(errors.infractores && errors.infractores[index]?.edad)}
                                                            helperText={errors.infractores && errors.infractores[index]?.edad?.message}
                                                        />
                                                    )}

                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <Controller
                                                    name={`infractores.${index}.ocupation`}
                                                    control={control}
                                                    defaultValue={item?.ocupation || ''}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={`Ocupación del arrestado ${index + 1}`}
                                                            placeholder='Albañil'
                                                            error={!!(errors.infractores && errors.infractores[index]?.ocupation)}
                                                            helperText={errors.infractores && errors.infractores[index]?.ocupation?.message}
                                                        />
                                                    )}

                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <Controller
                                                    name={`infractores.${index}.alias`}
                                                    control={control}
                                                    defaultValue={item?.alias || ''}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={`Alias del arrestado ${index + 1}`}
                                                            placeholder='El colla'
                                                            error={!!(errors.infractores && errors.infractores[index]?.alias)}
                                                            helperText={errors.infractores && errors.infractores[index]?.alias?.message}
                                                        />
                                                    )}

                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Card>

                            ))}
                        </Grid>
                        <Grid item xs={12}>
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
                                {errors.infractores && <FormHelperText sx={{ color: 'error.main' }}>{errors.infractores.message}</FormHelperText>}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Descripción'
                                            placeholder='Descripción del hecho (opcional)'
                                            onChange={onChange}
                                            error={Boolean(errors.description)}
                                            value={value || ''}
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
                        {can &&
                            <Button
                                size='large'
                                type='submit'
                                variant='contained'
                                color={atendido?.status === 'warning' ? 'warning' : 'primary'}
                                sx={{ mr: 3 }}
                                startIcon={<Icon icon='mdi:content-save' />}
                            >
                                {atendido?.status === 'warning' ? 'Actualizar' : 'Guardar'}
                            </Button>
                        }
                    </Box>
                </fieldset>
            </form>
        </Box>
    )
}

export default AddDenuncias
