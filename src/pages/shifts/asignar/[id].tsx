import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Typography,
    Button,
    useTheme,
    IconButton,
    Divider,
    CircularProgress,
} from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { instance } from "src/configs/axios";
import { UserType } from "src/types/types";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Icon from "src/@core/components/icon";
import AddPersonal from "./AddPersonal";
import AddServices from "./AddServices";
import EditServices from "./EditService";
import EditCargo from "./EditCargo";
import { useDispatch } from "react-redux";
import { AppDispatch } from "src/store";
import { updateShit } from "src/store/shits";

interface User {
    cargo?: string
    user: UserType
}

interface ZoneType {
    _id?: string
    name: string
}

interface Services {
    _id?: string
    name: string;
}

interface UserService {
    services: Services,
    zone: ZoneType,
    otherService: string,
    otherZone: string
    users: User[]
}

interface HourRange {
    name: string;
    hrs_i: string;
    hrs_s: string;
    services: UserService[];
}

interface ShiftsType {
    _id?: string;
    __v?: string;
    createdAt?: string
    updatedAt?: string
    date: string;
    supervisor: UserType | null;
    hrs: HourRange[];
}

const defaultValues: ShiftsType = {
    date: "",
    supervisor: null,
    hrs: [],
};

const Asignar = () => {

    const router = useRouter();
    const { id } = router.query;

    const [shift, setShift] = useState<ShiftsType>(defaultValues);
    const [openAddPersonal, setOpenAddPersonal] = useState<boolean>(false);
    const [openAddService, setOpenAddService] = useState<boolean>(false);
    const [openEditService, setOpenEditService] = useState<boolean>(false);
    const [openEditcargo, setOpenEditcargo] = useState<boolean>(false);
    const [indexHr, setIndexHr] = useState<number>(0);
    const [indexService, setIndexService] = useState<number>(0);
    const [indexUser, setIndexUser] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)

    const theme = useTheme()

    const toggleAddPersonal = () => setOpenAddPersonal(!openAddPersonal);
    const toggleAddService = () => setOpenAddService(!openAddService);
    const toggleEditService = () => setOpenEditService(!openEditService);
    const toggleEditCargo = () => setOpenEditcargo(!openEditcargo)

    useEffect(() => {
        if (id) {
            const fetchShift = async () => {
                try {
                    const response = await instance.get(`/shits/${id}`);
                    const data = response.data;
                    setShift(data);
                } catch (error) {
                    console.error("Error fetching shift:", error);
                }
            };
            fetchShift();
        }
    }, [id]);

    const dispatch = useDispatch<AppDispatch>()

    const handleAddService = (indexHr: number) => {
        setIndexHr(indexHr);
        toggleAddService();
    }
    const handleAddPersonalAutomatic = (indexHr: number, indexService: number) => {
        setIndexHr(indexHr);
        setIndexService(indexService);
        toggleAddPersonal();
    }
    const handleEditService = (indexHr: number, indexService: number) => {
        setIndexHr(indexHr);
        setIndexService(indexService);
        toggleEditService();
    }

    const handleDeleteService = (indexHr: number, indexService: number) => {
        const updatedHrs = [...(shift.hrs || [])];
        const updatedServices = [...(updatedHrs[indexHr].services || [])];

        updatedServices.splice(indexService, 1);

        updatedHrs[indexHr] = {
            ...updatedHrs[indexHr],
            services: updatedServices
        };

        setShift({ ...shift, hrs: updatedHrs });
    }

    const handleEditCargo = (indexHr: number, indexService: number, indexUser: number) => {
        setIndexHr(indexHr);
        setIndexService(indexService);
        setIndexUser(indexUser)
        toggleEditCargo();
    }

    const handleSave = async () => {
        setLoading(true);
        const cleanedShift = {
            ...shift,
            supervisor: shift?.supervisor?._id || null,
            hrs: shift.hrs?.map(hour => ({
                ...hour,
                services: hour?.services?.map(service => ({
                    ...service,
                    services: service?.services?._id ? service.services._id : null,
                    zone: service?.zone?._id ? service.zone._id : null,
                    users: service?.users?.map(user => ({
                        user: user?.user?._id,
                        cargo: user?.cargo || ''
                    }))
                }))
            }))
        };

        delete cleanedShift._id

        try {
            await dispatch(updateShit({ data: cleanedShift, id: shift._id }));
            router.push('/shifts');
        } catch (error) {
            console.error('Error al guardar el turno:', error);
        } finally {
            setLoading(false);
        }
    };


    const [año, mes, día] = shift?.date?.split("-") || ["", "", ""];

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>

                {loading ?
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                    :
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
                                {shift?.hrs?.map((hourRange, indexHrs) => (
                                    <Card variant="outlined" elevation={0} key={indexHrs} sx={{ mb: 4 }}>
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
                                            {hourRange?.services?.map((service, indexService) => {
                                                return (
                                                    <Grid container spacing={2} sx={{ mt: 2 }} key={indexService}>
                                                        <Grid item xs={service?.zone?.name ? 5 : 11}>
                                                            <Typography variant="subtitle1">
                                                                {service?.otherService || service?.services?.name || "No definido"}
                                                            </Typography>
                                                        </Grid>
                                                        {service?.zone?.name &&
                                                            <Grid item xs={6}>
                                                                <Typography variant="subtitle1">
                                                                    {service?.otherZone || service?.zone?.name}
                                                                </Typography>
                                                            </Grid>
                                                        }
                                                        <Grid item xs={1}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                <IconButton size='small' onClick={() => handleEditService(indexHrs, indexService)}>
                                                                    <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                                                                </IconButton>
                                                                <IconButton size='small' onClick={() => handleDeleteService(indexHrs, indexService)}>
                                                                    <Icon icon='ic:outline-delete' fontSize={20} color={theme.palette.error.main} />
                                                                </IconButton>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            {service?.users?.map((user, idx) => (
                                                                <Grid container spacing={1} key={idx}>
                                                                    {service?.zone?.name && <Grid item xs={0.4}>
                                                                        <IconButton size='small' onClick={() => handleEditCargo(indexHrs, indexService, idx)}>
                                                                            <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                                                                        </IconButton>
                                                                    </Grid>}
                                                                    {service?.zone?.name && <Grid item xs={4.5}>
                                                                        <Typography variant="subtitle2">
                                                                            {user?.cargo ? user?.cargo : user?.user?.post || "Sin cargo"}
                                                                        </Typography>
                                                                    </Grid>}
                                                                    <Grid item xs={service?.zone?.name ? 5 : 11}>
                                                                        <Typography variant="subtitle2">
                                                                            {user?.user?.grade || ''} {user?.user?.firstName || "Sin nombre"} {user?.user?.lastName || ''} {user?.user?.paternalSurname || ''} {user?.user?.maternalSurname || ''}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                <Button
                                                                    variant='contained'
                                                                    color='primary'
                                                                    startIcon={<Icon icon='mdi:add-circle' />}
                                                                    onClick={() => handleAddPersonalAutomatic(indexHrs, indexService)}
                                                                >
                                                                    Agregar personal
                                                                </Button>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>

                                                )
                                            })}
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                                <Button
                                                    onClick={() => handleAddService(indexHrs)}
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
                                    variant='contained'
                                    color='primary'
                                    onClick={handleSave}
                                    startIcon={<Icon icon='mdi:content-save' />}
                                >
                                    Guardar
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>}
            </Grid>
            <AddPersonal open={openAddPersonal} toggle={toggleAddPersonal} shift={shift} setShift={setShift} indexHr={indexHr} indexService={indexService} />
            <AddServices open={openAddService} toggle={toggleAddService} shift={shift} setShift={setShift} indexHr={indexHr} />
            <EditServices open={openEditService} toggle={toggleEditService} shift={shift} setShift={setShift} indexHr={indexHr} indexService={indexService} />
            <EditCargo open={openEditcargo} toggle={toggleEditCargo} shift={shift} setShift={setShift} indexHr={indexHr} indexService={indexService} indexUser={indexUser} />
        </Grid>
    );
};


export default Asignar;
