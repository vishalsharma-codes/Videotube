import axios from "axios";

export default axios.create({
    baseURL:"https://videotube-u9v7.onrender.com",
    withCredentials:true
})