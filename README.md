# ZeroTrace: Anonymous Surveys Using Zero-Knowledge Proofs (ZKPs)

## Project Overview
**ZeroTrace** is an innovative survey system designed to ensure complete anonymity for participants while maintaining the integrity and reliability of collected data. Using advanced cryptographic techniques, specifically **Zero-Knowledge Proofs (ZKPs)**, this project enables participants to submit responses without exposing any personal information.  

With features like verifiable response uniqueness, bot prevention, and time-locked response access, **ZeroTrace** redefines how surveys are conducted in the digital age by prioritizing user privacy and data integrity.  

---

## Features  
- **Verifiable Response Uniqueness**:  
  Participants can only submit their response once, ensuring data integrity without storing personal or identifiable information using Zero-Knowledge Proofs (ZKPs).  

- **Proof of Human**:  
 The application incorporates Google reCAPTCHA for human verification when submitting form responses. This feature ensures that only genuine users can submit forms, enhancing security and preventing automated bots from submitting false data.
- **Time-Locked Survey Responses**:  
 The ones who make form allocate an encryption time. Once the form is activated from their profille page by clicking allocate, the encryption timer starts and users can then submit their responses till the timer ends. Responses are all decrypted till the timer ends.

- **Complete Anonymity**:  
  Ensures no identifiable data is stored or accessible at any stage, maintaining participant confidentiality.  

## How to Use  

- **Sign Up/Log In**:  
  Create an account to access the survey system, or log in to your existing account.  

- **Homepage**:  
  View surveys available for participation .  
- **Encryption Key Generation**

  use command 
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'));"
  to generate a 256-bit key you need to add in backend/.env file

- **Profile Page**:  
  - **Survey Management**:  
    - **Create New Survey**: Use this option to design and publish a new survey.  
    - **View Created Surveys**: See the list of surveys you have created.  

- **Response Form**:  
  Participate in a survey by answering questions anonymously and submitting your response.  

- **Result Button**:  
  Access the results of your surveys after the time-lock period ends, ensuring no early bias in responses.  

---

## Framework & Technology  

**ZeroTrace** is built using the MERN stack and additional tools for enhanced functionality:  

- **MongoDB**: For secure and efficient data storage.  
- **Express.js**: Backend framework for managing server logic and handling API requests.  
- **React.js**: Frontend framework for building an intuitive and interactive user interface.  
- **Node.js**: Runtime environment for executing server-side code.  

### Additional Tools  
- **circomlibjs** & **snarkjs**: For implementing Zero-Knowledge Proofs (ZKPs) to ensure privacy and data integrity.  
- **bcryptjs**: Provides secure password hashing for user authentication.  
- **Node-cron**: Automates scheduling of tasks like time-locking survey responses.  
 
---

## Installation & Setup

### Prerequisites:
- Node.js and npm installed on your system.
- MongoDB server running locally or on a cloud platform.

### Steps:
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/zhtHreem/zeroTrace.git
   cd ZeroTrace
2.To run **Backend** 
   ```bash
     cd backend
     nodemon server.js
   ```
3.To run **Frontend** open new terminal
   ```bash
     cd frontend
     npm start
   ```

   
