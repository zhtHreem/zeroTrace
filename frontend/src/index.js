import React from 'react';
import ReactDOM from 'react-dom/client';
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
    path:"/createform",
    element:<NewForm/>
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
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
