import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios';
import Swal from 'sweetalert2';

interface Redux {
    dispatch: Dispatch<any>
}

export const fetchData = createAsyncThunk('shits/fetchShits',
    async (filtrs?: { [key: string]: any }) => {
        const response = await instance.get('/shits', {
            params: filtrs
        })
        return response.data
    }
);

export const addShit = createAsyncThunk('shits/addShit',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.post('/shits', data.data)
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
                text: 'Se ha producido un error al intentar crear al rol. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const updateShit = createAsyncThunk('shits/updateShit',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.put(`/shits/${data.id}`, data.data)
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
                text: 'Se ha producido un error al intentar actualizar rol. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const deleteShit = createAsyncThunk('shits/deleteShit', async (data: { [key: string]: any }, { dispatch }: Redux) => {
    try {
        const response = await instance.delete(`/shits/${data.id}`)
        Swal.fire({
            title: '¡Éxito!',
            text: 'El turno fue eliminado exitosamente',
            icon: "success"
        });
        dispatch(fetchData(data.filtrs))
        return response
    } catch (e) {
        console.log(e)
        Swal.fire({
            title: '¡Error!',
            text: 'Se ha producido un error al intentar eliminar el turno. Contacte al desarrollador del sistema para más asistencia.',
            icon: "error"
        });
    }

})

export const shitSlice = createSlice({
    name: 'shits',
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

export default shitSlice.reducer