

import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import "./recapcha.css";

export default function Recaptcha({ onChange }) {
  return (
    <div className="recaptcha-container">
      <ReCAPTCHA
        sitekey="6LdNDYUqAAAAAL0jrLOMSRrDE5DL7F5CAZ_zNOfT"
        onChange={onChange}
      />
    </div>
  );
}