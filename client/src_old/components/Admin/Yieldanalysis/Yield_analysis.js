import React, { Component, useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Col, Container, Row, Table } from "react-bootstrap";
import "./Yield_analysis.css"

function Yield_analysis() {
  const [series2, setSeries2] = useState([
    {
      name: "Intake",
      data: [10, 20, 30],
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
      categories: ["lol", "lol2"],
    },
  });

  const [Cropname, setCropname] = useState("Rice")
  const [Districtname, setDistrictname] = useState("Ahmedabad")
  const [Maindata, setMaindata] = useState([])
  const [highest_area, sethighest_area] = useState([])
  const [highest_prod, sethighest_prod] = useState([])
  const [highest_yield, sethighest_yield] = useState([])

  useEffect(() => {
    const Area = [];
    const Prod = [];
    const Yield = [];
    const Year = [];
    const getstate = async () => {
      await fetch(`http://localhost:8000/area/apy/${Districtname}/${Cropname}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          console.warn(data.data, "newapi");
          sethighest_area(data.highest_area || [])
          sethighest_prod(data.highest_prod || [])
          sethighest_yield(data.highest_yield || [])
          setMaindata(data.data || [])
          {
            data.data.map((newdata, idx) => {
              Area.push(newdata.Area);
              Prod.push(newdata.Prod);
              Yield.push(newdata.Yield);
              Year.push(newdata.Year);
            });
          }
          console.log(Area);
          setSeries2([
            {
              name: "Area",
              data: Area,
              type: "line",
            },
            {
              name: "Production",
              data: Prod,
              type: "line",
            },
            {
              name: "Yield",
              data: Yield,
              type: "line",
            },
          ]);
          setObject2({
            fill: {
              colors: ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800'],
              type: "gradient",
            },
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
              enabled: false,
              offsetX: -6,
              style: {
                fontSize: "12px",
                colors: ["#fff"],
              },
            },
            stroke: {
              show: true,
              width: 2,
              colors: ["#00BFFF"],
            },
            tooltip: {
              shared: true,
              intersect: false,
            },
            xaxis: {
              categories: Year,

            },
          });
        });
    };
    console.log("what");
    getstate();
  }, [Cropname, Districtname]);

  //   function handlechange(e) {

  //   }

  return (
    <>
      <div className="auth-wrapper_Yield">
        <div className="auth-inner_Yeild">
          <h3>District and Crop wise Area, Production and Yield analysis</h3>
          <select onChange={(e) => setDistrictname(e.target.value)}>
            <option value={"Select Value"}>Select District </option>
            <option value={"Kachchh"}>Kachchh</option>
            <option value={"Banaskantha"}>Banaskantha</option>
            <option value={"Patan"}>Patan</option>
            <option value={"Mahesana"}>Mahesana</option>
            <option value={"Sabarkantha"}>Sabarkantha</option>
            <option value={"Arvalli"}>Arvalli</option>
            <option value={"Gandhinagar"}>Gandhinagar</option>
            <option value={"Ahmedabad"}>Ahmedabad</option>
            <option value={"Surendranagar"}>Surendranagar</option>
            <option value={"Morbi"}>Morbi</option>
            <option value={"Rajkot"}>Rajkot</option>
            <option value={"Jamnagar"}>Jamnagar</option>
            <option value={"Devbhumi Dwarka"}>Devbhumi Dwarka</option>
            <option value={"Porbandar"}>Porbandar</option>
            <option value={"Junagadh"}>Junagadh</option>
            <option value={"Gir Somnath"}>Gir Somnath</option>
            <option value={"Amreli"}>Amreli</option>
            <option value={"Bhavnagar"}>Bhavnagar</option>
            <option value={"Botad"}>Botad</option>
            <option value={"Anand"}>Anand</option>
            <option value={"Kheda"}>Kheda</option>
            <option value={"Panchmahal"}>Panchmahal</option>
            <option value={"Mahisagar"}>Mahisagar</option>
            <option value={"Dahod"}>Dahod</option>
            <option value={"Vadodara"}>Vadodara</option>
            <option value={"Chhota Udepur"}>Chhota Udepur</option>
            <option value={"Narmada"}>Narmada</option>
            <option value={"Bharuch"}>Bharuch</option>
            <option value={"Surat"}>Surat</option>
            <option value={"Dang"}>Dang</option>
            <option value={"Navsari"}>Navsari</option>
            <option value={"Valsad"}>Valsad</option>
            <option value={"Tapi"}>Tapi</option>
          </select>
          <select onChange={(e) => setCropname(e.target.value)}>
            <option value={"Select Value"}>Select Crop</option>
            <option value={"Rice"}>Rice</option>
            <option value={"Wheat"}>Wheat</option>
            <option value={"Bajra"}>Bajra</option>
            <option value={"Moong(Green Gram)"}>Mung (Green Gram)</option>
            <option value={"Sugarcane"}>Sugarcane</option>
            <option value={"Potato"}>Potato</option>
            <option value={"Tobacco"}>Tobacco</option>
            <option value={"Castor seed"}>Castor</option>
            <option value={"Soyabean"}>Soyabean</option>
            <option value={"Cotton(lint)"}>Cotton</option>
            <option value={"Banana"}>Banana</option>
            <option value={"Groundnut"}>Groundnut</option>
            <option value={"Maize"}>Maize</option>
            <option value={"Jowar"}>Jowar</option>
            <option value={"Gram"}>Gram</option>
            <option value={"Onion"}>Onion</option>
            <option value={"Arhar/Tur"}>Arhar/Tur</option>
          </select>
          <h1>{Cropname} {Districtname}</h1>


          <div className="Yeild_First_Table">
            <Table striped bordered hover style={{ height: "420px", borderRadius: "0.1rem" }} >
              <thead>
                <tr>
                  <th>No</th>
                  <th>Crop</th>
                  <th>Year</th>
                  <th>District</th>
                  <th>Area</th>
                  <th>Production</th>
                  <th>Yield</th>
                </tr>
              </thead>
              <tbody>
                {Maindata.map((Application, idx) => {
                  return (
                    <>
                      <tr>
                        <td>{idx + 1}</td>
                        <td>{Application.Crop}</td>
                        <td>{Application.Year}</td>
                        <td>{Application.District}</td>
                        <td>{Application.Area}</td>
                        <td>{Application.Prod}</td>
                        <td>{Application.Yield}</td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <br />

          <Container fluid>
            <Row>
              <Col xs={15} style={{ margin: "auto" }}>
                <ReactApexChart
                  className="Yeild_C1"
                  options={options2}
                  series={series2}
                  type="line"
                  height={400}
                  width={700}
                />
              </Col>
            </Row>
          </Container>
          <br /><br />
          <h3 style={{ position: "absolute" }}>Year wise District with highest Area for {Cropname} </h3>
          <Table striped bordered hover className="TableAllYield" >
            <thead>
              <tr>
                <th>No</th>
                <th>Crop</th>
                <th>Year</th>
                <th>District</th>
                <th>Area</th>
              </tr>
            </thead>
            <tbody>
              {highest_area.map((Application, idx) => {
                return (
                  <>
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{Application.Crop}</td>
                      <td>{Application.Year}</td>
                      <td>{Application.District}</td>
                      <td>{Application.Area}</td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </Table>
          <br />
          <h3 style={{ position: "absolute" }}>Year wise District with highest Production for {Cropname} </h3>
          <Table striped bordered hover className="TableAllskims">
            <thead>
              <tr>
                <th>No</th>
                <th>Crop</th>
                <th>Year</th>
                <th>District</th>
                <th>Production</th>
              </tr>
            </thead>
            <tbody>
              {highest_prod.map((Application, idx) => {
                return (
                  <>
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{Application.Crop}</td>
                      <td>{Application.Year}</td>
                      <td>{Application.District}</td>
                      <td>{Application.Prod}</td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </Table>
          <br />
          <h3 style={{ position: "absolute" }}>Year wise District with highest Yeild for {Cropname} </h3>
          <Table striped bordered hover className="TableAllskims">
            <thead>
              <tr>
                <th>No</th>
                <th>Crop</th>
                <th>Year</th>
                <th>District</th>
                <th>Yield</th>
              </tr>
            </thead>
            <tbody>
              {highest_yield.map((Application, idx) => {
                return (
                  <>
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{Application.Crop}</td>
                      <td>{Application.Year}</td>
                      <td>{Application.District}</td>
                      <td>{Application.Yield}</td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </Table>

        </div>
      </div>


    </>
  );
}

export default Yield_analysis;
