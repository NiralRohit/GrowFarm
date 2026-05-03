import React from "react";
import Table from "react-bootstrap/Table";
import "./schemes.css";
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from 'react-bootstrap/Form';
import Moment from "moment";
import Button from "react-bootstrap/Button";
import jsPDF from "jspdf";
import ReactApexChart from "react-apexcharts";
import { Container, Col, Row, FormGroup, Label, Input } from "reactstrap";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx/xlsx.mjs";
import { async } from "@firebase/util";
export default function AdminSchemes() {
  const [loading, setLoading] = useState(false);
  const [schemedata, setschemedata] = useState([]);
  const [morebtntry, setmorebtntry] = useState();
  const [Schemeid, setSchemeid] = useState();
  const [show, setShow] = useState(false);
  const [Applicationsinfo, setApplicationsinfo] = useState([]);
  const [ApplicationsinfoG2, setApplicationsinfoG2] = useState([]);
  const [Applieddatatable, setApplieddatatable] = useState(true);
  const [FullApplicationstable, setFullApplicationstable] = useState(false);
  const [FulltableReject, setFulltableReject] = useState(false);
  const [Analysisdatatable, setAnalysisdatatable] = useState(false);
  const [Districdrop, setDistricdrop] = useState([]);
  const [Talukadrop, setTalukadrop] = useState([]);
  const [villagedrop, setvillagedrop] = useState([]);
  const [districnewdata, setdistricnewdata] = useState("");
  const [Taluka, setTaluka] = useState("");
  const [Taluka2, setTaluka2] = useState("0");
  const [Villagename, setVillagename] = useState("0");
  const [districnewdata2, setdistricnewdata2] = useState("");
  const [districnewdata3, setdistricnewdata3] = useState("");
  const [disn, setdisn] = useState([]);
  const [Talukadata, setTalukadata] = useState([]);
  const [Talukadata2, setTalukadata2] = useState([]);
  const [Villagedata, setVillagedata] = useState([]);
  const [highApptableDistric, sethighApptableDistric] = useState([]);
  const [highApptableTaluka, sethighApptableTaluka] = useState([]);
  const [highApptableVillage, sethighApptableVillage] = useState([]);
  const [SchemeTitle, setSchemeTitle] = useState("");

  const [series, setSeries] = useState([
    {
      name: "Intake",
      data: [],
    },
  ]);
  const [options, setObject] = useState({
    Chart: {
      id: "bar",
    },
    stroke: {
      width: [1, 1, 1],
    },

    markers: {
      size: 0,
    },
    xaxis: {
      categories: [],
    },
  });
  const [series2, setSeries2] = useState([
    {
      name: "Intake",
      data: [],
    },
  ]);
  const [options2, setObject2] = useState({
    Chart: {
      id: "bar",
    },
    stroke: {
      width: [1, 1, 1],
    },

    markers: {
      size: 0,
    },
    xaxis: {
      categories: [],
    },
  });
  const [series3, setSeries3] = useState([
    {
      name: "Intake",
      data: [],
    },
  ]);
  const [options3, setObject3] = useState({
    Chart: {
      id: "bar",
    },
    stroke: {
      width: [1, 1, 1],
    },

    markers: {
      size: 0,
    },
    xaxis: {
      categories: [],
    },
  });
  const [series4, setSeries4] = useState([
    {
      name: "Intake",
      data: [],
    },
  ]);
  const [options4, setObject4] = useState({
    Chart: {
      id: "bar",
    },
    stroke: {
      width: [1, 1, 1],
    },

    markers: {
      size: 0,
    },
    xaxis: {
      categories: [],
    },
  });

  const downloadpdf = () => {
    const doc = new jsPDF();
    doc.text("Schemes For All", 20, 10);

    doc.autoTable({
      theme: "grid",
      columns: columns.map((col) => ({ ...col, dataKey: col.field })),
      body: schemedata,
    });
    doc.save("table.pdf");
  };

  const downloadExcel = () => {
    const newData = schemedata.map((row) => {
      delete row.tableData; // for Delete Some specific column , Replace tableData with Json Resp. data
      return row;
    });
    const workSheet = XLSX.utils.json_to_sheet(newData);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "Schemes");
    //Buffer
    let buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });
    //Binary string
    XLSX.write(workBook, { bookType: "xlsx", type: "binary" });
    //Download
    XLSX.writeFile(workBook, "All_Schemes_Data.xlsx");
  };

  const columns = [
    { title: "Scheme Title", field: "Title" },
    { title: "Expired Date", field: "Expired" },
    { title: "Total Applied", field: "Applied", type: "Applied" },
    { title: "Total Approved", field: "Approved", type: "Approved" },
    { title: "Total Rejected", field: "Reject", type: "Reject" },
    // { title: "Total Panding", field: ("Applied" - "Approved" - "Reject" ), type: "Reject" }
  ];
  useEffect(() => {
    getschemedata();
  }, []);

  function getschemedata() {
    fetch(`http://localhost:8000/scheme/allactivescheme`)
      .then((response) => response.json())
      .then((data) => {
        const Scheme = data;
        setschemedata(Scheme);
        setApplieddatatable(true);
        setFullApplicationstable(false);
        setFulltableReject(false);
        setAnalysisdatatable(false);
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

  function handledelete(Schemeid) {
    fetch(`http://localhost:8000/scheme/deletescheme/${Schemeid}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        getschemedata();
      });
  }

  function handleApplications(Schemeid) {
    fetch(
      `http://localhost:8000/scheme/listofapprovedapplications/${Schemeid}`,
      {
        method: "GET",
      }
    )
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
    fetch(
      `http://localhost:8000/scheme/listofrejectedapplications/${Schemeid}`,
      {
        method: "GET",
      }
    )
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

  function handleApplicationsAnalysis(scheme) {
    const Eligible_farmers = [];
    const Applications = [];
    const Approved = [];
    const Reject = [];
    const Category = [];

    setSchemeid(scheme.Schemeid);
    setSchemeTitle(scheme.Title)
    console.log(scheme.Schemeid)

    fetch(`http://localhost:8000/scheme/farmerdetailsforscheme/${scheme.Schemeid}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data);
        console.warn(Schemeid);
        setApplicationsinfo(data);
        setFulltableReject(false);
        setApplieddatatable(false);
        setAnalysisdatatable(true);
        {
          data.map((AnalysisGraphn, idx) => {
            Eligible_farmers.push(AnalysisGraphn.Eligible_farmers);
            Applications.push(AnalysisGraphn.Applications);
            Approved.push(AnalysisGraphn.Approved);
            Reject.push(AnalysisGraphn.Reject);
            Category.push(AnalysisGraphn.Category);
            console.log(Eligible_farmers);
          });
        }
        Eligible_farmers.shift();
        Applications.shift();
        Approved.shift();
        Reject.shift();
        Category.shift();
        console.log(Eligible_farmers);
        setSeries([
          {
            name: "Eligible farmers",
            data: Eligible_farmers,
            type: "bar",
          },
          {
            name: "Total Applications",
            data: Applications,
            type: "bar",
          },
          {
            name: "Approved",
            data: Approved,
            type: "bar",
          },
          {
            name: "Rejected",
            data: Reject,
            type: "bar",
          },
        ]);
        setObject({
          chart: {
            type: "bar",
            height: 430,
            width: 700,
          },
          title: {
            text: "Title",
          },
          plotOptions: {
            bar: {
              horizontal: false,
              dataLabels: {
                position: "top",
              },
            },
          },
          dataLabels: {
            enabled: true,
            offsetX: -6,
            style: {
              fontSize: "12px",
              colors: ["#fff"],
            },
          },
          stroke: {
            show: true,
            width: 1,
            colors: ["#fff"],
          },
          tooltip: {
            shared: true,
            intersect: false,
          },
          xaxis: {
            categories: Category,
          },
        });
      });
  }

  useEffect(() => {
    const getDistrict = async () => {
      const rescountry = await fetch("http://localhost:8000/scheme/list");
      const rescon = await rescountry.json();
      console.log(rescon);
      setdisn(rescon);
    };
    getDistrict();
  }, []);

  useEffect(() => {
    const getTaluka = async () => {
      const rescountry = await fetch(
        `http://localhost:8000/scheme/list/${districnewdata2}`
      );
      const rescon = await rescountry.json();
      console.log(rescon);
      setTalukadata(await rescon);
      console.warn(Talukadata);
    };
    getTaluka();
  }, [districnewdata2]);

  useEffect(() => {
    const getTaluka = async () => {
      const rescountry = await fetch(
        `http://localhost:8000/scheme/list/${districnewdata3}`
      );
      const rescon = await rescountry.json();
      console.log(rescon);
      setTalukadata2(await rescon);
      console.warn(Talukadata2);
    };
    getTaluka();
  }, [districnewdata3]);

  useEffect(() => {
    const getVillage = async () => {
      const rescountry = await fetch(
        `http://localhost:8000/scheme/list/${districnewdata3}/${Taluka2}`
      );
      const rescon = await rescountry.json();
      console.log(rescon);
      setVillagedata(await rescon);
      console.warn("what");
    };
    getVillage();
  }, [districnewdata3, Taluka2]);

  const handleDistric = (event) => {
    const getDistrictname = event.target.value;
    setdistricnewdata(getDistrictname);
  };
  const handleDistric2 = (event) => {
    const getDistrictname2 = event.target.value;
    setdistricnewdata2(getDistrictname2);
  };
  const handleDistric3 = (event) => {
    const getDistrictname3 = event.target.value;
    setdistricnewdata3(getDistrictname3);
    setVillagename("0");
    setVillagedata([]);
    setTaluka2("0");
    setTalukadata2([]);
  };

  const handleTaluka2 = (event) => {
    const getTalukaname2 = event.target.value;
    setTaluka2(getTalukaname2);
    setVillagename("0");
    setVillagedata([]);
  };
  const handleVillagename = (event) => {
    const getVillagename = event.target.value;
    setVillagename(getVillagename);
  };



  useEffect(() => {
    console.log(Schemeid);
    const Eligible_farmers = [];
    const Applications = [];
    const Approved = [];
    const Reject = [];
    const Category = [];
    const getstate = async () => {
      await fetch(
        `http://localhost:8000/scheme/analysis/${Schemeid}/${districnewdata3}/${Taluka2}/${Villagename}`,
        {
          method: "GET",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.warn(data, "newapi");
          console.warn(Schemeid);
          sethighApptableVillage(data.highestapplications);
          {
            data.newdata.map((AnalysisGraphn, idx) => {
              Eligible_farmers.push(AnalysisGraphn.Eligible_farmers);
              Applications.push(AnalysisGraphn.Applications);
              Approved.push(AnalysisGraphn.Approved);
              Reject.push(AnalysisGraphn.Reject);
              Category.push(AnalysisGraphn.Category);
              console.log(AnalysisGraphn);
              console.log(Category);
              console.log(Eligible_farmers);
            });
          }
          setSeries4([
            {
              name: "Eligible farmers",
              data: Eligible_farmers,
              type: "bar",
            },
            {
              name: "Total Applications",
              data: Applications,
              type: "bar",
            },
            {
              name: "Approved",
              data: Approved,
              type: "bar",
            },
            {
              name: "Rejected",
              data: Reject,
              type: "bar",
            },
          ]);
          setObject4({
            chart: {
              type: "bar",
              height: 430,
              width: 700,
            },
            title: {
              text: "Title",
            },
            plotOptions: {
              bar: {
                horizontal: false,
                dataLabels: {
                  position: "top",
                },
              },
            },
            dataLabels: {
              enabled: true,
              offsetX: -6,
              style: {
                fontSize: "12px",
                colors: ["#fff"],
              },
            },
            stroke: {
              show: true,
              width: 1,
              colors: ["#fff"],
            },
            tooltip: {
              shared: true,
              intersect: false,
            },
            xaxis: {
              categories: Category,
            },
          });
        });
    };
    console.log("what");
    getstate();
  }, [districnewdata3, Schemeid, Taluka2, Villagename]);

  return (
    <>
      {/* <h5 className="Title_Schemes">Active Schemes</h5> */}
      <div className="Download_btn">
        <Button onClick={downloadpdf}>Download (Pdf)</Button> &nbsp;
        <Button onClick={downloadExcel}>Download (Excel)</Button>
      </div>

      <div>
        {Applieddatatable ? (
          <>
          <h5 className="Title_Schemes">Active Schemes</h5>
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
                <th>More Info</th>
                <th>Approved Applications</th>
                <th>Rejected Applications</th>
                <th>Scheme Analytics </th>
                <th>Delete</th>
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
                      <td>{scheme.Applied}</td>
                      <td>{scheme.Approved}</td>
                      <td>{scheme.Reject}</td>
                      <td>
                        {scheme.Applied - scheme.Approved - scheme.Reject}{" "}
                      </td>
                      <td onClick={() => handlemoreinfo(scheme.Schemeid)}>
                        <Button variant="info">More Info</Button>
                      </td>
                      <td onClick={() => handleApplications(scheme.Schemeid)}>
                        <Button variant="success">Applications</Button>
                      </td>
                      <td onClick={() => handleApplicationsR(scheme.Schemeid)}>
                        <Button variant="success">Applications</Button>
                      </td>
                      <td
                        onClick={() =>
                          handleApplicationsAnalysis(scheme)
                        }
                      >
                        <Button variant="success">Analysis</Button>
                      </td>
                      <td onClick={() => handledelete(scheme.Schemeid)}>
                        <Button variant="danger">delete</Button>
                      </td>
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
                              <td>
                                {Moment(morebtntry.Start).format("DD-MM-YYYY")}{" "}
                              </td>
                            </tr>
                            <tr>
                              <th>Expire Date</th>
                              <td>
                                {Moment(morebtntry.Expired).format(
                                  "DD-MM-YYYY"
                                )}{" "}
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
          </>
        ) : null}
      </div>

      {FullApplicationstable ? (
        <>
          <Button onClick={() => getschemedata()}>Back</Button>
          <Table striped bordered hover className="TableAllskims">
            <thead>
              <tr>
                <th>No.</th>
                <th>Farmer's Name</th>
                <th>Farmer's Unique Id </th>
                <th>Applied date</th>
                <th> Approved date</th>
                <th> Status</th>
              </tr>
            </thead>
            <tbody>
              {Applicationsinfo.map((Application , idx) => {
                return (
                  <>
                    <tr>
                      <td>{idx  + 1}</td>
                      <td>{Application.Name}</td>
                      <td>{Application.Farmerid}</td>
                      <td>
                        {Moment(Application.Applieddate).format("DD-MM-YYYY")}
                      </td>
                      <td>{Application.Reponcedate}</td>
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
          <Button onClick={() => getschemedata()}>Back</Button>
          <Table striped bordered hover className="TableAllskims">
            <thead>
              <tr>
                <th>No.</th>
                <th>Farmer's Name</th>
                <th>Farmer's Unique id</th>
                <th>Applied date</th>
                <th>Rejected date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Applicationsinfo.map((Application , idx) => {
                return (
                  <>
                    <tr>
                      <td>{idx  + 1}</td>
                      <td>{Application.Name}</td>
                      <td>{Application.Farmerid}</td>
                      <td>
                        {Moment(Application.Applieddate).format("DD-MM-YYYY")}
                      </td>
                      <td>{Application.Reponcedate}</td>
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
      {Analysisdatatable ? (
        <>
          <Button onClick={() => getschemedata()}>Back</Button>
          <hr />
          <h5 style={{marginTop : "5px"}}>Scheme Name :- {SchemeTitle}</h5>

          <>
            <div className="Main_admin_Schemes_Graph">
              <div className="Mainin_admin_Schemes_Graph">
          <Table striped bordered hover className="TableAllskims">
            <thead>
              <tr>
                <th>No</th>
                <th>Category</th>
                <th>Eligible Farmers</th>
                <th>Total Applications</th>
                <th>Total Approved</th>
                <th>Total Reject</th>
              </tr>
            </thead>
            <tbody>
              {Applicationsinfo.map((Application, idx) => {
                return (
                  <>
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{Application.Category}</td>
                      <td>{Application.Eligible_farmers}</td>
                      <td>{Application.Applications}</td>
                      <td>{Application.Approved}</td>
                      <td>{Application.Reject}</td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </Table>
                <div>
                <h6 style={{ fontSize: "22px" }}>
                Overall Analysis of  Scheme :<b style={{ color: "green" }}>{SchemeTitle}</b>{" "}
                  </h6>
                  <Container fluid>
                    <Row>
                      <Col xs={15} style={{ margin: "auto" }}>
                        <ReactApexChart
                          className="SchemeA_C1"
                          options={options}
                          series={series}
                          type="bar"
                          height={500}
                        />
                      </Col>
                    </Row>
                  </Container>
                </div>
                <div className="Scheme_char4div">
                 <h6>Select the below  options for the analyses of the selected schemes</h6>

                  <div className="Select_Dropdown1">
                    <select onChange={(e) => handleDistric3(e)} className="form-control">
                      <option value={"0"} selected>
                        Select District
                      </option>
                      {disn.map((Districdropnew) => {
                        return (
                          <>
                            <option value={Districdropnew}>
                              {Districdropnew}
                            </option>
                          </>
                        );
                      })}
                    </select>
                  </div>
                  <br />
                  <div className="Select_Dropdown2">
                    <select onChange={(e) => handleTaluka2(e)} className="form-control">
                      <option value={"0"} selected>
                        Select Taluka
                      </option>
                      {Talukadata2.map((Talukadropnew) => {
                        return (
                          <>
                            <option value={Talukadropnew}>
                              {Talukadropnew}
                            </option>
                          </>
                        );
                      })}
                    </select>
                  </div>
                  <br />
                  <div className="Select_Dropdown3">
                    <select onChange={(e) => handleVillagename(e)} className="form-control">
                      <option value={"0"} selected>
                        Select Village
                      </option>
                      {Villagedata.map((Villagedropnew) => {
                        return (
                          <>
                            <option value={Villagedropnew}>
                              {Villagedropnew}
                            </option>
                          </>
                        );
                      })}
                    </select>
                  </div>
                  <h6 style={{ fontSize: "22px" }}>
                  Category wise highest schemes in  the {Villagename} for {Taluka2} of {districnewdata3}.
                  </h6>
                  
                  
                  <Table striped bordered hover className="TableAllskims">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Category</th>
                        {Taluka2 === "0" && Villagename === "0" ? (
                                <th>District</th>
                              ) : Villagename === "0" ? (
                                <th>Taluka</th>
                              ) : (
                                <th>Village</th>
                              )}
                        <th>Total Applications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highApptableVillage.map((Application, idx) => {
                        return (
                          <>
                            <tr>
                              <td>{idx + 1}</td>
                              <td>{Application.Category}</td>
                              {Taluka2 === "0" && Villagename === "0" ? (
                                <td>{Application.District}</td>
                              ) : Villagename === "0" ? (
                                <td>{Application.Taluka}</td>
                              ) : (
                                <td>{Application.Village}</td>
                              )}
                              <td>{Application.Applications}</td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </Table>

                  <h6 style={{ fontSize: "22px" }}>
                  Category wise highest schemes in  sleleceted location of gujarat
                  </h6>

                  <Container fluid>
                    <Row>
                      <Col xs={15} style={{ margin: "auto" }}>
                        <ReactApexChart
                          className="SchemeA_C4"
                          options={options4}
                          series={series4}
                          type="bar"
                          height={500}
                        />
                      </Col>
                    </Row>
                  </Container>
                </div>
              </div>
            </div>
          </>
        </>
      ) : null}
    </>
  );
}
