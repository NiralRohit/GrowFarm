import React, { Component } from "react";
// import { sha256} from 'js-sha256'
import "./adminlogin.css"

export default class adminlogin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      GST_No: "",
      Password: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleSubmit(e) {
    e.preventDefault();
    const { GST_No, Password } = this.state;

    if (!GST_No || !Password) {
      this.setState({ loginerroralert: "Please enter GST Number and Password" });
      return;
    }

    fetch("http://localhost:8000/trader/trader_login", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        GST_No,
        Password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data._id) {
          console.log(data);
          localStorage.setItem("userTrader", JSON.stringify(data));
          window.location.href = "./Trader_Accountpage";
        } else {
          console.log(data, "else");
          const loginerroralert = data.error;
          this.setState({ loginerroralert });
        }
      });
  }
  render() {
    return (
      <div className="auth-wrapper_adminLogin">
        <div className="auth-inner_adminLogin">
          <form className="form" id="adminlogin_form" onSubmit={this.handleSubmit}>
            <h2 id="adminlogin_h2">Trader Login</h2>

            <div className="mb-3">
              <label>GST Number</label>
              <input
                // type="email"
                className="form-control"
                id="admin_logindata"
                placeholder="Enter Your GST number"
                onChange={(e) => this.setState({ GST_No: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                // type="password"
                className="form-control"
                id="admin_logindata"
                placeholder="Enter Password"
                onChange={(e) => this.setState({ Password: e.target.value })}
              />
              <p style={{ color: "red", marginTop: "3px" }}>{this.state.loginerroralert}</p>
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
            <img id="admin_rightimg" src="./imgs/admin_profile.png" alt="Trader Profile"></img>
          </div>

        </div>
      </div>
    );
  }
}
