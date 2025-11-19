import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios';
import Swal from 'sweetalert2';

interface Redux {
    dispatch: Dispatch<any>
}

export const fetchData = createAsyncThunk('atendidos/fetchatendidos',
    async (filters: { [key: string]: any }) => {
        const response = await instance.get('/atendidos', {
            params: filters
        })

        return response.data
    }
);

export const updateAtendios = createAsyncThunk('atendidos/updateatendidos',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.put(`/atendidos/${data.id}`)
            Swal.fire({
                title: '¡Éxito!',
                text: 'Se ha confirmado la atención.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            dispatch(fetchData(data.filters))

            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar confirmar la atención. Contacte al desarrollador del sistema para más asistencia.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }

    }
)

export const atendidosSlice = createSlice({
    name: 'atendidos',
    initialState: {
        data: [],
        total: 0,
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {
                state.data = action.payload.result || [],
                    state.total = action.payload.total || 0
            })
    }
})

export default atendidosSlice.reducer