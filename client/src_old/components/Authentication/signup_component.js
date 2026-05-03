import React, { Component } from "react";
import { sha256 } from "js-sha256";
import "./signup.css";
import app from "./firebase_config";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import axios from "axios";
import Select from "react-select";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { async } from "@firebase/util";
import Alert from "react-bootstrap/Alert";

let otpglobalMob = 0;
let otpglobal = 0;
let newMobilenum = 0;
let Districtss = "";
const auth = getAuth(app);

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Districtdata: [],
      Talukadata: [],
      show: false,
      show2: false,
      show3: false,
      Name: "",
      Lastname: "",
      Mobilenum: "",
      Adharnum: "",
      Email: "",
      Password: "",
      Gender: "",
      Category: "",
      Qualification: "",
      Dateofbirth: "",
      Adharnum: "",
      Rationcardcategory: "",
      Rationcardnum: "",
      State: "",
      District: "",
      Districtsdata: "",
      Taluka: "",
      Village: "",
      Address: "",
      Contract_Farming: "",
      Pincode: "",
      Bankname: "",
      IFSC: "",
      Accountnum: "",
      Confirmpass: "",
      verifyButton: true,
      verifyButtonAdharnum: true,
      verifyButtonemail: true,
      verifyOtp: false,
      verifyOtpAdharbtn: false,
      verifyemailOtp: false,
      otp: "",
      emailotp: "",
      Adharotp: "",
      verified: false,
      verifiedAdhar: false,
      verifiedemail: false,
      alertbox: false, //otp sended
      alertboxAdhar: false, //otp sended
      alertboxemailotp: false, //otp sended
      alertbox2: false, //Enter 10 digit Number
      alertbox2Adhar: false, //Enter 12 digit Adhar Number
      alertbox3: false, //Passwords are Not match
      alertbox4: false, //Passwords Not Strong
      alertboxinvalidotp: false, // invalid otp
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSignInSubmit = this.onSignInSubmit.bind(this);
    this.onAdharnumSubmit = this.onAdharnumSubmit.bind(this);
    this.verifyCodeMob = this.verifyCodeMob.bind(this);
    this.verifyCode2Adhar = this.verifyCode2Adhar.bind(this);
    this.handleDistrict = this.handleDistrict.bind(this);

    // Using Backend otp method
    // this.VerifyMob = this.VerifyMob.bind(this);
    // this.verifyCode = this.verifyCode.bind(this);
  }

  handleClose = () => {
    this.setState({
      show: false,
      show2: false,
      show3: false,
    });
  };

  onSignInSubmit(e) {
    e.preventDefault();
    const { Mobilenum } = this.state;
    console.log(Mobilenum);

    fetch(`http://localhost:8000/farmer/mobilenumverify/${Mobilenum}`, {
      method: "get",
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          show: true,
          alertbox: true, //Otp sended
          verifyOtp: true, //otp Input field
        });
        console.log(data, "VOTP");
        otpglobalMob = data.OTP;
        console.log(otpglobalMob, "newvk");
      });
  }

  verifyCodeMob() {
    const otp = this.state.otp;
    console.log(otp);
    console.log("try", this.state.otp);
    if (otpglobalMob == otp) {
      this.setState({
        verified: true,
        verifyOtp: false,
        alertbox: false,
        show: false,
      });
    } else {
      this.setState({
        alertboxinvalidotp: true,
      });
    }
  }

  onCaptchaVerifyAdharnum() {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          this.onAdharnumSubmit();
        },
        "expired-callback": () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          // ...
        },
      },
      auth
    );
  }

  onAdharnumSubmitotp() {
    this.onCaptchaVerifyAdharnum();
    const phoneNumber = "+91" + newMobilenum;
    console.log(newMobilenum, "heeyyy");
    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        console.log(newMobilenum, "lallala");
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
        this.setState({
          alertboxAdhar: true, //Otp sended
          show3: true,
        });
        this.setState({ verifyOtpAdharbtn: true });
        // ...
      })
      .catch((error) => {
        this.setState({
          alertbox5: true,
        });
      });
  }

  onAdharnumSubmit(e) {
    e.preventDefault();
    const { Adharnum } = this.state;
    console.log(Adharnum);
    fetch("http://localhost:8000/farmer/adhar", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        Adharnum,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(Adharnum, "Adharnum2");
        console.log(data, "adhardata");
        console.log(data.Mobilenum, "adhardata");
        newMobilenum = data.Mobilenum;
        console.log(newMobilenum);
        this.onAdharnumSubmitotp();
      });
  }

  onEmailSubmit(e) {
    e.preventDefault();
    const { Email } = this.state;
    console.log(Email);

    fetch(`http://127.0.0.1:5000/verify/${Email}`, {
      method: "get",
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          show2: true,
          alertboxemailotp: true, //Otp sended
          verifyemailOtp: true, //otp Input field
        });
        console.log(data, "emailOTP");
        otpglobal = data.otp;
        console.log(otpglobal, "newvk");
      });
  }

  verifyCode2Adhar() {
    window.confirmationResult
      .confirm(this.state.Adharotp)
      .then((result) => {
        // User signed in successfully.
        const user = result.user;
        console.log(user);
        this.setState({
          verifiedAdhar: true,
          verifyOtpAdharbtn: false,
          alertboxAdhar: false,
          show3: false,
        });
        // ...
      })
      .catch((error) => {
        this.setState({
          alertboxinvalidotp: true,
          alertboxAdhar: false,
        });
      });
  }

  verifyCodeEmail() {
    const emailotp = this.state.emailotp;
    console.log(emailotp);
    console.log("try", this.state.emailotp);
    if (otpglobal == emailotp) {
      this.setState({
        verifiedemail: true,
        verifyemailOtp: false,
        alertboxemailotp: false,
        show2: false,
      });
    } else {
      this.setState({
        alertboxinvalidotp: true,
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.Password === this.state.Confirmpass) {
      if (
        this.state.Password.match(
          `^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$`
        )
      ) {
        this.setState({
          alertbox4: false,
        });
        const Password = sha256(this.state.Password);
        const Confirmpass = sha256(this.state.Confirmpass);
        const {
          Name,
          Lastname,
          Mobilenum,
          Email,
          Gender,
          Category,
          Physical_handicap,
          Qualification,
          Dateofbirth,
          Adharnum,
          Rationcardcategory,
          Rationcardnum,
          State,
          District,
          Taluka,
          Village,
          Contract_Farming,
          Address,
          Pincode,
          Bankname,
          IFSC,
          Accountnum,
        } = this.state;

        console.log(
          Name,
          Lastname,
          Mobilenum,
          Email,
          Password,
          Gender,
          Category,
          Physical_handicap,
          Qualification,
          Dateofbirth,
          Adharnum,
          Rationcardcategory,
          Rationcardnum,
          State,
          District,
          Physical_handicap,
          Taluka,
          Village,
          Contract_Farming,
          Pincode,
          Address,
          Bankname,
          IFSC,
          Accountnum
        );

        console.log(Password, "lol");
        fetch("http://localhost:8000/farmer/farmersignup", {
          method: "POST",
          crossDomain: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            Name,
            Password,
            Mobilenum,
            Email,
            Gender,
            Category,
            Qualification,
            Physical_handicap,
            Dateofbirth,
            Adharnum,
            Rationcardcategory,
            Rationcardnum,
            State,
            District,
            Taluka,
            Village,
            Contract_Farming,
            Pincode,
            Address,
            Bankname,
            IFSC,
            Accountnum,
            // Confirmpass,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status == "ok") {
              console.log(data, "userRegister");
              window.location.href = "./aftersignup?farmerid=" + data.Farmerid;
            } else {
              console.log(data, "userRegister");
              alert(data.error);
            }
          });
      } else {
        this.setState({
          alertbox4: true,
        });
      }
    } else {
      this.setState({
        alertbox3: true, //Passwords are Not match
      });
    }
  }

  changeMobile(e) {
    this.setState({ Mobilenum: e.target.value }, function () {
      if (this.state.Mobilenum.length === 10) {
        this.setState({
          verifyButton: true,
          alertbox2: false,
        });
      } else if (
        this.state.Mobilenum.length < 10 ||
        this.state.Mobilenum.length > 10
      ) {
        this.setState({
          alertbox2: true,
          verifyButton: false,
        });
      }
    });
  }
  changeAdharnum(e) {
    this.setState({ Adharnum: e.target.value }, function () {
      if (this.state.Adharnum.length === 12) {
        this.setState({
          verifyButtonAdharnum: true,
          alertbox2Adhar: false,
        });
      } else if (
        this.state.Adharnum.length < 12 ||
        this.state.Adharnum.length > 12
      ) {
        this.setState({
          alertbox2Adhar: true,
          verifyButtonAdharnum: false,
        });
      }
    });
  }
  changeEmail(e) {
    this.setState({ Email: e.target.value }, function () {
      this.setState({
        verifyButtonemail: true,
        alertbox2: false,
      });
    });
  }

  Password(e) {
    this.setState({ Password: e.target.value }, function () {
      const Password = sha256(this.state.Password);
      console.log(Password);
      if (
        this.state.Password.match(
          `^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$`
        )
      ) {
        this.setState({
          alertbox4: false,
        });
      } else {
        this.setState({
          alertbox4: true,
        });
      }
    });
  }

  handleDistrict(e) {
    this.setState({ District: e.target.value }, async function () {
      try {
        const response = await fetch(
          `http://localhost:8000/District/${this.state.District}`
        );
        const data = await response.json();
        console.log(data);
        this.setState({ Districtdata: data });
      } catch (err) {
        console.log(err);
      }
    });
  }
  handleTaluka(e) {
    this.setState({ Taluka: e.target.value }, async function () {
      try {
        const response = await fetch(
          `http://localhost:8000/District/${this.state.District}/${this.state.Taluka}`
        );
        const data = await response.json();
        console.log(data);
        this.setState({ Talukadata: data });
      } catch (err) {
        console.log(err);
      }
    });
  }

  // ContractYes(e){
  //   alert("lol")
  // }

  ContractYes(e) {
    this.setState({ Contract_Farming: e.target.value }, function () {
      if (this.state.Contract_Farming === "Yes") {
        window.alert("Your Some Personal Information will be Shere with Private Company ,are you Agree ?");
      } else {
        // alert("no")
      }
    });
  }

  render() {
    const { Districtdata } = this.state;
    const { Talukadata } = this.state;

    return (
      <div className="auth-wrapper_signup">
        <div className="auth-inner_signup">
          <form onSubmit={this.handleSubmit}>
            <h3 className="justtest" style={{ fontFamily: "monospace" }}>Farmer Registration Form</h3>
            <div id="recaptcha-container"></div>
            <hr />
            <h5 className="Smaintitle">Personal Information</h5>
            <div className="FnameSignup">
              <label>Full name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your full name"
                onChange={(e) => this.setState({ Name: e.target.value })}
              />
            </div>
            <div className="Compdivsignup">
              <label>Gender</label>
              <select
                type="text"
                className="form-control"
                placeholder="Last name"
                onChange={(e) => this.setState({ Gender: e.target.value })}
              >
                <option selected>Select your gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="Compdivsignup">
              <label>Category </label>
              <select
                type="text"
                className="form-control"
                placeholder="Last name"
                onChange={(e) => this.setState({ Category: e.target.value })}
              >
                <option selected>Select your Category</option>
                <option>GENERAL</option>
                <option>EWS</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
              </select>
            </div>
            <div className="Compdivsignup">
              <label>Physical handicap</label>
              <select
                type="text"
                className="form-control"
                placeholder="Last name"
                onChange={(e) =>
                  this.setState({ Physical_handicap: e.target.value })
                }
              >
                <option selected>Select disability</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="Compdivsignup">
              <label>Qualification </label>
              <select
                type="text"
                className="form-control"
                placeholder="Last name"
                onChange={(e) =>
                  this.setState({ Qualification: e.target.value })
                }
              >
                <option selected>Select your Qualification</option>
                <option>Graduation</option>
                <option value={"HSC"}>Higher secondary (12th Passed)</option>
                <option value={"SSC"}>Secondary (10th Passed)</option>
                <option>Primary</option>
                <option>None</option>
              </select>
            </div>
            <div style={{ marginTop: "20px" }}>
              <div className="Compdivsignup">
                <label>Date Of Birth </label>
                <input
                  type="date"
                  className="form-control"
                  placeholder="Last name"
                  onChange={(e) =>
                    this.setState({ Dateofbirth: e.target.value })
                  }
                />
              </div>

              <div className="Compdivsignup">
                <label> Ration Card Category </label>
                <select
                  type="text"
                  className="form-control"
                  placeholder="Last name"
                  onChange={(e) =>
                    this.setState({ Rationcardcategory: e.target.value })
                  }
                >
                  <option selected>Select your RationCard Category </option>
                  <option value={"APL"}>Above Poverty Line (APL)</option>
                  <option value={"BPL"}>Below Poverty Line (BPL)</option>
                  <option value={"AY"}>Annapoorna Yojana (AY)</option>
                </select>
              </div>
              <div className="Compdivsignup">
                <label>Ration Card Number </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="1967-425-5901"
                  onChange={(e) =>
                    this.setState({ Rationcardnum: e.target.value })
                  }
                />
              </div>
            </div>
            <br />
            <hr />
            <h4 className="Smaintitle">Farm location and other details</h4>
            <div className="Compdivsignup">
              <label>State</label>
              <input
                type="text"
                className="form-control"
                placeholder="Gujarat"
                value={"Gujarat"}
                onChange={(e) => this.setState({ State: e.target.value })}
                disabled
              />
            </div>
            <div className="Compdivsignup">
              <label>District</label>
              <select
                type="text"
                className="form-control"
                placeholder="Last name"
                // onChange={(e) => this.setState({ District: e.target.value })}
                onChange={(e) => this.handleDistrict(e)}
              >
                <option selected>Select your District </option>
                <option>Ahmedabad</option>
                <option>Amreli</option>
                <option>Anand</option>
                <option>Banaskantha</option>
                <option>Bharuch</option>
                <option>Bhavnagar</option>
                <option>Dahod</option>
                <option>Gandhinagar</option>
                <option>Jamnagar</option>
                <option>Junagadh</option>
                <option>Kachchh</option>
                <option>Kheda</option>
                <option>Mahesana</option>
                <option>Narmada</option>
                <option>Navsari</option>
                <option>Panchmahal</option>
                <option>Patan</option>
                <option>Porbandar</option>
                <option>Rajkot</option>
                <option>Sabarkantha</option>
                <option>Surat</option>
                <option>Surendranagar</option>
                <option>Tapi</option>
                <option>The Dangs</option>
                <option>Vadodara</option>
                <option>Valsad</option>
              </select>
            </div>
            <div className="Compdivsignup">
              <label>Taluka </label>

              <select
                type="text"
                className="form-control"
                placeholder="Last name"
                onChange={(e) => this.handleTaluka(e)}
              >
                <option>Select Taluka</option>
                {Districtdata.map((getst) => {
                  return <option>{getst}</option>;
                })}
              </select>
            </div>
            <div className="Compdivsignup">
              <label>Village</label>

              <select
                type="text"
                className="form-control"
                placeholder="Last name"
                onChange={(e) => this.setState({ Taluka: e.target.value })}
              >
                <option selected>Select Village</option>
                {Talukadata.map((getst) => {
                  return <option>{getst}</option>;
                })}
              </select>
            </div>
            <div className="Compdivsignup">
              <label>Pincode</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Your Pincode"
                onChange={(e) => this.setState({ Pincode: e.target.value })}
              />
            </div>


            <div className="Compdivsignuptextarea">
              <label>Farmer Address </label>
              <textarea
                type="text"
                className="form-control"
                placeholder="Full Address"
                onChange={(e) => this.setState({ Address: e.target.value })}
              />
            </div>

            <br />
            <br />
            <hr />

            <h4 className="Smaintitle">Bank Details</h4>

            <div className="Compdivsignup">
              <label>Bank Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Bank Name"
                onChange={(e) => this.setState({ Bankname: e.target.value })}
              />
            </div>
            <div className="Compdivsignup">
              <label>IFSC Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter IFSC code"
                onChange={(e) => this.setState({ IFSC: e.target.value })}
              />
            </div>
            <div className="Compdivsignup">
              <label>Account Number </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Account Number"
                onChange={(e) => this.setState({ Accountnum: e.target.value })}
              />
            </div>
            <div className="Compdivsignup">
              <label>Confirm Account Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Confirm Account Number"
                onChange={(e) =>
                  this.setState({ ConfirmFarmertype: e.target.value })
                }
              />
            </div>
            <br />
            <br />
            <hr />
            <h4 className="Smaintitle">Authentication Details</h4>
            <div className="Compdivsignup">
              <div className="AdharcardnumSignup" >
                <div className="mb-3" id="Adharenumberdiv">
                  <label>Aadhar-Card</label>
                  <input
                    // type="number"
                    className="form-control"
                    placeholder="Enter Aadhar-Card Number"
                    onChange={(e) => this.changeAdharnum(e)}
                  />

                  {this.state.verifyButtonAdharnum ? (
                    <input
                      type="button"
                      value={this.state.verifiedAdhar ? "Verified" : "verify"}
                      // onClick={(e)=>this.VerifyMob(e)}
                      onClick={this.onAdharnumSubmit}
                      // style={{
                      //   backgroundColor: "#0163d2",
                      //   width: "100%",
                      // }}
                      style={
                        this.state.verifiedAdhar
                          ? { backgroundColor: "#00931C", width: "100%" }
                          : { backgroundColor: "#D9D9D9", width: "100%" }
                      }
                    />
                  ) : null}
                  {this.state.alertbox2Adhar ? (
                    <p style={{ color: "red" }}>Enter 12 digit Adhar Number</p>
                  ) : null}
                </div>

                {this.state.show3 ? (
                  <Modal
                    show={this.state.show3}
                    onHide={() => this.handleClose()}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>
                        Aadhar-Card Number authentication
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1"
                        >
                          <Form.Label>Otp</Form.Label>
                          <Form.Control
                            // type="email"
                            placeholder="Enter 6 digit otp"
                            onChange={(e) =>
                              this.setState({ Adharotp: e.target.value })
                            }
                            autoFocus
                          />{" "}
                          <br />
                          {this.state.alertboxinvalidotp ? (
                            <Alert variant="danger">
                              <p style={{ color: "red" }} className="mb-0">
                                Invalid Otp
                              </p>
                            </Alert>
                          ) : null}
                          {this.state.alertboxAdhar ? (
                            <Alert variant="success">
                              <p style={{ color: "green" }} className="mb-0">
                                otp sent to your Linked Adharnumber :- {this.state.Adharnum}
                              </p>
                            </Alert>
                          ) : null}
                        </Form.Group>
                        <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlTextarea1"
                        ></Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={this.handleClose}>
                        Close
                      </Button>
                      <Button
                        variant="primary"
                        onClick={(e) => this.verifyCode2Adhar(e)}
                      >
                        Verify Otp
                      </Button>
                    </Modal.Footer>
                  </Modal>
                ) : null}
              </div>
            </div>

            <div className="Compdivsignup">
              <div className="Mobilenummaindiv">
                <div className="MobilenumSignup" id="Adharenumberdiv">
                  <label>Mobile</label>
                  <input
                    // type="number"
                    className="form-control"
                    placeholder="Enter Mobile Number"
                    onChange={(e) => this.changeMobile(e)}
                  />

                  {this.state.verifyButton ? (
                    <input
                      type="button"
                      value={this.state.verified ? "Verified" : "verify"}
                      // onClick={(e)=>this.VerifyMob(e)}
                      onClick={this.onSignInSubmit}
                      style={{
                        backgroundColor: "#D9D9D9",
                        width: "100%",
                      }}
                    />
                  ) : null}
                  {this.state.alertbox2 ? (
                    <p style={{ color: "red" }}>Enter 10 digit Number</p>
                  ) : null}
                </div>

                {this.state.show ? (
                  <Modal
                    show={this.state.show}
                    onHide={() => this.handleClose()}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Mobile number authentication</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1"
                        >
                          <Form.Label>Otp</Form.Label>
                          <Form.Control
                            // type="email"
                            placeholder="Enter 4 digit otp"
                            onChange={(e) =>
                              this.setState({ otp: e.target.value })
                            }
                            autoFocus
                          />
                          {this.state.alertboxinvalidotp ? (
                            <p style={{ color: "red" }}>Invalid Otp</p>
                          ) : null}
                          {this.state.alertbox ? (
                            <p style={{ color: "green" }}>
                              otp sended to your Mobile Number{" "}
                              {this.state.Mobilenum}
                            </p>
                          ) : null}
                        </Form.Group>
                        <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlTextarea1"
                        ></Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={this.handleClose}>
                        Close
                      </Button>
                      <Button variant="primary" onClick={this.verifyCodeMob}>
                        Verify Otp
                      </Button>
                    </Modal.Footer>
                  </Modal>
                ) : null}
              </div>
            </div>
            <div className="Compdivsignup">
              <div className="Emailmaindiv">
                {/* For Email */}
                <div className="EmailSignup" id="Adharenumberdiv">
                  <label>Email</label>
                  <input
                    // type="number"
                    className="form-control"
                    placeholder="Enter your email "
                    onChange={(e) => this.changeEmail(e)}
                  />

                  {this.state.verifyButtonemail ? (
                    <input
                      type="button"
                      value={this.state.verifiedemail ? "Verified" : "verify"}
                      // onClick={(e)=>this.VerifyMob(e)}
                      onClick={(e) => this.onEmailSubmit(e)}
                      style={{
                        backgroundColor: "#D9D9D9",
                        width: "100%",
                      }}
                    />
                  ) : null}

                  {this.state.show2 ? (
                    <Modal
                      show={this.state.show2}
                      onHide={() => this.handleClose()}
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>Email Id authentication</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form>
                          <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlInput1"
                          >
                            <Form.Label>Otp</Form.Label>
                            <Form.Control
                              // type="email"
                              placeholder="Enter 4 digit otp"
                              onChange={(e) =>
                                this.setState({ emailotp: e.target.value })
                              }
                              autoFocus
                            />
                            {this.state.alertboxinvalidotp ? (
                              <p style={{ color: "red" }}>Invalid Otp</p>
                            ) : null}
                            {this.state.alertboxemailotp ? (
                              <p style={{ color: "green" }}>
                                otp sended to your Email
                              </p>
                            ) : null}
                          </Form.Group>
                          <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlTextarea1"
                          ></Form.Group>
                        </Form>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                          Close
                        </Button>
                        <Button
                          variant="primary"
                          onClick={(e) => this.verifyCodeEmail(e)}
                        >
                          Verify Otp
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  ) : null}
                </div>
              </div>
            </div>
            <br />

            <div className="Compdivsignup">
              <label>Are you interested in Contract Farming ? </label>
              <select
                // onChange={(e) =>this.setState({ Contract_Farming: e.target.value })}
                onChange={(e) => this.ContractYes(e)}
                type="text"
                className="form-control"
              >
                <option onClick={(e) => this.ContractYes(e)}>Yes</option>
                <option selected>No</option>
              </select>
            </div>



            <div className="mb-3">
              <label>Create password</label>
              <input
                type="Password"
                className="form-control"
                placeholder="Enter Password"
                onChange={(e) => this.Password(e)}
              />
              {this.state.alertbox4 ? (
                <p style={{ color: "red" }}>Password is Not Strong</p>
              ) : null}
            </div>

            <div className="mb-3">
              <label>Confirm Password</label>
              <input
                type="Confirmpass"
                className="form-control"
                placeholder="Confirm Password"
                onChange={(e) => this.setState({ Confirmpass: e.target.value })}
              />
              {this.state.alertbox3 ? (
                <p style={{ color: "red" }}>Passwords are Not match</p>
              ) : null}
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Sign Up
              </button>
            </div>
            <p className="forgot-password text-right">
              Already registered <a href="/sign-in">sign in?</a>
            </p>
          </form>
        </div>
      </div>
    );
  }
}
