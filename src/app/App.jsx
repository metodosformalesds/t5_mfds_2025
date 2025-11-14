import '../features/login-signup/pages/loginsignup.css'
import { LoginSignup } from '../features/login-signup/pages/login-signup.jsx';
import UserPerfil from '../features/perfil/pages/user-perfil.jsx';

export function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <LoginSignup /> } />
        <Route path='/perfil/:activepage' element={ <UserPerfil /> } />
      </Routes>
    </BrowserRouter>
    // <div>
    //   <LoginSignup />
    // </div>
  )
}

export default App