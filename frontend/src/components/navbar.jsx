import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext.jsx";
import Search from "./IndexRoute/search.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

function Navbar() {
    const { isLoggedIn, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    async function submitLogout(event) {
        event.preventDefault();

        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    return (
        <div className="py-2 ms-auto me-auto" id="navbar-container">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded-5 p-2">
                <div className="container text-center">
                    <img src="/logo.png" alt="Gandalf" className="img-fluid" style={{ maxWidth: "15px" }} />
                    <Link className="navbar-brand" to="/" style={{ marginLeft: "5px" }}>
                        Movie Wizard
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbar"
                        aria-controls="navbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbar">
                        {isLoggedIn ? (
                            <>
                                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/watch-later">
                                            Watch Later
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/watched-movies">
                                            Watched
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/magic">
                                            Magic Recommendations
                                        </Link>
                                    </li>
                                    <li className="nav-item dropdown">
                                        <a
                                            className="nav-link dropdown-toggle"
                                            href="#"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            Menu
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <a className="dropdown-item" href="/change-password">
                                                    Change Password
                                                </a>
                                            </li>
                                            <li>
                                                <a className="dropdown-item" href="/delete-info">
                                                    Delete User Information
                                                </a>
                                            </li>
                                            <li>
                                                <a className="dropdown-item" href="/delete">
                                                    Delete Your Account
                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>

                                <Search
                                    mode="desktop"
                                    inputId="search_movies"
                                    resultsId="search_results"
                                    placeholder="Search for a movie..."
                                />

                                <form onSubmit={submitLogout} className="d-flex text-center">
                                    <button type="submit" className="btn btn-outline-light rounded-5 ms-1">
                                        Logout
                                    </button>
                                </form>
                            </>
                        ) : (
                            <ul className="navbar-nav ms-auto mt-2">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">
                                        Register
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">
                                        Log In
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
