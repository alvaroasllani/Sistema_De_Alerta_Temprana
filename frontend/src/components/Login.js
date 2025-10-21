import React, { useState } from 'react';
import { FaMountain, FaUser, FaLock, FaExclamationCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validación simple con condicional
    if (email === 'usuario1@ejemplo.com' && password === 'password123') {
      onLogin();
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <FaMountain />
          </div>
          <h1>Sistema de Alerta Temprana</h1>
          <p>Cuenca Taquiña</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Usuario</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario1@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-footer">
          <p>© 2024 Sistema de Alerta Temprana - Cuenca Taquiña</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

