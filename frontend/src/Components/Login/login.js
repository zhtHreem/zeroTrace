import React from 'react';
import { GoogleLogin } from 'react-google-login';
import backgroundImage from './assets/fingerprint.png'
import './login.css';

const clientId = "723962808269-mqthfe2ndj39j2hh4bvgm4rc2d144r9n.apps.googleusercontent.com";

function Login() {

    const onSuccess = (res) => {
        console.log("Login successful! current user: ", res.profileObj);
    };

    const onFailure = (res) => {
        console.log("Login Failed! res: ", res);
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Please, Login to Continue!</h2>
                <p>Hey, welcome back to your special place</p>

                <form>
                    <div className= "input-container">
                    <h3 style={{textAlign : 'left'}}>Enter Your Email:</h3>
                    <input type="email" placeholder="Email Address" required />
                    <h3 style={{textAlign : 'left'}}>Enter Password: </h3>
                    <input type="password" placeholder="Password" required />
                    </div>
                    <div className="form-options">
                        <label>
                            <input type="checkbox" /> Remember me
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

                <p className="sign-up-text">
                    Don’t have an account? <a href="/sign-up">Sign Up</a>
                </p>
            </div>

            <div className="login-image" style={{ backgroundImage: `url(${backgroundImage})` }}>
   
            </div>
        </div>
    );
}

export default Login;
