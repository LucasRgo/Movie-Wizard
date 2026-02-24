import React from "react";
import MoviePoster from "../IndexRoute/MoviePoster.jsx";

function Directors({ directorsData = [] }) {
    if (!directorsData.length) {
        return null;
    }

    return (
        <section>
            <h2 className="text-center mt-2">
                &quot;It would be wise to see more of the work of these directors&quot;
            </h2>
            <div className="container-xl">
                <div className="row text-center mt-4">
                    {directorsData.map((directorData, index) => (
                        <React.Fragment key={`${directorData.director}-${index}`}>
                            <h3>
                                <span className="director-name">{directorData.director}</span>
                            </h3>
                            <div className="row-posters" id={`director-${index}-posters`}>
                                {(directorData.movies || []).map((movie) => (
                                    <MoviePoster
                                        key={movie.id}
                                        movie={movie}
                                        posterField="poster_url"
                                        rounded={true}
                                    />
                                ))}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Directors;
