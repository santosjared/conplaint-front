import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Switch, FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Icon from 'src/@core/components/icon';
import LoadingButton from '@mui/lab/LoadingButton';
import Swal from 'sweetalert2';
import { instance } from 'src/configs/axios';
import { Actions, Permission, Rol, Subjects } from 'src/context/types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { fetchData } from 'src/store/role';

// Styled Dialog
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

// Styled iOS switch
const IOSSwitch = styled((props: any) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
                opacity: 1,
                border: 0,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 13,
        backgroundColor: '#E9E9EA',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

// Acciones posibles
const ACTIONS: Actions[] = ['read', 'create', 'update', 'delete'];

// Lista base de permisos posibles
const permissions: Permission[] = [
    { subject: 'home', action: ['read'] },
    { subject: 'usuarios', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'roles', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'denuncias', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'recibidos', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'asignados', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'atender', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'turnos', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'vehiculos', action: ['read', 'create', 'update', 'delete'] },
];

interface Props {
    open: boolean;
    toggle: () => void;
    rol: Rol;
    page: number
    pageSize: number
}

const Permissions = ({ open, toggle, rol, page, pageSize }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [per, setPer] = useState<Permission[]>([]);
    const [allActive, setAllActive] = useState<boolean>(false);

    useEffect(() => {
        setPer(rol.permissions)
    }, [rol])

    const isActionEnabled = useCallback((action: Actions, subject: Subjects): boolean => {
        const permission = per.find(p => p.subject === subject);
        return permission?.action.includes(action) || false;
    }, [per]);

    const dispatch = useDispatch<AppDispatch>()
    const handleToggle = (action: Actions, subject: Subjects) => {
        setPer(prev => {
            const idx = prev.findIndex(p => p.subject === subject);
            if (idx !== -1) {
                const subjectPerm = prev[idx];
                const newActions = subjectPerm.action.includes(action)
                    ? subjectPerm.action.filter(a => a !== action)
                    : [...subjectPerm.action, action];

                const updated = [...prev];
                updated[idx] = { subject, action: newActions };
                return updated;
            } else {
                return [...prev, { subject, action: [action] }];
            }
        });
        setAllActive(false);
    };

    const allCheck = () => {
        if (allActive) {
            setPer([]);
        } else {
            const allPermissions: Permission[] = permissions.map(p => ({
                subject: p.subject,
                action: [...p.action]
            }));
            setPer(allPermissions);
        }
        setAllActive(!allActive);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await instance.put(`/roles/asigne-permissions/${rol._id}`, { permissions: per });

            dispatch(fetchData({ filter: '', skip: page * pageSize, limit: pageSize }))
            Swal.fire({
                title: '¡Éxito!',
                text: `Permisos asignados exitosamente al rol ${rol.name}`,
                icon: "success"
            });
        } catch (e) {
            console.log(e);
            Swal.fire({
                title: '¡Error!',
                text: `Se produjo un error al asignar permisos al rol ${rol.name}. Contacta al desarrollador.`,
                icon: "error"
            });
        }
        setLoading(false);
        toggle();
    };

    const handleCancel = () => {
        toggle();
    };

    return (
        <BootstrapDialog
            onClose={toggle}
            open={open}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Asignar permisos al rol {rol.name}
            </DialogTitle>

            <IconButton
                aria-label="close"
                onClick={toggle}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main
                })}
            >
                <Icon icon='mdi:close' fontSize={10} />
            </IconButton>

            <DialogContent dividers>
                <Box sx={{ display: 'flex', ml: 6, mb: 3 }}>
                    <Typography variant='h5' sx={{ mr: 3 }}>Todos</Typography>
                    <IOSSwitch checked={allActive} onChange={allCheck} />
                </Box>

                <TableContainer component={Paper} sx={{ p: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Módulo</Typography></TableCell>
                                {ACTIONS.map(action => (
                                    <TableCell key={action} align="center">
                                        <Typography sx={{ fontWeight: 'bold', fontSize: 15, textTransform: 'capitalize' }}>
                                            {action}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {permissions.map((permission) => (
                                <TableRow key={permission.subject}>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{permission.subject}</TableCell>
                                    {ACTIONS.map(action => (
                                        <TableCell key={`${permission.subject}-${action}`} align="center">
                                            {permission.action.includes(action) ? (
                                                <FormControlLabel
                                                    control={
                                                        <IOSSwitch
                                                            checked={allActive ? true : isActionEnabled(action, permission.subject)}
                                                            onChange={() => handleToggle(action, permission.subject)}
                                                        />
                                                    }
                                                    label={null}
                                                />
                                            ) : null}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <DialogActions>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        p: 5
                    }}
                >
                    <Button
                        size='large'
                        disabled={loading}
                        variant='outlined'
                        color='secondary'
                        onClick={handleCancel}
                        startIcon={<Icon icon='mdi:cancel-circle' />}
                    >
                        Cancelar
                    </Button>

                    {loading ? (
                        <LoadingButton
                            color="secondary"
                            loading={loading}
                            loadingPosition="start"
                            startIcon={<Icon icon='mdi:content-save' />}
                            variant="contained"
                        >
                            <span>Guardando...</span>
                        </LoadingButton>
                    ) : (
                        <Button
                            size='large'
                            onClick={handleSave}
                            variant='contained'
                            startIcon={<Icon icon='mdi:content-save' />}
                        >
                            Guardar
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </BootstrapDialog>
    );
};

export default Permissions;
