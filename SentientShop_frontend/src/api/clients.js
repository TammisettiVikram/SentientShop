import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8000/api/",
});
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
api.post("auth/login/", {
    email,
    password
}).then(res => {
    localStorage.setItem("token", res.data.access);
});
api.post("orders/checkout/")
    .then(res => {
        console.log(res.data.client_secret);
    });
