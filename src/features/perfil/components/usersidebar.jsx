import React from "react";
import './usersidebar.css';
import { Link } from "react-router-dom";
import editIcon from '../../../assets/boton-editar.png';

const UserSidebar = (activepage) => {
    return (
        <div className="usersidebar">
            {activepage === 'accountsettings' ? 
            <div className="s2">
                <img src={editIcon} alt="Editar"/>
                <span> Editar Perfil </span>
            </div>:<Link to='/user/accountsettings' className='stylenone'><div className="s1">
                <img src={editIcon} alt="Editar"/>
                <span> Editar Perfil </span>
            </div></Link> }

            {activepage === 'suscripcion' ? 
            <div className="s2">
                <img src={editIcon} alt="Editar"/>
                <span> Suscripcion </span>
            </div>:<Link to='/user/accountsettings' className='stylenone'><div className="s1">
                <img src={editIcon} alt="Editar"/>
                <span> Suscripcion </span>
            </div></Link> }

            {activepage === 'access' ? 
            <div className="s2">
                <img src={editIcon} alt="Editar"/>
                <span> Access </span>
            </div>:<Link to='/user/accountsettings' className='stylenone'><div className="s1">
                <img src={editIcon} alt="Editar"/>
                <span> Access </span>
            </div></Link> }
        
        </div>
    )
}

export default UserSidebar; 