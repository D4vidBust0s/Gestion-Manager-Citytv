import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Swal from 'sweetalert2'
import { useChat } from '../../context/ChatContext'
import styled from 'styled-components'

/* Estilos */
import './Sidebar.scss'

/* Imagenes */
import logo from '../../assets/Logo-Dashboard.png'
import chat from '../../assets/chat.svg'
import home from '../../assets/home.svg'
import task from '../../assets/task.svg'
import logOut from '../../assets/logOut.svg'
import plan from '../../assets/plan.svg'
import arrow from '../../assets/arrow.svg'
import locking from '../../assets/locking.svg'
import sun from '../../assets/sun.svg'
import employee from '../../assets/employee.svg'
import payroll from '../../assets/payroll.svg'
import inquiries from '../../assets/inquiries.svg'
import reports from '../../assets/reports.svg'
import tools from '../../assets/tools.svg'
import mobil from '../../assets/mobil.svg'
import tools2 from '../../assets/tools2.svg'

function Sidebar({ onLogout, collapsed = false, onToggleCollapsed }) {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);
  
  // Extraemos totalNoLeidos, limpiarContadorGlobal y cerrarSesionSocket del contexto corporativo de chat
  const { totalNoLeidos, limpiarContadorGlobal, cerrarSesionSocket } = useChat(); 

  // Manejo de acordeón con auto-colapso exclusivo
  const toggleMenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  // Con la sidebar colapsada, el clic en un icono restaura el panel y abre esa sección
  const handleGroupClick = (menuName) => {
    if (collapsed) {
      if (onToggleCollapsed) onToggleCollapsed();
      setActiveMenu(menuName);
      return;
    }
    toggleMenu(menuName);
  };

  // Determinar si una ruta está activa
  const isPathActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && (location.pathname === path || location.pathname.startsWith(path + '/'))) {
      return true;
    }
    return false;
  };

  // Apertura contextual inteligente del acordeón según la ruta actual
  useEffect(() => {
    const path = location.pathname;
    if (path === '/programmer') {
      setActiveMenu('journal');
    } else if (
      ['/permissions', '/breaks', '/incapacity', '/recess', '/licenses', '/cv', '/register', '/notes'].some(
        (p) => path.startsWith(p)
      )
    ) {
      setActiveMenu('employee');
    } else if (['/payroll-main', '/payroll-manager', '/user-balancers'].some((p) => path.startsWith(p))) {
      setActiveMenu('payroll');
    } else if (['/balancer'].some((p) => path.startsWith(p))) {
      setActiveMenu('inquiries');
    } else if (['/rules', '/programs', '/groups', '/rotation'].some((p) => path.startsWith(p))) {
      setActiveMenu('system');
    }
  }, [location.pathname]);

  // Manejador centralizado para el cierre de sesión limpio (con confirmación previa)
  const handleLogoutClick = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Cerrar sesión?',
      text: 'Tu sesión actual se cerrará y volverás a la pantalla de inicio de sesión.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EB464B',
      cancelButtonColor: '#00094B',
      reverseButtons: true,
      footer: '<h6>Gestión Manager Citytv</h6>',
    });

    // Cancelar, Esc o clic fuera: la sesión se mantiene intacta
    if (!result.isConfirmed) return;

    try {
      cerrarSesionSocket(); // Avisamos al servidor que el usuario cerró sesión
    } catch (error) {
      console.error('No se pudo notificar el cierre de sesión al socket:', error);
    }

    if (onLogout) {
      onLogout(); // La sesión se cierra pase lo que pase con el socket
    }
  };

  return (
    <div className={`Sidebar${collapsed ? ' Sidebar--collapsed' : ''}`} id="app-sidebar">
      <div className="Sidebar__contentLogo flex">
        <img src={logo} alt="Logo" />
      </div>

      {/* MENU AUXILIAR*/}
      <div className="menuAux">
        <span className={`menuAux__item ${isPathActive('/chat') ? 'menuAux__item--active' : ''}`} style={{ position: 'relative' }}>
          <Link to="/chat" onClick={() => limpiarContadorGlobal()}>
            <img src={chat} alt="chat" />
            {totalNoLeidos > 0 && <SidebarBadge>{totalNoLeidos}</SidebarBadge>}
          </Link>
        </span>

        <span className={`menuAux__item ${isPathActive('/') ? 'menuAux__item--active' : ''}`}>
          <Link to="/">
            <img src={home} alt="home" />
          </Link>
        </span>

        <span className={`menuAux__item ${isPathActive('/tasks') ? 'menuAux__item--active' : ''}`}>
          <Link to="/tasks">
            <img src={task} alt="task" />
          </Link>
        </span>

       <span 
          className="menuAux__item" 
          onClick={handleLogoutClick}
          style={{ cursor: 'pointer' }}
          title="Cerrar Sesión"
        >
          <img src={logOut} alt="Cerrar sesión" />
        </span>
      </div>

      {/* MENU PRINCIPAL*/}
      <nav className="nav">
        <ul className="list">
          <li className="list__item">
            <div className="list__buttom">
              <img src={plan} alt="main" className="list__img" />
              <Link
                to="/mainplanner"
                className={`nav__link ${isPathActive('/mainplanner') ? 'nav__link--active' : ''}`}
              >
                Main Planner
              </Link>
            </div>
          </li>

          <li className="list__item">
            <div className="list__buttom">
              <img src={plan} alt="main" className="list__img" />
              <Link
                to="/mainplanner+"
                className={`nav__link ${isPathActive('/mainplanner+') ? 'nav__link--active' : ''}`}
              >
                Main Planner +
              </Link>
            </div>
          </li>

          <li className="list__item">
            <div className="list__buttom">
              <img src={locking} alt="locking" className="list__img" />
              <a href="#" className="nav__link" onClick={(e) => e.preventDefault()}>
                Locking
              </a>
            </div>
          </li>

          {/* JOURNAL */}
          <li className="list__item list__item--click">
            <div
              className={`list__buttom list__buttom--click ${activeMenu === 'journal' ? 'arrow' : ''}`}
              onClick={() => handleGroupClick('journal')}
            >
              <img src={sun} alt="journal" className="list__img" />
              <span className={`nav__link ${['/programmer'].includes(location.pathname) ? 'nav__link--active' : ''}`}>
                Journal
              </span>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className={`list__show ${activeMenu === 'journal' ? 'list__show--open' : ''}`}>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside" onClick={(e) => e.preventDefault()}>
                  Consolidate
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside" onClick={(e) => e.preventDefault()}>
                  Requirements
                </a>
              </li>

              <li className="list__inside">
                <Link
                  to="/programmer"
                  className={`nav__link nav__link--inside ${isPathActive('/programmer') ? 'nav__link--active' : ''}`}
                >
                  Programmer
                </Link>
              </li>
            </ul>
          </li>

          {/* EMPLOYEE */}
          <li className="list__item list__item--click">
            <div
              className={`list__buttom list__buttom--click ${activeMenu === 'employee' ? 'arrow' : ''}`}
              onClick={() => handleGroupClick('employee')}
            >
              <img src={employee} alt="employe" className="list__img" />
              <span
                className={`nav__link ${
                  ['/permissions', '/breaks', '/incapacity', '/recess', '/licenses', '/cv', '/register', '/notes'].includes(
                    location.pathname
                  )
                    ? 'nav__link--active'
                    : ''
                }`}
              >
                Employee
              </span>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className={`list__show ${activeMenu === 'employee' ? 'list__show--open' : ''}`}>
              <li className="list__inside">
                <Link
                  to="/permissions"
                  className={`nav__link nav__link--inside ${isPathActive('/permissions') ? 'nav__link--active' : ''}`}
                >
                  Permissions
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/breaks"
                  className={`nav__link nav__link--inside ${isPathActive('/breaks') ? 'nav__link--active' : ''}`}
                >
                  Breaks
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/incapacity"
                  className={`nav__link nav__link--inside ${isPathActive('/incapacity') ? 'nav__link--active' : ''}`}
                >
                  Incapacity
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/recess"
                  className={`nav__link nav__link--inside ${isPathActive('/recess') ? 'nav__link--active' : ''}`}
                >
                  Recess
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/licenses"
                  className={`nav__link nav__link--inside ${isPathActive('/licenses') ? 'nav__link--active' : ''}`}
                >
                  License
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/compensatory"
                  className={`nav__link nav__link--inside ${isPathActive('/compensatory') ? 'nav__link--active' : ''}`}
                >
                  Compensatory
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/cv"
                  className={`nav__link nav__link--inside ${isPathActive('/cv') ? 'nav__link--active' : ''}`}
                >
                  CV
                </Link>
              </li>

            </ul>
          </li>

          {/* PAYROLL */}
          <li className="list__item list__item--click">
            <div
              className={`list__buttom list__buttom--click ${activeMenu === 'payroll' ? 'arrow' : ''}`}
              onClick={() => handleGroupClick('payroll')}
            >
              <img src={payroll} alt="payroll" className="list__img" />
              <span
                className={`nav__link ${
                  ['/payroll-manager', '/user-balancers'].includes(location.pathname) ? 'nav__link--active' : ''
                }`}
              >
                Payroll
              </span>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className={`list__show ${activeMenu === 'payroll' ? 'list__show--open' : ''}`}>
             <li className="list__inside">
              <Link
                to="/payroll-main"
                className={`nav__link nav__link--inside ${isPathActive('/payroll-main') ? 'nav__link--active' : ''}`}
              >
                Main
              </Link>
            </li>

              <li className="list__inside">
                <Link
                  to="/payroll-manager"
                  className={`nav__link nav__link--inside ${isPathActive('/payroll-manager') ? 'nav__link--active' : ''}`}
                >
                  Manager
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/user-balancers"
                  className={`nav__link nav__link--inside ${isPathActive('/user-balancers') ? 'nav__link--active' : ''}`}
                >
                  User Balancers
                </Link>
              </li>
            </ul>
          </li>

          {/* INQUIRIES */}
          <li className="list__item list__item--click">
            <div
              className={`list__buttom list__buttom--click ${activeMenu === 'inquiries' ? 'arrow' : ''}`}
              onClick={() => handleGroupClick('inquiries')}
            >
              <img src={inquiries} alt="inquiries" className="list__img" />
              <span className={`nav__link ${['/balancer'].includes(location.pathname) ? 'nav__link--active' : ''}`}>
                Inquiries
              </span>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className={`list__show ${activeMenu === 'inquiries' ? 'list__show--open' : ''}`}>
              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside" onClick={(e) => e.preventDefault()}>
                  Team Status
                </a>
              </li>

              <li className="list__inside">
                <Link
                  to="/balancer"
                  className={`nav__link nav__link--inside ${isPathActive('/balancer') ? 'nav__link--active' : ''}`}
                >
                  Balancer
                </Link>
              </li>
            </ul>
          </li>

          {/* REPORTS */}
          <li className="list__item list__item--click">
            <div
              className={`list__buttom list__buttom--click ${activeMenu === 'reports' ? 'arrow' : ''}`}
              onClick={() => handleGroupClick('reports')}
            >
              <img src={reports} alt="reports" className="list__img" />
              <span className="nav__link">
                Reports
              </span>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className={`list__show ${activeMenu === 'reports' ? 'list__show--open' : ''}`}>
              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside" onClick={(e) => e.preventDefault()}>
                  Main
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside" onClick={(e) => e.preventDefault()}>
                  Turns
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside" onClick={(e) => e.preventDefault()}>
                  Advanced
                </a>
              </li>
            </ul>
          </li>

          {/* TOOLS */}
          <li className="list__item list__item--click">
            <div
              className={`list__buttom list__buttom--click ${activeMenu === 'tools' ? 'arrow' : ''}`}
              onClick={() => handleGroupClick('tools')}
            >
              <img src={tools2} alt="tools" className="list__img" />
              <span className={`nav__link ${['/tasks', '/chat'].includes(location.pathname) ? 'nav__link--active' : ''}`}>
                Tools
              </span>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className={`list__show ${activeMenu === 'tools' ? 'list__show--open' : ''}`}>
              <li className="list__inside">
                <Link
                  to="/tasks"
                  className={`nav__link nav__link--inside ${isPathActive('/tasks') ? 'nav__link--active' : ''}`}
                >
                  Tasks
                </Link>
              </li>

             <li className="list__inside">
                <Link
                  to="/routes"
                  className={`nav__link nav__link--inside ${isPathActive('/routes') ? 'nav__link--active' : ''}`}
                >
                  Routes
                </Link>
              </li>


              <li className="list__inside" style={{ position: 'relative' }}>
                <Link
                  to="/chat"
                  className={`nav__link nav__link--inside ${isPathActive('/chat') ? 'nav__link--active' : ''}`}
                  onClick={() => limpiarContadorGlobal()}
                >
                  Chat
                  {totalNoLeidos > 0 && <ToolBadge>{totalNoLeidos}</ToolBadge>}
                </Link>
              </li>
            </ul>
          </li>

          {/* SYSTEM */}
          <li className="list__item list__item--click">
            <div
              className={`list__buttom list__buttom--click ${activeMenu === 'system' ? 'arrow' : ''}`}
              onClick={() => handleGroupClick('system')}
            >
              <img src={tools} alt="tools" className="list__img" />
              <span
                className={`nav__link ${
                  ['/rules', '/programs', '/groups', '/rotation'].includes(location.pathname) ? 'nav__link--active' : ''
                }`}
              >
                System
              </span>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className={`list__show ${activeMenu === 'system' ? 'list__show--open' : ''}`}>
              <li className="list__inside">
                <Link
                  to="/rules"
                  className={`nav__link nav__link--inside ${isPathActive('/rules') ? 'nav__link--active' : ''}`}
                >
                  Rules
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/programs"
                  className={`nav__link nav__link--inside ${isPathActive('/programs') ? 'nav__link--active' : ''}`}
                >
                  Programs
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/groups"
                  className={`nav__link nav__link--inside ${isPathActive('/groups') ? 'nav__link--active' : ''}`}
                >
                  Groups
                </Link>
              </li>

              <li className="list__inside">
                <Link
                  to="/rotation"
                  className={`nav__link nav__link--inside ${isPathActive('/rotation') ? 'nav__link--active' : ''}`}
                >
                  Rotations
                </Link>
              </li>
            </ul>
          </li>

          {/* APP MOBIL */}
          <li className="list__item list__item--click">
            <div
              className={`list__buttom list__buttom--click ${activeMenu === 'mobil' ? 'arrow' : ''}`}
              onClick={() => handleGroupClick('mobil')}
            >
              <img src={mobil} alt="mobil" className="list__img" />
              <span className="nav__link">
                App Mobil
              </span>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className={`list__show ${activeMenu === 'mobil' ? 'list__show--open' : ''}`}>
              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside" onClick={(e) => e.preventDefault()}>
                  Advertisiment
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside" onClick={(e) => e.preventDefault()}>
                  Send Turns
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}

// Estilizados
const SidebarBadge = styled.span`
  position: absolute;
  top: -12px;
  right: -8px;
  background-color: #EB464B;
  color: white;
  font-size: 0.95rem;
  padding: 1px 5px;
  border-radius: 50%;
  font-weight: bold;
  min-width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const ToolBadge = styled.span`
  background-color: #4CAF50;
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  margin-left: 8px;
`;

Sidebar.propTypes = {
  onLogout: PropTypes.func,
  collapsed: PropTypes.bool,
  onToggleCollapsed: PropTypes.func,
};

export default Sidebar;