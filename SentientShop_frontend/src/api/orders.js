import { api } from "./client";

export const checkout = async () => {
    const response = await api.post("orders/checkout/");
    return response.data; // client_secret, order_id
};
