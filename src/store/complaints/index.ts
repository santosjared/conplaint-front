import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios';
import Swal from 'sweetalert2';

interface Redux {
    dispatch: Dispatch<any>
}

export const fetchData = createAsyncThunk('complsintd/fetchData',
    async (filtrs?: { [key: string]: any }) => {
        if (filtrs) {
            const response = await instance.get('/complaints/type-complaints', {
                params: filtrs,
            })
            return response.data
        }
        const response = await instance.get('/complaints/type-complaints')
        return response.data
    }
);

export const addComplaints = createAsyncThunk('complaints/addComplaints',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.post('/complaints', data.data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            Swal.fire({
                title: '¡Éxito!',
                text: 'Datos guardados exitosamente',
                icon: 'success'
            });
            dispatch(fetchData(data.filtrs))
            return response
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar crear la denuncias. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const updateComplaints = createAsyncThunk('complaints/updateComplaints',
    async (data: { [key: string]: any }, { dispatch }: Redux) => {
        try {
            const response = await instance.put(`/complaints/${data.id}`, data.data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
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
                text: 'Se ha producido un error al intentar actualizar la denuncia. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

    }
)
export const deleteComplaints = createAsyncThunk('complaints/deleteComplaints', async (data: { [key: string]: any }, { dispatch }: Redux) => {
    try {
        const response = await instance.delete(`/complaints/${data.id}`)
        Swal.fire({
            title: '¡Éxito!',
            text: 'La denuncia fue eliminado exitosamente',
            icon: "success"
        });
        dispatch(fetchData(data.filtrs))
        return response
    } catch (e) {
        console.log(e)
        Swal.fire({
            title: '¡Error!',
            text: 'Se ha producido un error al intentar eliminar el denuncia. Contacte al desarrollador del sistema para más asistencia.',
            icon: "error"
        });
    }

})

export const complaintSlice = createSlice({
    name: 'complaint',
    initialState: {
        data: []
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {
                state.data = action.payload
            })
    }
})

export default complaintSlice.reducer