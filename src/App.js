import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const buttonUrls = {
  Google: "https://www.google.com",
  YouTube: "https://www.youtube.com",
  Netflix: "https://www.netflix.com",
  AWS: "https://aws.amazon.com",
  GitHub: "https://github.com",
  LinkedIn: "https://www.linkedin.com",
  Medium: "https://medium.com",
};

const BIG_DATA_CLOUD_API_KEY = process.env.CLOUD_API_KEY;

const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  let deviceType = "Desktop";
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) || /iPhone|iPad|iPod/.test(platform)) {
    deviceType = "Mobile";
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = "Tablet";
  }

  return {
    deviceType,
    platform,
    browser: userAgent,
  };
};

function App() {
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("black");
  const [loading, setLoading] = useState(false);
  const [currentButton, setCurrentButton] = useState(null);

  const logClick = async (buttonName, location) => {
    const deviceInfo = getDeviceInfo();
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const istTimeStamp = istTime.toISOString().slice(0, 19);
    setMessageColor("black");

    try {
      await axios.post("https://api.rohithgowthamg.cloud/clicks", {
        id: crypto.randomUUID(),
        button: buttonName,
        timestamp: istTimeStamp,
        pageUrl: buttonUrls[buttonName],
        device: deviceInfo,
        location: location,
      });

      setMessage(`Click logged successfully for ${buttonName} at ${istTimeStamp} IST`);
      setMessageColor("green");
    } catch (error) {
      console.error("Error sending click data:", error);
      setMessage(`Failed to log click for ${buttonName}.`);
      setMessageColor("red");
    }
  };

  const handleClick = (buttonName) => {
    const url = buttonUrls[buttonName];
    setLoading(true);
    setCurrentButton(buttonName);
    setMessage("");
    
    //start 3 sec timer for loading
    setTimeout(() => {
      setLoading(false);
    }, 3000);

    const processClick = async () => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported.");
        await logClick(buttonName, { city: "Unknown", country: "Unknown" });
        return;
      }

      const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
      if (permissionStatus.state === "denied") {
        console.warn("Location access denied.");
        await logClick(buttonName, { city: "Unknown", country: "Unknown" });
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        let location = { city: "Unknown", country: "Unknown" };

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en&key=${BIG_DATA_CLOUD_API_KEY}`
          );
          const data = await response.json();
          location = { 
            city: data.city || "Unknown", 
            country: data.countryName || "Unknown" 
          };
        } catch (error) {
          console.error("Error fetching location from BigDataCloud:", error);
        }

        await logClick(buttonName, location);
      } catch (error) {
        console.warn("Location permission denied or error:", error);
        await logClick(buttonName, { city: "Unknown", country: "Unknown" });
      }
    };

    processClick().then(() => {
      setTimeout(() => {
        window.open(url, "_blank");
      }, 3000);
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>ClickStream Tracker</h1>

      {Object.keys(buttonUrls).map((name) => (
        <button key={name} onClick={() => handleClick(name)} style={{ margin: "5px" }}>
          {name}
        </button>
      ))}

      {loading && (
        <div style={{ marginTop: "20px" }}>
          <div className="spinner"></div>
          <p style={{ fontSize: "18px", color: "blue" }}>Logging your click for {currentButton}</p>
        </div>
      )}

      {!loading && message && (
        <p style={{ marginTop: "20px", fontSize: "18px", color: messageColor }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
