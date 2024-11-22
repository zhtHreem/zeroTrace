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
import UserForms from './Components/User/forms';
import UserProfile from './Components/User/profile';
import Survey from './Components/Surveys/survey';
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
    path:"/form/:id",
    element:<FormPreview/>
  },{
    path:"/",
    element:<Header/>
  },{
    path:"/user/form",
    element:<UserForms/>
  },{
    path:"/user/:search",
    element:<UserProfile/>
  },{
    path:"/surveys",
    element:<Survey/>
  }
  


]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
      <RouterProvider router={router} />

);
