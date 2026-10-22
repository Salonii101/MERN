import fs from "fs";
import { encryptFile, decryptFile } from "./encrypt.util.js"; 

const password = "SuperSecret123!";

// 1️⃣ Prepare a test file
const originalFile = "test.txt";
fs.writeFileSync(originalFile, "This is a secret message to test encryption!");

// 2️⃣ Encrypt the file
encryptFile(originalFile, password);

// 3️⃣ Decrypt the file
const encryptedFile = originalFile + ".enc";
decryptFile(encryptedFile, password);

// 4️⃣ Verify the decrypted file matches the original
const decryptedFile = encryptedFile.replace(".enc", ".dec");
const originalData = fs.readFileSync(originalFile, "utf-8");
const decryptedData = fs.readFileSync(decryptedFile, "utf-8");

if (originalData === decryptedData) {
  console.log("Test Passed: Decrypted file matches the original");
} else {
  console.log("Test Failed: Decrypted file does NOT match the original");
}
