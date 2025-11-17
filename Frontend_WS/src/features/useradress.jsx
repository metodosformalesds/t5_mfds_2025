// src/features/perfil/components/useradress.jsx
import React from "react";
import "./useraddress.css"; // asegúrate del nombre exacto

const UserAddress = () => {
  const [show, setShow] = React.useState(true);

  const saveAdress = [
    {
      AddressLine1: "AddressLine1",
      AddressLine2: "AddressLine2",
      AddressLine3: "AddressLine3",
    },
    {
      AddressLine1: "AddressLine4",
      AddressLine2: "AddressLine5",
      AddressLine3: "AddressLine6",
    },
  ];

  return (
    <div className="useraddress">
      {!show && <h1 className="mainhead1">Tu dirección</h1>}

      {!show && (
        <div className="addressin">
          {saveAdress.map((item, index) => (
            <div className="address" key={index}>
              <span>{item.AddressLine1}</span>,
              <span>{item.AddressLine2}</span>,
              <span>{item.AddressLine3}</span>
              <div className="delbtn">
                <img src="" alt="" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!show && (
        <div className="addnewbtn" onClick={() => setShow(true)}>
          <img src="" alt="" />
        </div>
      )}

      {show && (
        <div className="addnew">
          <h1 className="mainhead1">Nueva dirección</h1>
          <div className="form">
            <div className="form-group">
              <label htmlFor="postalcode">Código Postal</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label htmlFor="addressline1">Dirección 1</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label htmlFor="addressline2">Dirección 2</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label htmlFor="addressline3">Dirección 3</label>
              <input type="text" />
            </div>
          </div>
          <button className="mainbutton1" onClick={() => setShow(false)}>
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAddress;


