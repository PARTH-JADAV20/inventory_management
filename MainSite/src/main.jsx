import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ShopProvider } from './Components/ShopContext/ShopContext';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <ShopProvider>
    <App />
  </ShopProvider>,
)
