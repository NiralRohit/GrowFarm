import React from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Approved from "./Approved";
import Applied from "./Applied";
import Schemes from "./schemes";
import Rejected from "./Rejected";
import "./SchemesMain.css";

function SchemesMain() {
  return (
    <>
      <div className="Main_Farmer_Schemes">
        <div className="Mainin_Farmer_Schemes">
          <div className="Farmer_Tabs">
            <Tabs
              defaultActiveKey="profile"
              id="uncontrolled-tab-example"
              className="mb-3"
            >
              <Tab eventKey="profile" title="Beneficiary Schemes">
                <Schemes />
              </Tab>
              <Tab eventKey="home" title="Applied Schemes">
                <Applied />
              </Tab>
              <Tab eventKey="contact" title="Approved Schemes">
                <Approved />
              </Tab>
              <Tab eventKey="info" title="Rejected Schemes">
                <Rejected/>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}

export default SchemesMain;
