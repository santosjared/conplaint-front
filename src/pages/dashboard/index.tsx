import { Badge, Box, Card, Grid, Tab } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import { useSelector } from "react-redux";
import { fetchData } from "src/store/clients/complaints";
import ComplaintsClient from "src/views/clients/complints";
import SearchComplaint from "src/views/clients/search";
import { io } from 'socket.io-client'
import environment from 'src/configs/environment'
import { useApi } from "src/hooks/useApi";
import Swal from 'sweetalert2';

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

    const api = useApi();


    useEffect(() => {
        const fecth = async () => {
            try {
                const response = await api.get('/complaints-client/complaints-with-status',
                    { params: { ...filters, status: activeTab === 'all' ? '' : activeTab, skip: (page - 1) * limit, limit } })
                // dispatch(setData(response))
            } catch (error: any) {
                let message = 'Estamos teniendo problemas al solicitar datos. Por favor contacte al desarrollador del sistema para más asistencia.';
                if (error.response?.status === 401) {
                    message = 'No tienes autorización para solicitar denuncias, solicite autorización al administador del sistema';
                }
                if (error.response?.status === 404) {
                    message = "No podemos encontrar las denuncias error 404. Por favor contacte al desarrollador del sistema para más asistencia."
                }
                Swal.fire({
                    title: '¡Error!',
                    text: message,
                    icon: "error"
                });
            }
        }
        // fecth();
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
                <Card>
                    <TabContext value={activeTab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange}>
                                <Tab label="Todos" value="all" />
                                <Tab label="Denuncias atendidas" value="acepted" />
                                <Tab label={store.totalWaiting > 0 ? <Badge badgeContent={store.totalWaiting} color="error">
                                    Denuncias en espera
                                </Badge> : 'Denuncias en espera'
                                } value="waiting" />
                                <Tab label="Denuncias rechazadas" value="refused" />
                            </TabList>
                        </Box>
                        <TabPanel value="all">
                            <SearchComplaint search={search} />
                            <ComplaintsClient complaints={store.data} page={page} limit={limit} status='' pageSize={Math.ceil(store.total / limit)} setPage={setPage} />
                        </TabPanel>
                        <TabPanel value="acepted">
                            <SearchComplaint search={search} />
                            <ComplaintsClient complaints={store.data} page={page} limit={limit} pageSize={Math.ceil(store.total / limit)} setPage={setPage} />
                        </TabPanel>
                        <TabPanel value="waiting">
                            <SearchComplaint search={search} />
                            <ComplaintsClient complaints={store.data} page={page} limit={limit} status="waiting" pageSize={Math.ceil(store.total / limit)} setPage={setPage} />
                        </TabPanel>
                        <TabPanel value="refused">
                            <SearchComplaint search={search} />
                            <ComplaintsClient complaints={store.data} page={page} limit={limit} status="refused" pageSize={Math.ceil(store.total / limit)} setPage={setPage} />
                        </TabPanel>
                    </TabContext>
                </Card>
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