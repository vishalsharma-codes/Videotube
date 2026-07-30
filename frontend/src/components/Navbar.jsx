import { useEffect, useState } from "react";
import axios from "../api/axios";
import {Link} from "react-router-dom"

function Navbar() {

    const [user, setUser] = useState(null);

    useEffect(() => {

        const getCurrentUser = async () => {
            try {
                const response = await axios.get("/users/current-user");

                setUser(response.data.data);
            } catch (error) {
                console.log(error.response?.data || error.message);
            }
        };

        getCurrentUser();

    }, []);

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px 30px",
                backgroundColor: "#222",
                color: "white",
            }}
        >
            <h2>
            <Link
                to="/"
                style={{ color: "white", textDecoration: "none" }}
            >
                VideoTube
            </Link>
        </h2>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                }}
            >
                {user && (
                    <Link
                        to="/upload"
                        style={{
                            color: "white",
                            textDecoration: "none",
                        }}
                    >
                        Upload
                    </Link>
                )}

                <Link
                    to="/dashboard"
                    style={{
                        color: "white",
                        textDecoration: "none"
                    }}
                >
                    Dashboard
                </Link>

                {user && (
                        <Link
                            to={`/tweets/${user._id}`}
                            style={{
                                color: "white",
                                textDecoration: "none",
                            }}
                        >
                            Tweets
                        </Link>
                    )}

                {user ? (
                    <Link
                        to={`/profile/${user.username}`}
                        style={{
                            color: "white",
                            textDecoration: "none"
                        }}
                    >
                        Welcome, {user.fullName}
                    </Link>
                ) : (
                    <h3>Not Logged In</h3>
                )}
            </div>
                    </nav>
                );
            }

export default Navbar;