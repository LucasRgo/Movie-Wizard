import React from "react";
import { useNavigate } from "react-router-dom";

export const resolvePosterUrl = (rawPoster) => {
    if (!rawPoster) {
        return null;
    }

    if (typeof rawPoster !== "string") {
        return null;
    }

    const trimmed = rawPoster.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const duplicatedPrefix = "https://image.tmdb.org/t/p/w500https://";
        if (trimmed.startsWith(duplicatedPrefix)) {
            return trimmed.replace("https://image.tmdb.org/t/p/w500", "");
        }

        return trimmed;
    }

    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `https://image.tmdb.org/t/p/w500${cleanPath}`;
};

function MoviePoster({ movie, posterField = "poster_url", rounded = false }) {
    const navigate = useNavigate();

    if (!movie) {
        return null;
    }

    const posterUrl = resolvePosterUrl(
        movie[posterField] ?? movie.poster_url ?? movie.poster_path,
    );

    const handleOpenMovie = () => {
        navigate(`/movies/${movie.id}`);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenMovie();
        }
    };

    const posterClassName = `row-poster${rounded ? " rounded-4" : ""}`;

    if (!posterUrl) {
        return (
            <div
                className={posterClassName}
                onClick={handleOpenMovie}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1a1a1a",
                    color: "#b9b9b9",
                    minHeight: "180px",
                }}
            >
                Poster unavailable
            </div>
        );
    }

    return (
        <img
            src={posterUrl}
            alt={movie.title || "Movie Poster"}
            className={posterClassName}
            onClick={handleOpenMovie}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
        />
    );
}

export default MoviePoster;
