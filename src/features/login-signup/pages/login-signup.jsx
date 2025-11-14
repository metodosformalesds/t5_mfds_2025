import React from 'react';
import '../pages/loginsignup.css';

import user_icon from '../../../assets/icons/avatar.png';
import email_icon from '../../../assets/icons/correo.png';
import password_icon from '../../../assets/icons/contrasena.png';
import google_icon from '../../../assets/icons/google.png';
import microsoft_icon from '../../../assets/icons/microsoft.png';

export function LoginSignup() {

    const[action, setAction] = React.useState('Sign Up');

    return(

        <div className='cont-signup'>
            <div className="header-signup">
                <div className="text-signup">
                    {action}
                </div>
                <div className="underline"></div>
                <div className='social-login'>
                    <button className='social-button'>
                        <img src={google_icon} alt="Google" />
                        Google
                    </button>   
                    <button className='social-button'>
                        <img src={microsoft_icon} alt="Microsoft" />
                        Microsoft
                    </button>
                </div>
                <div className="inputs-signup">
                    {action === "Login" ?<div></div> : <div className="input-signup">
                        <img src={user_icon} alt="" />
                        <input type="text" placeholder='name' />
                    </div>}
                    <div className="input-signup">
                        <img src={email_icon} alt="" />
                        <input type="email" placeholder='email' />
                    </div>
                    <div className="input-signup">
                        <img src={password_icon} alt="" />
                        <input type="password" placeholder='password' />
                    </div>
                    {action === "Login" ? <div></div> : <div className="input-signup">
                        <img src={password_icon} alt="" />
                        <input type="password" placeholder='confirm password' />
                    </div>}
                </div>
            </div>
            {action === "Login" ? <div></div> : <div className="forgot-password">Lost Password? <span>Click Here!</span> </div>}
            <div className="submit-cont">
                <div className={action === "Login"? "submit gray" : "submit"} onClick={() => setAction('Sign Up')}>
                    Sign Up
                </div>
                <div className={action === "Sign Up"? "submit gray" : "submit"} onClick={() => setAction('Login')}>
                    Login
                </div>
            </div>
        </div>

    )
}
