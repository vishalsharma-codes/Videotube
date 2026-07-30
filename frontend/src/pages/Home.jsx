import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Home() {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get("/videos");

                console.log(response.data);
                console.log(response.data.data.videos);

                setVideos(response.data.data.videos);
            } catch (error) {
                console.log(error.response?.data || error.message);
            }
        };

        fetchVideos();
    }, []);
    console.log("VIDEOS STATE:", videos);

return (
    <>
        <Navbar />

        <h1>Home Page</h1>

        {videos.map((video) => (
            <Link
                key={video._id}
                to={`/watch/${video._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                <div
                    style={{
                        border: "1px solid gray",
                        margin: "20px",
                        padding: "20px",
                    }}
                >
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        width="250"
                    />

                    <h2>{video.title}</h2>

                    <p>{video.description}</p>

                    <h4>{video.owner.fullName}</h4>
                </div>
            </Link>
        ))}
    </>
);
}

export default Home;