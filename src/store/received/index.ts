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
    id: string
}
export const fetchData = createAsyncThunk('antendidos/fetchData',
    async (filters: { [key: string]: any }) => {
        try {
            const response = await instance.get('/atendidos', {
                params: filters
            });

            return response.data;
        } catch (e) {
            console.log(e);
            Swal.fire({
                title: '¡Error!',
                text: 'Estamos teniendo problemas al traer las denuncias. Por favor contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });

            return null
        }
    }
);

export const refusedComplaints = createAsyncThunk('atendidos/refusedComplaints', async ({ status, skip, limit, id }: RefuseProps, { dispatch }: Redux) => {
    try {
        const response = await instance.delete(`/atendidos/${id}`);
        dispatch(fetchData({ status, skip, limit }));

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

export const atendidosSlice = createSlice({
    name: 'atendidos',
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

export default atendidosSlice.reducer
