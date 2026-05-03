import React, { Component, useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Col, Container, Row } from "react-bootstrap";
import Chart from "react-apexcharts";


function Soilanalysis() {

    const [Districtname, setDistrictname] =useState("Kachchh")

    const [Object, setObject ] = useState({
      chart: {
        type : "pie" ,
        id: 'apexchart-example',
  }})
    const [Series , setSeries ] = useState([ 10 , 20 , 30 ])

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

      <Container fluid>
        <Row>
          <Col xs={15} style={{ margin: "auto" }}>
          <Chart options={Object} 
      series={Series}   type="pie" width={800} height={500} />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Soilanalysis