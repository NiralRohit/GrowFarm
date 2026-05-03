import React, { useEffect, useContext, useState } from "react";
import "./Expertlogin.css"

function Expertregistration() {
  const handleChange = (event) =>
    setFormData({ ...formData, [event.target.name]: event.target.value });

  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
  });

  console.log(formData);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/expert/expert_login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      console.log(data);
      alert(data.status)
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="auth-wrapper_ExpertLogin">
        <div className="auth-inner_ExpertLogin">
          <form id="expertlogin_form" onSubmit={handleSubmit}>
            <h2 id="expertlogin_h2">Expert Login</h2>
            <div>
              <label>Email</label>
              <input
                type="text"
                name="Email"
                value={formData.Email}
                className="form-control"
                id="expert_logindata"
                placeholder="Enter Your Email"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="text"
                name="Password"
                value={formData.Password}
                className="form-control"
                id="expert_logindata"
                placeholder="Enter Password"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <button type="submit" id="expert_singinbtn">Submit</button>
          </form>

          <div id="expert_rightside">
            <img id="exert_rightimg" src="./imgs/admin.jpg" alt="expert_loginimg"></img>
          </div>

        </div>
      </div>
      <p className="forgot-password text-center">
        New User ? <a id="expert_login_pageflow" href="/Expertregistration">Expert Register</a>
      </p>
    </>
  );
}

export default Expertregistration;
