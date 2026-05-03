import React from "react";
import Table from "react-bootstrap/Table";
import "./schemes.css";
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Moment from 'moment';
import Button from "react-bootstrap/Button";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx/xlsx.mjs';
export default function AdminExpiredSchemes() {
  const [loading, setLoading] = useState(false);
  const [schemedata, setschemedata] = useState([]);
  const [morebtntry, setmorebtntry] = useState();
  const [Schemeid, setSchemeid] = useState();
  const [show, setShow] = useState(false);
  const [Applicationsinfo, setApplicationsinfo] = useState([]);
  const [Applieddatatable, setApplieddatatable] = useState(true);
  const [FullApplicationstable, setFullApplicationstable] = useState(false);
  const [FulltableReject, setFulltableReject] = useState(false);


const downloadpdf = () => {
const doc = new jsPDF()
doc.text("Schemes For All" , 20 , 10)

doc.autoTable({
  theme: "grid",
  columns: columns.map(col => ({ ...col, dataKey: col.field })),
  body: schemedata
})
doc.save("table.pdf")
}

const downloadExcel = () =>{
  const newData=schemedata.map(row=>{
    delete row.tableData  // for Delete Some specific column , Replace tableData with Json Resp. data 
    return row
  })
  const workSheet=XLSX.utils.json_to_sheet(newData)
  const workBook=XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workBook,workSheet,"Schemes")
  //Buffer
  let buf=XLSX.write(workBook,{bookType:"xlsx",type:"buffer"})
  //Binary string
  XLSX.write(workBook,{bookType:"xlsx",type:"binary"})
  //Download
  XLSX.writeFile(workBook,"All_Schemes_Data.xlsx")
}

const columns = [
  { title: "Scheme Title", field: "Title", },
  { title: "Expired Date", field: "Expired", },
  { title: "Total Applied", field: "Applied", type: "Applied" },
  { title: "Total Approved", field: 'Approved', type: "Approved" },
  { title: "Total Rejected", field: 'Reject', type: "Reject" },
  // { title: "Total Panding", field: ("Applied" - "Approved" - "Reject" ), type: "Reject" }
]
  useEffect(() => {
    getschemedata();
  }, []);

  function getschemedata() {
    fetch(`http://localhost:8000/scheme/allexscheme`)
      .then((response) => response.json())
      .then((data) => {
        const Scheme = data;
        setschemedata(Scheme);
        setApplieddatatable(true)
        setFullApplicationstable(false)
        setFulltableReject(false)
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
    fetch(`http://localhost:8000/scheme/listofapprovedapplications/${Schemeid}`, {
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
  function handleApplicationsR(Schemeid) {
    fetch(`http://localhost:8000/scheme/listofapprovedapplications/${Schemeid}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        console.warn(Schemeid);
        setApplicationsinfo(data);
        console.warn(Applicationsinfo);
        console.warn(data);
        setFulltableReject(true);
        setApplieddatatable(false);
        setSchemeid(Schemeid);
      });
  }

  return (
    <>
      <Button onClick={downloadpdf}>Download (pdf)</Button> &nbsp;
      <Button onClick={downloadExcel}>Download (Excel)</Button>
      <div>
      {Applieddatatable ? (
        <Table striped bordered hover className="TableAllskims">
          <thead>
            <tr>
              <th>No.</th>
              <th>Scheme Title</th>
              <th>Last Date</th>
              <th>Applied</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Total pending</th>
              <th>Approved Applications</th>
              <th>Rejected Applications</th>
              <th>More Info</th>
            </tr>
          </thead>
          <tbody>
            {schemedata.map((scheme, idx) => {
              return (
                <>
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{scheme.Title}</td>
                    <td>{Moment(scheme.Expired).format('DD-MM-YYYY')}</td>
                    <td>{scheme.Applied}</td>
                    <td>{scheme.Approved}</td>
                    <td>{scheme.Reject}</td>
                    <td>{scheme.Applied - scheme.Approved - scheme.Reject} </td>
                    <td onClick={() => handleApplications(scheme.Schemeid)}>
                    <Button variant="success">Applications</Button></td>
                    <td onClick={() => handleApplicationsR(scheme.Schemeid)}>
                    <Button variant="success">Applications</Button></td>
                    <td onClick={() => handlemoreinfo(scheme.Schemeid)}>
                    <Button variant="info">More Info</Button></td>
                  </tr>

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
                <th>Scheme .Schemeid</th>
                <th> Total Approved</th>
              </tr>
            </thead>
            <tbody>
              {Applicationsinfo.map((Application) => {
                return (
                  <>
                    <tr>
                      <td>1</td>
                      <td>{Application.Farmerid}</td>
                      <td>{Application.Schemeid}</td>
                      <td>{Application.Status}</td>
                      {/* <td  onClick={() => handlemoreinfo2(Application.Schemeid) } ><button>More Info</button></td> */}
                    </tr>
                  </>
                );
              })}
            </tbody>
          </Table>
        </>
      ) : null}
      {FulltableReject ? (
        <>
          <button onClick={() => getschemedata()}>Back</button>
          <Table striped bordered hover className="TableAllskims">
            <thead>
              <tr>
                <th>No.</th>
                <th>Farmer id</th>
                <th>Scheme .Schemeid</th>
                <th> Total Reject</th>
              </tr>
            </thead>
            <tbody>
              {Applicationsinfo.map((Application) => {
                return (
                  <>
                    <tr>
                      <td>1</td>
                      <td>{Application.Farmerid}</td>
                      <td>{Application.Schemeid}</td>
                      <td>{Application.Status}</td>
                      {/* <td  onClick={() => handlemoreinfo2(Application.Schemeid) } ><button>More Info</button></td> */}
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
