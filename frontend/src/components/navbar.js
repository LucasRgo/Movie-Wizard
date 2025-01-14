import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const navigate = useNavigate();

  async function submitLogout(e) {
    e.preventDefault();

    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const trimmedQuery = searchQuery.trim();

      // If the input is empty, clear the search results
      if (trimmedQuery === '') {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/search?q=${trimmedQuery}`);
        if (response.ok) {
          const results = await response.json();
          console.log(results);
          setSearchResults(results);
        } else {
          console.error("Failed to fetch search results");
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    }, 300);

    // Clear timeout if searchQuery changes before timeout completes
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="py-2 ms-auto me-auto" id="navbar-container" >
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded-5 p-2">
        <div className="container text-center">
          <img src="/logo.png" alt="Gandalf" className="img-fluid" style={{ maxWidth: '15px' }} />
          <a className="navbar-brand" href="/" style={{ marginLeft: '5px' }}>Movie Wizard</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbar">
            {isLoggedIn ? (
              <>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item"><a className="nav-link" href="/watch-later">Watch Later</a></li>
                  <li className="nav-item"><a className="nav-link" href="/watched-movies">Watched</a></li>
                  <li className="nav-item"><a className="nav-link" href="/magic">Magic Recommendations</a></li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">Menu</a>
                    <ul className="dropdown-menu">
                      <li><a className="dropdown-item" href="/change-password">Change Password</a></li>
                      <li><a className="dropdown-item" href="/delete-info">Delete User Information</a></li>
                      <li><a className="dropdown-item" href="/delete">Delete Your Account</a></li>
                    </ul>
                  </li>
                </ul>

                <div className="search-container pc-only">
                  <form className="search-form">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search for a movie..."
                      autoFocus
                      autoComplete="on"
                    />
                  </form>
                </div>
                <form onSubmit={submitLogout} className="d-flex text-center">
                  <button type="submit" className="btn btn-outline-light rounded-5 ms-1">Logout</button>
                </form>
              </>
            ) : (
              <ul className="navbar-nav ms-auto mt-2">
                <li className="nav-item"><a className="nav-link" href="/register">Register</a></li>
                <li className="nav-item"><a className="nav-link" href="/login">Log In</a></li>
              </ul>
            )}
          </div>
        </div>
      </nav>
      <div className="container-md">
      <ul id="search_results" className="rounded-bottom-4 pc-only">
        {searchResults.map((movie) => (
          <li
            onClick={() => {
              window.location.href = `/movies/${movie.id}`;
            }}
            key={movie.id}
            className="movie-grid-item"
          >
            <div id="movie-poster">
              <img
                src={movie.poster_url}
                alt={`Poster de ${movie.title}`}
                className="poster-image"
              />
            </div>
            <div className="movie-details">
              <h5 className="movie-title mb-0">{movie.year} - {movie.title}</h5>
              <div className="movie-director mt-0">Director: {movie.director}</div>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

export default Navbar;
