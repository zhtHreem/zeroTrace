import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GoogleLogin } from 'react-google-login';
import backgroundImage from './assets/fingerprint.png';
import './login.css';

const clientId = "723962808269-mqthfe2ndj39j2hh4bvgm4rc2d144r9n.apps.googleusercontent.com";

function Login() {
    const navigate = useNavigate();
    
    const [userData, setUserData] = useState({
        email: '',
        password: '',
        googleId: '',
        allowExtraEmails: false,
    });
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Basic form validation
        if (!userData.email || !userData.password) {
          setError('Email and password are required');
          return;
        }

        // Password validation: minimum 8 characters, at least one letter and one number
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordPattern.test(userData.password)) {
          setError('Password must be at least 8 characters long and contain both letters and numbers.');
          return;
        }
      
        const payload = {
          email: userData.email,
          password: userData.password,
        };
      
        // Add googleId if available
        if (userData.googleId) {
          payload.googleId = userData.googleId;
        }
      
        try {
            const response = await fetch('http://localhost:5000/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
          
            if (!response.ok) {
              const errorDetails = await response.json();
              console.error('Error during login:', errorDetails);
              setError(errorDetails.error || 'Failed to login. Please try again.');
              return;
            }
          
            const data = await response.json();
            console.log("user id:", data.user._id);
            console.log('Login successful:', data);
            localStorage.setItem('user', JSON.stringify(data.user._id));
 
            setError('');
            navigate("/");
          } catch (error) {
            console.error('Error during login:', error.message);
            setError('Failed to login. Try again');
          }
    };

    const handleChange = (event) => {
        const { name, value, checked, type } = event.target;
        const val = type === 'checkbox' ? checked : value;

        setUserData((prevUserData) => ({
            ...prevUserData,
            [name]: val,
        }));
    };

    const onSuccess = (res) => {
        console.log('Login successful! current user:', res.profileObj);
        setUserData((prevData) => ({
          ...prevData,
          googleId: res.profileObj.googleId,
          email: res.profileObj.email,
          name: res.profileObj.name,
        }));
      };
      
    const onFailure = (res) => {
        console.log("Login Failed! res: ", res);
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Please, Login to Continue!</h2>
                <p>Hey, welcome back to your special place</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <h3 style={{ textAlign: 'left' }}>Enter Your Email:</h3>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={userData.email}
                            onChange={handleChange}
                            required
                        />
                        <h3 style={{ textAlign: 'left' }}>Enter Password:</h3>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={userData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="form-options">
                        <label>
                            <input
                                type="checkbox"
                                name="allowExtraEmails"
                                checked={userData.allowExtraEmails}
                                onChange={handleChange}
                            /> Remember me
                        </label>
                        <a href="/forgot-password">Forgot Password?</a>
                    </div>

                    <button type="submit" className="sign-in-button">Sign in</button>

                    <div className="or-separator">OR</div>

                    <div id="signInButton">
                        <GoogleLogin
                            clientId={clientId}
                            buttonText="Login with Google"
                            onSuccess={onSuccess}
                            onFailure={onFailure}
                            cookiePolicy={'single_host_origin'}
                            isSignedIn={true}
                            className="google-login-button"
                        />
                    </div>
                </form>
            </div>

            <div className="login-image" style={{ backgroundImage: `url(${backgroundImage})` }}>
            </div>
        </div>
    );
}

export default Login;
