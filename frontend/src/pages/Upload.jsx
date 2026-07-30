import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

function Upload() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);

    const uploadVideo = async (e) => {
        e.preventDefault();

        if (!title || !description || !videoFile || !thumbnail) {
            alert("Please fill all fields.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("title", title);
            formData.append("description", description);
            formData.append("videoFile", videoFile);
            formData.append("thumbnail", thumbnail);

            await axios.post("/videos", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Video uploaded successfully!");

            navigate("/");
        } catch (error) {
            console.log(error.response?.data || error.message);
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div
                style={{
                    maxWidth: "500px",
                    margin: "40px auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                }}
            >
                <h2>Upload Video</h2>

                <form
                    onSubmit={uploadVideo}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Video Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <textarea
                        placeholder="Video Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <label>Choose Video</label>

                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                    />

                    <label>Choose Thumbnail</label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Uploading..." : "Upload Video"}
                    </button>
                </form>
            </div>
        </>
    );
}

export default Upload;