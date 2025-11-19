import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios';
import Swal from 'sweetalert2';

interface Redux {
    dispatch: Dispatch<any>
}

export const fetchData = createAsyncThunk('rol/fetchRol',
    async (filters?: { [key: string]: any }) => {
        try {
            const response = await instance.get('/roles', {
                params: filters
            })

            return response.data
        } catch (e) {
            console.log(e)

            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar traer los. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });

            return null;
        }
    }
);

export const addRol = createAsyncThunk('rol/addRol',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.post('/roles', data.data)
            Swal.fire({
                title: '¡Éxito!',
                text: 'Datos guardados exitosamente',
                icon: "success"
            });
            dispatch(fetchData(data.filters))

            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar crear al rol. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const updateRol = createAsyncThunk('rol/updateRol',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.put(`/roles/${data.id}`, data.data)
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
                text: 'Se ha producido un error al intentar actualizar rol. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const deleteRol = createAsyncThunk('rol/deleteRol', async (data: { [key: string]: any }, { dispatch }: Redux) => {
    try {
        const response = await instance.delete(`/roles/${data.id}`)
        Swal.fire({
            title: '¡Éxito!',
            text: 'El rol fue eliminado exitosamente',
            icon: "success"
        });
        dispatch(fetchData(data.filters));

        return response
    } catch (e) {
        console.log(e)
        Swal.fire({
            title: '¡Error!',
            text: 'Se ha producido un error al intentar eliminar el rol. Contacte al desarrollador del sistema para más asistencia.',
            icon: "error"
        });
    }

})

export const roleSlice = createSlice({
    name: 'role',
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


export default roleSlice.reducer