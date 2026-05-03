import React from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Authentication/login_component";
import Adminlogin from "./components/Authentication/adminlogin";
import SignUp from "./components/Authentication/signup_component";
import Expertregistration from "./components/Authentication/Expertregistration";
import Expertlogin from "./components/Authentication/Expertlogin";
import Traderlogin from "./components/Authentication/Traderlogin";
import Forgotpin from "./components/Authentication/Forgotpin";
import Aftersignup from "./components/Authentication/aftersignup";
import Myaccount from "./components/AuthenticateFarmer/Farmer_account";
import Croprek from "./components/AuthenticateFarmer/Crop_recommendation"
import Notification from "./components/AuthenticateFarmer/Notification/Notification"
import Diseasepre from "./components/AuthenticateFarmer/Disease_detection"
import Weatherdetails from "./components/AuthenticateFarmer/Weather_analyzer"
import Schemes from "./components/AuthenticateFarmer/Farmer_schemes/schemes"
import SchemesMain from "./components/AuthenticateFarmer/Farmer_schemes/SchemesMain"
import Applied from "./components/AuthenticateFarmer/Farmer_schemes/Applied"
import Approved from "./components/AuthenticateFarmer/Farmer_schemes/Approved"
import Yieldfinder from "./components/AuthenticateFarmer/Yield_finder/yieldfinder"
import Findfarmer from "./components/Admin/findfarmer"
import AdminSchemes from "./components/Admin/AdminSchemes"
import AnalysisMap from "./components/Admin/AnalysisMap/AnalysisMap"
import Dashboard from "./components/Admin/Dashboard/Dashboard"
import AdminSchemesMain from "./components/Admin/AdminSchemesMain"
import AdminAppliedSchemes from "./components/Admin/AdminAppliedSchemes"
import AddSchemes from "./components/Admin/AddSchemes";
import { AppContext , socket } from "./components/AuthenticateFarmer/Farmer_account/appContext";
import ExpertTalk from "./components/AuthenticateFarmer/Expert_Talk/ExpertTalk";
import Farmer_homepage from "./components/AuthenticateFarmer/Farmer_Homepage/Farmer_homepage";
import Yield_analysis from "./components/Admin/Yieldanalysis/Yield_analysis";
import Irrigationanalysis from "./components/Admin/Irrigationanalysis/Irrigationanalysis";
import Soilanalysis from "./components/Admin/Soilanalysis/Soilanalysis";
import Trader_Accountpage from "./components/Authentication/Trader_Accountpage";
import Genratebill from "./components/Authentication/Genratebill";
import Apmc from "./components/Admin/APMC/Apmc";


function App() {
  return (
    <AppContext.Provider value={{ socket}}>
    <Router>
      <div className="App">
        <Navbar />
        <div>
          <div >
            <Routes>
              <Route exact path="/" element={<Login />} />
              <Route exact path="Farmer_homepage" element={<Farmer_homepage/>} />
              <Route exact path="/sign-in" element={<Login />} />
              <Route exact path="/adminlogin" element={<Adminlogin />} />
              <Route exact path="/sign-up" element={<SignUp />} />
              <Route exact path="/aftersignup" element={<Aftersignup />} />
              <Route exact path="/Myaccount" element={<Myaccount />} />
              <Route exact path="/Croprek" element={<Croprek />} />
              <Route exact path="/Diseasepre" element={<Diseasepre />} />
              <Route exact path="/Weatherdetails" element={<Weatherdetails />} />
              <Route exact path="/schemes" element={<Schemes />} />
              <Route exact path="/SchemesMain" element={<SchemesMain />} />
              <Route exact path="/Approved" element={<Approved />} />
              <Route exact path="/Applied" element={<Applied />} />
              <Route exact path="/yieldfinder" element={<Yieldfinder />} />
              <Route exact path="/Forgotpin" element={<Forgotpin/>}/>
              <Route exact path="/findfarmer" element={<Findfarmer/>}/>
              <Route exact path="/AddSchemes" element={<AddSchemes/>}/>
              <Route exact path="/AdminSchemes" element={<AdminSchemes/>}/>
              <Route exact path="/AnalysisMap" element={<AnalysisMap/>}/>
              <Route exact path="/Dashboard" element={<Dashboard/>}/>
              <Route exact path="/AdminSchemesMain" element={<AdminSchemesMain/>}/>
              <Route exact path="/AdminAppliedSchemes" element={<AdminAppliedSchemes/>}/>
              <Route exact path="/Notification" element={<Notification/>}/>
              <Route exact path="/Expertlogin" element={<Expertlogin/>}/>
              <Route exact path="/Expertregistration" element={<Expertregistration/>}/>
              <Route exact path="/Traderlogin" element={<Traderlogin/>}/>
              <Route exact path="/ExpertTalk" element={<ExpertTalk/>}/>
              <Route exact path="/Yield_analysis" element={<Yield_analysis/>}/>
              <Route exact path="/Irrigationanalysis" element={<Irrigationanalysis/>}/>
              <Route exact path="/Soilanalysis" element={<Soilanalysis/>}/>
              <Route exact path="/Trader_Accountpage" element={<Trader_Accountpage/>}/>
              <Route exact path="/Genratebill" element={<Genratebill/>}/>
              <Route exact path="/Apmc" element={<Apmc/>}/>
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  </AppContext.Provider>
  );
}

export default App;
