import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import "./recapcha.css"; // Import the CSS file
export default function Recaptcha() {
  const onChange = (value) => {
    console.log("Captcha value:", value); // Handle verification
  };
  return (
    <div className="recaptcha-container">
      <ReCAPTCHA
        sitekey="6LdNDYUqAAAAAL0jrLOMSRrDE5DL7F5CAZ_zNOfT"
        onChange={onChange}
      />
    </div>
  );
}