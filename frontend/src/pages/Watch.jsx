import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

function Watch() {

    const { videoId } = useParams();

    const [video, setVideo] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [user, setUser] = useState(null);
    const [subscribed, setSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);

    useEffect(() => {

        const fetchVideo = async () => {
            try {
                const response = await axios.get(`/videos/${videoId}`);

                console.log(response.data);

                setVideo(response.data.data);
                setLiked(response.data.data.isLiked);
                setLikesCount(response.data.data.likesCount);

                const commentsResponse = await axios.get(`/comments/${videoId}`);
                setComments(commentsResponse.data.data);

                const userResponse = await axios.get("/users/current-user");
                setUser(userResponse.data.data);

                const subscriberResponse = await axios.get(
                    `/subscriptions/c/${response.data.data.owner._id}`
                );

                setSubscriberCount(subscriberResponse.data.data.length);

                const alreadySubscribed = subscriberResponse.data.data.some(
                    (subscriber) =>
                        subscriber.subscriberDetails._id === userResponse.data.data._id
                );

                setSubscribed(alreadySubscribed);

            } catch (error) {
                console.log(error.response?.data || error.message);
            }
        };

        fetchVideo();
    }, [videoId]);

    const toggleLike = async () => {
        try {
            await axios.post(`/likes/toggle/v/${videoId}`);

            if (liked) {
                setLiked(false);
                setLikesCount((prev) => prev - 1);
            } else {
                setLiked(true);
                setLikesCount((prev) => prev + 1);
            }

            } catch (error) {
                console.log(error.response?.data || error.message);
            }
        };

    const addComment = async () => {
        if (!newComment.trim()) return;

        try {
            await axios.post(
                `/comments/${videoId}`,
                {
                    content: newComment
                }
            );

            setNewComment("");

            const commentsResponse = await axios.get(`/comments/${videoId}`);
            setComments(commentsResponse.data.data);

        } catch (error) {
            console.log(error.response?.data || error.message);
        }
    };

    const deleteComment = async (commentId) => {
    try {
        await axios.delete(`/comments/c/${commentId}`);

        setComments(comments.filter(comment => comment._id !== commentId));

    } catch (error) {
        console.log(error.response?.data || error.message);
    }
    };

    const toggleSubscription = async () => {
    try {
        await axios.post(
            `/subscriptions/c/${video.owner._id}`
        );

        if (subscribed) {
            setSubscribed(false);
            setSubscriberCount((prev) => prev - 1);
        } else {
            setSubscribed(true);
            setSubscriberCount((prev) => prev + 1);
        }

    } catch (error) {
        console.log(error.response?.data || error.message);
    }
    };

    if (!video) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Navbar />

            <div style={{ padding: "20px" }}>

                <video
                    src={video.videoFile}
                    controls
                    width="800"
                />

                <h1>{video.title}</h1>
                <button onClick={toggleLike}>
                    {liked ? "❤️ Liked" : "🤍 Like"}({likesCount})
                </button>

                <h3>{video.owner.fullName}</h3>

                <button onClick={toggleSubscription}>
                    {subscribed ? "Subscribed ✓" : "Subscribe"}
                </button>

                <p>{subscriberCount} Subscribers</p>

                <p>{video.description}</p>

                <hr />

                <h2>Comments</h2>

                <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />

                <button onClick={addComment}>
                    Comment
                </button>
                {comments.map((comment) => (
                <div
                    key={comment._id}
                    style={{
                        border: "1px solid gray",
                        marginTop: "15px",
                        padding: "10px"
                    }}
                >
                <h4>{comment.owner.fullName}</h4>

                <p>{comment.content}</p>

                {user && comment.owner._id === user._id && (
                    <button onClick={() => deleteComment(comment._id)}>
                        Delete
                    </button>
                )}
                </div>
    ))}

                <hr />

            </div>
        </>
    );
}

export default Watch;