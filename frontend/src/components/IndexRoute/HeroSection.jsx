import React from "react";
import { Link } from "react-router-dom";
import Search from "./search";

function HeroSection() {
    return (
        <>
            <div className="mobile-only">
                <div className="container text-center">
                    <div className="search-container-mobile rounded-5">
                        <h2>Search for movies</h2>
                        <Search
                            mode="mobile"
                            inputId="search_movies_mobile"
                            resultsId="search_results_mobile"
                            placeholder="Enter movie title..."
                        />
                    </div>
                </div>
            </div>

            <div className="mobile-only my-4">
                <div className="text-center">
                    <div className="button-container">
                        <Link to="/magic" className="magic-button">
                            Magic Recommendations
                        </Link>
                    </div>
                </div>
            </div>

            <div className="pc-only">
                <div id="wizard-warning" className="container-sm text-center my-4">
                    <div className="card text-bg-dark rounded-pill">
                        <div className="row">
                            <div className="col-md-4 rounded-pill">
                                <img
                                    src="/good.jpg"
                                    alt="wizard"
                                    className="img-fluid rounded-pill"
                                />
                            </div>
                            <div className="col-md-8">
                                <div className="card-body">
                                    <h1 className="display-6 mt-2">&quot;Come lad! I&apos;ll unveil the</h1>
                                    <h1 className="display-6 mt-2">wonders of cinema to you!&quot;</h1>
                                    <h1 style={{ marginTop: "1rem" }} className="blockquote-footer">
                                        Movie Wizard
                                    </h1>
                                    <div className="button-container">
                                        <Link to="/magic" className="magic-button mt-3">
                                            Magic Recommendations
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HeroSection;
