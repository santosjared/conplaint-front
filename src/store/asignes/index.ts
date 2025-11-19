import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios';
import Swal from 'sweetalert2';

interface Redux {
    dispatch: Dispatch<any>
}

export const fetchData = createAsyncThunk('asignados/fetchAsignados',
    async (filters: { [key: string]: any }) => {
        try {
            const response = await instance.get('/asignados', {
                params: filters
            })

            return response.data
        } catch (e) {
            console.log(e);
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar traer denuncias asignadas. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });

            return null
        }
    }
);

export const confirmarDenuncia = createAsyncThunk('asignados/confirmedAsignados',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.put(`/asignados/${data.id}`)
            Swal.fire({
                title: '¡Éxito!',
                text: 'La denuncia fue confirmada',
                icon: "success"
            });
            dispatch(fetchData(data.filters))

            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'No se puede confirmar la denuncia. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)

export const asignadosSlice = createSlice({
    name: 'asignados',
    initialState: {
        data: [],
        total: 0,
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {
                state.data = action.payload?.result || [],
                    state.total = action.payload?.total || 0
            })
    }
})

export default asignadosSlice.reducer