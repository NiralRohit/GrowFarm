import React, { useEffect, useContext, useState } from "react";
import "./Expertregistration.css"

function Expertregistration() {
  const handleChange = (event) =>
    setFormData({ ...formData, [event.target.name]: event.target.value });

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Mobile_no: "",
    Password: "",
  });

  console.log(formData);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/expert/registration",
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
       <div className="auth-wrapper_ExpertSignup">
      <div className="auth-inner_ExpertSignup">
      <form id="exoertsignup_form"onSubmit={handleSubmit}>
        <h2 id="exoertsignup_h2">Expert Registration</h2>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="Name"
            value={formData.Name}
            className="form-control"
            id="exoerts_signupdata"
            placeholder="Enter Your Full Name"
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="text"
            name="Email"
            value={formData.Email}
            className="form-control"
            id="exoerts_signupdata"
            placeholder="Enter Your Email"
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div>
          <label>Mobile Number</label>
          <input
            type="text"
            name="Mobile_no"
            value={formData.Mobile_no}
            className="form-control"
            id="exoerts_signupdata"
            placeholder="Enter Mobile Number"
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
            id="exoerts_signupdata"
            placeholder="Enter Password"
            onChange={(e) => handleChange(e)}
          />
        </div>
        <button id="exoert_singupbtn" type="submit">Submit</button>
      </form>

      <div id="expert_rightside">
          <img id="expert_rightimg" src="./imgs/admin.jpg" alt="expert_signupimg"></img>
        </div>

     
            </div>
            </div>

            <p className="forgot-password text-center">
              Already registered <a id="exoert_signup_pageflow" href="/Expertlogin">Expert Login ?</a>
              <a id="exoert_signup_pageflow" className="Farmer_Sign_Up"href="/sign-in">  Farmer Sign Up </a> <br />
            </p>

            
    </>
  );
}

export default Expertregistration;
