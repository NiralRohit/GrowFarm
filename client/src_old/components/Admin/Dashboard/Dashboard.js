import { positions } from "@mui/system";
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import ReactFusioncharts from "react-fusioncharts";
import "./Dashboard.css";

function Dashboard() {
  const [mapdatanew, setmapdatanew] = useState([]);
  const [Category, setCategory] = useState("");
  const [Taluka2, setTaluka2] = useState("0");
  const [Villagename, setVillagename] = useState("0");
  const [districnewdata3, setdistricnewdata3] = useState("Kheda");
  const [disn, setdisn] = useState([]);
  const [Talukadata2, setTalukadata2] = useState([]);
  const [Villagedata, setVillagedata] = useState([]);

  const [Object, setObject] = useState({
    chart: {
      type: "pie",
      id: "apexchart-example",
    },
  });
  const [Series, setSeries] = useState([10, 20, 30]);
  const [Object2, setObject2] = useState({
    chart: {
      type: "pie",
      id: "apexchart-example",
    },
  });
  const [Series2, setSeries2] = useState([10, 20, 30]);

  useEffect(() => {
    getdata();
  }, []);

  useEffect(() => {
    const TotaldatapieGraph2 = [];
    const getstate = async () => {
      await fetch(
        `http://localhost:8000/admin/analysis/${districnewdata3}/${Taluka2}/${Villagename}`,
        {
          method: "GET",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.warn(data.data);

          console.log(data.data[0]);

          // TotaldatapieGraph.push(data.registeredfarmers)
          TotaldatapieGraph2.push(data.data[0].SC);
          TotaldatapieGraph2.push(data.data[0].EWS);
          TotaldatapieGraph2.push(data.data[0].ST);
          TotaldatapieGraph2.push(data.data[0].OBC);
          TotaldatapieGraph2.push(data.data[0].GENERAL);

          console.log(TotaldatapieGraph2);

          setObject2({
            chart: {
              id: "apexchart-example",
            },
            xaxis: {
              categories: [0, 20, 30, 40, 50],
            },
            labels: ["SC", "ST", "OBC", "EWS", "GENERAL"],
          });
          setSeries2(TotaldatapieGraph2);
        });
    };
    console.log("what");
    getstate();
  }, [districnewdata3, Taluka2, Villagename]);

  function getdata() {
    const TotaldatapieGraph = [];

    fetch(`http://localhost:8000/admin/registeredfarmerdetails`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        console.log(data.registeredfarmers);

        // TotaldatapieGraph.push(data.registeredfarmers)
        TotaldatapieGraph.push(data.SCfarmers);
        TotaldatapieGraph.push(data.STfarmers);
        TotaldatapieGraph.push(data.OBCfarmers);
        TotaldatapieGraph.push(data.EWSfarmers);
        TotaldatapieGraph.push(data.GENERALfarmers);

        console.log(TotaldatapieGraph);

        setObject({
          chart: {
            id: "apexchart-example",
          },
          xaxis: {
            categories: [0, 20, 30, 40, 50],
          },
          labels: ["SC", "ST", "OBC", "EWS", "GENERAL"],
        });
        setSeries(TotaldatapieGraph);
      });
  }
  function getdata2() {}

  useEffect(() => {
    const getstate = async () => {
      await fetch(`http://localhost:8000/admin/mapdata/${Category}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          console.warn(data, "newapi");
          setmapdatanew(data);
        });
    };
    console.log("what");
    getstate();
  }, [Category]);

  // function getmapData (){
  // console.log(Category)

  //     fetch(`http://localhost:8000/admin/mapdata/${Category}` , {
  //         method  : "GET"
  //     })
  //     .then((response) => response.json())
  //     .then((data) => {
  // console.log(data)
  // setmapdatanew(data)
  //     })
  // }

  function handleselectCategory(e) {
    setCategory(e.target.value);
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

  const dataSource = {
    chart: {
      caption: "Category wise  data of registered farmer in the respected area",
      // subcaption: "Click on a continent to see trend from 1955-2015",
      numbersuffix: "",
      includevalueinlabels: "1",
      labelsepchar: ": ",
      entityfillhovercolor: "#FFF9C4",
      theme: "fusion",
    },
    colorrange: {
      minvalue: "0",
      code: "#FFE0B2",
      gradient: "1",
      color: [
        {
          minvalue: "0.5",
          maxvalue: "1.0",
          color: "#FFD74D",
        },
        {
          minvalue: "1.0",
          maxvalue: "2.0",
          color: "#FB8C00",
        },
        {
          minvalue: "2.0",
          maxvalue: "3.0",
          color: "#E65100",
        },
      ],
    },
    data: mapdatanew,
  };

  return (
    <>
      <div className="Alldatapie">
        <div className="graph1">
          <h5>
            Graph illustrating the distribution of farmers in each category in
          </h5>
          {/* <div style={{marginTop : "100px"}}>Dashboard</div> */}

          <Chart
            options={Object}
            series={Series}
            type="pie"
            width={800}
            height={500}
          />
          </div>
          <div className="graph2">
          <div style={{ marginTop: "200px" }}>
            <Chart
              options={Object2}
              series={Series2}
              type="pie"
              width={800}
              height={500}
            />
          </div>
          </div>
        
      </div>

      <div style={{ marginTop: "40px" }}>
        <h6 style={{ marginTop: "80px" }}>Select your option :</h6>
        <select onChange={(e) => handleselectCategory(e)}>
          <option value={"SC"}>SC</option>
          <option value={"ST"}>ST</option>
          <option value={"OBC"}>OBC</option>
          <option value={"EWS"}>EWS</option>
          <option value={"GENERAL"}>GENERAL</option>
        </select>
        <ReactFusioncharts
          type="maps/gujarat"
          width="500"
          height="500"
          dataFormat="JSON"
          dataSource={dataSource}
        />
      </div>

      <br />
      <div>
        <br />
        <p style={{ position: "absolute", marginLeft: "20px" }}>
          Select the below options for the analyses of the selected schemes
        </p>
        <br />
        <br /> <br />
        <div className="Select_Dropdown1">
          <select onChange={(e) => handleDistric3(e)} className="form-control">
            <option value={"0"} selected>
              Select District
            </option>
            {disn.map((Districdropnew) => {
              return (
                <>
                  <option value={Districdropnew}>{Districdropnew}</option>
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
                  <option value={Talukadropnew}>{Talukadropnew}</option>
                </>
              );
            })}
          </select>
        </div>
        <br />
        <div className="Select_Dropdown3">
          <select
            onChange={(e) => handleVillagename(e)}
            className="form-control"
          >
            <option value={"0"} selected>
              Select Village
            </option>
            {Villagedata.map((Villagedropnew) => {
              return (
                <>
                  <option value={Villagedropnew}>{Villagedropnew}</option>
                </>
              );
            })}
          </select>
        </div>
        <h5 style={{ position: "absolute", marginLeft: "20px" }}>
          Category wise Registered Farmer in the {Villagename} for {Taluka2} of{" "}
          {districnewdata3}.
        </h5>
      </div>
    </>
  );
}

export default Dashboard;
