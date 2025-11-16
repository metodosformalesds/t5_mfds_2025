import React from "react";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

const UserProfile = ({ user }) => {
  const navigate = useNavigate();

  // Datos de ejemplo / fallback mientras no haya sesión conectada al back
  const defaultUser = {
    name: "Erika",
    businessName: "Tu Espacio Verde",
    phone: "+52 656 123 4567",
    email: "erika@example.com",
    city: "Ciudad Juárez",
    country: "México",
    avatar: "",
  };

  const profileUser = { ...defaultUser, ...(user || {}) };

  const handleEdit = () => {
    // Ahora el panel de edición vive en /editarPerfil
    navigate("/editarPerfil");
  };

  return (
    <div className="userprofile-page">
      <h1 className="userprofile-title">Mi perfil</h1>

      <div className="userprofile-wrapper">
        <section className="userprofile-card">
          {/* Columna izquierda: foto + datos básicos debajo */}
          <div className="userprofile-left">
            <div className="userprofile-avatar">
              {profileUser.avatar ? (
                <img src={profileUser.avatar} alt={profileUser.name} />
              ) : (
                <span>
                  {profileUser.name ? profileUser.name.charAt(0) : "?"}
                </span>
              )}
            </div>

            <div className="userprofile-info-list">
              <div className="userprofile-info-item">
                <span className="label">Teléfono</span>
                <span>{profileUser.phone}</span>
              </div>
              <div className="userprofile-info-item">
                <span className="label">Correo</span>
                <span>{profileUser.email}</span>
              </div>
              <div className="userprofile-info-item">
                <span className="label">Ciudad</span>
                <span>{profileUser.city}</span>
              </div>
              <div className="userprofile-info-item">
                <span className="label">País</span>
                <span>{profileUser.country}</span>
              </div>
            </div>
          </div>

          {/* Columna derecha: nombre y business name */}
          <div className="userprofile-right">
            <h2 className="userprofile-name">{profileUser.name}</h2>
            <p className="userprofile-business">
              {profileUser.businessName || "Business name pendiente"}
            </p>

            <p className="userprofile-description">
              Aquí se mostrará la información básica de tu cuenta. Puedes
              completar o actualizar tus datos en el apartado{" "}
              <strong>Editar perfil</strong>.
            </p>

            <button
              className="userprofile-edit-btn"
              onClick={handleEdit}
            >
              Editar perfil
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
