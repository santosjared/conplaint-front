import { Box, Button, Card, CardContent, CardMedia, FormControl, FormHelperText, Grid, TextField, Typography, useTheme } from "@mui/material"
import { Controller, useForm } from "react-hook-form"
import { styled } from '@mui/material/styles'
import { useDropzone } from 'react-dropzone'
import { Fragment, useEffect, useState } from "react"
import Icon from "src/@core/components/icon"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from 'yup'
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/store"
import { addComplaints, updateComplaints } from "src/store/complaints"

type ComplaintsType = {
    name: string
    description: string
    file?: File
    _id?: string
    __v?: string
}

interface Props {
    toggle: () => void;
    mode?: 'create' | 'edit';
    defaultValues?: ComplaintsType;
    page: number
    limit: number
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
    name: yup
        .string()
        .required('El tipo de denuncia es obligatorio')
        .min(3, 'El tipo de denuncia debe contener al menos 3 caracteres')
        .max(50, 'El tipo de denuncia no debe exceder los 50 caracteres'),

    description: yup
        .string()
        .notRequired()
        .test('minLength', 'La descripción debe tener al menos 10 caracteres', (value) => {
            if (!value) return true;
            return value.length >= 10;
        })
        .max(1000, 'La descripción no debe pasar de los 1000 caracteres'),

    file: yup
        .mixed()
        .notRequired()
        .test('fileType', 'Solo se permiten archivos de imagen', (value) => {
            if (!value) return true;
            return value.type?.startsWith('image/');
        })
        .test('fileSize', 'La imagen no debe superar los 12 MB', (value) => {
            if (!value) return true;
            return value.size <= 12 * 1024 * 1024;;
        })
});


const AddComplaints = ({ toggle, mode = 'create', defaultValues, page, limit }: Props) => {

    const [preview, setPreview] = useState<string | null>(null)

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
    }, [defaultValues, mode])

    const uploadFile = watch('file')

    const { getRootProps, getInputProps, isDragAccept } = useDropzone({
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
        },
        onDrop: (acceptedFiles: File[]) => {
            const firstAcceptedFile = acceptedFiles[0];
            setValue('file', firstAcceptedFile, { shouldValidate: true });
            setPreview(URL.createObjectURL(firstAcceptedFile));
        }
    });
    const handleReset = () => {
        setPreview(null)
        reset()
        toggle()
    }
    const onSubmit = (data: ComplaintsType) => {
        if (mode === 'edit' && defaultValues?._id) {
            delete data._id;
            dispatch(updateComplaints({ data, id: defaultValues._id, filters: { skip: (page - 1) * limit, limit } }))
        } else {
            dispatch(addComplaints({ data, filters: { skip: (page - 1) * limit, limit } }))
        }
        handleReset()
    }
    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.primary.main}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}><Typography variant='subtitle2'>{mode === 'create' ? 'Agregar denuncia' : 'Editar denuncia'}</Typography></legend>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Tipo de denuncia'
                                            placeholder='Robo'
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
                                            placeholder='Descripción de la denuncia'
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
                        <Grid item xs={12}>
                            <DragAndDrog  {...getRootProps()} sx={{
                                mb: 0,
                                backgroundColor: isDragAccept ? theme.palette.grey[300] : theme.palette.grey[200],
                                height: !uploadFile ? 100 : 290,
                                border: errors.file ? `2px dashed ${theme.palette.error.main}` : `2px dashed ${theme.palette.primary.main}`,
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
                            {errors.file && <FormHelperText sx={{ color: 'error.main' }}>{errors.file.message}</FormHelperText>}
                        </Grid>
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
export default AddComplaints