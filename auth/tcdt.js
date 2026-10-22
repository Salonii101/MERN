import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLIENT_NAME;
const apiKey = process.env.CLOUDINARY_CLIENT_API;
const apiSecret = process.env.CLOUDINARY_CLIENT_SECRET;

async function testUpload() {
    try {
        console.log("=================================");
        console.log("DIRECT CLOUDINARY UPLOAD TEST");
        console.log("=================================");

        console.log("Cloud Name:", cloudName);
        console.log("API Key:", apiKey);
        console.log("API Secret exists:", !!apiSecret);

        const form = new FormData();

        form.append(
            "file",
            fs.createReadStream("./test.txt")
        );

        const url =
            `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

        console.log("URL:", url);
        console.log("Uploading...");

        const response = await axios.post(
            url,
            form,
            {
                auth: {
                    username: apiKey,
                    password: apiSecret,
                },

                headers: {
                    ...form.getHeaders(),
                },

                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        console.log("=================================");
        console.log("UPLOAD SUCCESS");
        console.log("=================================");

        console.log(response.data);

    } catch (error) {

        console.log("=================================");
        console.log("UPLOAD FAILED");
        console.log("=================================");

        console.log("HTTP STATUS:");
        console.log(error.response?.status);

        console.log("\nX-Cld-Error:");
        console.log(
            error.response?.headers?.["x-cld-error"]
        );

        console.log("\nResponse Headers:");
        console.log(error.response?.headers);

        console.log("\nResponse Data:");
        console.log(error.response?.data);

        console.log("\nAxios Message:");
        console.log(error.message);

        console.log("=================================");
    }
}

testUpload();