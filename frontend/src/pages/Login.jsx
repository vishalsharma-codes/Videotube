import { useState } from "react";
import axios from "../api/axios";

function Login() {

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {

            const data = {
                password,
            };

            // Check whether the user entered an email or a username
            if (login.includes("@")) {
                data.email = login;
            } else {
                data.username = login;
            }

            const response = await axios.post("/users/login", data);

            console.log(response.data);
            alert("Login Successful");

        } catch (error) {
            console.log(error.response?.data || error.message);
            alert("Login Failed");
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <input
                type="text"
                placeholder="Email or Username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
            />

            <br /><br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br /><br />

            <button type="button" onClick={handleLogin}>
                Login
            </button>
        </div>
    );
}

export default Login;