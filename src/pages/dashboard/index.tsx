import { Box, Card, Grid, Tooltip, Typography } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import { useSelector } from "react-redux";
import { fetchData } from "src/store/clients/complaints";
import { io } from 'socket.io-client'
import environment from 'src/configs/environment'
import { ApexOptions } from "apexcharts";
import GraficaDenuncias from "./grafica-denuncias";
import CrmMonthlyBudget from "./grafica-fecha";
import CrmTotalGrowth from "./torta-denucias";

interface SearchFilter {
    name: string,
    date: string
}


const socket = io(environment().backendURI)

const Dashboard = () => {

    const [activeTab, setActiveTab] = useState<string>('all')
    const [page, setPage] = useState<number>(1)
    const [filters, setFilters] = useState<SearchFilter>({ name: '', date: '' })

    const limit = 5

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.complaintsClient)

    useEffect(() => {
        dispatch(fetchData({ ...filters, status: activeTab === 'all' ? '' : activeTab, skip: (page - 1) * limit, limit }))
    }, [activeTab, page, filters])

    socket.on('notification', (data) => {
        dispatch(fetchData({ ...filters, status: activeTab === 'all' ? '' : activeTab, skip: (page - 1) * limit, limit }))
    })

    const handleChange = (event: SyntheticEvent, value: string) => {
        setActiveTab(value)
        setPage(1)
    }
    const search = (data: SearchFilter) => {
        setPage(1)
        setFilters(data)
    }

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography variant="h6">Denuncias para hoy</Typography>
            </Grid>
            <Grid item xs={3}>
                <Card>
                    <Box sx={{ p: 2, backgroundColor: theme => theme.palette.primary.main }}>
                        <Tooltip title="Total de denuncias atendidas" arrow>
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
                                Total de denuncias atendidas
                            </Typography>
                        </Tooltip>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: theme => theme.palette.success.main,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 50,
                        }}
                    >
                        <Typography variant="h6" color="white">
                            78
                        </Typography>
                    </Box>
                </Card>
            </Grid>
            <Grid item xs={3}>
                <Card>
                    <Box sx={{ p: 2, backgroundColor: theme => theme.palette.primary.main }}>
                        <Tooltip title="Total de denuncias recibidos" arrow>
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
                                Total de denuncias recibidos
                            </Typography>
                        </Tooltip>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: theme => theme.palette.info.main,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 50,
                        }}
                    >
                        <Typography variant="h6" color="white">
                            78
                        </Typography>
                    </Box>
                </Card>
            </Grid>
            <Grid item xs={3}>
                <Card>
                    <Box sx={{ p: 2, backgroundColor: theme => theme.palette.primary.main }}>
                        <Tooltip title="Total de denuncias sin atender" arrow>
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
                                Total de denuncias sin atender
                            </Typography>
                        </Tooltip>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: theme => theme.palette.warning.main,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 50,
                        }}
                    >
                        <Typography variant="h6" color="white">
                            78
                        </Typography>
                    </Box>
                </Card>
            </Grid>
            <Grid item xs={3}>
                <Card>
                    <Box sx={{ p: 2, backgroundColor: theme => theme.palette.primary.main }}>
                        <Tooltip title="Total de denuncias rechazadas" arrow>
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
                                Total de denuncias rechazadas
                            </Typography>
                        </Tooltip>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: theme => theme.palette.error.main,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 50,
                        }}
                    >
                        <Typography variant="h6" color="white">
                            78
                        </Typography>
                    </Box>
                </Card>
            </Grid>
            <Grid item xs={9}>
                <GraficaDenuncias />
            </Grid>
            <Grid item xs={3}>
                <CrmTotalGrowth />
            </Grid>
            <Grid item xs={9}>
                <CrmMonthlyBudget />
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