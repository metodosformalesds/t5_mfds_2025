import './App.css'
import { CardEjemplo } from '../features/Card-ejemplo.jsx'


export function App() {
  return(
    <section className='App'>
      <CardEjemplo 
      username="@usuarioejemplo" 
      name="Pablo Hernandez" 
      isFollowing={true} 
      />

      <CardEjemplo 
      username="@EibramAlvarado" 
      name="Alexis Alvarado" 
      isFollowing={false} 
      />

      <CardEjemplo 
      username="@ErnestoMijares" 
      name="Ernesto" 
      isFollowing={false} 
      />
    </section>
  )
}

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'


export default App