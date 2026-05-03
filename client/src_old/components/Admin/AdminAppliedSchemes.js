import React from "react";
import { useContext } from "react";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Moment from "moment";
import Button from "react-bootstrap/Button";
import { AppContext } from "../AuthenticateFarmer/Farmer_account/appContext";
// import { AppContext } from "./appContext";

export default function AdminAppliedSchemes() {
  const [schemedata, setschemedata] = useState([]);
  const [Schemeid, setSchemeid] = useState();
  const [Applicationsinfo, setApplicationsinfo] = useState([]);
  const [Applieddatatable, setApplieddatatable] = useState(false);
  const [FullApplicationstable, setFullApplicationstable] = useState(false);
  const [morebtntry, setmorebtntry] = useState();
  const [farmermorebtntry, setfarmermorebtntry] = useState();
  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const auth = localStorage.getItem("user");
  const [message, setMessage] = useState("");
  const { socket } = useContext(AppContext);
  
  // const { socket} = useContext(AppContext);

  useEffect(() => {
    getschemedata();
    handleApplications(Schemeid)
    console.log(JSON.parse(auth).Farmertype);
    console.log(JSON.parse(auth).Category);
  }, []);

  function getschemedata() {
    fetch(`http://localhost:8000/scheme/appliedschemes`, {
      method: "GET",
      crossDomain: true,
    })
      .then((response) => response.json())
      .then((data) => {
        const Scheme = data;
        console.log(Scheme, "schemdata");
        setschemedata(Scheme);
        setApplieddatatable(true);
        setFullApplicationstable(false);
      });
  }

  function handlemoreinfo(Schemeid) {
    fetch(`http://localhost:8000/scheme/schemeinfo/${Schemeid}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        console.warn(Schemeid);
        getschemedata();
        setmorebtntry(data);
        setShow(true);
      });
  }
  function handleFarmerinfo(Application) {
    fetch(`http://localhost:8000/admin/farmerinformation/${Application.Farmerid}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        console.warn(Schemeid);
        setfarmermorebtntry(data);
        setShow2(true);
      });
  }
  function handleApplications(Schemeid) {
    fetch(`http://localhost:8000/scheme/applicationsofscheme/${Schemeid}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        console.warn(Schemeid);
        setApplicationsinfo(data);
        console.warn(Applicationsinfo);
        console.warn(data);
        setFullApplicationstable(true);
        setApplieddatatable(false);
        setSchemeid(Schemeid);
        handleApprove();
      });
  }
  function handleApprove(Application) {
    fetch(
      `http://localhost:8000/scheme/approve/${Schemeid}/${Application.Farmerid}`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        console.warn(Application);
        // alert("Approved");
        setMessage("Approved");
        handleApplications(Schemeid)

        socket.emit('send-notification', {
          content : "Hello.....Approve done" , 
          to : Application.Farmerid
      });


      });
  }
  function handleReject(Application) {
    fetch(
      `http://localhost:8000/scheme/reject/${Schemeid}/${Application.Farmerid}`,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        handleApplications(Schemeid)
        // alert("Rejected");
        // handleApplications();
        socket.emit('send-notification', {
          content : "Hello.....Reject done" , 
          to : Application.Farmerid
      });
      });
  }

  return (
    <>
      {Applieddatatable ? (
        <Table striped bordered hover className="TableAllskims">
          <thead>
            <tr>
              <th>No.</th>
              <th>Scheme Title</th>
              <th>Last Date</th>
              <th>Total pending</th>
              <th>More Info</th>
              <th>Applications</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schemedata.map((scheme, idx) => {
              return (
                <>
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{scheme.Title}</td>
                    <td>{Moment(scheme.Expired).format("DD-MM-YYYY")}</td>
                    <td>{scheme.Applied - scheme.Approved} </td>
                    <td onClick={() => handlemoreinfo(scheme.Schemeid)}>
                      <Button variant="info">More Info</Button>
                    </td>
                    <td onClick={() => handleApplications(scheme.Schemeid)}>
                      <Button variant="success">Applications</Button>
                    </td>
                    <td>{scheme.Status} </td>
                  </tr>

                  {show ? (
                    <Modal
                      show={show}
                      backdrop="static"
                      keyboard={true}
                      size="xl"
                      onHide={() => setShow(false)}
                      dialogClassName="modal-190w"
                      aria-labelledby="example-custom-modal-styling-title"
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                          {morebtntry.Title}
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <table id="F_model_Table">
                          <tr>
                            <th>Title</th>
                            <td>{morebtntry.Title}</td>
                          </tr>
                          <tr>
                            <th>Description</th>
                            <td> {morebtntry.Description} </td>
                          </tr>
                          <tr>
                            <th>Benefits</th>
                            <td>{morebtntry.Benefits} </td>
                          </tr>
                          <tr>
                            <th>For More Information </th>
                            <td> {morebtntry.How} </td>
                          </tr>
                          <tr>
                            <th>Start Date</th>
                            <td>
                              {Moment(morebtntry.Start).format("DD-MM-YYYY")}{" "}
                            </td>
                          </tr>
                          <tr>
                            <th>Expire Date</th>
                            <td>
                              {Moment(morebtntry.Expired).format("DD-MM-YYYY")}{" "}
                            </td>
                          </tr>
                          <tr>
                            <th> Eligible Category</th>
                            <td>{morebtntry.Category.join(" , ")} </td>
                          </tr>
                          <tr>
                            <th>Eligible Farmer Type</th>
                            <td> {morebtntry.Farmertype.join(" , ")} </td>
                          </tr>
                        </table>
                      </Modal.Body>
                    </Modal>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </Table>
      ) : null}

      {FullApplicationstable ? (
        <>
        <br />
          <button onClick={() => getschemedata()}>Back</button>
          <Table striped bordered hover className="TableAllskims">
            <thead>
              <tr>
                <th>No.</th>
                <th>Farmer Name</th>
                <th>Farmer id</th>
                <th>Apply date</th>
                <th>Status</th>
                <th>Approve</th>
                <th>Reject</th>
              </tr>
            </thead>
            <tbody>
              {Applicationsinfo.map((Application, idx) => {
                return (
                  <>
                    <tr>
                      <td>1</td>
                      <td>{Application.Name}</td>
                      <td>{Application.Farmerid}</td>
                      <td>{Moment(Application.Applieddate).format("DD-MM-YYYY")}</td>
                      <td>{Application.Status}</td>
                      {/* <td  onClick={() => handlemoreinfo2(Application.Schemeid) } ><button>More Info</button></td> */}
                      <td onClick={() => handleFarmerinfo(Application)}>
                        <button>More info</button>
                      </td>
                      <td onClick={() => handleApprove(Application)}>
                        <button>Approve</button>
                      </td>
                      <td onClick={() => handleReject(Application)}>
                        <button>reject</button>
                      </td>
                    </tr>

                    {show2 ? (
                    <Modal
                      show={show2}
                      backdrop="static"
                      keyboard={true}
                      size="xl"
                      onHide={() => setShow2(false)}
                      dialogClassName="modal-190w"
                      aria-labelledby="example-custom-modal-styling-title"
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                         Farmer Details
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <table id="F_model_Table">
                          <tr>
                            <th>Name</th>
                            <td>{farmermorebtntry._id}</td>
                          </tr>
                          <tr>
                            <th>Name</th>
                            <td> {farmermorebtntry.Name} </td>
                          </tr>
                          <tr>
                            <th>Gender</th>
                            <td>{farmermorebtntry.Gender} </td>
                          </tr>
                          <tr>
                            <th>Category</th>
                            <td> {farmermorebtntry.Category} </td>
                          </tr>
                          <tr>
                            <th>Qualification</th>
                            <td> {farmermorebtntry.Qualification} </td>
                          </tr>
                          <tr>
                            <th>Adharnum</th>
                            <td> {farmermorebtntry.Adharnum} </td>
                          </tr>
                          <tr>
                            <th>Rationcardcategory</th>
                            <td> {farmermorebtntry.Rationcardcategory} </td>
                          </tr>
                        </table>
                      </Modal.Body>
                    </Modal>
                  ) : null}

                  </>
                );
              })}
            </tbody>
          </Table>
        </>
      ) : null}
    </>
  );
}
