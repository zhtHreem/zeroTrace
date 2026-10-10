import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import NewForm from './Components/SurveyForm/newform';
import ResponseForm from './Components/ResponseForm/response';
import UserProfile from './Components/User/profile';
import Survey from './Components/Surveys/survey';
import ResultsPage from './Components/User/results';
import NotFound from './Components/Landing/NotFound';
import { GoogleOAuthProvider } from '@react-oauth/google';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <App /> },
  { path: '/createform', element: <NewForm /> },
  { path: '/form/:id', element: <ResponseForm /> },
  { path: '/user/:search', element: <UserProfile /> },
  { path: '/surveys', element: <Survey /> },
  { path: '/results/:formId', element: <ResultsPage /> },
  { path: '*', element: <NotFound /> },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
