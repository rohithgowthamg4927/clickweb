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
    }

    catch (error) {
      console.error("Error sending click data:", error);
      setMessage(`Failed to log click for ${buttonName}.`);
      setMessageColor("red");
    }
  };

  const handleClick = (buttonName) => {
    const url = buttonUrls[buttonName];
    window.open(url, "_blank");

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported.");
      logClick(buttonName, { city: "Unknown", country: "Unknown" });
      return;
    }

    navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
      if (permissionStatus.state === "denied") {
        console.warn("Location access denied previously.");
        logClick(buttonName, { city: "Unknown", country: "Unknown" });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let location = { city: "Unknown", country: "Unknown" };

          try {
            const response = await fetch(
              `https://geocode.xyz/${latitude},${longitude}?geoit=json`
            );
            const data = await response.json();
            location = { city: data.city || "Unknown", country: data.country || "Unknown" };
          } catch (error) {
            console.error("Error fetching location:", error);
          }

          logClick(buttonName, location);
        },
        (error) => {
          console.warn("Location permission denied or error:", error);
          logClick(buttonName, { city: "Unknown", country: "Unknown" });
        }
      );
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Click Tracker!</h1>
      {Object.keys(buttonUrls).map((name) => (
        <button key={name} onClick={() => handleClick(name)} style={{ margin: "5px" }}>
          {name}
        </button>
      ))}
      {message && (
        <p style={{ marginTop: "20px", fontSize: "18px", color: messageColor }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
