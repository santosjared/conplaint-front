import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios';
import Swal from 'sweetalert2';

interface Redux {
    dispatch: Dispatch<any>
}

export const fetchData = createAsyncThunk('patrols/fetchPatrols',
    async (filters: { [key: string]: any }) => {
        try {
            const response = await instance.get('/patrols', {
                params: filters
            })

            return response.data
        } catch (e) {
            console.log(e);
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar traer los vehículod de patrullas. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });

            return null
        }
    }
);

export const addPatrols = createAsyncThunk('patrols/addPatrols',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.post('/patrols', data.data)
            Swal.fire({
                title: '¡Éxito!',
                text: 'Datos guardados exitosamente',
                icon: "success"
            });
            dispatch(fetchData(data.filters));

            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar crear al vehículo de patrullas. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const updatePatrols = createAsyncThunk('patrols/updatePatrols',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.put(`/patrols/${data.id}`, data.data)
            Swal.fire({
                title: '¡Éxito!',
                text: 'Datos actualizados exitosamente',
                icon: "success"
            });
            dispatch(fetchData(data.filters));

            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar actualizar el vehículo de radio patrullas. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const deletePatrols = createAsyncThunk('patrols/deletePatrols', async (data: { [key: string]: any }, { dispatch }: Redux) => {
    try {
        const response = await instance.delete(`/patrols/${data.id}`)
        Swal.fire({
            title: '¡Éxito!',
            text: 'El vehículo de radio patrullas fue eliminado exitosamente',
            icon: "success"
        });
        dispatch(fetchData(data.filters));

        return response
    } catch (e) {
        console.log(e)
        Swal.fire({
            title: '¡Error!',
            text: 'Se ha producido un error al intentar eliminar el vehículo de radio patrullas. Contacte al desarrollador del sistema para más asistencia.',
            icon: "error"
        });
    }

})

export const patrolsSlice = createSlice({
    name: 'patrols',
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

export default patrolsSlice.reducer