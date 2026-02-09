import { checkout } from "../api/orders";

const Checkout = async () => {
    const data = await checkout();
    console.log(data.client_secret);
};

export default Checkout;
