import React from "react";
import { useNavigate } from "react-router-dom";
import "./accountsettings.css";
import "./changepassword.css";
import defaultAvatar from "../assets/icons/avatar.png";

const AccountSettings = () => {
  const [profilePhoto, setProfilePhoto] = React.useState(defaultAvatar);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setProfilePhoto(url);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setProfilePhoto(url);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Aquí luego iría la lógica real para guardar en el backend
    console.log("Perfil guardado correctamente");
    navigate("/perfil");
  };

  return (
    <div className="accountsettings">
      <div className="accountsettings-card">
        {/* FILA FOTO DE PERFIL */}
        <div className="accountsettings-row photo-row">
          <div className="settings-label-col">
            <span className="settings-section-label">Foto de perfil</span>
          </div>

          <div className="settings-content-col">
            <div className="profile-photo-row">
              {/* Foto circular */}
              <div className="photo-left">
                <img
                  src={profilePhoto}
                  alt="profile"
                  className="profile-photo"
                />
              </div>

              {/* Cuadro de subir imagen */}
              <div
                className="upload-box"
                onClick={handleChooseFile}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="upload-icon">🖼️</div>
                <p className="upload-text">
                  <span>Click to replace</span> or drag and drop
                </p>
                <p className="upload-subtext">
                  SVG, PNG, JPG or GIF (max. 400 × 400px)
                </p>
              </div>

              {/* Input oculto */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {/* FILA DETALLES PERSONALES */}
        <div className="accountsettings-row">
          <div className="settings-label-col">
            <span className="settings-section-label">Detalles personales</span>
          </div>

          <div className="settings-content-col">
            <div className="form-grid">
              <div className="formgroup">
                <label>Nombre Completo</label>
                <input type="text" placeholder="Ej. Juan Pérez" />
              </div>

              <div className="formgroup">
                <label>Nombre de la empresa</label>
                <input type="text" placeholder="Ej. Mi Negocio" />
              </div>

              <div className="formgroup">
                <label>Teléfono</label>
                <input type="text" placeholder="+52 656 123 4567" />
              </div>

              <div className="formgroup">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FILA DETALLES DE UBICACIÓN */}
        <div className="accountsettings-row">
          <div className="settings-label-col">
            <span className="settings-section-label">
              Detalles de ubicación
            </span>
          </div>

          <div className="settings-content-col">
            <div className="form-grid">
              <div className="formgroup">
                <label>Código Postal</label>
                <input type="text" />
              </div>

              <div className="formgroup">
                <label>País</label>
                <input type="text" />
              </div>

              <div className="formgroup">
                <label>Estado</label>
                <input type="text" />
              </div>

              <div className="formgroup">
                <label>Ciudad</label>
                <input type="text" />
              </div>
            </div>
          </div>
        </div>

        {/* FILA BOTÓN GUARDAR */}
        <div className="accountsettings-row footer-row">
          <div className="settings-label-col" />
          <div className="settings-content-col">
            <button className="mainbutton1" onClick={handleSave}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
