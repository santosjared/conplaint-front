import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, FormControlLabel,
    Checkbox
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

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface Props {
    open: boolean;
    toggle: () => void;
    rol: Rol;
    page: number
    pageSize: number
}

const permissions: Permission[] = [
    { subject: 'dashboard', action: ['read'] },
    { subject: 'users', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'roles', action: ['read', 'create', 'update', 'delete', 'permissions'] },
    { subject: 'shifts', action: ['read', 'create', 'update', 'delete', 'personal', 'print'] },
    { subject: 'vehicles', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'complaints', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'recibidos', action: ['read', 'acepted', 'refused'] },
    { subject: 'asignes', action: ['confirmed', 'print', 'read'] },
    { subject: 'atender', action: ['read', 'create', 'update', 'delete'] },
];

const Permissions = ({ open, toggle, rol, page, pageSize }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [per, setPer] = useState<Permission[]>([]);
    const [allSelect, setAllSelect] = useState<boolean>(false);

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
        setAllSelect(false);
    };

    const handleAllSelect = () => {
        if (!allSelect) {
            setPer(permissions)
        } else {
            setPer([])
        }
        setAllSelect(!allSelect)
    }

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
            maxWidth="lg"
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
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <FormControlLabel
                        label={<Typography variant='h5'>Seleccionar Todos</Typography>}
                        control={<Checkbox checked={allSelect} onChange={handleAllSelect} />}
                    />

                </Box>

                <TableContainer component={Paper} sx={{ p: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Módulos</Typography></TableCell>
                                <TableCell colSpan={6} align='center'><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Permisos</Typography></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Dashboard</Typography></TableCell>
                                <TableCell colSpan={6}>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'dashboard')}
                                            onChange={() => handleToggle('read', 'dashboard')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>

                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de Usuarios</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'users')}
                                            onChange={() => handleToggle('read', 'users')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'users')}
                                            onChange={() => handleToggle('create', 'users')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'users')}
                                            onChange={() => handleToggle('update', 'users')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={3}>
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'users')}
                                            onChange={() => handleToggle('delete', 'users')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de Roles y Permisos</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'roles')}
                                            onChange={() => handleToggle('read', 'roles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'roles')}
                                            onChange={() => handleToggle('create', 'roles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'roles')}
                                            onChange={() => handleToggle('update', 'roles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'roles')}
                                            onChange={() => handleToggle('delete', 'roles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <FormControlLabel
                                        label='Asignar permisos'
                                        control={<Checkbox
                                            checked={isActionEnabled('permissions', 'roles')}
                                            onChange={() => handleToggle('permissions', 'roles')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de Turnos</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'shifts')}
                                            onChange={() => handleToggle('read', 'shifts')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'shifts')}
                                            onChange={() => handleToggle('create', 'shifts')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'shifts')}
                                            onChange={() => handleToggle('update', 'shifts')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'shifts')}
                                            onChange={() => handleToggle('delete', 'shifts')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Asignar Personal'
                                        control={<Checkbox
                                            checked={isActionEnabled('personal', 'shifts')}
                                            onChange={() => handleToggle('personal', 'shifts')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Imprimir'
                                        control={<Checkbox
                                            checked={isActionEnabled('print', 'shifts')}
                                            onChange={() => handleToggle('print', 'shifts')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de vehículos</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'vehicles')}
                                            onChange={() => handleToggle('read', 'vehicles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'vehicles')}
                                            onChange={() => handleToggle('create', 'vehicles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'vehicles')}
                                            onChange={() => handleToggle('update', 'vehicles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={3}>
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'vehicles')}
                                            onChange={() => handleToggle('delete', 'vehicles')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de Denuncias</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'complaints')}
                                            onChange={() => handleToggle('read', 'complaints')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'complaints')}
                                            onChange={() => handleToggle('create', 'complaints')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'complaints')}
                                            onChange={() => handleToggle('update', 'complaints')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={3}>
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'complaints')}
                                            onChange={() => handleToggle('delete', 'complaints')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Denuncias Recibidas</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'recibidos')}
                                            onChange={() => handleToggle('read', 'recibidos')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Atender'
                                        control={<Checkbox
                                            checked={isActionEnabled('acepted', 'recibidos')}
                                            onChange={() => handleToggle('acepted', 'recibidos')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={4}>
                                    <FormControlLabel
                                        label='Rechazar'
                                        control={<Checkbox
                                            checked={isActionEnabled('refused', 'recibidos')}
                                            onChange={() => handleToggle('refused', 'recibidos')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Denuncias Asignadas</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'asignes')}
                                            onChange={() => handleToggle('confirmed', 'asignes')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Confirmar Atencion'
                                        control={<Checkbox
                                            checked={isActionEnabled('confirmed', 'asignes')}
                                            onChange={() => handleToggle('confirmed', 'asignes')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Generar Reporte'
                                        control={<Checkbox
                                            checked={isActionEnabled('print', 'asignes')}
                                            onChange={() => handleToggle('print', 'asignes')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={3}>
                                    <FormControlLabel
                                        label='Ver  Denuncia Real'
                                        control={<Checkbox
                                            checked={isActionEnabled('look', 'asignes')}
                                            onChange={() => handleToggle('read', 'asignes')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Atender Denuncia Asignada</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'atender')}
                                            onChange={() => handleToggle('read', 'atender')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'atender')}
                                            onChange={() => handleToggle('create', 'atender')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'atender')}
                                            onChange={() => handleToggle('update', 'atender')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'atender')}
                                            onChange={() => handleToggle('delete', 'atender')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>
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
