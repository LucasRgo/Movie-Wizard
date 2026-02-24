import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";

const clampStars = (value) => Math.min(5, Math.max(0, value));
const toStars = (ratingFromApi) => clampStars(Math.round(Number(ratingFromApi || 0) / 2));
const toApiRating = (stars) => clampStars(stars) * 2;

function RatingComponent({ movieId, initialRating = 0, onMessage }) {
    const [selectedStars, setSelectedStars] = useState(toStars(initialRating));
    const [hoveredStars, setHoveredStars] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setSelectedStars(toStars(initialRating));
    }, [initialRating]);

    const visibleStars = hoveredStars || selectedStars;

    const stars = useMemo(() => [1, 2, 3, 4, 5], []);

    const submitRating = async (starValue) => {
        if (!movieId || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/movies/${movieId}/rate/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                credentials: "include",
                body: JSON.stringify({ rating: toApiRating(starValue) }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to save your rating.");
            }

            setSelectedStars(starValue);
            onMessage?.(data.message || "Rating saved.");
        } catch (error) {
            onMessage?.(error.message || "Unable to save your rating.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="stars" className="text-center my-3">
            <div
                className="star-rating"
                id="star-rating"
                onMouseLeave={() => setHoveredStars(0)}
            >
                {stars.map((star) => (
                    <span
                        key={star}
                        className="star"
                        data-value={star * 2}
                        onMouseEnter={() => setHoveredStars(star)}
                        onClick={() => submitRating(star)}
                        style={{
                            color: visibleStars >= star ? "#D400F5" : "#444",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            fontSize: "2rem",
                            margin: "0 2px",
                            userSelect: "none",
                        }}
                    >
                        &#9733;
                    </span>
                ))}
            </div>
        </div>
    );
}

export default RatingComponent;
