import axios from "axios";

export default axios.create({
    baseURL:"https://videotube-u9v7.onrender.com/api/v1",
    withCredentials:true
})