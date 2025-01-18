require("dotenv").config(); // Load environment variables

const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");

// Twilio credentials (replace with your actual values)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

const app = express();
const port = 8000;

app.use(bodyParser.json());

// Send verification code
app.post("/send-code", async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    try {
        const verification = await twilioClient.verify.v2
            .services("YOUR_VERIFICATION_SERVICE_SID") // Set up a Verification Service in Twilio Console
            .verifications.create({
                to: phoneNumber,
                channel: "sms", // You can use 'call' or 'email' for other channels
            });

        res.status(200).json({ message: "Verification code sent", sid: verification.sid });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify the code
app.post("/verify-code", async (req, res) => {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
        return res.status(400).json({ message: "Phone number and code are required" });
    }

    try {
        const verificationCheck = await twilioClient.verify.v2
            .services("YOUR_VERIFICATION_SERVICE_SID")
            .verificationChecks.create({
                to: phoneNumber,
                code: code,
            });

        if (verificationCheck.status === "approved") {
            res.status(200).json({ message: "Phone number verified successfully" });
        } else {
            res.status(400).json({ message: "Invalid code" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
