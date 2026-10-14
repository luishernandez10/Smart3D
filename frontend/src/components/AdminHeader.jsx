import { apiFetch } from "../api";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditar = () => {
    alert("Redirigiendo a edición de perfil...");
    // navigate("/editar-perfil"); // si ya tienes la ruta
  };

  const handleCerrarSesion = async () => {
    try { await apiFetch(import.meta.env.VITE_API_URL + '/api/auth/logout', { method: 'POST' }); }
    catch { /* La sesión del servidor caduca aunque falle la conexión. */ }
    finally {
      sessionStorage.removeItem('token'); sessionStorage.removeItem('usuario'); localStorage.removeItem('usuario');
      navigate("/login");
    }
  };

  const usuario = JSON.parse(sessionStorage.getItem("usuario")) || { username: "Admin", rol: "Sin rol" };

  return (
    <header className="admin-header">
      <div className="admin-header-logo">
        <img src="/img/logo.jpg" alt="logo" />
        <h2>Familia Smart</h2>
      </div>

      <div className="admin-header-user" ref={menuRef}>
        <div className="admin-user-info">
          <span className="admin-user-name">{usuario.username}</span>
          <span className="admin-user-role">{usuario.rol}</span>
        </div>
        <button
          className="admin-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú de usuario"
        >
          ☰
        </button>
        {menuOpen && (
          <div className="admin-dropdown">
            <button onClick={handleEditar}>Editar perfil</button>
            <button onClick={handleCerrarSesion}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
