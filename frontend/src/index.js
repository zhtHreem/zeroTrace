import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './index.css';
import ResponseForm from './Components/ResponseForm/response';
import App from './App';
import NewForm from './Components/SurveyForm/newform';
import FormPreview from './Components/ResponseForm/response'; // ResponseForm is used for viewing/filling forms
import { Navbar, Footer } from './Components/HomePage/navbar';
import Header from './Components/HomePage/header';
import Recap from './Components/Recapcha/recapcha';
import UserForms from './Components/User/forms';
import UserProfile from './Components/User/profile';
import Survey from './Components/Surveys/survey';
import ResultsPage from './Components/User/results'; // Import ResultsPage

const router = createBrowserRouter([
  {
    path: "/login",
    element: <App />,
  },
  {
    path: "/createform",
    element: <NewForm />,
  },
  {
    path: "/recapcha",
    element: <Recap />,
  },
  {
    path: "/form/:id", // Ensure the form preview route is set up
    element: <ResponseForm />, // Render ResponseForm for form viewing and filling
  },
  {
    path: "/",
    element: <Header />,
  },
  {
    path: "/user/form",
    element: <UserForms />,
  },
  {
    path: "/user/:search",
    element: <UserProfile />,
  },
  {
    path: "/surveys",
    element: <Survey />,
  },
  {
    path: "/results/:formId", // Add route for ResultsPage
    element: <ResultsPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);
