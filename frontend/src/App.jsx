import RequireAdmin from "./components/RequireAdmin";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Inicio from "./pages/Inicio";
import Nosotros from "./pages/Nosotros";
import Proyectos from "./pages/Proyectos";
import Talleres from "./pages/Talleres";
import FamiliaSmart from "./pages/FamiliaSmart";
import RoboKidsPage from './pages/RoboKids';
import RoboJuniorsPage from './pages/RoboJuniors';
import Login from "./pages/Login";
import Campus from "./pages/Campus";
import Inscripciones from "./pages/Inscripciones";
import AdminTaller from "./pages/AdminTaller";
import Docentes from "./pages/Docentes";
import Sedes from "./pages/Sedes";
import SedeDetalle from "./pages/SedeDetalle";
import ProyectoDetalle from "./pages/ProyectoDetalle";

function AppWrapper() {
  const location = useLocation();

  // Lista de rutas administrativas donde se ocultan Navbar y Footer
  const adminPaths = [
    "/campus",
    "/inscripciones",
    "/docentes",
    "/reportes",
    "/ajustes",
    "/admintaller",
    "/sedes",
    "/detalle-proyecto",
  ];

  // Verifica si la ruta actual es una ruta admin
  const shouldHideLayout = adminPaths.some(path =>
    location.pathname.toLowerCase().startsWith(path)
  );

  return (
    <div className="app-container">
      {!shouldHideLayout && <Navbar />}
      
      <div className="content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/talleres" element={<Talleres />} />
          <Route path="/login" element={<Login />} />
          <Route path="/robokids" element={<RoboKidsPage />} />
          <Route path="/robojuniors" element={<RoboJuniorsPage />} />
          <Route path="/familia-smart" element={<FamiliaSmart />} />
          <Route path="/campus" element={<RequireAdmin><Campus /></RequireAdmin>} />
          <Route path="/inscripciones" element={<RequireAdmin><Inscripciones /></RequireAdmin>} />
          <Route path="/admintaller" element={<RequireAdmin><AdminTaller /></RequireAdmin>} />
          <Route path="/docentes" element={<RequireAdmin><Docentes /></RequireAdmin>} />
          <Route path="/sedes" element={<RequireAdmin><Sedes /></RequireAdmin>} />
          <Route path="/sedes/:nombre" element={<RequireAdmin><SedeDetalle /></RequireAdmin>} />
          <Route path="/detalle-proyecto/:nombre" element={<RequireAdmin><ProyectoDetalle /></RequireAdmin>} />
       
        </Routes>
      </div>

      {!shouldHideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
