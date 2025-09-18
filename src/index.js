
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NhostProvider } from '@nhost/react';
import nhost from './services/nhost'; // File bạn đã có: nhost.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
      <App />
    </NhostProvider>
  </React.StrictMode>
);
{/*
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
*/}


