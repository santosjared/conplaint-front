import axios from 'axios';
import getConfig from './environment'


export const instance = axios.create({
    baseURL: getConfig().backendURI,
    timeout: 5000,
});