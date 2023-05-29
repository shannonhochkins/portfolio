import React from 'react'
import ReactDOM from 'react-dom/client'
import { Splash } from './components/splash';
import { Global, css } from '@emotion/react';
import cursor from './assets/cursor.png'
const globalStyles = css`
  :root {
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background-color: #242424;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
  }
  #root {
    width: 100%;
    height: 100%;
  }
  
  body, html {
    height: 100%;
    margin: 0;
  }
  
  body {
    background: black;
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    cursor: url('${cursor}') 39 39, auto;
  }

  canvas {
    background-color: transparent;
  }
`

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Global styles={globalStyles} />
    <Splash />
  </React.StrictMode>,
)
