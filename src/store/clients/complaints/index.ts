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
export const fetchData = createAsyncThunk('complaintsClient/fetchData',
    async (filters: { [key: string]: any }) => {
        const response = await instance.get('/complaints-client', {
            params: filters
        })
        return response.data
    }
);

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
            state.data = action.payload?.result || []
            state.total = action.payload?.total || 0
        })
    }
}
)

export default complaintsClientSlice.reducer
