import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import NewForm from './Components/SurveyForm/newform';
import FormPreview from './Components/ResponseForm/response';
import { Navbar,Footer } from './Components/HomePage/navbar';
import Header from './Components/HomePage/header';
const router = createBrowserRouter([
  {
    path: "/login",
    element: <App />,
  },
  {
    path:"/forms",
    element:<NewForm/>
  },
  {
    path:"/rform",
    element:<FormPreview/>
  },{
    path:"/",
    element:<Header/>
  }
  


]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <RouterProvider router={router} />
   
  </React.StrictMode>
);
