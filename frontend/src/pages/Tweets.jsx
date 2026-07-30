import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

const Tweets = () => {
    const { userId } = useParams();

    const [tweets, setTweets] = useState([]);
    const [content, setContent] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchCurrentUser();
        fetchTweets();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get("/users/current-user");
            setCurrentUser(response.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTweets = async () => {
        try {
            const response = await axios.get(`/tweets/user/${userId}`);
            setTweets(response.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const createTweet = async () => {
        if (!content.trim()) return;

        try {
            await axios.post("/tweets", {
                content,
            });

            setContent("");
            fetchTweets();
        } catch (error) {
            console.log(error);
        }
    };

    const updateTweet = async (tweetId) => {
        if (!editContent.trim()) return;

        try {
            await axios.patch(`/tweets/${tweetId}`, {
                content: editContent,
            });

            setEditingId(null);
            setEditContent("");
            fetchTweets();
        } catch (error) {
            console.log(error);
        }
    };

    const deleteTweet = async (tweetId) => {
        try {
            await axios.delete(`/tweets/${tweetId}`);
            fetchTweets();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div
            style={{
                maxWidth: "700px",
                margin: "30px auto",
                padding: "20px",
            }}
        >
            <h1>User Tweets</h1>

            <div
                style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "30px",
                }}
            >
                <textarea
                    rows="4"
                    placeholder="What's happening?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px",
                    }}
                />

                <button
                    onClick={createTweet}
                    style={{
                        marginTop: "10px",
                        padding: "10px 20px",
                        cursor: "pointer",
                    }}
                >
                    Post Tweet
                </button>
            </div>

            {tweets.length === 0 ? (
                <h3>No Tweets Found</h3>
            ) : (
                tweets.map((tweet) => (
                    <div
                        key={tweet._id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "15px",
                            marginBottom: "20px",
                        }}
                    >
                        <h3>{tweet.owner.fullName}</h3>

                        <p>@{tweet.owner.username}</p>

                        <small>
                            {new Date(tweet.createdAt).toLocaleString()}
                        </small>

                        {editingId === tweet._id ? (
                            <>
                                <textarea
                                    rows="3"
                                    value={editContent}
                                    onChange={(e) =>
                                        setEditContent(e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        marginTop: "15px",
                                        padding: "10px",
                                    }}
                                />

                                <button
                                    onClick={() =>
                                        updateTweet(tweet._id)
                                    }
                                    style={{
                                        marginTop: "10px",
                                        marginRight: "10px",
                                    }}
                                >
                                    Save
                                </button>

                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setEditContent("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <p
                                    style={{
                                        marginTop: "15px",
                                    }}
                                >
                                    {tweet.content}
                                </p>

                                {currentUser &&
                                    currentUser._id === tweet.owner._id && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingId(tweet._id);
                                                    setEditContent(
                                                        tweet.content
                                                    );
                                                }}
                                                style={{
                                                    marginRight: "10px",
                                                }}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    deleteTweet(tweet._id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default Tweets;