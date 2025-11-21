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
import { PostType, RolType, UserType } from "src/types/types";
import { addUser, updateUser } from "src/store/user";

interface GradeType {
    name: string;
    _id: string;
}

interface Props {
    toggle: () => void;
    page: number;
    pageSize: number;
    mode?: 'create' | 'edit';
    defaultValues?: UserType;
}


const AddUser = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {

    const [showPassword, setShowPassword] = useState(false)
    const [roles, setRoles] = useState<RolType[]>([])
    const [grades, setGrades] = useState<GradeType[]>([])
    const [posts, setPosts] = useState<PostType[]>([])

    const checkemail = defaultValues?.email

    const theme = useTheme()

    const schema = yup.object().shape({
        grade: yup.object({
            _id: yup.string().required('El campo grado es requerido'),
            name: yup.string()
                .min(2, 'El campo grado debe tener al menos 2 caracteres')
                .max(50, 'El campo grado no debe exceder más de 50 caracteres')
                .required('El campo grado es requerido'),
        }).required('El campo grado es requerido')
            .nullable(),

        paternalSurname: yup.string()
            .transform(value => (value === '' ? undefined : value))
            .min(3, 'El campo apellido paterno debe tener al menos 3 caracteres')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo apellido paterno solo debe contener letras')
            .max(50, 'El campo apellido paterno no debe exceder más de 50 caracteres')
            .notRequired(),

        maternalSurname: yup.string()
            .transform(value => (value === '' ? undefined : value))
            .min(3, 'El campo apellido materno debe tener al menos 3 caracteres')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo apellido materno solo debe contener letras')
            .max(50, 'El campo apellido materno no debe exceder más de 50 caracteres')
            .notRequired(),

        firstName: yup.string()
            .required('El campo 1er. nombre es requerido')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo 1er. nombre solo debe contener letras')
            .min(3, 'El campo 1er. nombre debe tener al menos 3 caracteres')
            .max(50, 'El campo 1er. nombre no debe exceder más de 50 caracteres'),

        lastName: yup.string()
            .transform(value => (value === '' ? undefined : value))
            .min(3, 'El campo 2do. nombre debe tener al menos 3 caracteres')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo 2do. nombre solo debe contener letras')
            .max(50, 'El campo 2do. nombre no debe exceder más de 50 caracteres')
            .notRequired(),

        email: yup.string()
            .email('Debe ingresar un correo electrónico válido')
            .min(5, 'El correo electrónico debe tener al menos 5 caracteres')
            .max(100, 'El correo electrónico no debe exceder más de 100 caracteres')
            .required('El campo correo electrónico es requerido'),

        ci: yup.string()
            .required('El campo ci es requerido')
            .min(7, 'El campo ci debe tener al menos 7 caracteres')
            .max(10, 'El campo ci no debe exceder más de 10 caracteres'),

        exp: yup.string()
            .required('Seleccione la expedición del carnet')
            .min(2, 'La expedición del ci debe tener al menos 2 caracteres')
            .max(10, 'La expedición del ci no debe exceder más de 10 caracteres'),

        post: yup.object({
            _id: yup.string().required('El campo cargo es requerido'),
            name: yup.string()
                .min(2, 'El campo cargo debe tener al menos 2 caracteres')
                .max(50, 'El campo cargo no debe exceder más de 50 caracteres')
                .required('El campo cargo es requerido'),
        }).required('El campo cargo es requerido')
            .nullable(),

        customPost: yup.string().when('post', {
            is: 'other',
            then: schema => schema
                .required('Especifique otro cargo, por favor')
                .min(3, 'El campo otro cargo debe tener al menos 3 caracteres')
                .max(50, 'El campo otro cargo no debe exceder más de 50 caracteres'),
            otherwise: schema => schema.notRequired(),
        }),

        phone: yup.string()
            .matches(/^\d+$/, 'El celular debe contener solo números')
            .min(6, 'El celular debe tener al menos 6 dígitos')
            .max(15, 'El celular no debe exceder más de 15 dígitos')
            .required('El campo celular es requerido'),

        address: yup.string()
            .min(3, 'El campo dirección debe tener al menos 3 caracteres')
            .max(100, 'El campo dirección no debe exceder más de 100 caracteres')
            .required('El campo dirección es requerido'),

        password: mode === 'create'
            ? yup.string()
                .min(8, 'El campo contraseña debe tener al menos 8 caracteres')
                .max(32, 'El campo contraseña no debe exceder más de 32 caracteres')
                .required('El campo contraseña es requerido')
            : yup.string()
                .transform(value => (value === '' ? undefined : value))
                .min(8, 'El campo contraseña debe tener al menos 8 caracteres')
                .max(32, 'El campo contraseña no debe exceder más de 32 caracteres')
                .notRequired(),

        gender: yup.string()
            .required('El campo sexo es obligatorio')
            .min(1, 'El campo sexo debe tener al menos 1 carácter')
            .max(10, 'El campo sexo no debe exceder más de 10 caracteres'),

        rol: yup.object({
            _id: yup.string().required('El campo rol es requerido'),
            name: yup.string()
                .min(2, 'El campo rol debe tener al menos 2 caracteres')
                .max(50, 'El campo rol no debe exceder más de 50 caracteres')
                .required('El campo rol es requerido'),
        }).required('El campo rol es requerido')
            .nullable(),

        otherGrade: yup.string().when('grade', {
            is: (val: GradeType | null) => val?.name === 'Otro',
            then: schema => schema
                .required('Debe especificar otro tipo de grado')
                .min(3, 'El campo otro grado debe tener al menos 3 caracteres')
                .max(50, 'El campo otro grado no debe exceder más de 50 caracteres'),
            otherwise: schema => schema.notRequired()
        }),

        otherPost: yup.string().when('post', {
            is: (val: PostType | null) => val?.name === 'Otro',
            then: schema => schema
                .required('Debe especificar otro tipo de cargo')
                .min(3, 'El campo otro cargo debe tener al menos 3 caracteres')
                .max(50, 'El campo otro cargo no debe exceder más de 50 caracteres'),
            otherwise: schema => schema.notRequired()
        }),
    });

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
    const otherGrade = watch('grade');

    useEffect(() => {
        const fetchRol = async () => {
            try {
                const response = await instance.get('/users/roles');
                setRoles(response.data || []);
            } catch (e) {
                console.log(e)
            }

        }
        fetchRol();
    }, [mode, defaultValues, toggle]);

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

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await instance.get('/users/posts');
                setPosts([...response.data, { name: 'Otro', _id: 'other' }]);
            } catch (e) {
                console.log(e)
            }
        }
        fetchPosts();
    }, [mode, defaultValues, toggle]);

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, mode])

    const onSubmit = async (data: UserType) => {
        try {
            const modifiedData = {
                ...data,
                post: data.post?._id || '',
                grade: data.grade?._id || '',
                rol: data.rol?._id || ''
            };

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

                await dispatch(updateUser({
                    data: modifiedData,
                    id: defaultValues._id,
                    filters: { skip: page * pageSize, limit: pageSize }
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
                    filters: { skip: page * pageSize, limit: pageSize }
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
                <legend style={{ textAlign: 'center' }}><Typography variant='subtitle2'>{mode === 'create' ? 'Agregar usuario' : 'Editar Usuario'}</Typography></legend>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="grade-select">Grado</InputLabel>
                            <Controller
                                name="grade"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        labelId="grade-select"
                                        id="select-grade"
                                        label="Grado"
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
                                        <MenuItem value='Masculino'>
                                            Masculino
                                        </MenuItem>
                                        <MenuItem value='Femenino'>
                                            Femenino
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
                                            CBBA
                                        </MenuItem>
                                        <MenuItem value='OR'>
                                            OR
                                        </MenuItem>
                                        <MenuItem value='SR'>
                                            SCZ
                                        </MenuItem>
                                        <MenuItem value='BN'>
                                            BE
                                        </MenuItem>
                                        <MenuItem value='TO'>
                                            TJA
                                        </MenuItem>
                                        <MenuItem value='PA'>
                                            PD
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
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        labelId="post-select"
                                        id="select-post"
                                        label="Cargo Actual"
                                        error={Boolean(errors.post)}
                                        value={value?._id ?? ''}
                                        onChange={(e) => {
                                            const selectedId = e.target.value as string
                                            const selectedPost = posts.find((post) => post._id === selectedId) || null
                                            onChange(selectedPost)
                                        }}
                                    >
                                        {posts.map((value) => (<MenuItem
                                            value={value._id || ''}
                                            key={value._id}
                                        >{value.name}</MenuItem>))}
                                    </Select>
                                )}
                            />
                            {errors.post && <FormHelperText sx={{ color: 'error.main' }}>{errors.post.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    {selectedPost?.name === 'Otro' && (
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="otherPost"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Otro cargo'
                                            placeholder='Especificar cargo'
                                            onChange={(e) => onChange(e.target.value.toUpperCase())}
                                            error={Boolean(errors.otherPost)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.otherPost && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherPost.message}</FormHelperText>}
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
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        labelId="role-select"
                                        id="select-role"
                                        label="Rol"
                                        error={Boolean(errors.rol)}
                                        value={value?._id ?? ''}
                                        onChange={(e) => {
                                            const selectedId = e.target.value as string
                                            const selectedRol = roles.find((rol) => rol._id === selectedId) || null
                                            onChange(selectedRol)
                                        }}
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