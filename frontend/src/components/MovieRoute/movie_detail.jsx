import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MovieActions from "./movieActions";
import RatingComponent from "./ratingComponent";
import SimilarMovies from "./SimilarMovies";
import { resolvePosterUrl } from "../IndexRoute/MoviePoster";

function MovieDetail() {
    const { movie_id: movieIdParam } = useParams();
    const [movie, setMovie] = useState(null);
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!movieIdParam) {
            setStatus("error");
            return undefined;
        }

        let isMounted = true;

        const loadMovieDetail = async () => {
            try {
                const response = await fetch(`/api/movies/${movieIdParam}/`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Movie not found.");
                }

                if (isMounted) {
                    setMovie(data);
                    setStatus("success");
                }
            } catch (error) {
                if (isMounted) {
                    setStatus("error");
                    setMessage(error.message || "Unable to load movie details.");
                }
            }
        };

        setStatus("loading");
        setMessage("");
        loadMovieDetail();

        return () => {
            isMounted = false;
        };
    }, [movieIdParam]);

    if (status === "loading") {
        return (
            <div className="container text-center my-4">
                <p>Loading movie details...</p>
            </div>
        );
    }

    if (status === "error" || !movie) {
        return (
            <div className="container text-center my-4">
                <div className="alert alert-danger rounded-4" role="alert">
                    {message || "Unable to load movie details."}
                </div>
            </div>
        );
    }

    const posterUrl = resolvePosterUrl(movie.poster_url);

    return (
        <>
            <div
                id="background"
                style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
            ></div>
            <div id="content" className="container text-center">
                <div className="card mb-3 text-bg-dark rounded-5">
                    <div className="row g-0">
                        <div className="col-md-5">
                            <img
                                id="movie_poster"
                                src={posterUrl || ""}
                                className="img-fluid rounded shadow card-img rounded-5"
                                alt={movie.title}
                            />
                        </div>
                        <div className="col-md-7">
                            <div id="card-body" className="card-body">
                                <h1 className="display-3">{movie.title}</h1>
                                <p className="fw-bold">{movie.year}</p>
                                <h5>{movie.synopsis}</h5>
                                <h4>Director: {movie.director}</h4>

                                <MovieActions
                                    movieId={movie.id}
                                    initialInWatchLater={movie.is_in_watchlater}
                                    onMessage={setMessage}
                                />
                                <RatingComponent
                                    movieId={movie.id}
                                    initialRating={movie.user_rating}
                                    onMessage={setMessage}
                                />

                                <div id="message">{message}</div>
                                <p id="the-movie-id" data-user-rating={movie.user_rating}>
                                    {movie.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SimilarMovies movieId={movie.id} />
        </>
    );
}

export default MovieDetail;
