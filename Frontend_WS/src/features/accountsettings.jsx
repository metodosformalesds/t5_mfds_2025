/**
 * Autor: Carlo Lara 215661
 * Componente: AccountSettings
 * Descripción: Formulario de edición del perfil del usuario; permite actualizar datos personales, ubicación y foto de perfil, sincronizando cambios con el backend.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./accountsettings.css";
import "./changepassword.css";
import defaultAvatar from "../assets/icons/avatar.png";

const AccountSettings = () => {
  const navigate = useNavigate();

  // ==========================
  // STATES
  // ==========================
  const [profilePhoto, setProfilePhoto] = useState(defaultAvatar);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // solo lectura
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");

  const fileInputRef = useRef(null);

  // ==========================
  // CARGAR DATOS DEL USUARIO
  // ==========================
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) return;

    const user = JSON.parse(saved);

    if (user.profile_image) setProfilePhoto(user.profile_image);
    if (user.first_name || user.last_name)
      setFullName(`${user.first_name || ""} ${user.last_name || ""}`.trim());

    setBusinessName(user.business_name || "");
    setPhone(user.phone_number || "");
    setEmail(user.email || "");
    setCountry(user.location || "");
    setStateName(user.state || "");
    setCity(user.city || "");
  }, []);

  // ==========================
  // FILE HANDLERS
  // ==========================
  const handleChooseFile = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePhoto(URL.createObjectURL(file));
    setProfilePhotoFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setProfilePhoto(URL.createObjectURL(file));
    setProfilePhotoFile(file);
  };

  // ==========================
  // GUARDAR CAMBIOS (BACKEND)
  // ==========================
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Debes iniciar sesión.");
        return;
      }

      // Separar nombre completo en first_name + last_name
      const parts = fullName.trim().split(" ");
      const firstName = parts.shift() || "";
      const lastName = parts.join(" ");

      // Crear FormData
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("business_name", businessName);
      formData.append("phone_number", phone);
      formData.append("city", city);
      formData.append("state", stateName);
      formData.append("location", country);

      if (profilePhotoFile) {
        formData.append("profile_image", profilePhotoFile);
      }

      // Enviar al backend
      const res = await fetch(
        "http://localhost:8000/api/auth/profile/update/",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        alert("Error al actualizar perfil");
        return;
      }

      const updated = await res.json();

      // Guardar en localStorage
      localStorage.setItem("user", JSON.stringify(updated));

      // Actualizar avatar del header
      window.dispatchEvent(new Event("auth-change"));

      alert("Perfil actualizado correctamente");
      navigate("/perfil");
    } catch (error) {
      console.error(error);
      alert("Error en la conexión con el servidor");
    }
  };

  return (
    <div className="accountsettings">
      <div className="accountsettings-card">

        {/* Foto de perfil */}
        <div className="accountsettings-row photo-row">
          <div className="settings-label-col">
            <span className="settings-section-label">Foto de perfil</span>
          </div>

          <div className="settings-content-col">
            <div className="profile-photo-row">
              <div className="photo-left">
                <img src={profilePhoto} alt="profile" className="profile-photo" />
              </div>

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
              </div>

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

        {/* Datos personales */}
        <div className="accountsettings-row">
          <div className="settings-label-col">
            <span className="settings-section-label">Detalles personales</span>
          </div>

          <div className="settings-content-col">
            <div className="form-grid">
              <div className="formgroup">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="formgroup">
                <label>Nombre de la empresa</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="formgroup">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="formgroup">
                <label>Correo electrónico</label>
                <input type="email" value={email} disabled />
              </div>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="accountsettings-row">
          <div className="settings-label-col">
            <span className="settings-section-label">Ubicación</span>
          </div>

          <div className="settings-content-col">
            <div className="form-grid">
              <div className="formgroup">
                <label>País</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div className="formgroup">
                <label>Estado</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>

              <div className="formgroup">
                <label>Ciudad</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
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
