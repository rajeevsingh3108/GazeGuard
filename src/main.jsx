import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Login_admin from './components/login_admin.jsx'
import './index.css'
import Admin from './components/admin.jsx'
import Login_user from './components/login_user.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Register from "./components/Register.jsx";
import TestPage from './components/admin_test.jsx'
import Dashboard from './components/admin_dashboard.jsx'
import User from "./components/user.jsx"
import UserTest from "./components/user_test.jsx"
import Video from './components/video.jsx'

const router=createBrowserRouter([
  {
    path:'/',
    element:<App/>
  },
  {
    path:'login_admin',
    element:<Login_admin/>
  },
  {
    path:'login_user',
    element:<Login_user/>
  },
  {
    path:'Register',
    element:<Register/>
  },
  {
    path:"admin",
    element: <Admin/>
  },
  {
    path:"user",
    element: <User/>
  },
  {
    path:"user_test",
    element: <UserTest/>
  },
  {
    path:"/test-page",
    element:<TestPage/>

  }
  ,{
    path:"/dashboard", element:<Dashboard/>
  },
  {
    path:"/video",
    element:<Video/>
  }

])
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <RouterProvider router={router}/>
  </React.StrictMode>,
)