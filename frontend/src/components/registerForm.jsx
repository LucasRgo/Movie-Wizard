import React, { useState, useContext } from 'react';
import { AuthContext } from './authContext.jsx';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext); // Access register function from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleRegistration(e) {
    e.preventDefault();

    try {
      await register({ username, password });
      navigate('/'); // Navigate to the homepage upon successful registration
    } catch (error) {
      setError('Registration failed. Please try again.');
      console.error("Registration error:", error);
    }
  }

  return (
    <div className="container d-flex py-2 justify-content-center align-items-center">
      <div className="row w-100">
        <div className="col-md-6 mx-auto">
          <div className="card rounded-5">
            <div className="card-body p-5 text-bg-dark rounded-5">
              <div className="text-center mb-4">
                <img src="/logo.png" alt="Gandalf" className="img-fluid" style={{ maxWidth: '150px' }} />
                <div className="mt-3">
                  <div className="d-flex justify-content-center">
                    <i className="bi bi-film mx-1"></i>
                    <i className="bi bi-play-btn mx-1"></i>
                    <i className="bi bi-camera-reels mx-1"></i>
                  </div>
                </div>
              </div>
              <h2 className="text-center mb-4">Join Movie Wizard!</h2>
              {error && <p className="text-danger text-center">{error}</p>}
              <form onSubmit={handleRegistration}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="d-flex justify-content-center">
                  <button type="submit" className="btn btn-outline-light">
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
