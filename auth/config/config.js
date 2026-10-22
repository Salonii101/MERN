import dotenv from "dotenv";

// Load .env from project root
dotenv.config();

export const configEnv = {
    PORT: process.env.PORT || 5000,
    FRONTEND_URL: process.env.FRONTEND_URL,

    // MongoDB
    MONGO_URI: process.env.MONGO_URI,

    // JWT
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_EXPIRE: process.env.JWT_EXPIRE,

    // Cookies
    COOKIE_EXPIRE: process.env.COOKIE_EXPIRE,

    // SMTP
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_SERVICE: process.env.SMTP_SERVICE,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_MAIL: process.env.SMTP_MAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,

    // Cloudinary
    CLOUDINARY_NAME: process.env.CLOUDINARY_CLIENT_NAME,
    CLOUDINARY_API: process.env.CLOUDINARY_CLIENT_API,
    CLOUDINARY_SECRET: process.env.CLOUDINARY_CLIENT_SECRET,

    // API Keys
    VIRUSTOTAL_API_KEY: process.env.VIRUSTOTAL_API_KEY,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
};
