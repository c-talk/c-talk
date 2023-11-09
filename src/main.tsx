import React from 'react'
import ReactDOM from 'react-dom/client'

import { Routes } from '@generouted/react-router'

import './styles/global.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>
)
