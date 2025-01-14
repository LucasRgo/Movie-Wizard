// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MovieDetail from './components/MovieRoute/movie_detail';
import RegisterForm from './components/registerForm';
import LoginForm from './components/loginForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import Index from './components/IndexRoute/index'
import Navbar from './components/navbar';
import Footer from './components/footer';
import WatchLater from './components/userFunctions/watchlater';
import RatedMovies from './components/userFunctions/watched';
import MagicMovies from './components/magicComponents/fiveMovies';
import React from 'react';
import './css/style.css'

function App() {

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/watch-later" element={<WatchLater />} />
        <Route path="/magic" element={<MagicMovies />} />
        <Route path="/watched-movies" element={<RatedMovies />} />
        <Route path="/movies/:movie_id" element={<MovieDetail />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
