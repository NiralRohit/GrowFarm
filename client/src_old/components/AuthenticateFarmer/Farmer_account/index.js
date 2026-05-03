import React, { useEffect, useContext, useState } from "react";
import style from "./style.css";
import profileimg from "./profile.png";
import Modal from "react-bootstrap/Modal";
import Moment from "moment";
import Image from "react-bootstrap/Image";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";
import { BsCheckCircleFill, BsInfoCircleFill } from "react-icons/bs";
import { AiOutlineCopy } from "react-icons/ai";
import copy from "copy-to-clipboard";
import jsPDF from "jspdf";
import { AppContext } from "./appContext";
import { Form, Card, ProgressBar, Table } from "react-bootstrap";
import { Container, Col, Row, FormGroup, Label, Input } from "reactstrap";
import { Grid } from "react-bootstrap-icons";
import { Hidden } from "@mui/material";
import { borderBottom } from "@mui/system";
import Select from "react-select";

const options = [
  { value: "Rice", label: "Rice" },
  { value: "Maize", label: "Maize" },
  { value: "Kidneybeans", label: "Kidneybeans" },
  { value: "Pigeonpeas", label: "Pigeonpeas" },
  { value: "Mothbeans", label: "Mothbeans" },
];

function Myaccount() {
  const [farmdata, setFarmdata] = useState([]);
  const [farmdrop, setFarmdrop] = useState([]);
  // const [Crop, setCrop] = useState("");
  const [Soil_type, setSoil_type] = useState("");
  const [Season, setSeason] = useState("");
  const [Sow_date, setSow_date] = useState("");
  const [Harvest_date, setHarvest_date] = useState("");
  const [Production, setProduction] = useState("");
  const [UPIN, setUPIN] = useState("");
  const [Farmerid, setFarmerid] = useState("");
  const [Name, setName] = useState("");
  const [UPINinfo, setUPINinfo] = useState("");
  const [Irigation_sources_used, setIrigation_sources_used] = useState("");
  const auth = localStorage.getItem("user");
  const { socket } = useContext(AppContext);
  const [Yielddata, setYielddata] = useState([]);
  const [Crop, setCrop] = useState([]);
  const [Cropproduction, setCropproduction] = useState([]);
  const [Ratio, setRatio] = useState([]);
  const [values, setValues] = useState([]);
  const [show, setShow] = useState(false);

  const [Pro, setPro] = useState([]);
  const [valuespro, setValuespro] = useState([]);
  const [Billhistorydata, setBillhistorydata] = useState([]);



  console.log(Farmerid)
  const handleChangecrop = (selectedOption) => {
    setCrop(selectedOption);
    setCropproduction(selectedOption);
  };

  // const handleChangeRatio = (event) => {
  //   const options = event.target.options;
  //   const selectedSkills = [];
  //   for (let i = 0; i < options.length; i++) {
  //     if (options[i].selected) {
  //       selectedSkills.push(options[i].value);
  //     }
  //   }

  //   console.log(selectedSkills)
  // };

  const handleChangeRatio = (event, index) => {
    const updatedValues = [...values];
    updatedValues[index] = event.target.value;
    setValues(updatedValues);
    setRatio(updatedValues);
  };

  const handleChangeProduction = (event, index) => {
    const updatedValuespro = [...valuespro];
    updatedValuespro[index] = event.target.value;
    setValuespro(updatedValuespro);
    setPro(updatedValuespro);
  };

  console.log(Ratio);

  console.log(Crop);

  console.warn(UPIN)

  // socket.emit("join-room", {
  //   Farmerid: JSON.parse(auth).Farmerid,
  // });

  // useEffect(() => {
  //   socket.emit("join-notificationroom", {
  //     to: JSON.parse(auth).Farmerid,
  //   });
  // }, [socket]);




  useEffect(() => {
    getschemedata();
    getApmcbilldata()
  }, []);

  function getschemedata() {
    fetch(`http://localhost:8000/farm/farminfo/${JSON.parse(auth).Adharnum}`, {
      method: "GET",
      crossDomain: true,
    })
      .then((response) => response.json())
      .then((data) => {
        setFarmdata(data);
        console.log(data);
        setFarmdrop(data);
      });
  }
  function getApmcbilldata() {
    console.warn(JSON.parse(auth).Farmerid)
    fetch(`http://localhost:8000/farmer/bills_farmers/${JSON.parse(auth).Farmerid}`, {
      method: "GET",
      crossDomain: true,
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        setBillhistorydata(data)
      });
  }


  function getYielddata() {
    // const upininfoname = event.target.value;
    // console.warn(upininfoname)
    console.log(UPINinfo)
    fetch(`http://localhost:8000/cropdata/crophistory/${UPINinfo}`, {
      method: "GET",
      crossDomain: true,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setYielddata(data)
        data.map((newdata => {
          console.log(newdata)
        }))



      });
  }
  // console.log(Yielddata);

  function AddnewCrop() {
    setFarmerid(JSON.parse(auth).Farmerid)
    setName(JSON.parse(auth).Name)
    setShow(true)
  }

  console.log(Farmerid)
  console.log(Name)

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Simple tooltip
    </Tooltip>
  );
  const copyToClipboard = () => {
    copy(JSON.parse(auth).Farmerid);
    alert(`You have copied "${JSON.parse(auth).Farmerid}"`);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8000/cropdata/crophistoryform",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UPIN,
            Farmerid,
            Name,
            Crop,
            Ratio,
            Pro,
            Soil_type,
            Season,
            Sow_date,
            Harvest_date,
            Irigation_sources_used,
          }),
        }
      );
      const data = await response.json();
      console.log(data.data);

      console.log(Farmerid)
      console.log(Name)
    } catch (error) {
      console.error(error);
    }
  };

  return auth ? (
    <>
      <div className="auth-wrapper_AccountmainP">
        <div className="auth-inner_AccountmainP">
          <div>
            <img
              className="rounded-full"
              id="Profileimage"
              src="/Profileimage.svg"
              alt="..."
            ></img>
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="button-tooltip-2"> Farmer Full Name </Tooltip>
              }
            >
              {({ ref, ...triggerHandler }) => (
                <>
                  <h6 className="MainP">
                    {JSON.parse(auth).Name} &nbsp;
                    <div
                      ref={ref}
                      variant="light"
                      {...triggerHandler}
                      className="d-inline-flex align-items-center"
                    >
                      <BsInfoCircleFill
                        style={{ height: "0.6em", width: "0.6em" }}
                      />
                    </div>{" "}
                  </h6>
                </>
              )}
            </OverlayTrigger>
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="button-tooltip-2"> Farmers Uniqe id </Tooltip>
              }
            >
              {({ ref, ...triggerHandler }) => (
                <>
                  <h6
                    className="MainP"
                    id="farmerID"
                    style={{ color: "#44A444", fontSize: "15px" }}
                  >
                    {JSON.parse(auth).Farmerid} &nbsp;
                    <div
                      ref={ref}
                      variant="light"
                      {...triggerHandler}
                      className="d-inline-flex align-items-center"
                    >
                      <BsInfoCircleFill
                        style={{ height: "0.6em", width: "0.6em" }}
                      />
                    </div>{" "}
                    <AiOutlineCopy
                      style={{ height: "1.4em", width: "1.4em" }}
                      onClick={copyToClipboard}
                    ></AiOutlineCopy>
                  </h6>
                  <table id="F_Account_Pinfo">
                    <tr>
                      <th>Farmertype</th>
                      <td>{JSON.parse(auth).Farmertype}</td>
                    </tr>
                    <tr>
                      <th>Category</th>
                      <td>{JSON.parse(auth).Category}</td>
                    </tr>
                    <tr>
                      <th>Gender</th>
                      <td>{JSON.parse(auth).Gender}</td>
                    </tr>
                    <tr>
                      <th>Date of birth</th>
                      <td>
                        {Moment(JSON.parse(auth).Dateofbirth).format(
                          "DD-MM-YYYY"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>Qualification</th>
                      <td>{JSON.parse(auth).Qualification}</td>
                    </tr>
                    <tr>
                      <th>Physical Disability</th>
                      <td>{JSON.parse(auth).Physical_handicap}</td>
                    </tr>
                    <tr>
                      <th>Ration card Category </th>
                      <td>{JSON.parse(auth).Rationcardcategory}</td>
                    </tr>
                  </table>
                  {/* <button onClick={generatePDF} type="primary">Download PDF</button>  */}
                </>
              )}
            </OverlayTrigger>
          </div>
        </div>
      </div>

      <div className="Main_Farmer_Account">
        <div className="Mainin_Farmer_Account">
          <Tabs
            defaultActiveKey="profile"
            id="uncontrolled-tab-example"
            className="mb-3"
          >
            <Tab eventKey="profile" title="Communication Details" id="intabs">
              <br />
              <Card id="F_A_Minfo">
                <Card.Body>
                  <div>
                    <Image src="/Leaf.svg" id="Leaf1info" />
                    <Image src="/Leaf1.svg" id="Leaf1info1" />
                    <h4 className="CD_title">Communication details</h4>
                    <hr />
                    <div className="commcont">
                      <p>
                        <span className="CD_Name_Title">Email : </span>{" "}
                        {JSON.parse(auth).Email}
                      </p>
                      <p>
                        <span className="CD_Name_Title">Mobile Number : </span>{" "}
                        {JSON.parse(auth).Mobilenum}
                      </p>
                      <p>
                        <span className="CD_Name_Title">Pincode : </span>
                        {JSON.parse(auth).Pincode}
                      </p>
                      <p>
                        <span className="CD_Name_Title">Address : </span>{" "}
                        {JSON.parse(auth).Village} ,{JSON.parse(auth).Taluka} ,{" "}
                        {JSON.parse(auth).State}
                      </p>
                    </div>
                  </div>
                  <div>
                    <br />
                    <h4 className="CD_title">Bank details</h4>
                    <hr />
                    <div className="commcont">
                      <p>
                        <span className="CD_Name_Title">Bank name : </span>{" "}
                        {JSON.parse(auth).Bankname}{" "}
                      </p>
                      <p>
                        <span className="CD_Name_Title">IFSC Code : </span>
                        {JSON.parse(auth).IFSC}
                      </p>
                      <p>
                        <span className="CD_Name_Title">Account Number : </span>{" "}
                        {JSON.parse(auth).Accountnum}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
            <Tab eventKey="home" title="Farm Information">
              <br />
              <div>
                {farmdata.map((farm, idx) => {
                  return (
                    <>
                      <h5 className="FarmTitle">
                        Farm : {idx + 1} ({farm.Farmname})
                      </h5>
                      <Card id="F_A_Minfo">
                        <Card.Body>
                          <div>
                            <h4 className="CD_title">Farm Location</h4>
                            <hr />
                            <div className="commcont">
                              <p className="P_alltags">
                                <span className="CD_Name_Title">State : </span>{" "}
                                Gujarat{" "}
                              </p>
                              <p className="P_alltags">
                                <span className="CD_Name_Title">
                                  {" "}
                                  District :{" "}
                                </span>
                                {farm.District}{" "}
                              </p>
                              <p className="P_alltags">
                                <span className="CD_Name_Title">Taluka : </span>
                                {farm.Taluka}
                              </p>
                              <p>
                                <span className="CD_Name_Title">
                                  {" "}
                                  Village :
                                </span>{" "}
                                {farm.Village}{" "}
                              </p>
                            </div>
                          </div>
                          <div>
                            <br />
                            <h4 className="CD_title">Land information</h4>
                            <hr />
                            <div className="commcont">
                              <p className="P_alltags">
                                <span className="CD_Name_Title">UPIN : </span>{" "}
                                {farm.UPIN}
                              </p>
                              <p className="P_alltags">
                                <span className="CD_Name_Title">
                                  {" "}
                                  Surveynumber :{" "}
                                </span>
                                {farm.Surveynumber}{" "}
                              </p>
                              <p className="P_alltags">
                                <span className="CD_Name_Title">
                                  Old survey number :{" "}
                                </span>
                                {farm.Oldsurveynumber}
                              </p>
                              <p>
                                <span className="CD_Name_Title">
                                  Khata No :{" "}
                                </span>
                                {farm.Khatanum}{" "}
                              </p>
                            </div>
                          </div>
                          <div>
                            <br />
                            <h4 className="CD_title">Land Area</h4>
                            <hr />
                            <div className="commcont">
                              <p className="P_alltags">
                                <span className="CD_Name_Title">
                                  {" "}
                                  Total Area (H.Are.SqMt) :{" "}
                                </span>{" "}
                                {farm.Hectare}.{farm.Are}.{farm.Square_meters}
                              </p>
                              <p className="P_alltags">
                                <span className="CD_Name_Title">
                                  {" "}
                                  Landusefor :
                                </span>{" "}
                                {farm.Landusefor}
                              </p>
                              <p className="P_alltags">
                                <span className="CD_Name_Title">
                                  Totalassessmentrs :{" "}
                                </span>{" "}
                                {farm.Totalassessmentrs} Rs.
                              </p>
                            </div>
                          </div>

                          <div>
                            <br />
                            <br />
                            <br />
                            <h4 className="CD_title">Farm Ownership Details</h4>
                            <hr />
                            <div className="commcont">
                              {farm.Ownership_Details.map(
                                (farmnewArray, idx) => {
                                  return (
                                    <>
                                      <p>
                                        <span className="CD_Name_Title">
                                          {" "}
                                          {idx + 1}.{" "}
                                        </span>{" "}
                                        {farmnewArray.Farmername}
                                      </p>
                                      <h6 style={{ fontWeight: 100 }}></h6>
                                    </>
                                  );
                                }
                              )}
                            </div>
                          </div>
                          <div>
                            <br />
                            <h4 className="CD_title">Other Rights Details</h4>
                            <hr />
                            <div className="commcont">
                              {farm.OtherRightsDetails.map(
                                (farmnewArray, idx) => {
                                  return (
                                    <>
                                      <p>
                                        <span className="CD_Name_Title">
                                          {" "}
                                          {idx + 1}.{" "}
                                        </span>{" "}
                                        {farmnewArray}
                                      </p>
                                      <h6 style={{ fontWeight: 100 }}></h6>
                                    </>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                      {/* <Col key={idx}>
                        
                        <div className="parentbox">
                          <div className="section1">
                            <div className="box1">
                              <h5>Farm Location</h5>
                              <h6 style={{ fontWeight: 100 }}>
                                State : Gujarat
                              </h6>
                              <h6 style={{ fontWeight: 100 }}>
                                District : {farm.District}
                              </h6>
                              <h6 style={{ fontWeight: 100 }}>
                                Taluka : {farm.Taluka}
                              </h6>
                              <h6 style={{ fontWeight: 100 }}>
                                Village : {farm.Village}
                              </h6>
                            </div>
                            <div className="box2">
                              <h5>Land information</h5>
                              <h6 style={{ fontWeight: 100 }}>
                                UPIN : {farm.UPIN}
                              </h6>
                              <h6 style={{ fontWeight: 100 }}>
                              Surveynumber : {farm.Surveynumber}
                              </h6>
                              <h6 style={{ fontWeight: 100 }}>
                                Old survey number : {farm.Oldsurveynumber}
                              </h6>
                              <h6 style={{ fontWeight: 100 }}>
                                Khata No : {farm.Khatanum}
                              </h6>
                            </div>
                            <div className="box3">
                              <h5>Land Area</h5>
                              <h6 style={{ fontWeight: 100 }}>
                                Total Area (H.Are.SqMt) : {farm.Hectare}.
                                {farm.Are}.{farm.Square_meters}
                              </h6>
                              <h6 style={{ fontWeight: 100 }}>
                                Landusefor : {farm.Landusefor}
                              </h6>
                              <h6 style={{ fontWeight: 100 }}>
                                Totalassessmentrs : {farm.Totalassessmentrs} Rs.
                              </h6>
                              <h6 style={{ fontWeight: 100 }}>
                                Farmname : {farm.Farmname}
                              </h6>
                            </div>
                          </div>
                          <div className="section2">
                            <div className="box4">
                              <h5>Farm Ownership Details</h5>
                              {farm.Ownership_Details.map(
                                (farmnewArray, idx) => {
                                  return (
                                    <>
                                      <h6 style={{ fontWeight: 100 }}>
                                        {farmnewArray.Farmername}
                                      </h6>
                                    </>
                                  );
                                }
                              )}
                            </div>
                            <div className="box5">
                              <h5>Farm OtherRights Details</h5>
                              {farm.OtherRightsDetails.map(
                                (farmnewArray, idx) => {
                                  return (
                                    <>
                                      <h6>{farmnewArray}</h6>
                                    </>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>

                        <br></br>
                      </Col> */}
                    </>
                  );
                })}
              </div>
            </Tab>
            <Tab eventKey="Yieldinfo" title="Yield information">
              <br />

              <div>
                <div>
                  <select
                    onChange={(event) => setUPINinfo(event.target.value)}

                    name="UPIN"
                  >
                    <option selected>Select Farm</option>
                    {farmdrop.map((farmdropnew) => {
                      return (
                        <>
                          <option value={farmdropnew.UPIN}>
                            {farmdropnew.Farmname}
                          </option>
                        </>
                      );
                    })}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" onClick={getYielddata}>
                  Submit
                </button>
                <br />
                <Table striped bordered hover className="TableAllskims">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Crop</th>
                      <th>Production</th>
                      <th>Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Yielddata.map((newdata, idx) => {
                      return (
                        <>
                          {newdata.Crop.map((newdataa, idx) => {
                            return (
                              <>
                                <tr>
                                  <td>{idx + 1}</td>
                                  <td>{newdataa.value}</td>
                                  <td>{newdata.Production}</td>
                                  <td>{newdata.Ratio}</td>
                                </tr>
                              </>
                            )
                          })}
                          <br />

                        </>
                      );
                    })}
                  </tbody>
                </Table>

                {/* <h1>{Yielddata.Are}</h1> */}
              </div>
              <br />
              <Button onClick={AddnewCrop}>Add New Crop Details</Button>

              {show ? (
                <Modal
                  show={show}
                  backdrop="static"
                  keyboard={true}
                  size="xl"
                  onHide={() => setShow(false)}
                  dialogClassName="modal-90w"
                  aria-labelledby="example-custom-modal-styling-title"
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                      Add Crop
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {/* <h1>Hello</h1> */}
                    <label>Select Farm</label>
                    <form onSubmit={handleSubmit}>
                      <div>
                        <select
                          onChange={(event) => setUPIN(event.target.value)}
                          name="UPIN"
                        >
                          <option selected>Select Farm</option>
                          {farmdrop.map((farmdropnew) => {
                            return (
                              <>
                                <option value={farmdropnew.UPIN}>
                                  {farmdropnew.Farmname}
                                </option>
                              </>
                            );
                          })}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label>Crop</label>
                        <Select
                          isMulti
                          value={Crop}
                          onChange={handleChangecrop}
                          options={options}
                        />
                      </div>
                      <lable>Select Ratio</lable>
                      <br />
                      {Crop.map((value, index) => (
                        <input
                          key={index}
                          type="text"
                          className="form-control_Crop"
                          name={`value${index}`}
                          placeholder={`${value.value}`}
                          // value={value.value}
                          onChange={(event) => handleChangeRatio(event, index)}
                        />

                      ))}
                      <lable>Select Pro</lable>
                      {Cropproduction.map((value, index) => (
                        <input
                          key={index}
                          type="text"
                          className="form-control_Crop"
                          name={`value${index}`}
                          placeholder={`${value.value}`}
                          // value={value.value}
                          onChange={(event) => handleChangeProduction(event, index)}
                        />

                      ))}

                      <div className="mb-3">
                        <label>Select Soil type</label>
                        <input
                          // type="email"
                          className="form-control"
                          placeholder="e.g. Black, Red, Alluvial, Clay"
                          onChange={(event) => setSoil_type(event.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label>Select Season</label>
                        <input
                          // type="email"
                          className="form-control"
                          placeholder="e.g. Kharif, Rabi, Whole Year"
                          onChange={(event) => setSeason(event.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label>Sow date</label>
                        <input
                          type="date"
                          className="form-control"
                          placeholder="Enter your mobilenumber"
                          onChange={(event) => setSow_date(event.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label>Harvest date</label>
                        <input
                          type="date"
                          className="form-control"
                          placeholder="Enter your mobilenumber"
                          onChange={(event) => setHarvest_date(event.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label>Production</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter production in quintals"
                          onChange={(event) => setProduction(event.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label>Select Irigation sources used</label>
                        <input
                          // type="email"
                          className="form-control"
                          placeholder="e.g. Borewell, Canal, Rainfed"
                          onChange={(event) =>
                            setIrigation_sources_used(event.target.value)
                          }
                        />
                      </div>

                      <div></div>

                      <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                          Submit
                        </button>
                      </div>
                    </form>
                  </Modal.Body>
                </Modal>
              ) : null}



            </Tab>
            <Tab eventKey="Apmc bill" title="APMC Bill History" >
              <br />
              {/* <h1> Hello</h1> */}
              <Table striped bordered hover className="TableAllskims">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Trade_name</th>
                    <th>Crop</th>
                    <th>Bill date</th>
                    <th>Total Bags</th>
                    <th>Rate</th>
                    <th>Other Chargs</th>
                    <th>Bill_Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Billhistorydata.map((newdata, idx) => {
                    return (
                      <>
                        <tr>
                          <td>{idx + 1}</td>
                          <td>{newdata.Trade_name}</td>
                          <td>{newdata.Crop}</td>
                          <td>{Moment(newdata.Bill_date).format("DD-MM-YYYY")}</td>
                          <td>{newdata.Bags}</td>
                          <td>{newdata.Rate}</td>
                          <td>{newdata.Bill_Amount - newdata.Amount}</td>
                          <td>{newdata.Bill_Amount}</td>

                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  ) : (
    <>
      <div>
        <h2>Login Require</h2>
      </div>
    </>
  );
}

export default Myaccount;
