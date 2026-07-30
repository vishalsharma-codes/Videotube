import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

function Profile() {
    const { username } = useParams();

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`/users/c/${username}`);

                setProfile(response.data.data);

            } catch (error) {
                console.log(error.response?.data || error.message);
            }
        };

        fetchProfile();

    }, [username]);

    if (!profile) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Navbar />

            <div style={{ padding: "30px" }}>

                <img
                    src={profile.coverImage}
                    alt="cover"
                    width="100%"
                    height="250"
                />

                <br /><br />

                <img
                    src={profile.avatar}
                    alt="avatar"
                    width="120"
                    style={{ borderRadius: "50%" }}
                />

                <h1>{profile.fullName}</h1>

                <h3>@{profile.username}</h3>

                <p>Subscribers : {profile.subscribersCount}</p>

                <p>Subscribed To : {profile.channelsSubscribedToCount}</p>

                <p>
                    {profile.isSubscribed
                        ? "✅ You are subscribed"
                        : "❌ Not subscribed"}
                </p>

            </div>
        </>
    );
}

export default Profile;