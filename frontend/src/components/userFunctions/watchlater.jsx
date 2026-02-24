import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolvePosterUrl } from "../IndexRoute/MoviePoster";

function WatchLater() {
    const [movies, setMovies] = useState([]);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let isMounted = true;

        const loadWatchLater = async () => {
            try {
                const response = await fetch("/api/watchlater", {
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
                    throw new Error("Unable to load your watch later list.");
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

        loadWatchLater();

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="container text-center my-4">
                <p>Loading watch later list...</p>
            </div>
        );
    }

    if (status === "unauthorized") {
        return (
            <div className="container my-4">
                <div className="alert alert-dark text-center" role="alert">
                    You should log in to see your Watch Later list.
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="container my-4">
                <div className="alert alert-danger text-center" role="alert">
                    Unable to load your Watch Later list.
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-center">Watch Later</h2>
            <div className="container-fluid text-center p-2">
                <div className="row gx-1 gy-2">
                    {movies.length === 0 ? <p>No movies in your watch later list yet.</p> : null}
                    {movies.map((movie) => (
                        <div className="col-4 col-sm-2 mb-2" key={movie.id}>
                            <Link to={`/movies/${movie.id}`} className="text-decoration-none">
                                <div className="card rounded-4 text-bg-dark h-100 poster-new">
                                    <img
                                        className="rounded-top-4 img-fluid"
                                        src={resolvePosterUrl(movie.poster_path || movie.poster_url) || ""}
                                        alt={movie.title}
                                    />
                                    <div className="card-body p-1">
                                        <h5 className="card-title">{movie.year}</h5>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WatchLater;
