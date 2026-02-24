import React from "react";
import GenreMovies from "./GenreMovies.jsx";
import HeroSection from "./HeroSection.jsx";
import TopMovies from "./TopMovies.jsx";

const genreSections = [
    {
        genre: "drama",
        title: 'Drama "Tales of profound emotion and timeless conflict"',
    },
    {
        genre: "action",
        title: 'Action "Breathless narratives of adventure and adrenaline"',
    },
    {
        genre: "comedy",
        title: 'Comedy "Embrace the humor of these tales"',
    },
    {
        genre: "animation",
        title: 'Animation "Travel to enchanting animated worlds"',
    },
    {
        genre: "romance",
        title: 'Romance "Explore passion\'s captivating stories"',
    },
    {
        genre: "science",
        title: 'Sci-fi "Explore the unknown of alternative futures."',
    },
    {
        genre: "horror",
        title: 'Horror "Discover sinister depths of horror."',
    },
];

function Index() {
    return (
        <>
            <HeroSection />
            <TopMovies />
            {genreSections.map((section) => (
                <GenreMovies key={section.genre} genre={section.genre} title={section.title} />
            ))}
        </>
    );
}

export default Index;
