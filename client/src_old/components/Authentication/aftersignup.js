import React from 'react'
import { Link } from 'react-router-dom'

function Aftersignup() {
  // Get Farmer ID from URL query parameter
  const params = new URLSearchParams(window.location.search);
  const farmerId = params.get('farmerid');

  return (
    <>
      <div className="auth-wrapper">
        <div className="auth-inner">
          <h3 style={{ color: "green", marginBottom: "15px" }}>Registration Successful!</h3>
          {farmerId ? (
            <>
              <h4>Your Unique Farmer ID:</h4>
              <div style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#0163d2",
                backgroundColor: "#f0f7ff",
                padding: "15px 25px",
                borderRadius: "10px",
                margin: "15px 0",
                letterSpacing: "3px",
                border: "2px dashed #0163d2",
                userSelect: "all",
                cursor: "pointer"
              }}>
                {farmerId}
              </div>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
                Click the ID above to select it, then copy and save it for login.
              </p>
            </>
          ) : (
            <h4>   Your account has been created successfully!</h4>
          )}
          <p>Now login with your Unique ID or Mobile Number</p>
          <Link to={"/sign-in"} style={{
            display: "inline-block",
            padding: "10px 30px",
            backgroundColor: "#0163d2",
            color: "white",
            borderRadius: "5px",
            textDecoration: "none",
            marginTop: "10px"
          }}>Go to Login</Link>
        </div>
      </div>
    </>
  )
}

export default Aftersignup