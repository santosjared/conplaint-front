import {
    Box,
    Card,
    CardContent,
    CardHeader,
    FormControl,
    Grid,
    TextField,
    Typography,
    Autocomplete,
    Button,
    IconButton,
    useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { instance } from "src/configs/axios";
import { UserType } from "src/types/types";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Icon from "src/@core/components/icon";

// Types
interface HourRange {
    name: string;
    hrs_i: string;
    hrs_s: string;
}

interface ShiftsType {
    _id?: string;
    date: string;
    supervisor: UserType | null;
    hrs: HourRange[];
}

interface AsignedItem {
    servicios: string;
    otros: string;
    user: UserType | null;
}

interface FormValues {
    asigned: AsignedItem[];
}

// Validation Schema
const schema = yup.object().shape({
    asigned: yup.array().of(
        yup.object().shape({
            servicios: yup.string().required("Campo requerido"),
            otros: yup.string().required("Campo requerido"),
            user: yup.object().required("Usuario requerido"),
        })
    ),
});

const Asignar = () => {

    const router = useRouter();
    const { id } = router.query;

    const [shift, setShift] = useState<ShiftsType | null>(null);
    const [users, setUsers] = useState<UserType[]>([]);

    const theme = useTheme();

    // Form setup
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            asigned: [],
        },
    });

    const asigned = watch("asigned");

    const { fields, append, remove } = useFieldArray({
        control,
        name: "asigned",
    })

    // Fetch shift data
    useEffect(() => {
        if (id) {
            const fetchShift = async () => {
                try {
                    const response = await instance.get(`/shits/${id}`);
                    const data = response.data;
                    setShift(data);
                    const initialAsigned = {
                        servicios: "",
                        otros: "",
                        user: null,
                    };
                    reset({ asigned: [initialAsigned] });
                } catch (error) {
                    console.error("Error fetching shift:", error);
                }
            };
            fetchShift();
        }
    }, [id, reset]);

    // Fetch available users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await instance.get(`/shits/users-available`);
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    // Submit handler
    const onSubmit = async (data: FormValues) => {
        try {
            const payload = {
                shiftId: shift?._id,
                assignments: data.asigned,
            };
            console.log("Payload to submit:", payload);

            await instance.post("/shits/asignar", payload);
            alert("Asignación exitosa");
            router.push("/turnos"); // O ruta correspondiente
        } catch (error) {
            console.error("Error al enviar:", error);
            alert("Error al asignar usuarios.");
        }
    };

    const [año, mes, día] = shift?.date?.split("-") || ["", "", ""];

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Card>
                        <CardHeader
                            title={`Asignar personal al turno de la fecha ${día}/${mes}/${año}`}
                        />
                        <CardContent>
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" gutterBottom>
                                    Supervisor:{" "}
                                    {shift?.supervisor
                                        ? `${shift.supervisor.grade} ${shift.supervisor.firstName} ${shift.supervisor.lastName || ""} ${shift.supervisor.paternalSurname || ""} ${shift.supervisor.maternalSurname || ""}`
                                        : "No asignado"}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                {shift?.hrs.map((hourRange, index) => (
                                    <Card variant="outlined" elevation={0} key={index} sx={{ mb: 4 }}>
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Typography variant="h6" gutterBottom>
                                                    {hourRange.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {hourRange.hrs_i} - {hourRange.hrs_s}
                                                </Typography>
                                            </Box>
                                            {fields.map((field, index) => {
                                                const userSelected = asigned[index]?.user;
                                                return (
                                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                                        <Grid item xs={5.5}>
                                                            <FormControl fullWidth>
                                                                <Controller
                                                                    name={`asigned.${index}.servicios`}
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <TextField
                                                                            {...field}
                                                                            label={`Servicio ${index + 1}`}
                                                                            placeholder="Vehículo de servicio"
                                                                            value={field.value}
                                                                            onChange={(e) =>
                                                                                field.onChange(e.target.value.toUpperCase())
                                                                            }
                                                                            error={
                                                                                !!errors.asigned?.[index]?.servicios
                                                                            }
                                                                            helperText={
                                                                                errors.asigned?.[index]?.servicios
                                                                                    ?.message
                                                                            }
                                                                        />
                                                                    )}
                                                                />
                                                            </FormControl>
                                                        </Grid>

                                                        <Grid item xs={5.5}>
                                                            <FormControl fullWidth>
                                                                <Controller
                                                                    name={`asigned.${index}.otros`}
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <TextField
                                                                            {...field}
                                                                            label={`Otro ${index + 1}`}
                                                                            placeholder="Zona alta n-8"
                                                                            value={field.value}
                                                                            onChange={(e) =>
                                                                                field.onChange(e.target.value.toUpperCase())
                                                                            }
                                                                            error={!!errors.asigned?.[index]?.otros}
                                                                            helperText={
                                                                                errors.asigned?.[index]?.otros?.message
                                                                            }
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

                                                        <Grid item xs={5.5}>
                                                            <Typography variant="subtitle2">
                                                                {userSelected?.post || "Sin cargo"}
                                                            </Typography>
                                                        </Grid>

                                                        <Grid item xs={5.5}>
                                                            <FormControl fullWidth>
                                                                <Controller
                                                                    name={`asigned.${index}.user`}
                                                                    control={control}
                                                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                                        <Autocomplete
                                                                            disablePortal
                                                                            options={users}
                                                                            getOptionLabel={(option: UserType) =>
                                                                                `${option.firstName} ${option.paternalSurname || ""} ${option.maternalSurname || ""}`.trim()
                                                                            }
                                                                            value={value || null}
                                                                            isOptionEqualToValue={(opt, val) =>
                                                                                opt._id === val?._id
                                                                            }
                                                                            onChange={(_, newValue) => onChange(newValue)}
                                                                            renderInput={(params) => (
                                                                                <TextField
                                                                                    {...params}
                                                                                    label="Usuario"
                                                                                    error={!!error}
                                                                                    helperText={error?.message}
                                                                                />
                                                                            )}
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
                                                    </Grid>

                                                )
                                            })}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                                <Button
                                                    variant='contained'
                                                    color='primary'
                                                    startIcon={<Icon icon='mdi:add-circle' />}
                                                    onClick={() => router.push('/shifts')}
                                                >
                                                    Agregar personal
                                                </Button>
                                                <Button
                                                    type='submit'
                                                    variant='contained'
                                                    color='primary'
                                                    startIcon={<Icon icon='mdi:add-circle' />}
                                                >
                                                    Agregar servicios
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                                }
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    variant='contained'
                                    color='error'
                                    startIcon={<Icon icon='mdi:cancel-circle' />}
                                    onClick={() => router.push('/shifts')}
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
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </form>
    );
};

export default Asignar;
