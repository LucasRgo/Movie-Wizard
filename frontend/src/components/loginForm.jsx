import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext.jsx';

const LoginForm = () => {
  const { login } = useContext(AuthContext); // Access login function from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function submitLogin(e) {
    e.preventDefault();

    try {
      await login({ username, password });
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  return (
    <div className="container d-flex py-2 mb-5 justify-content-center align-items-center">
      <div className="card text-bg-dark rounded-5 w-100">
        <div className="row">
          <div className="col-md-3 d-flex flex-column align-items-center justify-content-center text-center p-4">
            <img src="logo.png" alt="Gandalf" className="img-fluid" style={{ maxWidth: '70px' }} />
            <div className="d-flex my-2">
              <i className="bi bi-film mx-1"></i>
              <i className="bi bi-play-btn mx-1"></i>
              <i className="bi bi-camera-reels mx-1"></i>
            </div>
            <h3 className="mb-3" style={{ color: 'rgb(255, 255, 255)' }}>
              Welcome to the Movie Wizard!
            </h3>
            <form onSubmit={submitLogin}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control mx-auto w-auto"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control mx-auto w-auto"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-outline-light rounded-4">
                Log in
              </button>
            </form>
          </div>
          <div className="col-md-9 rounded-5">
            <img src="blade.jpg" alt="Blade Runner 2049" className="img-fluid rounded-5 w-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
