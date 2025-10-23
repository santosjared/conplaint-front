import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { forwardRef, Fragment, useEffect, useState } from "react";
import Icon from "src/@core/components/icon";
import Fade, { FadeProps } from '@mui/material/Fade'
import { ReactElement, Ref } from "react";
import { PostType, UserType } from "src/types/types";
import { instance } from "src/configs/axios";

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

interface GradeType {
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
    date: string;
    supervisor: string;
    hrs: HourRange[];
}

interface Props {
    open: boolean;
    toggle: () => void;
    shift: ShiftsType
    setShift: (data: ShiftsType) => void;
    indexHr: number;
    indexService: number;
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Fade ref={ref} {...props} />
})

const AddPersonal = ({ open, toggle, shift, setShift, indexHr, indexService }: Props) => {

    const [field, setField] = useState<string>('');
    const [cargo, setCargo] = useState<string>('');
    const [userAvailable, setUserAvailable] = useState<UserType[]>([]);
    const [users, setUsers] = useState<UserType[]>([])
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [posts, setPosts] = useState<PostType[]>([])

    const hrs = shift?.hrs?.[indexHr] || [];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await instance.get(`/shits/users-available`);
                const data: UserType[] = response.data || [];

                const allAssignedUserIds = hrs.services
                    ?.flatMap(service => service.users?.map(user => user?.user?._id)) || [];

                const currentServiceUserIds = hrs.services?.[indexService]?.users?.map(user => user?.user?._id) || [];

                const users = data.filter(user =>
                    currentServiceUserIds.includes(user._id) || !allAssignedUserIds.includes(user._id)
                );
                setUserAvailable(users);
                setUsers(users)
                setSelectedUsers(currentServiceUserIds as string[]);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [hrs, open, indexService, toggle]);


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await instance.get('/users/posts');
                setPosts([...response.data, { name: 'TODOS', _id: '' }]);
            } catch (e) {
                console.log(e)
            }
        }
        fetchPosts();
    }, [hrs, open, indexService, toggle]);



    const handleFilter = (field: string, cargo: string) => {
        const serviceUsers = hrs?.services?.[indexService]?.users || [];

        return userAvailable.filter(user => {
            const fullName = `${user.grade} ${user.firstName} ${user.lastName || ''} ${user.paternalSurname || ''} ${user.maternalSurname || ''}`.toLowerCase();
            const matchesField = fullName.includes(field.toLowerCase());
            const matchesCargo = cargo ? user.post?._id === cargo : true;
            const isAlreadyAssigned = serviceUsers.some(u => u.user._id === user._id);

            return matchesField && matchesCargo && !isAlreadyAssigned;
        });
    }

    const handleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAssignUsers = () => {
        const updatedShift = { ...shift };
        const usersToAssign = userAvailable.filter(user => selectedUsers.includes(user._id || ''));

        updatedShift.hrs[indexHr].services[indexService].users = usersToAssign.map(user => ({
            user,
        }));

        setShift(updatedShift);
        setSelectedUsers([]);
        toggle();
    }



    const handlecancel = () => {
        setSelectedUsers([]);
        toggle();
    };

    return (
        <Dialog
            fullWidth
            open={open}
            maxWidth='sm'
            scroll='body'
            onClose={toggle}
            TransitionComponent={Transition}
        >
            <DialogContent sx={{ pb: 6, px: { xs: 8, sm: 15 }, pt: { xs: 8, sm: 12.5 }, position: 'relative' }}>
                <IconButton size='small' onClick={toggle} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
                    <Icon icon='mdi:close' />
                </IconButton>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
                        Agregar personal al servicio {hrs?.services?.[indexService]?.otherService
                            || hrs?.services?.[indexService]?.services.name || 'No definido'} - {hrs?.services?.[indexService]?.otherZone
                                || hrs?.services?.[indexService]?.zone.name || ''}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={8}>
                            <FormControl fullWidth>
                                <TextField
                                    fullWidth
                                    name='search'
                                    value={field}
                                    autoComplete='off'
                                    label='Buscar personal'
                                    onChange={e => { setField(e.target.value); setUsers(handleFilter(e.target.value, cargo)); }}
                                    placeholder='John Doe'
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="post-select">Cargo</InputLabel>
                                <Select
                                    labelId="post-select"
                                    id="select-post"
                                    value={cargo}
                                    label="Cargo"
                                    onChange={e => {
                                        setCargo(e.target.value);
                                        setUsers(handleFilter(field, e.target.value));
                                    }}
                                >
                                    {posts.map((value) => (
                                        <MenuItem
                                            value={value._id || ''}
                                            key={value._id}
                                        >
                                            {value.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>

                {users.map((user, index) => (
                    <Grid container key={index} spacing={2} alignItems="center">
                        <Grid item xs={1}>
                            <Checkbox
                                checked={selectedUsers.includes(user._id || '')}
                                onChange={() => handleSelectUser(user._id || '')}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1">{user.post?.name}</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Typography variant="body1">
                                {user.grade?.name} {user.firstName} {user.lastName || ''} {user.paternalSurname || ''} {user.maternalSurname || ''}
                            </Typography>
                        </Grid>
                    </Grid>
                ))}
            </DialogContent>
            <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'center' }}>
                <Button variant='contained' color='error' sx={{ mr: 2 }} onClick={handlecancel}>
                    Cancelar
                </Button>
                <Button variant='contained' onClick={handleAssignUsers}>
                    Asignar
                </Button>
            </DialogActions>
        </Dialog>
    )
};

export default AddPersonal;