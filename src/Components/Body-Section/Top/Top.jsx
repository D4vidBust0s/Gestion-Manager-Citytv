import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import menu from '../../../assets/menu.svg';
import defaultAvatar from '../../../assets/Ana-Brenda.jpg';
import "./Top.css";

function Top() {
  const [clockState, setClockState] = useState();
  const [dateState, setDateState] = useState();

  const [userData, setUserData] = useState({
    id: '',
    nombres: 'Usuario',
    apellidos: '',
    rol: 'Administrador',
    avatar: defaultAvatar
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    rol: 'Administrador',
    currentPassword: '',
    newPassword: '',
    imagen: ''
  });

  // Cargar datos del usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('userAuth');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          id: parsedUser.id || parsedUser._id,
          nombres: parsedUser.nombres || 'Usuario',
          apellidos: parsedUser.apellidos || '',
          rol: parsedUser.rol || 'Administrador',
          avatar: parsedUser.imagen && parsedUser.imagen.trim() !== '' ? parsedUser.imagen : defaultAvatar
        });
        setFormData({
          nombres: parsedUser.nombres || '',
          apellidos: parsedUser.apellidos || '',
          rol: parsedUser.rol || 'Administrador',
          currentPassword: '',
          newPassword: '',
          imagen: parsedUser.imagen || ''
        });
      } catch (error) {
        console.error("Error al parsear el usuario del localStorage", error);
      }
    }
  }, []);

  // Reloj y fecha
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setClockState(date.toLocaleTimeString('en-US', { hour12: false }));
      setDateState(new Date().toDateString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Convertir imagen a Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagen: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar formulario de actualización
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3000/api/auth/user/${userData.id}`, formData);
      
      toast.success("¡Perfil actualizado con éxito!");
      
      // Actualizar localStorage
      localStorage.setItem("userAuth", JSON.stringify(response.data.user));
      
      // Actualizar estado en pantalla
      setUserData({
        id: response.data.user.id,
        nombres: response.data.user.nombres,
        apellidos: response.data.user.apellidos,
        rol: response.data.user.rol,
        avatar: response.data.user.imagen || defaultAvatar
      });

      // Limpiar campos de contraseña y cerrar modal
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al actualizar el perfil");
    }
  };

  return (
    <>
      <div className="container">
        <div className="content-avatar" onClick={() => setShowModal(true)} title="Editar perfil" style={{ cursor: 'pointer' }}>
          <img src={userData.avatar} alt="Avatar" className="avatar" />
        </div>
        <span className="content-menu">
          <img src={menu} alt="menu" className="menu" />
        </span>
        <span className="fecha">
          {dateState}
          <br />
          <h5>{clockState}</h5>
        </span>
       <h3 className="nombre">
    {`${userData.nombres} ${userData.apellidos}`}
    <br />
    <span className='roll'>{userData.rol}</span>
  </h3>
      </div>

      {/* MODAL CON CAMPOS DE ROL Y VALIDACIÓN DE CONTRASEÑA */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Perfil</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="input-group">
                <label>Nombres</label>
                <input 
                  type="text" 
                  value={formData.nombres} 
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Apellidos</label>
                <input 
                  type="text" 
                  value={formData.apellidos} 
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Rol</label>
                <select 
                  value={formData.rol} 
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="input-select"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Ingeniero">Ingeniero</option>
                  <option value="Administrativo">Administrativo</option>
                </select>
              </div>

              <div className="input-group">
                <label>Contraseña Actual</label>
                <input 
                  type="password" 
                  placeholder="Requerido solo si vas a cambiar la contraseña"
                  value={formData.currentPassword} 
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} 
                />
              </div>

              <div className="input-group">
                <label>Nueva Contraseña</label>
                <input 
                  type="password" 
                  placeholder="Dejar en blanco para mantener la actual"
                  value={formData.newPassword} 
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} 
                />
              </div>

              <div className="input-group">
                <label>Imagen de Perfil</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Top;