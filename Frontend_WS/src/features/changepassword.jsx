/**

 * Autor: Eibram Alexis Alvarado Orta

 * Componente: Componente para permitir al usuario: cambiar su contraseña, 
actualizar su correo y eliminar su cuenta. 

 * Descripción: Este componente nos ofrece una interfaz para que el usuario pueda
 modificar su información sensible como la contraseña y el correo electrónico, 
así como la opción de eliminar su cuenta de forma permanente.

 */

import React from "react";
import { useNavigate } from "react-router-dom";
import "./changepassword.css";

const ChangePassword = ({
  // Luego puedes pasar este dato desde tu contexto/autenticación
  currentEmail = "micorreo@ejemplo.com",
  // Y opcionalmente pasar una función real para eliminar cuenta
  onDeleteAccount,
}) => {
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleUpdateEmail = (e) => {
    e.preventDefault();
    // TODO: lógica real para actualizar correo (fetch/axios)
    console.log("Correo actualizado correctamente");
    navigate("/perfil");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    // TODO: lógica real para cambiar contraseña
    console.log("Contraseña actualizada correctamente");
    navigate("/perfil");
  };

  // Abre el modal
  const handleDeleteClick = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // Confirma eliminación (aquí luego va la llamada al backend)
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);

      // 👉 Aquí conectas con tu backend más adelante
      // Ejemplo:
      // await api.delete("/mi-endpoint/eliminar-cuenta");

      if (onDeleteAccount) {
        await onDeleteAccount();
      }

      console.log("Cuenta eliminada (simulado)");
      navigate("/"); // Redirige al home
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="changepass-page">
      <div className="changepass-card">
        {/* Título */}
        <h1 className="changepass-title">Cambiar contraseña</h1>

        {/* ==== BLOQUE ACTUALIZAR CORREO ==== */}
        <section className="changepass-section">
          <div className="changepass-label-col">
            <span className="changepass-section-label">
              Actualizar correo
            </span>
          </div>

          <div className="changepass-content-col">
            <p className="current-email">
              {currentEmail}{" "}
              <span className="verified-dot">●</span>{" "}
              <span className="verified-text">Tu correo está verificado.</span>
            </p>

            <div className="formgroup">
              <label htmlFor="newemail">Nuevo correo electrónico</label>
              <input
                type="email"
                id="newemail"
                placeholder="Ingresa tu nuevo correo"
              />
            </div>

            <button
              className="mainbutton1 email-btn"
              onClick={handleUpdateEmail}
            >
              Actualizar correo
            </button>
          </div>
        </section>

        {/* ==== BLOQUE NUEVA CONTRASEÑA ==== */}
        <section className="changepass-section">
          <div className="changepass-label-col">
            <span className="changepass-section-label">
              Nueva contraseña
            </span>
          </div>

          <div className="changepass-content-col">
            <div className="formgroup">
              <label htmlFor="oldpass">Contraseña actual</label>
              <input
                type="password"
                id="oldpass"
                placeholder="Ingresa tu contraseña actual"
              />
              <p className="hint-text">Mínimo 8 caracteres</p>
            </div>

            <div className="formgroup">
              <label htmlFor="newpass">Nueva contraseña</label>
              <input
                type="password"
                id="newpass"
                placeholder="Ingresa tu nueva contraseña"
              />
              <p className="hint-text">Mínimo 8 caracteres</p>
            </div>

            <button
              className="mainbutton1 password-btn"
              onClick={handleChangePassword}
            >
              Cambiar contraseña
            </button>
          </div>
        </section>

        {/* ==== BOTÓN ELIMINAR CUENTA ==== */}
        <div className="changepass-footer">
          <button
            className="delete-account-btn"
            onClick={handleDeleteClick}
          >
            Eliminar cuenta
          </button>
        </div>
      </div>

      {/* ==== MODAL DE CONFIRMACIÓN ==== */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Eliminar cuenta</h2>
            <p>
              ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se
              puede deshacer y perderás toda tu información y publicaciones.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="modal-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
