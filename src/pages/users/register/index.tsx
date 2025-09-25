import { Box, Button, FormControl, FormHelperText, Grid, IconButton, InputAdornment, OutlinedInput, TextField, Typography, useTheme } from "@mui/material"
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useDispatch } from 'react-redux';
import { AppDispatch } from "src/store";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup'
import { instance } from "src/configs/axios";
import { UserType } from "src/types/types";
import { addUser, updateUser } from "src/store/user";

interface Props {
    toggle: () => void;
    page: number;
    pageSize: number;
    mode?: 'create' | 'edit';
    defaultValues?: UserType;
}

const showErrors = (field: string, valueLen: number, min: number) => {
    if (valueLen === 0) {
        return `El campo ${field} es requerido`
    } else if (valueLen > 0 && valueLen < min) {
        return `El campo ${field} debe tener al menos ${min} caracteres`
    } else {
        return ''
    }
}



const AddUser = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {

    const [showPassword, setShowPassword] = useState(false)
    const [roles, setRoles] = useState<any[]>([])
    const checkemail = defaultValues?.email

    const theme = useTheme()

    const schema = yup.object().shape({
        grade: yup.string().required('El campo grado es requerido'),
        paternalSurname: yup.string()
            .transform(value => (value === '' ? undefined : value))
            .min(4, 'El campo apellido paterno debe tener al menos 4 caracteres')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo apellido paterno solo debe contener letras')
            .notRequired(),
        maternalSurname: yup.string()
            .transform(value => (value === '' ? undefined : value))
            .min(4, 'El campo apellido materno debe tener al menos 4 caracteres')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo apellido materno solo debe contener letras')
            .notRequired(),
        firstName: yup.string().required('El campo 1er. nombre es requerido')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo apellido solo debe contener letras')
            .min(3, obj => showErrors('1er. nombre', obj.value.length, obj.min)),
        lastName: yup.string()
            .transform(value => (value === '' ? undefined : value))
            .min(3, 'El campo 2do. nombre debe tener al menos 4 caracteres')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo 2do. nombre solo debe contener letras')
            .notRequired(),
        email: yup.string().email('Debe ingresar un correo electrónico válido').required('El campo correo electrónico es requerido'),
        ci: yup.string().required('El campo ci es requerido')
            .min(7, obj => showErrors('ci', obj.value.length, obj.min)),
        exp: yup.string().required('Seleccione la expedición del carnet'),
        post: yup.string().required('Seleccione algún cargo'),
        customPost: yup.string().when('post', {
            is: 'other',
            then: (schema) => schema.required('Especifique otro cargo, por favor'),
            otherwise: (schema) => schema.notRequired(),
        }),
        phone: yup
            .string()
            .matches(/^\d+$/, 'El celular debe contener solo números')
            .min(6, 'El celular debe tener al menos 6 dígitos')
            .required('El campo celular es requerido'),
        address: yup
            .string()
            .min(3, obj => showErrors('dirección', obj.value.length, obj.min))
            .required('El campo dirección es requerido'),
        password: mode === 'create'
            ? yup
                .string()
                .min(8, obj => showErrors('contraseña', obj.value.length, obj.min))
                .required('El campo contraseña es requerido')
            : yup
                .string()
                .transform(value => (value === '' ? undefined : value)) // elimina string vacío
                .min(8, 'El campo contraseña debe tener al menos 8 caracteres')
                .notRequired(),
        gender: yup.string().required('El campo sexo es obligatorio'),
        rol: yup.string().required('Debe seleccionar algun rol')

    })

    const dispatch = useDispatch<AppDispatch>()

    const {
        reset,
        control,
        watch,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })
    const selectedPost = watch('post');

    useEffect(() => {
        const fetchRol = async () => {
            try {
                const response = await instance.get('/roles');
                setRoles(response.data.result);
            } catch (e) {
                console.log(e)
            }

        }
        fetchRol();
    }, [toggle]);

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, mode])


    const onSubmit = async (data: UserType) => {
        try {
            const modifiedData = {
                ...data,
                post: data.post === 'other' ? data.customPost : data.post,
            };
            delete modifiedData.customPost;

            if (mode === 'edit' && defaultValues?._id) {
                if (data.email !== checkemail) {
                    const check = await instance.get(`/users/check-email/${data.email}`);
                    if (check.data) {
                        setError('email', {
                            type: 'manual',
                            message: 'Este correo ya está registrado'
                        });
                        return;
                    }
                }

                delete modifiedData._id;
                delete modifiedData.__v;

                await dispatch(updateUser({
                    data: modifiedData,
                    id: defaultValues._id,
                    filtrs: { skip: page * pageSize, limit: pageSize }
                }));
            }
            else {
                const check = await instance.get(`/users/check-email/${data.email}`);
                if (check.data) {
                    setError('email', {
                        type: 'manual',
                        message: 'Este correo ya está registrado'
                    });
                    return;
                }

                await dispatch(addUser({
                    data: modifiedData,
                    filtrs: { skip: page * pageSize, limit: pageSize }
                }));
            }
        } catch (error: any) {
            console.error('Error al guardar usuario:', error);
        }
        toggle();
        reset();
    };

    const handleOnclickCancel = () => {
        reset()
        toggle()
    }
    return (<Box>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <fieldset style={{ border: `1.5px solid ${theme.palette.primary.main}`, borderRadius: 10, paddingTop: 20 }}>
                <legend style={{ textAlign: 'center' }}><Typography variant='subtitle2'>Agregar Nuevo Usuario</Typography></legend>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="grade-select">Grado</InputLabel>
                            <Controller
                                name="grade"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        labelId="grade-select"
                                        id="select-grade"
                                        label="Grado"
                                        error={Boolean(errors.grade)}
                                    >
                                        <MenuItem value='CNL. MSc. CAD.'>
                                            CNL. MSc. CAD.
                                        </MenuItem>
                                        <MenuItem value='TTE.'>
                                            TTE.
                                        </MenuItem>
                                        <MenuItem value='SBTTE.'>
                                            SBTTE.
                                        </MenuItem>
                                        <MenuItem value='SOF. 2DO'>
                                            SOF. 2DO
                                        </MenuItem>
                                        <MenuItem value='SGTO. MY.'>
                                            SGTO. MY.
                                        </MenuItem>
                                        <MenuItem value='SGTO. 1RO.'>
                                            SGTO. 1RO.
                                        </MenuItem>
                                        <MenuItem value='SGTO. 2DO.'>
                                            SGTO. 2DO.
                                        </MenuItem>
                                        <MenuItem value='SGTO.'>
                                            SGTO.
                                        </MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.grade && <FormHelperText sx={{ color: 'error.main' }}>{errors.grade.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="paternalSurname"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Apellido Paterno'
                                        placeholder='Manzano'
                                        onChange={onChange}
                                        error={Boolean(errors.paternalSurname)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.paternalSurname && <FormHelperText sx={{ color: 'error.main' }}>{errors.paternalSurname.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="maternalSurname"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Apellido Materno'
                                        placeholder='Lopez'
                                        onChange={onChange}
                                        error={Boolean(errors.maternalSurname)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.maternalSurname && <FormHelperText sx={{ color: 'error.main' }}>{errors.maternalSurname.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="firstName"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='1er Nombre'
                                        placeholder='Jhon'
                                        onChange={onChange}
                                        error={Boolean(errors.firstName)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.firstName && <FormHelperText sx={{ color: 'error.main' }}>{errors.firstName.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="lastName"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='2do Nombre'
                                        placeholder='Doh'
                                        onChange={onChange}
                                        error={Boolean(errors.lastName)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.lastName && <FormHelperText sx={{ color: 'error.main' }}>{errors.lastName.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="gender-select">Género</InputLabel>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        labelId="gender-select"
                                        id="select-gender"
                                        label="Género"
                                        error={Boolean(errors.gender)}
                                    >
                                        <MenuItem value='M'>
                                            M
                                        </MenuItem>
                                        <MenuItem value='F'>
                                            F
                                        </MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.gender && <FormHelperText sx={{ color: 'error.main' }}>{errors.gender.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="ci"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Ci'
                                        placeholder='3456762-a'
                                        onChange={onChange}
                                        error={Boolean(errors.ci)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.ci && <FormHelperText sx={{ color: 'error.main' }}>{errors.ci.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="exp-select">Expedido</InputLabel>
                            <Controller
                                name="exp"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        labelId="exp-select"
                                        id="select-exp"
                                        label="Expedido"
                                        error={Boolean(errors.exp)}
                                    >
                                        <MenuItem value='PT'>
                                            PT
                                        </MenuItem>
                                        <MenuItem value='LP'>
                                            LP
                                        </MenuItem>
                                        <MenuItem value='CH'>
                                            CH
                                        </MenuItem>
                                        <MenuItem value='CB'>
                                            CB
                                        </MenuItem>
                                        <MenuItem value='OR'>
                                            OR
                                        </MenuItem>
                                        <MenuItem value='SR'>
                                            SR
                                        </MenuItem>
                                        <MenuItem value='BN'>
                                            BN
                                        </MenuItem>
                                        <MenuItem value='TO'>
                                            TO
                                        </MenuItem>
                                        <MenuItem value='PA'>
                                            PA
                                        </MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.exp && <FormHelperText sx={{ color: 'error.main' }}>{errors.exp.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="post-select">Cargo Actual</InputLabel>
                            <Controller
                                name="post"
                                control={control}
                                rules={{ required: 'Este campo es requerido' }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        labelId="post-select"
                                        id="select-post"
                                        label="Cargo Actual"
                                        error={Boolean(errors.post)}
                                    >
                                        <MenuItem value='COMANDANTE'>COMANDANTE</MenuItem>
                                        <MenuItem value='SUB COMANDANTE'>SUB COMANDANTE</MenuItem>
                                        <MenuItem value='OPERADOR'>OPERADOR</MenuItem>
                                        <MenuItem value='PATRULLERO'>PATRULLERO</MenuItem>
                                        <MenuItem value='CONDUCTOR'>CONDUCTOR</MenuItem>
                                        <MenuItem value='SECRETARIA'>SECRETARIA</MenuItem>
                                        <MenuItem value='MONITOREO DE CAMARAS'>MONITOREO DE CAMARAS</MenuItem>
                                        <MenuItem value='DESPACHADOR'>DESPACHADOR</MenuItem>
                                        <MenuItem value='RECEPCIONISTA'>RECEPCIONISTA</MenuItem>
                                        <MenuItem value='other'>OTRO</MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.post && <FormHelperText sx={{ color: 'error.main' }}>{errors.post.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    {selectedPost === 'other' && (
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="customPost"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Otro cargo'
                                            placeholder='Especificar cargo'
                                            onChange={onChange}
                                            error={Boolean(errors.customPost)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.customPost && <FormHelperText sx={{ color: 'error.main' }}>{errors.customPost.message}</FormHelperText>}
                            </FormControl>
                        </Grid>)}
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="phone"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Celular'
                                        placeholder='72381722'
                                        onChange={onChange}
                                        value={value}
                                        error={Boolean(errors.phone)}
                                    />
                                )}
                            />
                            {errors.phone && <FormHelperText sx={{ color: 'error.main' }}>{errors.phone.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="address"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Dirección'
                                        placeholder='Av. Las banderas'
                                        onChange={onChange}
                                        error={Boolean(errors.address)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.address && <FormHelperText sx={{ color: 'error.main' }}>{errors.address.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <Controller
                                name="email"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Correo electrónico'
                                        placeholder='example@gmail.com'
                                        onChange={onChange}
                                        error={Boolean(errors.email)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel htmlFor="outlined-adornment-password" >Contraseña</InputLabel>
                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <OutlinedInput
                                        id="outlined-adornment-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        error={Boolean(errors.password)}
                                        value={value}
                                        onChange={onChange}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowPassword((prevShow) => !prevShow)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <Icon icon='mdi:visibility-off' /> : <Icon icon='mdi:visibility' />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        label="Contraseña"
                                    />
                                )}
                            />

                            {errors.password && <FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="role-select">Rol</InputLabel>
                            <Controller
                                name="rol"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        labelId="role-select"
                                        id="select-role"
                                        label="Rol"
                                        error={Boolean(errors.rol)}
                                    >
                                        {roles.map((value) => (<MenuItem
                                            value={value._id}
                                            key={value._id}
                                        >{value.name}</MenuItem>))}
                                    </Select>
                                )} />
                            {errors.rol && <FormHelperText sx={{ color: 'error.main' }}>{errors.rol.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button size='large' variant='contained' color='error' onClick={handleOnclickCancel} startIcon={<Icon icon='mdi:cancel-circle' />}>
                        Cancelar
                    </Button>
                    <Button size='large' type='submit' variant='contained' sx={{ mr: 3 }} startIcon={<Icon icon='mdi:content-save' />}>
                        Guardar
                    </Button>
                </Box>
            </fieldset>
        </form>
    </Box>)
}
export default AddUser;