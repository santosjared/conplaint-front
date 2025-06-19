import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios';
import Swal from 'sweetalert2';

interface Redux {
    dispatch: Dispatch<any>
}

export const fetchData = createAsyncThunk('user/fetchUser',
    async (filtrs?: { [key: string]: any }) => {
        try {
            const response = await instance.get('/users', {
                params: filtrs
            })
            return response.data
        } catch (error) {
            console.log(error);
            return { result: [], total: 0 }
        }

    }
);

export const addUser = createAsyncThunk('user/addUser',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.post('/users', data.data)
            Swal.fire({
                title: '¡Éxito!',
                text: 'Datos guardados exitosamente',
                icon: "success"
            });
            dispatch(fetchData(data.filtrs))
            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar crear al usuario. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const updateUser = createAsyncThunk('user/updateUser',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.put(`/users/${data.id}`, data.data)
            Swal.fire({
                title: '¡Éxito!',
                text: 'Datos actualizados exitosamente',
                icon: "success"
            });
            dispatch(fetchData(data.filtrs))
            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar actualizar al usuario. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const dowUser = createAsyncThunk('user/dowUser',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.delete(`/users/dow/${data.id}`)
            Swal.fire({
                title: '¡Éxito!',
                text: 'Usuario dado de baja',
                icon: "success"
            });
            dispatch(fetchData(data.filtrs))
            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar dar de baja al usuario. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)

export const upUser = createAsyncThunk('user/upUser',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.delete(`/users/up/${data.id}`)
            Swal.fire({
                title: '¡Éxito!',
                text: 'Usuario reincorporado',
                icon: "success"
            });
            dispatch(fetchData(data.filtrs))
            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar reincorporar al usuario. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        data: [],
        total: 0
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {
                state.data = action.payload.result,
                    state.total = action.payload.total
            })
    }
})

export default userSlice.reducer