import { apiFetch } from "../api";
import React, { useState, useEffect } from "react";
import "./Inscripciones.css";
import AdminHeader from "../components/AdminHeader";
import { api as axios } from "../api";

const API_URL = import.meta.env.VITE_API_URL;
console.log("🌐 API_URL Inscripciones:", API_URL);

const Inscripciones = () => {
  const [tallerActivo, setTallerActivo] = useState("kids");

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fecha: "",
    dni: "",
    grado: "",
    telefono: "",
    pago: "Pendiente",
    sede: "",
  });

  const [filtros, setFiltros] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    grado: "",
    telefono: "",
    pago: "",
    sede: "",
  });

  const [registros, setRegistros] = useState([]);

  const endpointBase = (tipo) =>
    `${API_URL}/api/inscripciones/${tipo === "kids" ? "robokids" : "robojuniors"}`;

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistrar = async () => {
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.sede) return;

    const endpoint = endpointBase(tallerActivo);
    const fechaValida = formData.fecha ? new Date(formData.fecha).toISOString() : null;

    try {
      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: formData.nombre,
          apellidos: formData.apellido,
          dni: formData.dni,
          fecha: fechaValida,
          grado: formData.grado,
          telefono: formData.telefono,
          pago: formData.pago,
          sede: formData.sede,
        }),
      });

      setFormData({
        nombre: "",
        apellido: "",
        fecha: "",
        dni: "",
        grado: "",
        telefono: "",
        pago: "Pendiente",
        sede: "",
      });

      cargarRegistros();
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  const cargarRegistros = async () => {
    try {
      const endpoint = endpointBase(tallerActivo);
      const queryParams = new URLSearchParams({
        nombres: filtros.nombre,
        apellidos: filtros.apellido,
        dni: filtros.dni,
        grado: filtros.grado,
        telefono: filtros.telefono,
        pago: filtros.pago,
        sede: filtros.sede,
      });

      const response = await axios.get(`${endpoint}?${queryParams.toString()}`);
      const registrosConTaller = response.data.map((reg) => ({
        ...reg,
        fecha: reg.fecha ? new Date(reg.fecha).toLocaleDateString("es-PE") : "",
        taller: tallerActivo === "kids" ? "Kids" : "Juniors",
      }));
      setRegistros(registrosConTaller);
    } catch (error) {
      console.error("Error al cargar registros:", error);
    }
  };

  const marcarComoPagado = async (id) => {
    try {
      const endpoint = `${endpointBase(tallerActivo)}/${id}`;
      await axios.patch(endpoint, { pago: "Pagado" });
      cargarRegistros();
    } catch (err) {
      console.error("Error al actualizar pago:", err);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, [tallerActivo, filtros]);

  return (
    <div className="inscripciones-container">
      <AdminHeader />

      <div className="inscripciones-banner-blur">
        <div className="inscripciones-banner-content">
          <h2 className="titulo-inscripciones">Inscripciones</h2>
        </div>
      </div>

      <div className="botones-taller">
        <button
          className={tallerActivo === "kids" ? "activo" : ""}
          onClick={() => setTallerActivo("kids")}
        >
          Robo Kids
        </button>
        <button
          className={tallerActivo === "juniors" ? "activo" : ""}
          onClick={() => setTallerActivo("juniors")}
        >
          Robo Juniors
        </button>
      </div>

      {/* 📌 FORMULARIO DE REGISTRO */}
      <div className="filtros">
        <input name="apellido" value={formData.apellido} onChange={handleChangeForm} placeholder="Apellidos" />
        <input name="nombre" value={formData.nombre} onChange={handleChangeForm} placeholder="Nombres" />
        <input name="fecha" type="date" value={formData.fecha} onChange={handleChangeForm} />
        <input name="dni" value={formData.dni} onChange={handleChangeForm} placeholder="DNI" />
        <input name="grado" value={formData.grado} onChange={handleChangeForm} placeholder="Grado" />
        <input name="telefono" value={formData.telefono} onChange={handleChangeForm} placeholder="Teléfono" />
        <select name="pago" value={formData.pago} onChange={handleChangeForm}>
          <option value="Pendiente">Pendiente</option>
          <option value="Pagado">Pagado</option>
        </select>
        <select name="sede" value={formData.sede} onChange={handleChangeForm}>
          <option value="">Seleccionar sede</option>
          <option value="Trujillo">Trujillo</option>
          <option value="Víctor Larco">Víctor Larco</option>
          <option value="El Porvenir">El Porvenir</option>
        </select>
        <button className="btn-registrar" onClick={handleRegistrar}>Registrar</button>
      </div>

      {/* 📌 FILTROS DE BÚSQUEDA */}
      <div className="filtros">
        <input name="apellido" value={filtros.apellido} onChange={handleChangeFiltro} placeholder="Filtrar Apellidos" />
        <input name="nombre" value={filtros.nombre} onChange={handleChangeFiltro} placeholder="Filtrar Nombres" />
        <input name="dni" value={filtros.dni} onChange={handleChangeFiltro} placeholder="Filtrar DNI" />
        <input name="grado" value={filtros.grado} onChange={handleChangeFiltro} placeholder="Filtrar Grado" />
        <input name="telefono" value={filtros.telefono} onChange={handleChangeFiltro} placeholder="Filtrar Teléfono" />
        <select name="pago" value={filtros.pago} onChange={handleChangeFiltro}>
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Pagado">Pagado</option>
        </select>
        <select name="sede" value={filtros.sede} onChange={handleChangeFiltro}>
          <option value="">Todas las sedes</option>
          <option value="Trujillo">Trujillo</option>
          <option value="Víctor Larco">Víctor Larco</option>
          <option value="El Porvenir">El Porvenir</option>
        </select>
      </div>

      {/* 📌 TABLA DE INSCRIPCIONES */}
      <table className="tabla-inscripciones">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Apellidos</th>
            <th>Nombres</th>
            <th>DNI</th>
            <th>Grado</th>
            <th>Teléfono</th>
            <th>Sede</th>
            <th>Taller</th>
            <th>Pago</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((reg, i) => (
            <tr key={i}>
              <td>{reg.fecha}</td>
              <td>{reg.apellidos}</td>
              <td>{reg.nombres}</td>
              <td>{reg.dni}</td>
              <td>{reg.grado}</td>
              <td>{reg.telefono}</td>
              <td>{reg.sede}</td>
              <td>{reg.taller}</td>
              <td>{reg.pago}</td>
              <td>
                {reg.pago === "Pendiente" ? (
                  <button onClick={() => marcarComoPagado(reg.id)}>✔ Marcar</button>
                ) : (
                  "✔"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inscripciones;
