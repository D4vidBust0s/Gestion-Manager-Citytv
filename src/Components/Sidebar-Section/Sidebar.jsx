import {Link} from 'react-router-dom'
import {useEffect} from 'react'

/* Estilos */
import './Sidebar.scss'

/* Imagenes */
import logo from '../../assets/Logo-Dashboard.png'
import chat from '../../assets/chat.svg'
import home from '../../assets/home.svg'
import task from '../../assets/task.svg'
import gear from '../../assets/gear.svg'
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



function Sidebar() {

  useEffect(()=>{
    showSubMenu();
  },[]);

    function showSubMenu()
    {
            let listElements = document.querySelectorAll('.list__buttom--click');

            listElements.forEach(listElement => {
            listElement.addEventListener("click", ()=>{
            listElement.classList.toggle('arrow');

            let height = 0;
            let menu = listElement.nextElementSibling;

            if(menu.clientHeight=="0"){
              height=menu.scrollHeight;
            }

            menu.style.height=height+"px";
        })
    });
    }

    {
      /*----------------------------------------------------------------------------------------------------------------------------------------------------------*/
    } 


  return (
    <div className="Sidebar">
      <div className="Sidebar__contentLogo flex">
        <img src={logo} alt="Logo" />
      </div>

      {/* MENU AUXILIAR*/}

      <div className="menuAux">
        <span className="menuAux__item">
          <Link to="/chat">
            <img src={chat} alt="chat" />
          </Link>
        </span>

        <span className="menuAux__item">
          <Link to="/">
            <img src={home} alt="home" />
          </Link>
        </span>

        <span className="menuAux__item">
          <Link to="tasks">
            <img src={task} alt="task" />
          </Link>
        </span>

        <span className="menuAux__item">
          <Link to="config">
            <img src={gear} alt="task" />
          </Link>
        </span>
      </div>

      {/* MENU PRINCIPAL*/}
      <nav className="nav">
        <ul className="list">
          <li className="list__item">
            <div className="list__buttom">
              <img src={plan} alt="main" className="list__img" />
              <Link to="/mainplanner" className="nav__link">
                Main Planner
              </Link>
            </div>
          </li>

          <li className="list__item">
            <div className="list__buttom">
              <img src={plan} alt="main" className="list__img" />
              <Link to="/mainplanner+" className="nav__link">
                Main Planner +
              </Link>
            </div>
          </li>

          <li className="list__item">
            <div className="list__buttom">
              <img src={locking} alt="locking" className="list__img" />
              <a href="#" className="nav__link">
                Locking
              </a>
            </div>
          </li>

          <li className="list__item list__item--click">
            <div className="list__buttom list__buttom--click">
              <img
                src={sun}
                alt="journal"
                className="list__img"
                onClick={showSubMenu}
              />
              <a href="#" className="nav__link">
                Journal
              </a>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className="list__show">
              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Novelty
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Consolidate
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Requirements
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Programmer
                </a>
              </li>
            </ul>
          </li>

          <li className="list__item list__item--click">
            <div className="list__buttom list__buttom--click">
              <img src={employee} alt="employe" className="list__img" />
              <a href="#" className="nav__link">
                Employee
              </a>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className="list__show">
              <li className="list__inside">
                <Link to="/permissions" className="nav__link nav__link--inside">
                  Permissions
                </Link>
              </li>

              <li className="list__inside">
                <Link to="/breaks" className="nav__link nav__link--inside">
                  Breaks
                </Link>
              </li>

              <li className="list__inside">
                <Link to="/incapacity" className="nav__link nav__link--inside">
                  Incapacity
                </Link>
              </li>

              <li className="list__inside">
                <Link to="/recess" className="nav__link nav__link--inside">
                  Recess
                </Link>
              </li>

              <li className="list__inside">
                <Link to="licenses" className="nav__link nav__link--inside">
                  License
                </Link>
              </li>

              <li className="list__inside">
                <Link to="/cv" className="nav__link nav__link--inside">
                  CV
                </Link>
              </li>

              <li className="list__inside">
                <Link to="/register" className="nav__link nav__link--inside">
                  Register
                </Link>
              </li>

              <li className="list__inside">
                <Link to="/bonds" className="nav__link nav__link--inside">
                  Bonds
                </Link>
              </li>
            </ul>
          </li>

          <li className="list__item list__item--click">
            <div className="list__buttom list__buttom--click">
              <img src={payroll} alt="payroll" className="list__img" />
              <a href="#" className="nav__link">
                Payroll
              </a>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className="list__show">
              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Main
                </a>
              </li>

              <li className="list__inside">
                <Link
                  to="payroll-manager"
                  className="nav__link nav__link--inside"
                >
                  Manager
                </Link>
              </li>
            </ul>
          </li>

          <li className="list__item list__item--click">
            <div className="list__buttom list__buttom--click">
              <img src={inquiries} alt="inquiries" className="list__img" />
              <a href="#" className="nav__link">
                Inquiries
              </a>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className="list__show">
              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Team Status
                </a>
              </li>

              <li className="list__inside">
                <Link to="balancer" className="nav__link nav__link--inside">
                  Balancer
                </Link>
              </li>
            </ul>
          </li>

          <li className="list__item list__item--click">
            <div className="list__buttom list__buttom--click">
              <img src={reports} alt="reports" className="list__img" />
              <a href="#" className="nav__link">
                Reports
              </a>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className="list__show">
              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Main
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Turns
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Advanced
                </a>
              </li>
            </ul>
          </li>

          <li className="list__item list__item--click">
            <div className="list__buttom list__buttom--click">
              <img src={tools2} alt="tools" className="list__img" />
              <a href="#" className="nav__link">
                Tools
              </a>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className="list__show">
              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Tasks
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                 Routes
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Chat
                </a>
              </li>

            </ul>
          </li>

          <li className="list__item list__item--click">
            <div className="list__buttom list__buttom--click">
              <img src={tools} alt="tools" className="list__img" />
              <a href="#" className="nav__link">
                System
              </a>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className="list__show">
              <li className="list__inside">
                <Link to="/rules" className="nav__link nav__link--inside">
                  Rules
                </Link>
              </li>

              <li className="list__inside">
                <Link to="/programs" className="nav__link nav__link--inside">
                  Programs
                </Link>
              </li>

              <li className="list__inside">
                <Link to="/groups" className="nav__link nav__link--inside">
                  Groups
                </Link>
              </li>

              <li className="list__inside">
                <Link to="/rotation" className="nav__link nav__link--inside">
                  Rotations
                </Link>
              </li>
            </ul>
          </li>

          <li className="list__item list__item--click">
            <div className="list__buttom list__buttom--click">
              <img src={mobil} alt="mobil" className="list__img" />
              <a href="#" className="nav__link">
                App Mobil
              </a>
              <img src={arrow} alt="item1" className="list__arrow" />
            </div>

            <ul className="list__show">
              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
                  Advertisiment
                </a>
              </li>

              <li className="list__inside">
                <a href="#" className="nav__link nav__link--inside">
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

export default Sidebar
