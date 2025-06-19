import { configureStore } from '@reduxjs/toolkit';
import user from './user';
import rol from './role'
import complaints from './complaints'
import complaintsClient from './clients/complaints'

export const store = configureStore({
    reducer: {
        user,
        rol,
        complaints,
        complaintsClient
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>