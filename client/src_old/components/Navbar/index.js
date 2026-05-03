import { Link, useMatch, useNavigate, useResolvedPath } from "react-router-dom";
import React, { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import Logo1 from "../../assets/logo.svg";
import CardMedia from "@mui/material/CardMedia";
import { BsBell, BsCircle, BsFillBellFill } from "react-icons/bs";
import { AppContext } from "../AuthenticateFarmer/Farmer_account/appContext";
import Modal from "react-bootstrap/Modal";
import { Nav, NavDropdown } from "react-bootstrap";

export default function Navbar() {
  const navigate = useNavigate();
  const auth = localStorage.getItem("user");
  const auth2 = localStorage.getItem("userTrader");
  const [notifidata, setNotifidata] = useState([]);
  const { socket } = useContext(AppContext);
  const [show, setShow] = useState(false);
  const [notifyCount, setnotifyCount] = useState("");

    // socket.emit("join-notificationroom", {
    //   to: JSON.parse(auth).Farmerid,
    // });
    // socket.off("get-notification").on("get-notification", (data) => {
    //   const newone = data;
    //   console.log(newone);
    //   setNotifidata(data);
    //   console.warn(notifyCount);
    //   setnotifyCount(data.length);
    // });

    
   


  // const notifications = () => {
  //   setShow(true);
  //       socket.emit("join-notificationroom", {
  //     to: JSON.parse(auth).Farmerid,
  //   });
  //   socket.off("get-notification").on("get-notification", (data) => {
  //     const newone = data;
  //     console.log(newone);
  //     setNotifidata(data);
  //     console.warn(notifyCount);
  //     setnotifyCount(data.length);
  //   });
  // };

  const logout = () => {
    localStorage.clear();
    navigate("/sign-in");
  };

  return (
    <>
      <Nav
        className="navbar fixed-top  navbar-expand-lg navbar-light bg-light"
        id="nav"
      >
        <div className="container-fluid">
          <Link to="/Farmer_homepage" className="site-title">
            <CardMedia
              component="img"
              height="55"
              image={Logo1}
              alt="Career Insights"
              className="mainlogo1"
            />
            <span style={{ color: "#228944" }}>G</span>
            row <span style={{ color: "#228944" }}>&nbsp;F</span> arm
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {auth2 ? 
          

        <>
          <ul>
                <CustomLink to="/Genratebill"> Genrate bill</CustomLink>
                <CustomLink onClick={logout} to="/sign-in"> Logout</CustomLink>
              </ul>
        
        </>
        
        
        :
<>
{auth ? (
            JSON.parse(auth).Username == "admin" ? (
              <>
                <div>
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <CustomLink to="/Dashboard">Dashboard</CustomLink>
                    <CustomLink to="/Apmc">APMC</CustomLink>
                    <CustomLink to="/Yield_analysis">Yield analysis</CustomLink>
                    <CustomLink to="/Soilanalysis">Soilanalysis</CustomLink>
                    <CustomLink to="/Irrigationanalysis"> Irrigationanalysis</CustomLink>
                    <CustomLink to="/findfarmer">Find Farmer</CustomLink>
                    <CustomLink to="/AdminSchemesMain">Scheme </CustomLink>
                    {/* <CustomLink to="/AnalysisMap">Analysis Map</CustomLink> */}
                    <CustomLink onClick={logout} to="/sign-in">
                      Logout
                    </CustomLink>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div>
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <CustomLink to="/Myaccount">My Account</CustomLink>
                    <CustomLink to="/ExpertTalk">Expert Talk</CustomLink>
                    <CustomLink to="/Weatherdetails">
                      Weather Details
                    </CustomLink>
                    <CustomLink to="/SchemesMain">Schemes</CustomLink>
                    <NavDropdown title="Smart Farming" id="basic-nav-dropdown">
                      <NavDropdown.Item>
                        {" "}
                        <CustomLink to="/Croprek">
                          Crop Recomendation{" "}
                        </CustomLink>
                      </NavDropdown.Item>
                      <NavDropdown.Item>
                        <CustomLink to="/Diseasepre">
                          Disease Prediction
                        </CustomLink>
                      </NavDropdown.Item>
                      <NavDropdown.Item>
                        {" "}
                        <CustomLink to="/yieldfinder">Yield Finder</CustomLink>
                      </NavDropdown.Item>
                    </NavDropdown>
                    {/* <li class="notifiicon" onClick={notifications}>
                      <div className="NotifyCircle">
                        {" "}
                        <span className="notifyCount">{notifyCount}</span>{" "}
                      </div>
                      <BsBell style={{ height: "1.5em", width: "1.5em" }} />
                    </li> */}
                    <CustomLink onClick={logout} to="/sign-in">
                      Logout
                    </CustomLink>
                  </ul>
                </div>
              </>
            )
          ) : (
            <>
              <ul>
                <CustomLink to="/sign-up">Farmer Registration</CustomLink>
                <CustomLink to="/Expertregistration"> Expertregistration</CustomLink>
                <CustomLink to="/sign-in">Farmer Login</CustomLink>
                <CustomLink to="/adminlogin">Admin Login</CustomLink>
                <CustomLink to="/traderlogin">Trader Login</CustomLink>
              </ul>
            </>
          )}
</>

        }

         
        </div>
      </Nav>

      {show ? (
        <div>
          <Modal
            animation={false}
            show={show}
            onHide={() => setShow(false)}
            id="notifiModel"
          >
            <Modal.Header closeButton>
              <Modal.Title>Notifications</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {notifidata.map((dataa, idx) => {
                return (
                  <>
                    <h4>
                      {idx + 1}
                      {dataa.content}
                    </h4>
                  </>
                );
              })}
            </Modal.Body>
            <Modal.Footer></Modal.Footer>
          </Modal>
        </div>
      ) : null}
    </>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <>
      <li className={isActive ? "active" : ""}>
        <Link to={to} {...props}>
          {children}
        </Link>
      </li>
    </>
  );
}
