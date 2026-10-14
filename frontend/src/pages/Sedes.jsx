import { apiFetch } from "../api";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Sedes.css";
import AdminHeader from "../components/AdminHeader";
import { FaEye, FaEdit, FaTrashAlt, FaPlus, FaTimes, FaSave } from "react-icons/fa";

// ✅ Variable de entorno para Vite
const API_URL = import.meta.env.VITE_API_URL;

const Sedes = () => {
  const navigate = useNavigate();

  const [sedes, setSedes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaSede, setNuevaSede] = useState({
    nombre: "",
    direccion: "",
    distrito: "",
    estado: "Activo"
  });

  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const res = await apiFetch(`${API_URL}/api/sedes`);
        const data = await res.json();
        setSedes(data);
      } catch (error) {
        console.error("Error al cargar sedes:", error);
      }
    };
    cargarSedes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaSede({ ...nuevaSede, [name]: value });
  };

  const handleGuardar = async () => {
    if (!nuevaSede.nombre.trim() || !nuevaSede.direccion.trim()) {
      return alert("Por favor completa los campos obligatorios.");
    }

    try {
      const url = editandoId
        ? `${API_URL}/api/sedes/${editandoId}`
        : `${API_URL}/api/sedes`;
      const metodo = editandoId ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaSede)
      });

      if (!res.ok) throw new Error("Error al guardar sede");

      const result = await res.json();

      if (editandoId) {
        setSedes(sedes.map(s => (s.id === editandoId ? result : s)));
      } else {
        setSedes([result, ...sedes]);
      }

      setNuevaSede({ nombre: "", direccion: "", distrito: "", estado: "Activo" });
      setMostrarModal(false);
      setEditandoId(null);
    } catch (error) {
      console.error("Error al guardar sede:", error);
      alert("Hubo un error al guardar la sede.");
    }
  };

  const handleEditar = (sede) => {
    setNuevaSede(sede);
    setEditandoId(sede.id);
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta sede?")) return;

    try {
      const res = await apiFetch(`${API_URL}/api/sedes/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error al eliminar sede");

      setSedes(sedes.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error al eliminar sede:", error);
      alert("Hubo un error al eliminar la sede.");
    }
  };

  return (
    <div className="sedes-container">
      <AdminHeader />
      <h2 className="titulo">Sedes</h2>

      <div className="sedes-lista">
        <div className="sedes-header">
          <h3>Lista de sedes</h3>
          <button className="btn-agregar" onClick={() => {
            setMostrarModal(true);
            setNuevaSede({ nombre: "", direccion: "", distrito: "", estado: "Activo" });
            setEditandoId(null);
          }}>
            <FaPlus size={12} /> Agregar
          </button>
        </div>

        <ul className="sedes-items">
          {sedes.map((sede) => (
            <li key={sede.id} className="sede-item">
              <span>{sede.nombre}</span>
              <div>
                <button className="btn-ver" onClick={() => navigate(`/sedes/${sede.id}`)}>
                  <FaEye size={12} /> Ver
                </button>
                <button className="btn-editar" onClick={() => handleEditar(sede)}>
                  <FaEdit size={12} /> Editar
                </button>
                <button className="btn-eliminar" onClick={() => handleEliminar(sede.id)}>
                  <FaTrashAlt size={12} /> Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editandoId ? "Editar Sede" : "Agregar Nueva Sede"}</h3>
            <input type="text" name="nombre" placeholder="Nombre" value={nuevaSede.nombre} onChange={handleChange} />
            <input type="text" name="direccion" placeholder="Dirección" value={nuevaSede.direccion} onChange={handleChange} />
            <input type="text" name="distrito" placeholder="Distrito" value={nuevaSede.distrito} onChange={handleChange} />
            <select name="estado" value={nuevaSede.estado} onChange={handleChange}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <div className="modal-buttons">
              <button className="btn-cancelar" onClick={() => {
                setMostrarModal(false);
                setEditandoId(null);
              }}>
                <FaTimes size={12} /> Cancelar
              </button>
              <button className="btn-guardar" onClick={handleGuardar}>
                <FaSave size={12} /> {editandoId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sedes;
