import React, { Component, useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Col, Container, Row } from "react-bootstrap";
import Chart from "react-apexcharts";

function Irrigationanalysis() {

    const [Districtname, setDistrictname] =useState("Kachchh")

    const [Gross_Cropped_Area, setGross_Cropped_Area] =useState([])
    const [Other_Sources, setOther_Sources] =useState([])
    const [Other_Wells, setOther_Wells] =useState([])
    const [Tank, setTank] =useState([])
    const [Total, setTotal] =useState([])
    const [Tubewells, setTubewells] =useState([])
    const [Year, setYear] =useState([])

    const [Object, setObject ] = useState({
      chart: {
        type : "pie" ,
        id: 'apexchart-example',
  }})
    const [Series , setSeries ] = useState([ 10 , 20 , 30 ])

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
    const [series3, setSeries3] = useState([
        {
          name: "Intake",
          data: [10, 20, 30],
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
          categories: ["lol", "lol2"],
        },
      });

    useEffect(() => {
        const Gross_Cropped_Area = [];
        const  Prod = [];
        const Other_Sources = [];
        const Other_Wells = [];
        const Yield = [];
        const Tank = [];
        const Total = [];
        const Tubewells = [];
        const Year = [];
        const getstate = async () => {
          await fetch(`http://localhost:8000/area/cultivatedarea/${Districtname}`, {
            method: "GET",
          })
            .then((response) => response.json())
            .then((data) => {
              console.warn(data, "newapi");
              setGross_Cropped_Area(data.Total_Geographical_Area)
              setOther_Sources(data.Total_Reporting_Area)
              setOther_Wells(data.Total_Forest)
              setTank(data.Gross_Cropped_Area)
              setTotal(data.Total_Non_Cultivated_Area)
              setYear(data.Year)

              {
                data.map((newdata, idx) => {
                    Gross_Cropped_Area.push(newdata.Total_Geographical_Area);
                    // Other_Sources.push(newdata.Total_Reporting_Area);
                    Other_Wells.push(newdata.Total_Forest);
                    Tank.push(newdata.Gross_Cropped_Area);
                    Prod.push(newdata.Total_Non_Cultivated_Area);
                    Year.push(newdata.Year)
                });
              }

console.warn(Year)
            //   console.log(Area);
              setSeries3([
                {
                  name: "Total_Geographical_Area",
                  data:  Gross_Cropped_Area,
                  type: "bar",
                },
                {
                  name: "Total_Forest",
                  data: Other_Wells,
                  type: "bar",
                },
                {
                  name: "Gross_Cropped_Area",
                  data: Tank,
                  type: "bar",
                },
                {
                  name: "Total_Non_Cultivated_Area",
                  data: Prod,
                  type: "bar",
                },
              ]);
              setObject3({
                chart: {
                  type: "bar",
                  height: 430,
                  width: 900,
                },
                title: {
                  text: "Title",
                },
                plotOptions: {
                  bar: {
                    // horizontal: false,
                    dataLabels: {
                      position: "top",
                    },
                  },
                },
                dataLabels: {
                  enabled: false,
                  offsetX: 3,
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
                  // intersect: false,
                },
                xaxis: {
                  categories: Year,
                  
                },
              });
            });
        };
        console.log("what");
        getstate();
      }, [ Districtname]);
    useEffect(() => {
        const Gross_Cropped_Area = [];
        const  Prod = [];
        const Other_Sources = [];
        const Other_Wells = [];
        const Yield = [];
        const Tank = [];
        const Total = [];
        const Tubewells = [];
        const Year = [];
        const getstate = async () => {
          await fetch(`http://localhost:8000/area/irigation/${Districtname}`, {
            method: "GET",
          })
            .then((response) => response.json())
            .then((data) => {
              console.warn(data, "newapi");
              setGross_Cropped_Area(data.Gross_Cropped_Area)
              setOther_Sources(data.Other_Sources)
              setOther_Wells(data.Other_Wells)
              setTank(data.Tank)
              setTotal(data.Total)
              setTubewells(data.Tubewells)
              setYear(data.Year)

              {
                data.map((newdata, idx) => {
                    Gross_Cropped_Area.push(newdata.Gross_Cropped_Area);
                    Other_Sources.push(newdata.Other_Sources);
                    Other_Wells.push(newdata.Other_Wells);
                    Tank.push(newdata.Tank);
                    Prod.push(newdata.Prod);
                    Yield.push(newdata.Yield);
                    Total.push(newdata.Total);
                    Tubewells.push(newdata.Tubewells);
                    Year.push(newdata.Year)
                });
              }

console.warn(Year)
            //   console.log(Area);
              setSeries2([
                {
                  name: "Gross_Cropped_Area",
                  data:  Gross_Cropped_Area,
                  type: "bar",
                },
                {
                  name: "Total",
                  data: Total,
                  type: "bar",
                },
                {
                  name: "Tubewells",
                  data: Tubewells,
                  type: "bar",
                },
                {
                  name: "Tank",
                  data: Tank,
                  type: "bar",
                },
                {
                  name: "Other_Wells",
                  data: Other_Wells,
                  type: "bar",
                },
                {
                  name: "Other_Sources",
                  data: Other_Sources,
                  type: "bar",
                },  
              ]);
              setObject2({
                chart: {
                  type: "bar",
                  height: 430,
                  width: 900,
                },
                title: {
                  text: "Title",
                },
                plotOptions: {
                  bar: {
                    // horizontal: false,
                    dataLabels: {
                      position: "top",
                    },
                  },
                },
                dataLabels: {
                  enabled: false,
                  offsetX: 3,
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
                  // intersect: false,
                },
                xaxis: {
                  categories: Year,
                  
                },
              });
            });
        };
        console.log("what");
        getstate();
      }, [ Districtname]);

      useEffect(() => {
        const TotaldatapieGraph = [] ;
        const Soil = [] ;
          const getstate = async () => {
            await 
            
            fetch(`http://localhost:8000/area/district_soil/${Districtname}` , {
          method  : "GET"
      })
      .then((response) => response.json())
      .then((data) => {
  console.log(data.Types_of_soil)
  {
    data.Types_of_soil.map((newdata, idx) => {
      console.log(newdata.Area)
      TotaldatapieGraph.push(newdata.Area)
      Soil.push(newdata.Soil)
    });
  }
  
  
  setObject({
      chart: {
        id: 'apexchart-example'
      },
      xaxis: {
        categories: [0 , 20 , 30 , 40 , 50]
      },
      labels :  Soil,
    })
    setSeries(TotaldatapieGraph)
      });
          };
          console.log("what");
          getstate();
        }, [Districtname]);


  return (
    <>
    <div style={{marginTop : "100px"}}>Irrigationanalysis</div>
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

      <Container fluid className="Ichart1" style={{float : "left"}}>
        <Row>
          <Col xs={15} style={{ margin: "auto" }}>
            <ReactApexChart
              className="Yeild_C1"
              options={options2}
              series={series2}
              type="bar"
              height={400}
              width={700}
            />
          </Col>
        </Row>
      </Container>

      <Container fluid className="Ichart1" style={{float : "left"}}>
        <Row>
          <Col xs={15} style={{ margin: "auto" }}>
            <ReactApexChart
              className="Yeild_C2"
              options={options3}
              series={series3}
              type="bar"
              height={400}
              width={700}
            />
          </Col>
        </Row>
      </Container>

      <Container fluid style={{position : "absolute" , marginLeft : "45rem" , overflowX : "hidden"}}>
        <Row>
          <Col xs={15} style={{ margin: "auto" }}>
          <Chart options={Object} 
      series={Series}   type="pie" width={500} height={400} />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Irrigationanalysis