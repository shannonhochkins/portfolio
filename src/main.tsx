import React from 'react'
import ReactDOM from 'react-dom/client'
import { Header } from './components/header';
import { Splash } from './components/splash';
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Splash />
  </React.StrictMode>,
)
