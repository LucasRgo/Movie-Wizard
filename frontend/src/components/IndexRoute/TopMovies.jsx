import React, { useEffect, useState } from "react";
import MoviePoster from "./MoviePoster";

function TopMovies() {
    const [movies, setMovies] = useState([]);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let isMounted = true;

        const loadTopMovies = async () => {
            try {
                const response = await fetch("/api/movies-top/", {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Unable to fetch top movies.");
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

        loadTopMovies();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="container-fluid">
            <div className="row">
                <h4>&quot;These films reign in our collection.&quot;</h4>
                <div className="row-posters" id="top-row-posters">
                    {status === "loading" ? <p>Loading top movies...</p> : null}
                    {status === "error" ? <p>Unable to load top movies.</p> : null}
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

export default TopMovies;
