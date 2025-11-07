import { Box, Card, CardContent, Grid, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import Icon from "src/@core/components/icon"
import { useSocket } from "src/hooks/useSocket";
import GraficaDenuncias from "src/views/pages/dashboard/graficas/Estadisticas";
import CrmTotalGrowth from "src/views/pages/dashboard/graficas/Torta";
import getConfig from 'src/configs/environment'

const Dashboard = () => {

    const [open, setOpen] = useState<boolean>(true)

    const theme = useTheme()
    const { total_denuncias } = useSocket()


    return (
        <Grid container spacing={4}>
            {open && <Grid item xs={12}>
                <Card>
                    <Box sx={{ display: 'flex', justifyContent: 'end', p: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => setOpen(false)}
                            sx={{
                                color: (theme) => theme.palette.primary.contrastText,
                                backgroundColor: (theme) => theme.palette.secondary.main,
                                transition: 'background-color 0.3s ease',
                                '&:hover': {
                                    backgroundColor: (theme) => theme.palette.secondary.dark,
                                },
                                '&:active': {
                                    backgroundColor: (theme) => theme.palette.secondary.light,
                                },
                            }}
                        >
                            <Icon icon="mdi:close" fontSize={20} />
                        </IconButton>
                    </Box>
                    <CardContent sx={{ pt: 0, mt: 0 }}>
                        <Typography variant="h6" gutterBottom>
                            ¡Bienvenido a tu sitio web de denuncias!
                        </Typography>
                        <Typography variant="caption">
                            A través de este sistema podrás gestionar de forma eficiente todas las denuncias recibidas.
                            Aquí tendrás la posibilidad de registrar nuevos reportes, atender denuncias pendientes y
                            dar seguimiento a cada caso desde un solo lugar. Las denuncias llegan automáticamente desde
                            la aplicación móvil, lo que facilita la comunicación y el acceso en tiempo real a la información.
                            <br /><br />
                            Si aún no tienes la aplicación instalada, puedes descargarla haciendo clic en el siguiente enlace:{" "}
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const userAgent = navigator.userAgent || navigator.vendor;
                                    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
                                    const isAndroid = /android/i.test(userAgent);

                                    if (isIOS) {
                                        window.open(getConfig().URL_IOS, "_blank");
                                    } else if (isAndroid) {
                                        window.open(getConfig().URL_ANDROID, "_blank");
                                    } else {
                                        window.open(getConfig().URL_NAVEGATOR, "_blank");
                                    }
                                }}
                                style={{ color: theme.palette.info.main, textDecoration: "none", fontWeight: "bold" }}
                            >
                                Descargar aplicación móvil
                            </a>.
                        </Typography>
                    </CardContent>
                </Card>

            </Grid>}
            {total_denuncias.map((denuncia, index) => (
                <Grid item xs={3} key={index}>
                    <Card>
                        <Box sx={{ p: 2, backgroundColor: theme => theme.palette.primary.main }}>
                            <Tooltip title={`Total de denuncias ${denuncia.name}`} arrow>
                                <Typography
                                    variant="subtitle2"
                                    noWrap
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        color: 'white',
                                        mb: 2,
                                    }}
                                >
                                    {`Total de denuncias ${denuncia.name}`}
                                </Typography>
                            </Tooltip>
                        </Box>
                        <Box
                            sx={{
                                backgroundColor: theme =>
                                    denuncia.name === 'Recibidos' ? theme.palette.info.main : denuncia.name === 'Rechazados' ?
                                        theme.palette.error.main : denuncia.name === 'En espera' ? theme.palette.warning.main : theme.palette.success.main,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 50,
                            }}
                        >
                            <Typography variant="h6" color="white">
                                {denuncia.total}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            ))
            }
            <Grid item xs={12} sm={8}>
                <GraficaDenuncias />
            </Grid>
            <Grid item xs={12} sm={4}>
                <CrmTotalGrowth />
            </Grid>
        </Grid>

    );
}
Dashboard.acl = {
    action: 'read',
    subject: 'dashboard'
}

Dashboard.authGuard = true;

export default Dashboard