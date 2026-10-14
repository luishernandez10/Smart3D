import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Asegúrate de que esté el path correcto

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      if (res.status === 200) {
        sessionStorage.setItem('token', res.data.token);
        sessionStorage.setItem('usuario', JSON.stringify(res.data.docente));
        localStorage.removeItem('usuario');
        navigate('/campus');
      }
    } catch {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="container">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleLogin}>
        <div className="input-box">
          <input
            type="text"
            placeholder="Correo o Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <i className="fas fa-user"></i>
        </div>

        <div className="input-box">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i className="fas fa-lock"></i>
        </div>

        {error && <p className="error" style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

        <div className="forgot-link">
          <a href="#">¿Olvidaste tu contraseña?</a>
        </div>

        <button type="submit" className="btn">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
