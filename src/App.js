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

// Function to get device details
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  let deviceType = "Desktop";
  if (/Mobi|Android|iPhone/i.test(userAgent)) {
    deviceType = "Mobile";
  } 
  else if (/iPad|Tablet/i.test(userAgent)) {
    deviceType = "Tablet";
  }

  return {
    deviceType,
    platform,
    browser: userAgent,
  };
};

const getLocation = async () => {
  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try{
            const response = await fetch(
              `https://geocode.xyz/${latitude},${longitude}?geoit=json`
            );
            const data = await response.json();
            resolve({
              city: data.city || "Unknown",
              country: data.country || "Unknown",
            });
          } 
          catch(error){
            console.error("Error fetching location:", error);
            resolve({ city: "Unknown", country: "Unknown" });
          }
        },
        () => {
          console.warn("Location permission denied.");
          resolve({ city: "Unknown", country: "Unknown" });
        }
      );
    } 
    else{
      console.warn("Geolocation not supported.");
      resolve({ city: "Unknown", country: "Unknown" });
    }
  });
};

function App() {
  const [message, setMessage] = useState("");

  const handleClick = async (buttonName) => {
    const deviceInfo = getDeviceInfo();
    const location = await getLocation();

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const istTimeStamp = istTime.toISOString().slice(0, 19);

    try{
      await axios.post("http://15.207.109.203:5000/clicks", {
        id: crypto.randomUUID(),
        button: buttonName,
        timestamp: istTimeStamp,
        pageUrl: buttonUrls[buttonName],
        device: deviceInfo,
        location: location,
      });

      setMessage(`Click logged successfully for ${buttonName} at ${istTimeStamp} IST`);
      window.open(buttonUrls[buttonName], "_blank");
    } 
    catch(error){
      console.error("Error sending click data:", error);
      setMessage("Failed to log click");
    }
  };

  return(
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Click Tracker</h1>
      <button onClick={() => handleClick("Google")}>Google</button>
      <button onClick={() => handleClick("YouTube")}>YouTube</button>
      <button onClick={() => handleClick("Netflix")}>Netflix</button>
      <button onClick={() => handleClick("AWS")}>AWS</button>
      <button onClick={() => handleClick("GitHub")}>GitHub</button>
      <button onClick={() => handleClick("LinkedIn")}>LinkedIn</button>
      <button onClick={() => handleClick("Medium")}>Medium</button>
      <p style={{ color: message.includes("successfully") ? "green" : "red" }}>{message}</p>
    </div>
  );
}

export default App;
