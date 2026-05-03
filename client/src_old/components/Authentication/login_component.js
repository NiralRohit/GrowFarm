import React, { Component, useContext, useState } from "react";
import { sha256 } from 'js-sha256'
import { AppContext } from "../AuthenticateFarmer/Farmer_account/appContext";
import io from 'socket.io-client'
import "./login.css"
import Button from 'react-bootstrap/Button';


export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      auth: localStorage.getItem("user"),
      Mobilenum: "",
      Password: "",
      Mobilenumfield: false,
      Uniqeidfield: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.socket = io('http://localhost:7000')
  }

  selectMobilenum(e) {
    this.setState({
      Mobilenumfield: true,
      Uniqeidfield: false,
    })
  }
  selectUniqeid(e) {
    this.setState({
      Mobilenumfield: false,
      Uniqeidfield: true
    })
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.state.Password === "") {
      const Password = this.state.Password;
      const { Mobilenum, Farmerid } = this.state;
      console.log(Mobilenum, Password, Farmerid);
      fetch("http://localhost:8000/farmer/farmerlogin", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          Mobilenum,
          Farmerid,
          Password,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.Farmerid) {
            console.log(data)
            console.log(Password, "pin")
            localStorage.setItem("user", JSON.stringify(data));
            window.location.href = "./Myaccount";
          }
          else {
            // alert(data)
            console.log(data, "else")
            console.log(Password, "pin")
            console.log(data.error, "hahahaha")
            const loginerroralert = data.error
          }
        });
    } else {
      const Password = sha256(this.state.Password);
      const { Mobilenum, Farmerid } = this.state;
      console.log(Mobilenum, Password);
      fetch("http://localhost:8000/farmer/farmerlogin", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          Mobilenum,
          Farmerid,
          Password,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.Farmerid) {
            console.log(data)
            console.log(Password, "pin")
            localStorage.setItem("user", JSON.stringify(data));
            window.location.href = "./Myaccount";
          }
          else {
            // alert(data)
            console.log(data, "else")
            console.log(Password, "pin")
            console.log(data.error, "hahahaha")
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
      <div className="auth-wrapper_Login">
        <div className="auth-inner_Login">
          <form className="form" id="loginform" onSubmit={this.handleSubmit}>
            <h2 id="loginh2">Sign In</h2>
            <div className="radio_div">
              <label>

                <input className="radiobut_div"
                  type="radio"
                  name="subject"
                  onChange={(e) => this.selectMobilenum(e)}
                />Mobile Number
              </label>
              <label>
                <input className="radiobut_div"
                  type="radio"
                  name="subject"
                  onChange={(e) => this.selectUniqeid(e)}
                />Unique Id

              </label>
            </div>



            {this.state.Mobilenumfield ?
              <div className="mb-3">
                <label>Mobile Number</label>
                <input
                  // type="email"

                  className="form-control"
                  id="logindata"
                  placeholder="Enter Your Mobile number"
                  onChange={(e) => this.setState({ Mobilenum: e.target.value })}
                />
              </div> : null
            }
            {this.state.Uniqeidfield ?
              <div className="mb-3">
                <label>Unique Farmer Id</label>
                <input
                  // type="email"

                  className="form-control"
                  id="logindata"
                  placeholder="Enter Your Unique Id"
                  onChange={(e) => this.setState({ Farmerid: e.target.value })}

                />
              </div> : null

            }

            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                id="logindata"
                placeholder="Enter Password"
                onChange={(e) => this.setState({ Password: e.target.value })}
              />
              <p style={{ color: "red", marginTop: "3px" }}>{this.state.loginerroralert}</p>
            </div>

            <div className="d-grid">
              <Button variant="success" type="submit" className="btn btn-primary" id="singinbtn"/*style={{color:"black"}}*/>
                Submit
              </Button>
            </div>
            <p className="forgot-password text-right" >
              <a id="login_pageflow" href="/sign-up">Sign Up</a> <br />
              <a id="login_pageflow" href="/adminlogin">Admin Login</a>
            </p>

          </form>

          <div id="rightside">
            <img id="rightimg" src="./imgs/login_pic.jpg" alt="loginimg"></img>
          </div>
        </div>


      </div>


    );
  }
}
