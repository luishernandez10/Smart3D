import { apiFetch } from "../api";
import React, { useState, useEffect } from "react";
import "./AdminTaller.css";
import AdminHeader from "../components/AdminHeader";

const API_URL = import.meta.env.VITE_API_URL + "/api/talleres";
console.log("🌐 API_URL Talleres:", API_URL);

const AdminTaller = () => {
  const [talleres, setTalleres] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [nuevoTaller, setNuevoTaller] = useState({ nombre: "", informacion: "" });
  const [tallerSeleccionado, setTallerSeleccionado] = useState(null);

  useEffect(() => {
    obtenerTalleres();
  }, []);

  const obtenerTalleres = async () => {
    try {
      const res = await apiFetch(API_URL);
      const data = await res.json();
      setTalleres(data);
    } catch (error) {
      console.error("Error al obtener talleres:", error);
    }
  };

  const handleAgregarTaller = async () => {
    if (!nuevoTaller.nombre || !nuevoTaller.informacion) return;

    try {
      const res = await apiFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoTaller),
      });

      if (!res.ok) throw new Error("Error en el servidor");

      const nuevo = await res.json();
      setTalleres([...talleres, nuevo]);
      setNuevoTaller({ nombre: "", informacion: "" });
      setMostrarModal(false);
    } catch (error) {
      console.error("Error al agregar taller:", error);
      alert("No se pudo agregar el taller.");
    }
  };

  const handleEliminar = async (id) => {
    try {
      await apiFetch(`${API_URL}/${id}`, { method: "DELETE" });
      setTalleres(talleres.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error al eliminar taller:", error);
    }
  };

  const handleEditar = async () => {
    if (!nuevoTaller.nombre || !nuevoTaller.informacion) return;
    try {
      const res = await apiFetch(`${API_URL}/${tallerSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoTaller),
      });

      const actualizado = await res.json();
      const actualizados = talleres.map((t) => (t.id === actualizado.id ? actualizado : t));
      setTalleres(actualizados);
      setMostrarEditar(false);
      setTallerSeleccionado(null);
    } catch (error) {
      console.error("Error al editar taller:", error);
    }
  };

  const abrirEditar = (taller) => {
    setTallerSeleccionado(taller);
    setNuevoTaller({ nombre: taller.nombre, informacion: taller.informacion });
    setMostrarEditar(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setMostrarEditar(false);
    setNuevoTaller({ nombre: "", informacion: "" });
  };

  return (
    <>
      <AdminHeader />
      <div className="admin-taller-banner">
        <img src="/img/pexels-photo-7985825.jpg" alt="Banner" className="banner-blur-img" />
        <div className="admin-taller-banner-content">
          <h2 className="titulo-admin-taller">Gestión de Talleres</h2>
        </div>
      </div>

      <div className="admin-taller-container">
        <div className="lista-talleres-header">
          <h3>Lista de talleres</h3>
          <button className="btn-agregar" onClick={() => setMostrarModal(true)}>Agregar Taller</button>
        </div>

        <table className="tabla-talleres">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Información</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {talleres.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.nombre}</td>
                <td>{t.informacion}</td>
                <td className="acciones-cell">
                  <button className="btn-ver" onClick={() => abrirEditar(t)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => handleEliminar(t.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(mostrarModal || mostrarEditar) && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>{mostrarModal ? "Agregar Taller" : "Editar Taller"}</h2>
            <label>Nombre</label>
            <input
              type="text"
              value={nuevoTaller.nombre}
              onChange={(e) => setNuevoTaller({ ...nuevoTaller, nombre: e.target.value })}
            />
            <label>Información</label>
            <textarea
              rows="4"
              value={nuevoTaller.informacion}
              onChange={(e) => setNuevoTaller({ ...nuevoTaller, informacion: e.target.value })}
            />
            <div className="modal-botones">
              <button className="btn-cancelar-modal" onClick={cerrarModal}>Cancelar</button>
              <button className="btn-agregar-modal" onClick={mostrarModal ? handleAgregarTaller : handleEditar}>
                {mostrarModal ? "Agregar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTaller;
