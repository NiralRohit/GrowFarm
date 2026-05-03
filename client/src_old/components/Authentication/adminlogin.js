import React, { Component } from "react";
import { sha256} from 'js-sha256'
import "./adminlogin.css"

export default class adminlogin extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      Username: "admin",
      Password: "12345678",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
        
  handleSubmit(e) {
    e.preventDefault();
   
    if(this.state.Password ===""){
      const Password = this.state.Password;
      const { Username , Id  } = this.state;
      console.log(Username,Password ,Id);
      fetch("http://localhost:8000/admin/login", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          Username,
         Password,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.Id) {
            console.log(data)
            console.log(Password , "pin1")
            localStorage.setItem("user", JSON.stringify(data));
            window.location.href = "./findfarmer";
          }
          else{
            // alert(data)
            console.log(data , "else")
            console.log(Password , "pin2")
            console.log(data.error ,"hahahaha")
            const loginerroralert = data.error
            this.setState({
              loginerroralert
            })
            
          }
        });
    }else{
      const Password =sha256(this.state.Password);
      const { Username } = this.state;
      console.log(Username , "username",Password);
      fetch("http://localhost:8000/admin/login", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          Username,
         Password,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data._id) {
            console.log(data)
            console.log(Password , "pin3")
            localStorage.setItem("user", JSON.stringify(data));
            window.location.href = "./findfarmer";
          }
          else{
            // alert(data)
            console.log(data , "else")
            console.log(Password , "pin4else")
            console.log(data.error ,"hahahaha")
            const loginerroralert = data.error
            this.setState({
              loginerroralert
            })
            
          }
        });
    }
   
  }
  render() {
    return (
      <div className="auth-wrapper_adminLogin">
      <div className="auth-inner_adminLogin">
      <form className="form" id="adminlogin_form" onSubmit={this.handleSubmit}>
      <h2 id="adminlogin_h2">Admin Login</h2>
     
         <div className="mb-3">
         <label>User ID</label>
         <input
           // type="email"
           className="form-control"
           id="admin_logindata"
           placeholder="Enter Your Username"
           onChange={(e) => this.setState({ Username: e.target.value })}
         />
       </div> 
        
        <div className="mb-3">
          <label>Password</label>
          <input
            // type="password"
            className="form-control"
            id="admin_logindata"
            placeholder="Enter Password"
            onChange={(e) => this.setState({Password: e.target.value })}
          />
          <p style={{color : "red" , marginTop : "3px"}}>{this.state.loginerroralert}</p> 
        </div>
       
        <div className="d-grid">
          <button type="submit" className="btn btn-primary" id="admin_singinbtn">
            Submit
          </button>
        </div>
        {/* <p className="forgot-password text-right">
          <a id="admin_login_pageflow" href="/sign-up">Farrmer Sign Up</a>
        </p> */}
      </form>

      <div id="admin_rightside">
          <img id="admin_rightimg" src="./imgs/admin_profile.png" alt="Admin Profile"></img>
        </div>

      </div>
      </div>
    );
  }
}
