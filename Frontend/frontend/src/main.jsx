import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'
import { BrowserRouter, Route } from 'react-router-dom'
import ChatPage from './Pages/ChatPage/ChatPage.jsx'
import HomePage from './Pages/HomePage.jsx'
import SignInPage from './Pages/SignInPage.jsx'
import SignUpPage from './Pages/SignUpPage.jsx'

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <ToastProvider>
      {/* <StrictMode> */}
        <App />
      {/* </StrictMode> */}
    </ToastProvider>
  </ThemeProvider>
)
