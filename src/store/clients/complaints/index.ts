import { createAsyncThunk, createSlice, Dispatch } from "@reduxjs/toolkit";
import { instance } from "src/configs/axios";
import Swal from 'sweetalert2';

interface Redux {
    dispatch: Dispatch<any>
}

interface Props {
    status: string
    skip: number
    limit: number
    name?: string
    date?: string
}

interface RefuseProps extends Props {
    _id: string
}
export const fetchData = createAsyncThunk('complaintsClient/fetchData', async ({ status, skip, limit, name = '', date = '' }: Props) => {
    try {
        const response = await instance.get('/complaints-client/complaints-with-status', { params: { name, date, status, skip, limit } });
        return response.data
    } catch (e) {
        console.log(e);
        Swal.fire({
            title: '¡Error!',
            text: 'Estamos teniendo problemas al solicitar datos. Por favor contacte al desarrollador del sistema para más asistencia.',
            icon: "error"
        });
        return []
    }
})

export const refusedComplaints = createAsyncThunk('complaintsClient/refusedComplaints', async ({ status, skip, limit, _id }: RefuseProps, { dispatch }: Redux) => {
    try {
        const response = await instance.delete(`/complaints-client/complaints-refused/${_id}`);
        dispatch(fetchData({ status, skip, limit }))
        return response.data
    } catch (e) {
        console.log(e);
        Swal.fire({
            title: '¡Error!',
            text: 'Estamos teniendo problemas al rechazar la denuncia. Por favor contacte al desarrollador del sistema para más asistencia.',
            icon: "error"
        });
        return null
    }
})

export const complaintsClientSlice = createSlice({
    name: 'complaintsClient',
    initialState: {
        data: [],
        total: 0,
        totalWaiting: 0
    },
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchData.fulfilled, (state, action) => {
            state.data = action.payload.data
            state.total = action.payload.total
            state.totalWaiting = action.payload.totalWaiting
        })
    }
}
)

export default complaintsClientSlice.reducer
