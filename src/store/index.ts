import { configureStore } from '@reduxjs/toolkit';
import user from './user';
import rol from './role';
import complaints from './complaints';
import complaintsClient from './clients/complaints';
import auth from './auth';
import shits from './shits';
import patrols from './patrols';

export const store = configureStore({
    reducer: {
        user,
        rol,
        complaints,
        complaintsClient,
        auth,
        shits,
        patrols
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store