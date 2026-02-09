import { api } from "./client";

export const login = async (email, password) => {
    const response = await api.post("auth/login/", {
        email,
        password,
    });
    localStorage.setItem("token", response.data.access);
    return response.data;
};

export const register = async (email, password) => {
    return api.post("auth/register/", {
        email,
        password,
    });
};
