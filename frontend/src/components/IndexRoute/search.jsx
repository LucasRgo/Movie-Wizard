import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolvePosterUrl } from "./MoviePoster";

function Search({
    mode = "desktop",
    inputId,
    resultsId,
    placeholder = "Search for a movie...",
}) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const isDesktop = mode === "desktop";
    const finalInputId = inputId || (isDesktop ? "search_movies" : "search_movies_mobile");
    const finalResultsId = resultsId || (isDesktop ? "search_results" : "search_results_mobile");

    useEffect(() => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            setResults([]);
            setIsLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            setIsLoading(true);

            try {
                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(trimmedQuery)}`,
                    {
                        method: "GET",
                        credentials: "include",
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    setResults([]);
                    return;
                }

                const data = await response.json();
                setResults(Array.isArray(data) ? data : []);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setResults([]);
                }
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [query]);

    const listClassName = useMemo(() => {
        if (isDesktop) {
            return "rounded-bottom-4 pc-only";
        }

        return "rounded-4";
    }, [isDesktop]);

    const openMovie = (movieId) => {
        setResults([]);
        setQuery("");
        navigate(`/movies/${movieId}`);
    };

    const renderResultItem = (movie) => {
        if (isDesktop) {
            const posterUrl = resolvePosterUrl(movie.poster_url || movie.poster_path);

            return (
                <li
                    key={movie.id}
                    onClick={() => openMovie(movie.id)}
                    className="movie-grid-item"
                >
                    <div id="movie-poster">
                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                alt={`Poster of ${movie.title}`}
                                className="poster-image"
                            />
                        ) : null}
                    </div>
                    <div className="movie-details">
                        <h5 className="movie-title mb-0">{movie.year} - {movie.title}</h5>
                        <div className="movie-director mt-0">Director: {movie.director}</div>
                    </div>
                </li>
            );
        }

        return (
            <li key={movie.id} onClick={() => openMovie(movie.id)}>
                {movie.year} - {movie.title} (Dir. {movie.director})
            </li>
        );
    };

    return (
        <>
            {isDesktop ? (
                <div className="search-container pc-only">
                    <form className="search-form" onSubmit={(event) => event.preventDefault()}>
                        <input
                            id={finalInputId}
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={placeholder}
                            autoComplete="on"
                        />
                    </form>
                </div>
            ) : (
                <form className="search-form-mobile" onSubmit={(event) => event.preventDefault()}>
                    <input
                        id={finalInputId}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={placeholder}
                        autoComplete="off"
                    />
                </form>
            )}

            <ul id={finalResultsId} className={listClassName}>
                {isLoading ? <li>Searching...</li> : results.map(renderResultItem)}
            </ul>
        </>
    );
}

export default Search;
