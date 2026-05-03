import React from "react";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Moment from 'moment';
import "./SchemesMain.css";
import Button from "react-bootstrap/Button";

export default function Rejected() {
  const [schemedata, setschemedata] = useState([]);
  const [morebtntry, setmorebtntry] = useState();
  const [show, setShow] = useState(false);
  const auth = localStorage.getItem("user");

  useEffect(() => {
    getschemedata();
    console.log(JSON.parse(auth).Farmertype);
    console.log(JSON.parse(auth).Category);
  }, []);

  function getschemedata() {
    fetch(
      `http://localhost:8000/farmer/rejectedapplications/${
        JSON.parse(auth).Farmerid}`,
      {
        method: "GET",
        crossDomain: true,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const Scheme = data;
        setschemedata(Scheme);
        console.warn(Scheme ,  "lol");
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
 

  return (
    <>
     <h5>Rejected scheme of  <span style={{color : "green"}}>{JSON.parse(auth).Name}.</span></h5>
        <Table striped bordered hover className="F_Schemes_Table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Scheme Title</th>
              <th>Applied Date</th>
              <th>Reject Date</th>
              <th>Last Date</th>
              <th>More Info</th>
            </tr>
          </thead>
          <tbody>
            {schemedata.map((scheme, idx) => {

              
              return (
                <>
                  <tr>
                    <td scope="raw">{idx + 1}</td>
                    <td>{scheme.Title}</td>
                    <td> {Moment(scheme.Applieddate).format('DD-MM-YYYY')} </td>
                    <td> {Moment(scheme.Reponcedate).format('DD-MM-YYYY')} </td>
                    <td> {Moment(scheme.Expired).format('DD-MM-YYYY')} </td>
                    <td onClick={() => handlemoreinfo(scheme.Schemeid)}>
                      <Button variant="info">More Info</Button>
                    </td>
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
                        <p> {morebtntry._id} </p>
                        <p> {morebtntry.Description} </p>
                        <p> {morebtntry.Benefits} </p>
                        <p> {morebtntry.How} </p>
                        <p> {morebtntry.More} </p>
                        <p>  {Moment(morebtntry.Start).format('DD-MM-YYYY')} </p>
                        <p>  {Moment(morebtntry.Expired).format('DD-MM-YYYY')} </p>
                        <p> {morebtntry.Category[0]} </p>
                        <p> {morebtntry.Category[1]} </p>
                        <p> {morebtntry.Farmertype[0]} </p>
                        <p> {morebtntry.Farmertype[1]} </p>
                      </Modal.Body>
                    </Modal>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </Table>
    </>
  );
}
