import { Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { forwardRef } from "react";
import Icon from "src/@core/components/icon";
import Fade, { FadeProps } from '@mui/material/Fade'
import { ReactElement, Ref } from "react";
import { UserType } from "src/types/types";


interface ComplaintType {
    name: string
    image: string
    description: string
    _id: string
}

interface Infractor {
    apellido_paterno: string
    apellido_materno: string
    nombres: string
    ci: string
    edad: number
    ocupation: string
    alias: string
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
}

interface Props {
    open: boolean;
    toggle: () => void;
    confirmed: DenunciaType | null
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Fade ref={ref} {...props} />
})

const Denuncia = ({ open, toggle, confirmed }: Props) => {

    const [year, month, day] = confirmed?.fecha_hecho.split('-') || [];
    const formatted = `${day}/${month}/${year}`;
    return (
        <Dialog
            fullWidth
            open={open}
            maxWidth='lg'
            scroll='body'
            onClose={toggle}
            TransitionComponent={Transition}
        >
            <DialogContent >
                <Box sx={{ mb: 8 }}>
                    <IconButton size='small' onClick={toggle} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
                        <Icon icon='mdi:close' />
                    </IconButton>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardHeader title='Denuncia real' />
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'center', height: 30, mt: 5 }}>
                                    <Typography variant="h6">{confirmed?.tipo_denuncia?.name}</Typography>
                                </Box>
                                <Divider sx={{ my: 2, mb: 3 }} />
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Sigla:</strong> {confirmed?.sigla}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Fecha del hecho:</strong> {formatted}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Hora del hecho:</strong> {confirmed?.hora_hecho}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Lugar del hecho:</strong> {confirmed?.lugar_hecho}
                                </Typography>
                                <Divider />
                                <Typography variant="h6" sx={{ mb: 3 }}>Descripción:</Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>{confirmed?.description}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <Card>
                            <CardHeader title='Arrestados' />
                            <CardContent>
                                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                                    <TableContainer>
                                        <Table sx={{ minWidth: 650 }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align='center'><strong>Nro.</strong></TableCell>
                                                    <TableCell align='center'><strong>Apellido Paterno</strong></TableCell>
                                                    <TableCell align='center'><strong>Apellido Materno</strong></TableCell>
                                                    <TableCell align='center'><strong>Nombres</strong></TableCell>
                                                    <TableCell align='center'><strong>C.I.</strong></TableCell>
                                                    <TableCell align='center'><strong>Edad</strong></TableCell>
                                                    <TableCell align='center'><strong>Ocupación</strong></TableCell>
                                                    <TableCell align='center'><strong>Alias</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {confirmed?.infractores.map((infractor, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell align='center'>{index + 1}</TableCell>
                                                        <TableCell align='center'>{infractor.apellido_paterno}</TableCell>
                                                        <TableCell align='center'>{infractor.apellido_materno}</TableCell>
                                                        <TableCell align='center'>{infractor.nombres}</TableCell>
                                                        <TableCell align='center'>{infractor.ci}</TableCell>
                                                        <TableCell align='center'>{infractor.edad}</TableCell>
                                                        <TableCell align='center'>{infractor.ocupation}</TableCell>
                                                        <TableCell align='center'>{infractor.alias}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" onClick={toggle}>Aceptar</Button>
                </Box>
            </DialogActions>

        </Dialog>
    )
};

export default Denuncia;