import React, { useEffect, useState } from "react";
import MoviePoster from "./MoviePoster.jsx";

function GenreMovies({ genre, title }) {
    const [movies, setMovies] = useState([]);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let isMounted = true;

        const loadGenreMovies = async () => {
            try {
                const response = await fetch(`/api/${genre}-movies`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Unable to fetch genre movies.");
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

        setStatus("loading");
        loadGenreMovies();

        return () => {
            isMounted = false;
        };
    }, [genre]);

    return (
        <div className="container-fluid">
            <div className="row">
                <h4>{title}</h4>
                <div className="row-posters" id={`${genre}-row-posters`}>
                    {status === "loading" ? <p>Loading {genre} movies...</p> : null}
                    {status === "error" ? <p>Unable to load this section.</p> : null}
                    {status === "success" && movies.length === 0 ? <p>No movies available.</p> : null}
                    {status === "success"
                        ? movies.map((movie) => (
                              <MoviePoster
                                  key={movie.id}
                                  movie={movie}
                                  posterField="poster_path"
                              />
                          ))
                        : null}
                </div>
            </div>
        </div>
    );
}

export default GenreMovies;
