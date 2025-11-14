import React from 'react';
import UserSidebar from '../components/usersidebar.jsx';
import AccountSettings from '../components/accountsettings.jsx';
import ChangePassword from '../components/changepassword.jsx';
import UserAddress from '../components/useraddress.jsx';
import './userperfil.css';

const UserPerfil = () => {

    const {activepage} = React.useParams(); 
    // alert(activepage);

    return (
        // <div>UserPerfil, showing {activepage}</div>
        <div className='userperfil'>
            <div className="userprofilein">
                <div className="left">
                    <UserSidebar activepage={activepage}/>
                </div>

                <div className="right">
                    {activepage === 'accountsettings' && <div> <AccountSettings/> </div> }
                    {activepage === 'changepassword' && <div> <ChangePassword/> </div> }
                    {activepage === 'useraddress' && <div> <UserAddress/> </div> }
                </div>
            </div>
        </div>
    )
}

export default UserPerfil;