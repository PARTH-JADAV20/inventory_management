import "./App.css";
import "./styles.scss";
import Board from "./components/Board";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { auth } from "./components/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

function App() {
  const [clickCount, setClickCount] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [otp, setOtp] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const phoneNumber = "+919265517355"; // Replace with a valid number
  const recaptchaVerifier = useRef(null);

  const initializeRecaptcha = async (retryCount = 0, maxRetries = 3) => {
    if (!auth || !document.getElementById("recaptcha-container") || recaptchaVerifier.current) {
      console.log("Skipping reCAPTCHA init: conditions not met");
      return;
    }

    console.log(`Initializing RecaptchaVerifier (Attempt ${retryCount + 1}/${maxRetries})...`);
    try {
      recaptchaVerifier.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "normal", // Visible for debugging
        callback: () => {
          console.log("reCAPTCHA resolved");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired");
          setStatusMsg("reCAPTCHA expired. Please try again.");
          recaptchaVerifier.current = null;
        },
        "error-callback": (err) => {
          console.error("reCAPTCHA error:", err);
          setStatusMsg("reCAPTCHA failed. Check network or browser settings.");
          recaptchaVerifier.current = null;
        },
      });
      await recaptchaVerifier.current.render();
      console.log("reCAPTCHA rendered successfully");
    } catch (error) {
      console.error("RecaptchaVerifier init failed:", error, {
        code: error.code,
        message: error.message,
        details: error.details || "No additional details",
      });
      let errorMessage = "Failed to initialize reCAPTCHA.";
      if (error.code === "auth/network-request-failed") {
        errorMessage = `Network error rendering reCAPTCHA (Attempt ${retryCount + 1}/${maxRetries}). Check internet, firewall, or ad blockers.`;
        if (retryCount < maxRetries) {
          console.log(`Retrying reCAPTCHA initialization in 2s...`);
          setTimeout(() => initializeRecaptcha(retryCount + 1, maxRetries), 2000);
          return;
        }
      }
      setStatusMsg(errorMessage);
    }
  };

  // Initialize reCAPTCHA when popup opens
  useEffect(() => {
    if (showLogin || showReset) {
      initializeRecaptcha();
    }
    return () => {
      if (recaptchaVerifier.current) {
        console.log("Clearing RecaptchaVerifier...");
        try {
          recaptchaVerifier.current.clear();
        } catch (err) {
          console.error("reCAPTCHA cleanup error:", err);
        }
        recaptchaVerifier.current = null;
      }
    };
  }, [showLogin, showReset]);

  const handleClick = () => {
    setClickCount((prevCount) => {
      if (prevCount + 1 === 3) {
        handleVoiceAuth();
        return 0;
      }
      return prevCount + 1;
    });
  };

  const handleVoiceAuth = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setStatusMsg("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Heard:", transcript);

      const secretPhrase = "open the portal";
      if (transcript.includes(secretPhrase)) {
        window.location.href = "https://inventory-tool-1.netlify.app/?auth=true";
        // window.location.href = "http://localhost:5174/?auth=true";
      } else {
        setStatusMsg("Incorrect phrase. Try again!");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setStatusMsg("Speech recognition error. Try again.");
    };
  };

  const handleAdminClick = () => {
    setAdminClickCount((prev) => {
      if (prev + 1 === 3) {
        setShowLogin(true);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", { username, password });
      if (res.data.success) {
        window.location.href = "http://localhost:5174/salespage?auth=true";
      } else {
        setStatusMsg(res.data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setStatusMsg("Login failed. Please check your connection or try again.");
    }
  };

  const handleForgot = async () => {
    if (!phoneNumber) {
      setStatusMsg("Please provide a phone number.");
      return;
    }

    setMaskedPhone("****" + phoneNumber.slice(-4));
    setStatusMsg("Sending OTP...");

    try {
      if (!recaptchaVerifier.current) {
        await initializeRecaptcha();
        if (!recaptchaVerifier.current) {
          setStatusMsg("reCAPTCHA not ready. Please refresh and try again.");
          return;
        }
        console.log("Verifying reCAPTCHA...");
        await recaptchaVerifier.current.verify();
        console.log("Sending OTP to:", phoneNumber);
        const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current);
        setConfirmationResult(result);
        setShowReset(true);
        setStatusMsg(`OTP sent to ${maskedPhone}. Please enter the code.`);
        console.log("OTP sent successfully");
      }
    } catch (err) {
      console.error("OTP send error:", err, {
        code: err.code,
        message: err.message,
        details: err.details || "No additional details",
      });
      let errorMessage = "Failed to send OTP.";
      switch (err.code) {
        case "auth/invalid-phone-number":
          errorMessage = "Invalid phone number format. Use E.164 format (e.g., +91xxxxxxxxxx).";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Wait 5-10 minutes and try again.";
          break;
        case "auth/invalid-app-credential":
          errorMessage = "reCAPTCHA passed but auth failed. Check API key or Firebase config.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error sending OTP. Check internet, firewall, or ad blockers.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Phone auth not enabled in Firebase Console.";
          break;
        default:
          errorMessage = `Error: ${err.message}`;
      }
      setStatusMsg(errorMessage);
      recaptchaVerifier.current = null;
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!confirmationResult) {
      setStatusMsg("OTP verification process not started.");
      return;
    }

    if (!otp) {
      setStatusMsg("Please enter the OTP.");
      return;
    }

    setStatusMsg("Verifying OTP...");
    try {
      await confirmationResult.confirm(otp);
      const res = await axios.post("http://localhost:5000/auth/reset", {
        newUsername,
        newPassword,
        phoneNumber,
      });

      if (res.data.success) {
        setStatusMsg("Credentials updated successfully!");
        setTimeout(() => {
          setShowReset(false);
          setShowLogin(false);
          setStatusMsg("");
          setOtp("");
          setNewUsername("");
          setNewPassword("");
          setConfirmationResult(null);
          if (recaptchaVerifier.current) {
            recaptchaVerifier.current.clear();
            recaptchaVerifier.current = null;
          }
        }, 2000);
      } else {
        setStatusMsg(res.data.message || "Server error during update.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      let errorMessage = "Failed to reset credentials.";
      if (err.code === "auth/invalid-verification-code") {
        errorMessage = "Incorrect OTP. Please try again.";
      } else if (err.code === "auth/expired-verification-code") {
        errorMessage = "OTP has expired. Request a new one.";
      }
      setStatusMsg(errorMessage);
      recaptchaVerifier.current = null;
    }
  };

  return (
    <>
      <div className="container">
        <h1 onClick={handleAdminClick} className="title-clickable">
          2048
        </h1>
        <Board />
        <p className="game-description">
          Join the numbers and get to the <strong>2048 tile!</strong> Use{" "}
          <strong>arrow keys</strong> to move the tiles. When two tiles with the
          same number touch, they{" "}
          <strong>
            merge into <span onClick={handleClick} className="merge-click">one!</span>
          </strong>
        </p>
        <p>Created with React | How to play: Combine tiles to reach 2048!</p>
      </div>

      {showLogin && (
        <div className="popup-overlay" style={{ zIndex: 1000 }}>
          <div className="popup-box" style={{ zIndex: 1001, position: "relative" }}>
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
            <p
              style={{ cursor: "pointer", color: "blue", marginTop: "10px", textAlign: "left", fontSize: "10px" }}
              onClick={handleForgot}
            >
              Forgot Username/Password?
            </p>
            {statusMsg && (
              <p style={{ marginTop: "10px", color: statusMsg.includes("successfully") ? "green" : "red" }}>
                {statusMsg}
              </p>
            )}
            <div id="recaptcha-container" style={{ zIndex: 1002, position: "relative", marginTop: "10px" }}></div>
          </div>
        </div>
      )}

      {showReset && (
        <div className="popup-overlay" style={{ zIndex: 1000 }}>
          <div className="popup-box" style={{ zIndex: 1001, position: "relative" }}>
            <h2>Reset Credentials</h2>
            {maskedPhone && <p>Enter the code sent to {maskedPhone}</p>}
            <form onSubmit={handleReset}>
              <input
                type="text"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="New Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Update</button>
            </form>
            {statusMsg && (
              <p style={{ marginTop: "10px", color: statusMsg.includes("successfully") ? "green" : "red" }}>
                {statusMsg}
              </p>
            )}
            <div id="recaptcha-container" style={{ zIndex: 1002, position: "relative", marginTop: "10px" }}></div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;