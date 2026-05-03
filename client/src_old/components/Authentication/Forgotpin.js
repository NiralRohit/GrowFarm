import React, { Component } from "react";
import { sha256} from 'js-sha256'
import app2 from "./firebase_config"
import { getAuth, RecaptchaVerifier , signInWithPhoneNumber } from "firebase/auth";
import "./Forgotpin.css"
const auth = getAuth(app2);


export default class Login extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      Mobilenum: "",
      Password: "",
      confirmnewpass : "",
      otp : "",
      newpassbtn : true,
      confirmnewpassbtn : true,
      alertbox : false, //otp sended
      verified: false,
      verifyButton: false,
      verifyOtp: false,
      loginerroralert: false, //from database
      alertbox2 : false, //Enter 10 digit Number
      alertbox3 : false, //Passwords are Not match
      alertbox4 : false, //Passwords Not Strong

    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSignInSubmit = this.onSignInSubmit.bind(this);
    this.verifyCode2 = this.verifyCode2.bind(this);
  }
  

  changeMobile(e){
    this.setState({Mobilenum : e.target.value}, function(){
     if (this.state.Mobilenum.length === 10){
  this.setState({
    verifyButton: true,
    alertbox2 : false,
  }
  ); 
}else if (this.state.Mobilenum.length < 10 || this.state.Mobilenum.length > 10){
  this.setState({
      verifyButton: false,
      alertbox2 : true,
    })
}
    });
  }

  Password(e){
    this.setState({Password : e.target.value}, function(){
      const Password =sha256(this.state.Password);
      console.log(Password)
     if (this.state.Password.match(`^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$`)){
  this.setState({
    alertbox4 : false,
  }); 
}else{
  this.setState({
    alertbox4 : true,
  })
}
    });
  }

  onCaptchaVerify(){  
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
       this.onSignInSubmit();
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        // ...
      }
    }, auth);
      }
    
      onSignInSubmit(){
    this.onCaptchaVerify();
        const phoneNumber = "+91" + this.state.Mobilenum;
    const appVerifier = window.recaptchaVerifier;
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((confirmationResult) => {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          window.confirmationResult = confirmationResult;
          this.setState({
            alertbox : true  //Otp sended
          })
          this.setState({verifyOtp : true});
          // ...
        }).catch((error) => {
          // Error; SMS not sent
          // ...
        });
      }

      verifyCode2(){
        window.confirmationResult
        .confirm(this.state.otp)
        .then((result) => {
          // User signed in successfully.
          const user = result.user;
          console.log(user);
          this.setState({
            verified:true,
            verifyOtp:false,
            alertbox : false, 
            newpassbtn : true,
            confirmnewpassbtn : true,
          })
          // ...
        }).catch((error) => {
          alert("Invalid Otp")
        });
      }

  handleSubmit(e) {
    e.preventDefault();
    

    if(this.state.Password === this.state.confirmnewpass){

        if(this.state.Password ===""){
            const Password = this.state.Password;
            const { Mobilenum  } = this.state;
            console.log(Mobilenum,Password);
            fetch("http://localhost:8000/farmer/forgotpassword", {
              method: "POST",
              crossDomain: true,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
                Mobilenum,
               Password,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.Id) {
                  console.log(data)
                  console.log(Password , "pin")
                  localStorage.setItem("user", JSON.stringify(data));
                  window.location.href = "./Myaccount";
                }
                else{
                  // alert(data)
                  console.log(data , "else")
                  console.log(Password , "pin")
                  console.log(data.error ,"hahahaha")
                  const loginerroralert = data.error
                  this.setState({
                    loginerroralert
                  })
                  
                }
              });
          }else{
            const Password =sha256(this.state.Password);
            const { Mobilenum  } = this.state;
            console.log(Mobilenum,Password);
            fetch("http://localhost:8000/farmer/forgotpassword", {
              method: "POST",
              crossDomain: true,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
                Mobilenum,
               Password,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.status == "ok") {
                  console.log(data)
                  console.log(Password , "pin")
                  alert("New password Updated")
                  window.location.href = "./sign-in";
                }
                else{
                  // alert(data)
                  console.log(data , "else")
                  console.log(Password , "pin")
                  console.log(data.error ,"hahahaha")
                  const loginerroralert = data.error
                  this.setState({
                    loginerroralert
                  })
                  
                }
              });
          }
    }else{
        this.setState({
            alertbox3 : true  ,//Passwords are Not match
            loginerroralert : false
          })
    }
   
  }
  render() {
    return (
      <div className="auth-wrapper_forgotpin">
      <div className="auth-inner_forgotpin">
      <form id="forgotpin_form"onSubmit={this.handleSubmit}>
        <div id="recaptcha-container"></div>
        <h2 id="forgotpin_h2">Forgot Pasword</h2>
        
        <div className="mb-3">
          <label>Mobile Number</label>
          <input
            // type="email"
            className="form-control"
            id="forgotpin_data"
            placeholder="Enter your mobilenumber"
            onChange={(e) => this.changeMobile(e)}
          />


{this.state.verifyButton? <input 
type="button"   
value={this.state.verified ? "Verified" : "verify"}
onClick={this.onSignInSubmit}
style={
  {
    backgroundColor:"#0163d2",
    width:"100%"
  }
}
/> :null}
{this.state.alertbox  ? <p style={{color : "green"}}>otp sended to your Mobile Number</p> : null}
{this.state.alertbox2 ? <p style={{color : "red"}}>Enter 10 digit Number</p> : null}
        </div>

        {this.state.verifyOtp ?
<div className="mb-3">
   <label>Otp</label>
  <input
  // type="number"
  className="form-control"
  placeholder="Enter the Otp"
  onChange={(e) => this.setState({otp:e.target.value})}
  />
<input 
type="button"
value="Verify Otp"
// onClick={this.verifyCode}
onClick={this.verifyCode2}
style={
  {
    backgroundColor:"#0163d2",
    width:"100%"
  }
}
/> 
</div> : null}


        {this.state.newpassbtn ?
<div className="mb-3">
   <label>Create New Password</label>
  <input
  // type="number"
  className="form-control"
  id="forgotpin_data"
  placeholder="Enter New Password"
  onChange={(e) => this.Password(e)}
  />
  {this.state.alertbox4 ? <p style={{color : "red"}}>Password is Not Strong</p> : null}
</div> : null}

{this.state.confirmnewpassbtn ?
<div className="mb-3">
   <label>Confirm New Password</label>
  <input
  // type="number"
  className="form-control"
  id="forgotpin_data"
  placeholder="Enter New Password"
  onChange={(e) => this.setState({confirmnewpass: e.target.value})}
  />
  {this.state.alertbox3 ? <p style={{color : "red"}}>Passwords are Not match</p> : null}
</div> : null}


<p style={{color : "red" , marginTop : "3px"}}>{this.state.loginerroralert}</p> 
        <div className="d-grid">
          <button type="submit" id="forgotpin_btn" className="btn btn-primary" >
            Submit
          </button>
        </div>

       

        <p className="forgot-password text-right">
          <a id="forgotpin_pageflow"href="/sign-up">Farmer Sign Up</a>
        </p>
      </form>

      <div id="forgotpin_rightside">
          <img id="forgotpin_rightimg" src="./imgs/forgetpin.png" alt="expert_signupimg"></img>
        </div> 
      </div>
      </div>
    );
  }
}
