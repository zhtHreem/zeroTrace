import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import NewForm from './Components/SurveyForm/newform';
import FormPreview from './Components/ResponseForm/response';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path:"/forms",
    element:<NewForm/>
  },
  {
    path:"/rform",
    element:<FormPreview/>
  }
  


]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <RouterProvider router={router} />
   
  </React.StrictMode>
);
