import { configureStore } from '@reduxjs/toolkit';
import user from './user';
import rol from './role';
import complaints from './complaints';
import receveids from './received'
import auth from './auth';
import shits from './shits';
import patrols from './patrols';
import atendidos from './atendidos'
import asignados from './asignes'

export const store = configureStore({
    reducer: {
        user,
        rol,
        complaints,
        receveids,
        auth,
        shits,
        patrols,
        atendidos,
        asignados
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store