import React, { useEffect, useState } from "react";
import Directors from "./directors.jsx";
import MoviePoster from "../IndexRoute/MoviePoster.jsx";

function MagicMovies() {
    const [magicMovies, setMagicMovies] = useState([]);
    const [directorsData, setDirectorsData] = useState([]);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let isMounted = true;

        const loadMagicPageData = async () => {
            try {
                const [magicResponse, directorsResponse] = await Promise.all([
                    fetch("/api/magic", {
                        method: "GET",
                        credentials: "include",
                    }),
                    fetch("/api/directors", {
                        method: "GET",
                        credentials: "include",
                    }),
                ]);

                if (!magicResponse.ok || !directorsResponse.ok) {
                    throw new Error("Unable to load recommendations.");
                }

                const [magicData, directorsPayload] = await Promise.all([
                    magicResponse.json(),
                    directorsResponse.json(),
                ]);

                if (isMounted) {
                    setMagicMovies(Array.isArray(magicData) ? magicData : []);
                    setDirectorsData(Array.isArray(directorsPayload) ? directorsPayload : []);
                    setStatus("success");
                }
            } catch (error) {
                if (isMounted) {
                    setStatus("error");
                }
            }
        };

        loadMagicPageData();

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="container text-center my-4">
                <p>Loading magic recommendations...</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="container text-center my-4">
                <div className="alert alert-danger rounded-4" role="alert">
                    Unable to load recommendations right now.
                </div>
            </div>
        );
    }

    return (
        <>
            <section>
                <div className="container-xl">
                    <div className="row text-center">
                        <h2>
                            &quot;Handpicked with help of magic, these movies are your perfect match&quot;
                        </h2>
                        <div className="row-posters" id="top-row-posters">
                            {magicMovies.length === 0 ? <p>No recommendations found.</p> : null}
                            {magicMovies.map((movie) => (
                                <MoviePoster
                                    key={movie.id}
                                    movie={movie}
                                    posterField="poster_path"
                                    rounded={true}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Directors directorsData={directorsData} />
        </>
    );
}

export default MagicMovies;
