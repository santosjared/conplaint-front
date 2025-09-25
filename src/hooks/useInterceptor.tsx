import { instance } from 'src/configs/axios';
import store from 'src/store'
import { setUser } from 'src/store/auth';

interface FailedQueueItem {
    resolve: (token: string) => void;
    reject: (error: any) => void;
}

export const useInterceptor = () => {

    let isRefreshing = false;
    let failedQueue: FailedQueueItem[] = [];

    const processQueue = (error: any, token: string | null = null) => {
        failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token!);
            }
        });
        failedQueue = [];
    };


    instance.interceptors.request.use(
        (config) => {
            const state = store.getState();
            const token = state.auth.token;
            if (token && config.headers) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (
                error.response?.status === 401 &&
                !originalRequest._retry
            ) {
                const state = store.getState();
                const refresh_token = state.auth.refresh_token;
                const rememberMe = state.auth.user?.rememberMe || false;
                if (!refresh_token) {
                    return Promise.reject(error);
                }
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            return instance({
                                ...originalRequest,
                                headers: {
                                    ...originalRequest.headers?.toJSON?.(),
                                    Authorization: `Bearer ${token}`
                                }
                            });
                        }).catch((err) => Promise.reject(err));
                }
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const result = await instance.post('/auth/refresh-token', {
                        token: refresh_token
                    });
                    const newUser = { ...result.data.user, rememberMe }
                    const newToken = result.data.access_token;
                    store.dispatch(setUser({ user: newUser, token: newToken, refresh_token: result.data.refresh_token }));
                    processQueue(null, newToken);
                    return instance({
                        ...originalRequest,
                        headers: {
                            ...originalRequest.headers?.toJSON?.(),
                            Authorization: `Bearer ${newToken}`
                        }
                    });
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );
}
