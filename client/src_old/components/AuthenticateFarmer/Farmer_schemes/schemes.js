import React from "react";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Moment from 'moment';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import "./SchemesMain.css";

export default function Schemes() {
  const [schemedata, setschemedata] = useState([]);
  const [morebtntry, setmorebtntry] = useState([]);
  const [show, setShow] = useState(false);
  const auth = localStorage.getItem("user");

 
  useEffect(() => {
    getschemedata();
    console.log(JSON.parse(auth).Farmertype);
    console.log(JSON.parse(auth).Category);
  }, []);

  function getschemedata() {
    fetch(
      `http://localhost:8000/farmer/eligibleschemes/${
        JSON.parse(auth).Category
      }/${JSON.parse(auth).Farmertype}/${JSON.parse(auth).Farmerid}`,
      {
        method: "GET",
        crossDomain: true,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const Scheme = data;
        setschemedata(Scheme);
        console.log(Scheme);
      });
  }

  function handlemoreinfo(Schemeid) {
    fetch(`http://localhost:8000/scheme/schemeinfo/${Schemeid}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data , "moredata");
        getschemedata();
        setmorebtntry(data);
        setShow(true);
      });
  }
  function handleApply(scheme) {
    fetch(
      `http://localhost:8000/farmer/applyforscheme/${scheme.Schemeid}/${JSON.parse(auth).Farmerid}`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status == "ok") {
          console.warn(data);
          getschemedata();
          alert(data.result);
          window.location.reload();
        } else {
          alert(data.error);
        }
      });
  }


  const columns = ["one " , "two"
    // { title: "Total Panding", field: ("Applied" - "Approved" - "Reject" ), type: "Reject" }
  ]


  const downloadpdf_more = () => {
    const doc = new jsPDF()
    doc.text("Growfarm" , 20 , 10)
    
    doc.autoTable({
      theme: "grid",
      body: [
        { Maintitle: "Title", Details: morebtntry.Schemeid },
        { Maintitle: 'Description', Details: morebtntry.Description },
        { Maintitle: "Benefits", Details: morebtntry.Benefits },
        { Maintitle: 'How to Apply', Details: morebtntry.How },
        { Maintitle: "More Information", Details: morebtntry.More },
        { Maintitle: 'Start Date', Details: morebtntry.Start },
        { Maintitle: "Expired Date", Details: morebtntry.Expired },
        { Maintitle: 'Category', Details: morebtntry.Category },
        { Maintitle: 'Type', Details: morebtntry.Farmertype },
      ],
      columns: [
        { header: 'Title', dataKey: 'Maintitle' },
        { header: 'Details', dataKey: 'Details' },
      ],
    })
    doc.save("table.pdf")
    }

const handleClose = () =>{
  setShow(false)
}


  return (
    <>
    <h5>Beneficiary schemes for <span style={{color : "green"}}>{JSON.parse(auth).Name}.</span></h5>
      <Table striped bordered hover className="F_Schemes_Table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Scheme Title</th>
            <th>Last Date</th>
            <th>More Info</th>
            <th>Apply</th>
          </tr>
        </thead>
        <tbody>
          {schemedata.map((scheme, idx) => {
            return (
              <>
                <tr>
                  <td scope="raw">{idx + 1}</td>
                  <td>{scheme.Title}</td>
                  <td> {Moment(scheme.Expired).format('DD-MM-YYYY')}</td>
                  <td onClick={() => handlemoreinfo(scheme.Schemeid)}>
                    <Button variant="info">More Info</Button>
                  </td>
                  <td onClick={() => handleApply(scheme)}>
                    <Button variant="success">Apply</Button>
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
                        Scheme Information
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
                    <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={downloadpdf_more}>
          downloadpdf in pdf
          </Button>
        </Modal.Footer>
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
