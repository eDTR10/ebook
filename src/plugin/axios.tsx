import axios from "axios";

axios.defaults.baseURL = `${import.meta.env.VITE_URL}:8000/api/v1/`
axios.defaults.headers.get['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Add auth token to all requests
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('eprojex_auth_token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export default axios;