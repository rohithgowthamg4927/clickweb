const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Configure AWS SDK
AWS.config.update({
  region: "ap-south-1", // Change this to your AWS region
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "ClickEvents"; 

// API Endpoint to Log Clicks
app.post("/clicks", async (req, res) => {
  const { id, button, timestamp, pageUrl, device, location } = req.body;

  if (!id || !button || !timestamp || !pageUrl || !device || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const params = {
    TableName: TABLE_NAME,
    Item: {
      id,
      button,
      timestamp,
      pageUrl,
      deviceType: device.deviceType,
      platform: device.platform,
      browser: device.browser,
      city: location.city,
      country: location.country,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    res.json({ message: "Click logged successfully" });
  } catch (error) {
    console.error("DynamoDB Error:", error);
    res.status(500).json({ error: "Could not log click" });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
