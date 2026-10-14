import { apiFetch } from "../api";
import React, { useState, useEffect } from "react";
import "./Docentes.css";
import AdminHeader from "../components/AdminHeader";

const API_URL = import.meta.env.VITE_API_URL;
console.log("🌐 API_URL actual:", API_URL);

const Docentes = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [listaDocentes, setListaDocentes] = useState([]);
  const [editandoIndex, setEditandoIndex] = useState(null);

  const [datosDocente, setDatosDocente] = useState({
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
    telefono: "",
    direccion: "",
    fechaContrato: "",
    rol: "Docente",
    username: "",
    password: "",
    confirmarPassword: ""
  });

  useEffect(() => {
    const cargarDocentes = async () => {
      try {
        const res = await apiFetch(`${API_URL}/api/docentes`);
        if (!res.ok) throw new Error("No se pudo cargar la lista de docentes");
        const data = await res.json();
        setListaDocentes(data);
      } catch (error) {
        console.error(error);
        alert("Error al cargar docentes");
      }
    };

    cargarDocentes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosDocente({ ...datosDocente, [name]: value });
  };

  const siguientePaso = () => setPasoActual(pasoActual + 1);
  const pasoAnterior = () => setPasoActual(pasoActual - 1);

  const registrarDocente = async () => {
    const docenteSinConfirmar = Object.fromEntries(
      ['nombres', 'apellidos', 'fechaNacimiento', 'telefono', 'direccion', 'fechaContrato', 'rol', 'username', 'password']
        .map(key => [key, datosDocente[key]])
    );
    if (datosDocente.password !== datosDocente.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (editandoIndex !== null) {
      const id = listaDocentes[editandoIndex].id;
      try {
        const res = await apiFetch(`${API_URL}/api/docentes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(docenteSinConfirmar)
        });

        if (!res.ok) throw new Error("Error al actualizar docente");

        const actualizado = await res.json();
        const copia = [...listaDocentes];
        copia[editandoIndex] = actualizado;
        setListaDocentes(copia);
      } catch (error) {
        console.error(error);
        alert("Error al actualizar docente");
      }
    } else {
      try {
        const res = await apiFetch(`${API_URL}/api/docentes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(docenteSinConfirmar)
        });
        if (!res.ok) throw new Error("Error al guardar docente");
        const nuevo = await res.json();
        setListaDocentes([...listaDocentes, nuevo]);
      } catch (error) {
        console.error(error);
        alert("Hubo un error al guardar el docente");
      }
    }

    setDatosDocente({
      nombres: "",
      apellidos: "",
      fechaNacimiento: "",
      telefono: "",
      direccion: "",
      fechaContrato: "",
      rol: "Docente",
      username: "",
      password: "",
      confirmarPassword: ""
    });

    setPasoActual(1);
    setMostrarFormulario(false);
    setEditandoIndex(null);
  };

  const eliminarDocente = async (id) => {
    try {
      const res = await apiFetch(`${API_URL}/api/docentes/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error al eliminar docente");
      setListaDocentes(listaDocentes.filter(doc => doc.id !== id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar docente");
    }
  };

  const editarDocente = (index) => {
    const docente = listaDocentes[index];
    setDatosDocente({
      ...docente,
      password: "",
      fechaNacimiento: docente.fechaNacimiento?.substring(0, 10),
      fechaContrato: docente.fechaContrato?.substring(0, 10),
      confirmarPassword: ""
    });
    setEditandoIndex(index);
    setPasoActual(1);
    setMostrarFormulario(true);
  };

  return (
    <>
      <AdminHeader />

      <div className="admin-taller-banner">
        <img src="/img/pexels-photo-7985825.jpg" alt="Banner" className="banner-blur-img" />
        <div className="admin-taller-banner-content">
          <h2 className="titulo-admin-taller">Docentes</h2>
        </div>
      </div>

      <div className="admin-taller-container">
        <div className="lista-talleres-header">
          <h3>Lista de docentes</h3>
          <button className="btn-agregar" onClick={() => {
            setMostrarFormulario(true);
            setDatosDocente({
              nombres: "",
              apellidos: "",
              fechaNacimiento: "",
              telefono: "",
              direccion: "",
              fechaContrato: "",
              rol: "Docente",
              username: "",
              password: "",
              confirmarPassword: ""
            });
            setEditandoIndex(null);
            setPasoActual(1);
          }}>Agregar</button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-docente">
            <div className="pasos">
              <span className={pasoActual === 1 ? "paso activo" : "paso"}>1. Datos Personales</span>
              <span className={pasoActual === 2 ? "paso activo" : "paso"}>2. Académico</span>
              <span className={pasoActual === 3 ? "paso activo" : "paso"}>3. Usuario</span>
            </div>

            <h4>Registro de docente</h4>

            {pasoActual === 1 && (
              <div className="grid-form">
                <div><label>Nombres</label><input name="nombres" value={datosDocente.nombres} onChange={handleInputChange} /></div>
                <div><label>Apellidos</label><input name="apellidos" value={datosDocente.apellidos} onChange={handleInputChange} /></div>
                <div><label>Fecha de nacimiento</label><input type="date" name="fechaNacimiento" value={datosDocente.fechaNacimiento} onChange={handleInputChange} /></div>
                <div><label>Teléfono</label><input name="telefono" value={datosDocente.telefono} onChange={handleInputChange} /></div>
                <div className="full-width"><label>Dirección</label><input name="direccion" value={datosDocente.direccion} onChange={handleInputChange} /></div>
              </div>
            )}

            {pasoActual === 2 && (
              <div className="grid-form">
                <div><label>Fecha de contrato</label><input type="date" name="fechaContrato" value={datosDocente.fechaContrato} onChange={handleInputChange} /></div>
                <div><label>Rol</label><input name="rol" value={datosDocente.rol} onChange={handleInputChange} /></div>
              </div>
            )}

            {pasoActual === 3 && (
              <div className="grid-form">
                <div><label>Username</label><input name="username" value={datosDocente.username} onChange={handleInputChange} /></div>
                <div><label>Contraseña</label><input type="password" name="password" value={datosDocente.password} onChange={handleInputChange} /></div>
                <div><label>Confirmar Contraseña</label><input type="password" name="confirmarPassword" value={datosDocente.confirmarPassword} onChange={handleInputChange} /></div>
              </div>
            )}

            <div className="botones-formulario">
              {pasoActual > 1 && <button className="btn-cancelar" onClick={pasoAnterior}>Atrás</button>}
              {pasoActual < 3 && <button className="btn-siguiente" onClick={siguientePaso}>Siguiente</button>}
              {pasoActual === 3 && <button className="btn-siguiente" onClick={registrarDocente}>Guardar</button>}
            </div>
          </div>
        )}

        {listaDocentes.length > 0 && (
          <div className="lista-docentes">
            {listaDocentes.map((doc, i) => (
              <div className="docente-item" key={i}>
                <div className="docente-info">
                  <strong>{doc.nombres} {doc.apellidos}</strong> - {doc.rol}
                  <p className="docente-username">{doc.username}</p>
                </div>
                <div className="docente-actions">
                  <button className="btn-editar" onClick={() => editarDocente(i)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => eliminarDocente(doc.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Docentes;
