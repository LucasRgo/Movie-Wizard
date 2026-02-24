import React, { useEffect, useState } from "react";
import MoviePoster from "../IndexRoute/MoviePoster";

function SimilarMovies({ movieId }) {
    const [movies, setMovies] = useState([]);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        if (!movieId) {
            setMovies([]);
            setStatus("success");
            return undefined;
        }

        let isMounted = true;

        const loadSimilarMovies = async () => {
            try {
                const response = await fetch(`/api/similar/${movieId}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Unable to fetch similar movies.");
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
        loadSimilarMovies();

        return () => {
            isMounted = false;
        };
    }, [movieId]);

    return (
        <section>
            <div className="container-fluid mt-5">
                <div className="row text-center">
                    <h4>&quot;These movies share the same kind of magic&quot;</h4>
                    <div className="row-posters" id="similar-row-posters">
                        {status === "loading" ? <p>Loading similar movies...</p> : null}
                        {status === "error" ? <p>Unable to load similar movies.</p> : null}
                        {status === "success" && movies.length === 0 ? <p>No similar movies found.</p> : null}
                        {status === "success"
                            ? movies.map((movie) => (
                                  <MoviePoster
                                      key={movie.id}
                                      movie={movie}
                                      posterField="poster_url"
                                  />
                              ))
                            : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SimilarMovies;
