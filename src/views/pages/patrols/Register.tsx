import { Box, Button, Card, CardContent, CardMedia, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material"
import { Controller, useForm } from "react-hook-form"
import { styled } from '@mui/material/styles'
import { useDropzone } from 'react-dropzone'
import { Fragment, useEffect, useState } from "react"
import Icon from "src/@core/components/icon"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from 'yup'
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/store"
import { addPatrols, updatePatrols } from "src/store/patrols"
import { instance } from "src/configs/axios"
import baseUrl from 'src/configs/environment'

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
    marker: MarkerType | null
    otherMarker: string
    otherType: string
    type: TypeType | null
    image: File | null
    imageUrl: string
}

interface Props {
    page: number;
    pageSize: number;
    toggle: () => void;
    mode?: 'create' | 'edit';
    defaultValues?: VehicleType;
}
const DragAndDrog = styled(Box)(({ theme }) => ({
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    textAlign: 'center',
    cursor: 'pointer',
    height: 100,
    padding: 5
}))


const schema = yup.object().shape({
    plaque: yup
        .string()
        .trim()
        .required('La placa es obligatoria')
        .min(4, 'La placa debe tener al menos 4 caracteres')
        .max(10, 'La placa no puede tener más de 10 caracteres'),

    code: yup
        .string()
        .trim()
        .required('El código es obligatorio')
        .min(2, 'El código debe tener al menos 2 caracteres')
        .max(20, 'El código no puede tener más de 20 caracteres'),

    marker: yup
        .object({
            _id: yup.string().required('El campo marca de vehículo es requerido'),
            name: yup.string().required('El campo marca de vehículo es requerido')
        })
        .required('El campo marca de vehículo es requerido').nullable(),

    otherMarker: yup
        .string()
        .trim()
        .when('marker', {
            is: (val: MarkerType | null) => val?.name === 'Otro',
            then: schema =>
                schema
                    .required('Debe especificar otra marca')
                    .min(2, 'Debe tener al menos 2 caracteres')
                    .max(30, 'No puede tener más de 30 caracteres'),
            otherwise: schema => schema.notRequired()
        }),

    type: yup
        .object({
            _id: yup.string().required('El campo tipo de vehículo es requerido'),
            name: yup.string().required('El campo tipo de vehículo es requerido')
        })
        .required('El campo tipo de vehículo es requerido').nullable(),

    otherType: yup
        .string()
        .trim()
        .when('type', {
            is: (val: TypeType | null) => val?.name === 'Otro',
            then: schema =>
                schema
                    .required('Debe especificar otro tipo de vehículo')
                    .min(2, 'Debe tener al menos 2 caracteres')
                    .max(30, 'No puede tener más de 30 caracteres'),
            otherwise: schema => schema.notRequired()
        }),

    image: yup
        .mixed<File>()
        .test('fileSize', 'El archivo es muy grande (máximo 2 MB)', value => {
            if (!value) return true
            return (value as File).size <= 12 * 1024 * 1024 // 2 MB
        })
        .test('fileType', 'Formato no soportado (solo JPG/PNG)', value => {
            if (!value) return true
            return ['image/jpeg', 'image/png', 'image/jpg'].includes((value as File).type)
        })
        .test('fileName', 'El nombre del archivo es demasiado largo', value => {
            if (!value) return true
            return (value as File).name.length <= 100
        })
        .notRequired(),
})




const AddVehicle = ({ toggle, mode = 'create', defaultValues, page, pageSize }: Props) => {

    const [preview, setPreview] = useState<string | null>(null)
    const [marker, setMarker] = useState<MarkerType[]>([])
    const [type, setType] = useState<TypeType[]>([])

    const theme = useTheme()

    const dispatch = useDispatch<AppDispatch>()

    const {
        control,
        reset,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    useEffect(() => {
        reset(defaultValues)
        if (defaultValues?.imageUrl) {
            setPreview(`${baseUrl().backendURI}/images/${defaultValues?.imageUrl}`)
        } else {
            setPreview(defaultValues?.imageUrl || null)
        }
    }, [defaultValues, mode, toggle, page, pageSize])

    useEffect(() => {

        const fetchMarkers = async () => {
            try {
                const response = await instance.get('/patrols/markers');
                const data = await response.data;
                setMarker([...data, { _id: 'Other', name: 'Otro' }]);
            } catch (e) {
                console.log(e)
            }
        };
        fetchMarkers();
    }, [defaultValues, mode, toggle, page, pageSize]);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await instance.get('/patrols/types');
                const data = await response.data;
                setType([...data, { _id: 'Other', name: 'Otro' }]);
            } catch (e) {
                console.log(e)
            }
        };
        fetchTypes();
    }, [defaultValues, mode, toggle, page, pageSize]);

    const uploadFile = watch('image')
    const otherMarker = watch('marker')
    const otherType = watch('type')

    const { getRootProps, getInputProps, isDragAccept } = useDropzone({
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
        },
        onDrop: (acceptedFiles: File[]) => {
            const firstAcceptedFile = acceptedFiles[0];
            setValue('image', firstAcceptedFile, { shouldValidate: true });
            setPreview(URL.createObjectURL(firstAcceptedFile));
        }
    });
    const handleReset = () => {
        setPreview(null)
        reset()
        toggle()
    }
    const onSubmit = (data: VehicleType) => {

        const formData = new FormData()

        formData.append('code', data.code)
        formData.append('plaque', data.plaque)
        formData.append('marker', data.marker?._id || '')
        if (data.otherMarker) {
            formData.append('otherMarker', data.otherMarker)
        }
        formData.append('type', data.type?._id || '')
        if (data.otherType) {
            formData.append('otherType', data.otherType)
        }
        if (data.image) {
            formData.append('image', data.image)
        }

        if (mode === 'edit' && defaultValues?._id) {
            dispatch(updatePatrols({ data: formData, id: defaultValues._id, filters: { skip: page * pageSize, limit: pageSize } }))
        } else {
            dispatch(addPatrols({ data: formData, filters: { skip: page * pageSize, limit: pageSize } }))
        }
        handleReset()
    }
    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.primary.main}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}><Typography variant='subtitle2'>{mode === 'create' ? 'Agregar vehiculo' : 'Editar vehiculo'}</Typography></legend>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ mb: 6 }}>
                            <DragAndDrog  {...getRootProps()} sx={{
                                mb: 0,
                                backgroundColor: isDragAccept ? `${theme.palette.grey[400]}` : `${theme.palette.grey[100]}`,
                                height: !uploadFile ? 100 : 290,
                                border: errors.image ? `2px dashed ${theme.palette.error.main}` : `2px dashed ${theme.palette.grey[500]}`,
                            }}>
                                <input {...getInputProps()} />
                                {uploadFile ? <Card>
                                    <CardMedia
                                        sx={{ height: 200 }}
                                        image={preview || ''}
                                        title='img'
                                    />
                                    <CardContent>
                                        <Typography className='file-name'> {uploadFile.name}</Typography>
                                        <Typography className='file-size' variant='body2'>
                                            {Math.round(uploadFile.size / 100) / 10 > 1000
                                                ? `${(Math.round(uploadFile.size / 100) / 10000).toFixed(1)} MB`
                                                : `${(Math.round(uploadFile.size / 100) / 10).toFixed(1)} KB`}
                                        </Typography>
                                    </CardContent>
                                </Card> : <Fragment><Typography variant='subtitle2'>Subir una imagen</Typography>
                                    <Icon icon='mdi:upload-box' fontSize={40} color={theme.palette.success.main} /></Fragment>}

                            </DragAndDrog>
                            {errors.image && <FormHelperText sx={{ color: 'error.main' }}>{errors.image.message}</FormHelperText>}
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="plaque"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Placa de vehículo'
                                            placeholder='ZXR-345'
                                            onChange={onChange}
                                            error={Boolean(errors.plaque)}
                                            value={value}

                                        />
                                    )}
                                />
                                {errors.plaque && <FormHelperText sx={{ color: 'error.main' }}>{errors.plaque.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="code"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Codígo del vehículo'
                                            placeholder='ZXR-345'
                                            onChange={onChange}
                                            error={Boolean(errors.code)}
                                            value={value}

                                        />
                                    )}
                                />
                                {errors.code && <FormHelperText sx={{ color: 'error.main' }}>{errors.code.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="marker-select">Marca de vehículo</InputLabel>
                                <Controller
                                    name="marker"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            labelId="marker-select"
                                            id="select-marker"
                                            label="Marca de vehículo"
                                            value={value?._id ?? ''}
                                            error={Boolean(errors.marker)}
                                            onChange={(e) => {
                                                const selectedId = e.target.value as string
                                                const selectedMarker = marker.find((mar) => mar._id === selectedId) || null
                                                onChange(selectedMarker)
                                            }}
                                        >
                                            {marker.map((mar, index) => (
                                                <MenuItem value={mar._id || ''} key={index}>{mar.name}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.marker && <FormHelperText sx={{ color: 'error.main' }}>{errors.marker?.message || errors.marker.name?.message || errors.marker._id?.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        {otherMarker?.name == 'Otro' &&
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <Controller
                                        name="otherMarker"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                label='Especifica otra marca de vehículo'
                                                onChange={onChange}
                                                error={Boolean(errors.otherMarker)}
                                                value={value}
                                            />
                                        )}
                                    />
                                    {errors.otherMarker && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherMarker.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        }
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="type-select">Tipo de vehículo</InputLabel>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            labelId="type-select"
                                            id="select-type"
                                            label="Tipo de vehículo"
                                            value={value?._id ?? ''}
                                            error={Boolean(errors.type)}
                                            onChange={(e) => {
                                                const selectedId = e.target.value as string
                                                const selectedType = type.find((typ) => typ._id === selectedId) || null
                                                onChange(selectedType)
                                            }}
                                        >
                                            {type.map((typ, index) => (
                                                <MenuItem value={typ._id || ''} key={index}>{typ.name}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.type && <FormHelperText sx={{ color: 'error.main' }}>{errors.type?.message || errors.type.name?.message || errors.type._id?.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        {otherType?.name == 'Otro' &&
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <Controller
                                        name="otherType"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                label='Especifica otro tipo de vehículo'
                                                onChange={onChange}
                                                error={Boolean(errors.otherType)}
                                                value={value}
                                            />
                                        )}
                                    />
                                    {errors.otherType && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherType.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        }
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                        <Button size='large' variant='contained' color='error' onClick={handleReset} startIcon={<Icon icon='mdi:cancel-circle' />}>
                            Cancelar
                        </Button>
                        <Button size='large' type='submit' variant='contained' sx={{ mr: 3 }} startIcon={<Icon icon='mdi:content-save' />}>
                            Guardar
                        </Button>
                    </Box>
                </fieldset>
            </form>
        </Box>
    )
}
export default AddVehicle