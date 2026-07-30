import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Watch from "./pages/Watch";
import Playlist from "./pages/Playlist";
import Dashboard from "./pages/Dashboard";
import Tweets from "./pages/Tweets";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/watch/:videoId" element={<Watch />} />
        <Route path="/playlist" element={<Playlist />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tweets/:userId" element={<Tweets />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;