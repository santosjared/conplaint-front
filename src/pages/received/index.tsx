import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import ComplaintsClient from "src/views/clients/complints";
import SearchComplaint from "src/views/clients/search";
import { io } from 'socket.io-client'
import environment from 'src/configs/environment'
import { fetchData } from "src/store/clients/complaints";


interface SearchFilter {
    name: string,
    date: string
}

const socket = io(environment().backendURI)

const Received = () => {
    const [page, setPage] = useState<number>(1)

    const limit = 5

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.complaintsClient)

    const [filters, setFilters] = useState<SearchFilter>({ name: '', date: '' })

    useEffect(() => {
        dispatch(fetchData({ ...filters, status: 'waiting', skip: (page - 1) * limit, limit }))
    }, [page, filters])

    socket.on('notification', (data) => {
        dispatch(fetchData({ ...filters, status: 'waiting', skip: (page - 1) * limit, limit }))
        console.log('notoficacion ejecutada')
    })

    const search = (data: SearchFilter) => {
        setPage(1)
        setFilters(data)
    }

    return (<Grid container spacing={4}>
        <Grid item xs={12}>
            <Card>
                <CardHeader title='Denuncias recibidas' />
                <CardContent>
                    <SearchComplaint search={search} />
                    <ComplaintsClient complaints={store.data} page={page} limit={limit} status='waiting' pageSize={Math.ceil(store.total / limit)} setPage={setPage} />
                </CardContent>
            </Card>
        </Grid>
    </Grid>)
}

Received.acl = {
    action: 'read',
    subject: 'received'
}

Received.authGuard = true;

export default Received;