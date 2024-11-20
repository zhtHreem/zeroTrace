import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './index.css';
import ResponseForm from './Components/ResponseForm/response';
import App from './App';
import NewForm from './Components/SurveyForm/newform';
import FormPreview from './Components/ResponseForm/response';
import { Navbar,Footer } from './Components/HomePage/navbar';
import Header from './Components/HomePage/header';
import Recap from './Components/Recapcha/recapcha';
const router = createBrowserRouter([
  {
    path: "/login",
    element: <App />,
  },
  {
    path:"/createform",
    element:<NewForm/>
  },
  {
    path: "/recapcha",
    element: <Recap />
  },
  {
    path:"/form",
    element:<FormPreview/>
  },{
    path:"/",
    element:<Header/>
  }
  


]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
      <RouterProvider router={router} />

);
