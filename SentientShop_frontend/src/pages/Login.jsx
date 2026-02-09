import { login } from "../api/auth";

function Login() {
    const handleLogin = async () => {
        await login("test@example.com", "password123");
        alert("Logged in!");
    };

    return <button onClick={handleLogin}>Login</button>;
}

export default Login;
