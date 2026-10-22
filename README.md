
# SafeNet —File Security Platform

SafeNet is a platform designed to help users analyze potential digital threats, securely manage files, and access AI-assisted security guidance. It combines malware and URL scanning, encrypted cloud storage, and intelligent threat analysis in a unified application.

## Key Features

- **User Authentication:** Registration, login, OTP verification, and password recovery.
- **Malware Scanning:** Analyze suspicious files using VirusTotal integration.
- **URL Threat Analysis:** Inspect URLs for potential phishing and other security risks.
- **AI-Powered Threat Assessment:** Use Google's Gemini AI to generate threat explanations and remediation guidance.
- **Secure File Storage:** Integrate AWS S3 and Cloudinary for cloud-based file management.
- **File Encryption:** Use AES-256-GCM authenticated encryption to protect file contents before storage.
- **File Management:** Upload, list, download, decrypt, and delete user files through authenticated APIs.
- **Cybersecurity Chatbot:** Provide AI-assisted explanations of security concepts, vulnerabilities, and mitigation strategies.
- **Security Middleware:** Apply request validation, rate limiting, secure HTTP headers, and centralized error handling.

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- REST APIs
- JSON Web Tokens (JWT)
- AES-256-GCM encryption
- Google Gemini API
- VirusTotal API

### Frontend
- React.js
- JavaScript
- CSS
- Responsive UI and interactive animations

### Cloud Services
- AWS S3
- Cloudinary

## Project Structure

```text
MERN/
├── auth/                  # Backend application
│   ├── controllers/       # API controllers and business logic
│   ├── models/            # Database models
│   ├── routes/            # API route definitions
│   ├── utils/             # Encryption and utility functions
│   └── app.js             # Express application entry point
│
├── client/                # React frontend
│   └── src/
│       ├── components/    # Reusable UI components
│       └── App.jsx        # Frontend routing and application setup
│
├── .gitignore
└── README.md
```

*The structure above is representative; adjust it to match the actual files in your repository.*

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB instance
- Git
- API credentials for the external services you intend to use

### 1. Clone the Repository

```bash
git clone https://github.com/Salonii101/MERN.git
cd MERN
```

### 2. Configure the Backend

```bash
cd auth
npm install
```

Create a `.env` file in the backend directory and configure the environment variables required by your application.

Typical configuration includes:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
VIRUSTOTAL_API_KEY=your_virustotal_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Use the exact variable names expected by your application. Configure email, OTP, encryption, and frontend URL settings if required by your code.

Start the backend using the script defined in `auth/package.json`, for example:

```bash
npm run dev
```

### 3. Configure the Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by the frontend development server.

## Security Considerations

- Never commit `.env` files, API keys, passwords, or private credentials.
- Keep private cloud storage objects inaccessible to unauthorized users.
- Validate file types, file sizes, and user permissions on the server.
- Use authenticated encryption and securely manage encryption keys.
- Apply rate limits to authentication, file upload, and scanning endpoints.
- Treat AI-generated threat assessments as advisory rather than definitive malware verdicts.
- Use HTTPS and secure session or cookie settings in production.

## Project Objective

SafeNet was developed as a learning and implementation project to gain practical experience in backend development, REST API integration, cybersecurity workflows, secure file handling, cloud storage, and AI-assisted threat analysis.

## Future Improvements

- Automated security testing and API integration tests.
- More detailed threat analytics and scan history.
- Improved monitoring, logging, and audit trails.
- Deployment with production-ready configuration and CI/CD.
- Enhanced file validation and security reporting.

## Author

**Saloni**

- GitHub: [@Salonii101](https://github.com/Salonii101)
- LinkedIn: [Connect on LinkedIn](https://linkedin.com/in/saloni-0ab8342aa)
