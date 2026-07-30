import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

function Dashboard() {

    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);

    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const statsResponse = await axios.get("/dashboard/stats");
                setStats(statsResponse.data.data);

                const videosResponse = await axios.get("/dashboard/videos");
                setVideos(videosResponse.data.data);

            } catch (error) {
                console.log(error.response?.data || error.message);
            }

        };

        fetchDashboard();

    }, []);

    return (
        <>
            <Navbar />

            <div style={{ padding: "30px" }}>

                <h1>Dashboard</h1>

                <hr />

                <h2>Statistics</h2>

                <p>Total Videos : {stats?.totalVideos}</p>

                <p>Total Views : {stats?.totalViews}</p>

                <p>Total Likes : {stats?.totalLikes}</p>

                <p>Total Subscribers : {stats?.totalSubscribers}</p>

                <hr />

                <h2>Your Videos</h2>

                {videos.map((video) => (

                    <div
                        key={video._id}
                        style={{
                            border: "1px solid gray",
                            marginBottom: "20px",
                            padding: "20px",
                        }}
                    >

                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            width="250"
                        />

                        <h3>{video.title}</h3>

                        <p>{video.description}</p>

                        <p>Views : {video.views}</p>

                    </div>

                ))}

            </div>

        </>
    );
}

export default Dashboard;