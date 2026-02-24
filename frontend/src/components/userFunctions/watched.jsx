import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolvePosterUrl } from "../IndexRoute/MoviePoster.jsx";

const ratingToStars = (rating) => {
    const value = Math.round(Number(rating || 0) / 2);
    return Math.min(5, Math.max(0, value));
};

function WatchedMovies() {
    const [movies, setMovies] = useState([]);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let isMounted = true;

        const loadWatchedMovies = async () => {
            try {
                const response = await fetch("/api/watched-movies", {
                    method: "GET",
                    credentials: "include",
                });

                if (response.status === 401) {
                    if (isMounted) {
                        setStatus("unauthorized");
                    }
                    return;
                }

                if (!response.ok) {
                    throw new Error("Unable to load watched movies.");
                }

                const data = await response.json();

                if (isMounted) {
                    setMovies(Array.isArray(data) ? data : []);
                    setStatus("success");
                }
            } catch (error) {
                if (isMounted) {
                    setStatus("error");
                }
            }
        };

        loadWatchedMovies();

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="container text-center my-4">
                <p>Loading watched movies...</p>
            </div>
        );
    }

    if (status === "unauthorized") {
        return (
            <div className="container my-4">
                <div className="alert alert-dark text-center" role="alert">
                    You should log in to see your watched movies.
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="container my-4">
                <div className="alert alert-danger text-center" role="alert">
                    Unable to load watched movies.
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-center">Watched movies</h2>
            <div className="container-fluid text-center p-2">
                <div className="row gx-1 gy-2">
                    {movies.length === 0 ? <p>You have not rated any movies yet.</p> : null}
                    {movies.map((movie) => {
                        const filledStars = ratingToStars(movie.rating);

                        return (
                            <div className="col-4 col-sm-2 mb-2" key={movie.id}>
                                <Link to={`/movies/${movie.id}`} className="text-decoration-none">
                                    <div className="card rounded-4 text-bg-dark h-100 poster-new">
                                        <img
                                            className="rounded-top-4 img-fluid"
                                            src={resolvePosterUrl(movie.poster_path || movie.poster_url) || ""}
                                            alt={movie.title}
                                        />
                                        <div className="card-body p-1">
                                            <h5 id="stars-of-watched" className="card-title">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        id="star_rate"
                                                        style={{
                                                            color:
                                                                star <= filledStars
                                                                    ? "#D400F5"
                                                                    : "#444",
                                                        }}
                                                    >
                                                        &#9733;
                                                    </span>
                                                ))}
                                            </h5>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default WatchedMovies;
