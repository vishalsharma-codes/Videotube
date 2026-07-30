import { useState } from "react";
import axios from "../api/axios";

function Register() {

    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    const register = async () => {
    try {
        const formData = new FormData();

        formData.append("username", username);
        formData.append("fullName", fullName);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("avatar", avatar);

        if (coverImage) {
            formData.append("coverImage", coverImage);
        }

        const response = await axios.post("/users/register", formData);

        console.log(response.data);
        alert("Registration Successful");
    } catch (error) {
        console.log(error.response?.data || error.message);
        alert("Registration Failed");
    }
};

    return (
    <div>
        <h1>Register</h1>

        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />

        <br /><br />

        <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
        />

        <br /><br />

        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <input
            type="file"
            onChange={(e) => setAvatar(e.target.files[0])}
        />

        <br /><br />

        <input
            type="file"
            onChange={(e) => setCoverImage(e.target.files[0])}
        />
        <br /><br />

        <button type = "button" onClick={register}>
            Register
        </button>
    </div>
);
}

export default Register;