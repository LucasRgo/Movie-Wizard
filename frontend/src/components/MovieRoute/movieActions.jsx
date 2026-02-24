import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

function MovieActions({ movieId, initialInWatchLater = false, onMessage }) {
    const [isInWatchLater, setIsInWatchLater] = useState(Boolean(initialInWatchLater));
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsInWatchLater(Boolean(initialInWatchLater));
    }, [initialInWatchLater]);

    const handleToggleWatchLater = async () => {
        if (!movieId || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/movies/${movieId}/add-to-watchlist/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                credentials: "include",
            });

            if (response.status === 401) {
                onMessage?.("You should log in to manage your watch later list.");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to update watch later list.");
            }

            const wasRemoved = data.status === "removed";
            setIsInWatchLater(!wasRemoved);
            onMessage?.(wasRemoved ? "Removed from watch later." : "Added to watch later.");
        } catch (error) {
            onMessage?.(error.message || "Unable to update watch later list.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="text-center my-3">
            <button
                className="btn btn-outline-light my-3"
                style={{ borderColor: "#D400F5" }}
                onClick={handleToggleWatchLater}
                disabled={isSubmitting}
                type="button"
            >
                {isSubmitting
                    ? "Updating..."
                    : isInWatchLater
                      ? "Remove from Watch Later"
                      : "Add to Watch Later"}
            </button>
        </div>
    );
}

export default MovieActions;
