
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./Shared/styles/index.css"; 
import App from "./app/App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);



// import React, { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './Shared/styles/index.css'
// import App from './app/App.jsx'


// createRoot(document.getElementById('root')).render(
//   <App />
// )