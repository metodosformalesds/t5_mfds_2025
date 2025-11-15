import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Shared/styles/index.css'
import App from './app/App.jsx'


createRoot(document.getElementById('root')).render(
  <App />
)