import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MovieDetail from "./components/MovieRoute/movie_detail.jsx";
import RegisterForm from "./components/registerForm.jsx";
import LoginForm from "./components/loginForm.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Index from "./components/IndexRoute/index.jsx";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import WatchLater from "./components/userFunctions/watchlater.jsx";
import RatedMovies from "./components/userFunctions/watched.jsx";
import MagicMovies from "./components/magicComponents/fiveMovies.jsx";
import "./css/style.css";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/watch-later" element={<WatchLater />} />
                <Route path="/magic" element={<MagicMovies />} />
                <Route path="/watched-movies" element={<RatedMovies />} />
                <Route path="/movies/:movie_id" element={<MovieDetail />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
