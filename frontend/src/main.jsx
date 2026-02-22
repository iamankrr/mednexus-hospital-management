import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { LocationProvider } from './context/LocationContext';
import { ComparisonProvider } from './context/ComparisonContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LocationProvider>
      <ComparisonProvider>
        <App />
      </ComparisonProvider>
    </LocationProvider>
  </React.StrictMode>
);