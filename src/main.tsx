import React from 'react'
import ReactDOM from 'react-dom/client'

import { Routes } from '@generouted/react-router/lazy'

import './styles/global.scss'

document.addEventListener('contextmenu', (event) => event.preventDefault()) // Disable right-click

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>
)
