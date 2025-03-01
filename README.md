# ClickStream Analytics: Track and Analyze User Click Behavior in Real-Time

ClickStream Analytics is a serverless web application that tracks, stores, and analyzes user click interactions across popular web platforms. The application captures detailed click events including device information, geolocation data, and temporal patterns, providing valuable insights into user behavior.

The system consists of a React-based frontend for user interaction, a Node.js backend service for data collection, and an AWS-powered data pipeline for storage and analysis. It features real-time click tracking with geolocation support, automated daily data exports to S3 in Parquet format, and a containerized deployment architecture for scalability and reliability.

## Repository Structure

```
.
├── Dockerfile                 # Container configuration for Node.js backend service
├── lambda
│   └── lambda_function.py    # AWS Lambda function for daily DynamoDB to S3 exports
├── package.json              # Project dependencies and scripts configuration
├── public                    # Static assets and web app configuration
│   ├── index.html           # Main HTML entry point
│   ├── manifest.json        # PWA configuration
│   └── robots.txt           # Search engine crawling rules
└── src
    ├── App.js               # Main React component with click tracking logic
    ├── index.js             # React application entry point
    └── server.js            # Express backend for handling click events
```

## Usage Instructions

### Prerequisites

- Node.js v18 or higher
- AWS account with configured credentials
- Docker (for containerized deployment)
- Python 3.8+ (for Lambda function)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/rohithgowthamg4927/clickweb.git
cd clickweb
```

2. Install dependencies:

```bash
npm install
```

3. Configure AWS credentials:

```bash
aws configure
```

### Quick Start

1. Start the development server:

```bash
npm start
```

2. Start the backend service:

```bash
node src/server.js
```

3. Access the application at `http://localhost:3000`

4. Alternatively, use https://click.rohithgowthamg.cloud

#### Tracking Click Events

```javascript
// Example click event data
{
  "id": "unique-uuid",
  "button": "Google",
  "timestamp": "2023-07-20T10:30:00",
  "pageUrl": "https://www.google.com",
  "device": {
    "deviceType": "Desktop",
    "platform": "Windows",
    "browser": "Chrome"
  },
  "location": {
    "city": "New York",
    "country": "USA"
  }
}
```

#### Accessing Exported Data

```python
import pandas as pd

# Read exported Parquet file from S3
df = pd.read_parquet('s3://clickevents/year=2025/month=02/day=20/dynamodb_export.parquet')
```

### Troubleshooting

#### Backend Connection Issues

- Error: "Could not log click for <button-name>"
  1. Verify AWS credentials are properly configured
  2. Check DynamoDB table permissions
  3. Ensure the correct region is set in `server.js`

#### Geolocation Not Working

1. Check browser permissions for location access
2. Verify HTTPS is enabled for production deployment
3. Monitor browser console for specific error messages

## Data Flow

The application implements a multi-stage data pipeline that captures click events, processes them through various AWS services, and stores them for analysis.

```ascii
User Click → React App → Express Backend(ECS Fargate) → DynamoDB → Lambda → S3
   [Event]     [Capture]       [Process]                 [Store]    [Export] [Archive]
```

Key component interactions:

1. React frontend captures click events with device and location data
2. Express backend validates and enriches the click data
3. DynamoDB stores events in real-time with automatic scaling
4. Lambda function runs daily to export data to S3 in Parquet format
5. S3 maintains a partitioned data lake structure by date
6. All components use AWS SDK for secure service communication
7. Error handling and retries are implemented at each stage

## Infrastructure

### Lambda Functions

- `click-export-lambda`
  - Type: AWS::Lambda::Function
  - Purpose: Daily export of click events from DynamoDB to S3
  - Runtime: Python 3.13
  - Memory: 256MB
  - Timeout: 10 seconds

### DynamoDB Tables

- `ClickEvents`
  - Primary Key: id (String)
  - Attributes: button, timestamp, pageUrl, deviceType, platform, browser, city, country

### S3 Buckets

- Click data archive bucket
  - Purpose: Store exported Parquet files
  - Structure: Partitioned by year/month/day
