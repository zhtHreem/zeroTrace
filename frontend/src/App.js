import logo from './logo.svg';
import './App.css';
import LoginButton from './Components/Login/login';
import {useEffect} from 'react';
import { gapi } from 'gapi-script';


const clientId = "723962808269-mqthfe2ndj39j2hh4bvgm4rc2d144r9n.apps.googleusercontent.com"

function App() {

  useEffect (() => {
    function start(){
      gapi.client.init({
        clientId : clientId,
        scope: ""
      })
    };

    gapi.load('client:auth2', start)
  });

  return (
    <div className="App">
      <LoginButton/>
    </div>
  );
}

export default App;
