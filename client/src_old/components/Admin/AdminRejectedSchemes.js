import React from "react";
import Table from "react-bootstrap/Table";
import "./schemes.css";
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Moment from 'moment';
import Button from "react-bootstrap/Button";

export default function AdminRejectedSchemes() {
  const [schemedata, setschemedata] = useState([]);
  const [Schemeid, setSchemeid] = useState();
  const [Applicationsinfo, setApplicationsinfo] = useState([]);
  const [Applieddatatable, setApplieddatatable] = useState(true);
  const [FullApplicationstable, setFullApplicationstable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [morebtntry, setmorebtntry] = useState();
  const [show, setShow] = useState(false);

  useEffect(() => {
    getschemedata();
  }, []);

  function getschemedata() {
    fetch(`http://localhost:8000/scheme/rejectedapplications`)
      .then((response) => response.json())
      .then((data) => {
        const Scheme = data;
        setschemedata(Scheme);
        setApplieddatatable(true)
        setFullApplicationstable(false)
      });
  }

  function handlemoreinfo(Schemeid) {
    fetch(`http://localhost:8000/scheme/schemeinfo/${Schemeid}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        getschemedata();
        setmorebtntry(data);
        setShow(true);
      });
  }
  console.log(morebtntry, "morebtntry");

  function handleApplications(Schemeid) {
    fetch(`http://localhost:8000/scheme/listofrejectedapplications/${Schemeid}`, {
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
      });
  }


  return (
    <>
      <div>
        {Applieddatatable ? (
          <Table striped bordered hover className="TableAllskims">
            <thead>
              <tr>
                <th>No.</th>
                <th>Scheme Title</th>
                <th>Last Date</th>
                <th>Total Rejected</th>
                <th>More Info</th>
                <th>Total Applications</th>
              </tr>
            </thead>
            <tbody>
              {schemedata.map((scheme) => {
                return (
                  <>
                    <tr>
                      <td>1</td>
                      <td>{scheme.Title}</td>
                      <td>{Moment(scheme.Expired).format('DD-MM-YYYY')}</td>
                      <td>{scheme.Reject}</td>
                      <td onClick={() => handlemoreinfo(scheme.Schemeid)}><Button variant="info">More Info</Button></td>
                      <td onClick={() => handleApplications(scheme.Schemeid)}><Button variant="success">Applications</Button></td>
                      {/* <td  onClick={() => handledelete(scheme._id)}><button>delete</button></td> */}
                    </tr>

                    {show ? (
                      <Modal
                        show={show}
                        onHide={() => setShow(false)}
                        dialogClassName="modal-90w"
                        aria-labelledby="example-custom-modal-styling-title"
                      >
                        <Modal.Header closeButton>
                          <Modal.Title id="example-custom-modal-styling-title">
                            Custom Modal Styling
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
                          <td>{Moment(morebtntry.Start).format('DD-MM-YYYY')} </td>

                        </tr>
                        <tr>
                          <th>Expire Date</th>
                       <td>{Moment(morebtntry.Expired).format('DD-MM-YYYY')} </td>
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
      </div>

      {FullApplicationstable ? (
        <>
          <button onClick={() => getschemedata()}>Back</button>
          <Table striped bordered hover className="TableAllskims">
            <thead>
              <tr>
                <th>No.</th>
                <th>Farmer id</th>
                <th>Sheme ._id</th>
                <th>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {Applicationsinfo.map((Application) => {
                return (
                  <>
                    <tr>
                      <td>1</td>
                      <td>{Application.Farmerid}</td>
                      <td>{Application._id}</td>
                      <td>{Application.Status}</td>
                      {/* <td  onClick={() => handlemoreinfo2(Application._id) } ><button>More Info</button></td> */}
                    </tr>
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
