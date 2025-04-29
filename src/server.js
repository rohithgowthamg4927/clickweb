import 'dotenv/config';
import express from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Configure AWS with explicit credentials
const client = new DynamoDBClient();

const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "ClickEvents";

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
    await dynamoDB.send(new PutCommand(params));
    res.json({ message: "Click logged successfully" });
  } catch (error) {
    console.error("DynamoDB Error:", error);
    res.status(500).json({ error: "Could not log click" });
  }
});

app.get("/health", (req, res) => {
  const timestamp = new Date().toISOString();
  res.json({ status: "Server healthy", timestamp });
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running.`);
});
