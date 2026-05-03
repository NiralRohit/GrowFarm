import moment from "moment";
import React, { Component, useState, useEffect } from "react";
import { Button, Modal, Tab, Table, Tabs } from "react-bootstrap";

function Apmc() {
  const [Apmcdata, setApmcdata] = useState([]);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [otherdata, setotherdata] = useState([]);
  const [Apmcbilldata, setApmcbilldata] = useState([]);
  const [Apmcbilldata2, setApmcbilldata2] = useState([]);

  useEffect(() => {
    getapmcdata();
  }, []);

  function getapmcdata() {
    fetch(`http://localhost:8000/APMC/getall_traders`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setApmcdata(data);
      });
  }
  function handleotherdetails(GST_No) {

    fetch(`http://localhost:8000/trader/get_trader_details/${GST_No}`)
    .then((response) => response.json())
    .then((data) => {
      console.warn(GST_No);
    setotherdata(data)
    setShow(true)
    });
    
  }

  function seller(GST_No){
    console.log("seller")
    fetch(`http://localhost:8000/trader/listofbill_trader/Seller/${GST_No}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      setApmcbilldata(data)
      setShow(true)
    });
  }
  function Buyer(GST_No){
    console.log("Buyer")
    fetch(`http://localhost:8000/trader/listofbill_trader/Buyer/${GST_No}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      setApmcbilldata2(data)
      setShow2(true)
    });
  }

  return (
    <>
      <div style={{ marginTop: "100px" }}>
        <div className="Main_admin_Schemes">
          <div className="Mainin_admin_Schemes">
            <div className="test">
              <Tabs
                defaultActiveKey="profile"
                id="uncontrolled-tab-example"
                className="mb-3"
              >
                <Tab eventKey="profile" title="APMC Bill History">
                  <br />
                  <Table striped bordered hover className="TableAllskims">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Trade name</th>
                        <th>Administrative Office</th>
                        <th>GST No.</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>District</th>
                        <th>Taluka</th>
                        <th>Seller Bill</th>
                        <th>Buyer Bill</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Apmcdata.map((newdata, idx) => {
                        return (
                          <>
                            <tr>
                              <td>{idx + 1}</td>
                              <td>{newdata.Trade_Name}</td>
                              <td>{newdata.Administrative_Office}</td>
                              <td>{newdata.GST_No}</td>
                              <td>{newdata.Name}</td>
                              <td>{newdata.Mobile}</td>
                                    <td>{newdata.Email}</td>
                                    <td>{newdata.District}</td>
                                    <td>{newdata.Taluka}</td>
                                    <td><Button onClick={() => seller(newdata.GST_No)}>Bill</Button></td>
                                    <td><Button onClick={() => Buyer(newdata.GST_No)}>Bill</Button></td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </Table>


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
                            Bill Information
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Table striped bordered hover className="TableAllskims">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Party</th>
                        <th>Crop</th>
                        <th>GST No.</th>
                        <th>Date</th>
                        <th>Bags</th>
                        <th>Amount</th>
                        <th>Other Charges</th>
                        <th>Bill Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Apmcbilldata.map((newdata, idx) => {
                        return (
                          <>
                            <tr>
                              <td>{idx + 1}</td>
                              <td>{newdata.Party}</td>
                              <td>{newdata.Crop}</td>
                              <td>{newdata.GST_No}</td>
                              <td>{moment(newdata.Bill_date).format("DD-MM-YYYY")}</td>
                              <td>{newdata.Bags}</td>
                              <td>{newdata.Amount}</td>
                                    <td>{newdata.Bill_Amount -newdata.Amount }</td>
                                    <td>{newdata.Bill_Amount}</td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </Table>
                        </Modal.Body>
                      </Modal>
                    ) : null}
                  {show2 ? (
                      <Modal
                        show={show2}
                        backdrop="static"
                        keyboard={true}
                        size="xl"
                        onHide={() => setShow2(false)}
                        dialogClassName="modal-90w"
                        aria-labelledby="example-custom-modal-styling-title"
                      >
                        <Modal.Header closeButton>
                          <Modal.Title id="example-custom-modal-styling-title">
                            Scheme Information 2
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Table striped bordered hover className="TableAllskims">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Party</th>
                        <th>Crop</th>
                        <th>GST No.</th>
                        <th>Date</th>
                        <th>Bags</th>
                        <th>Amount</th>
                        <th>Other Charges</th>
                        <th>Bill Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Apmcbilldata2.map((newdata, idx) => {
                        return (
                          <>
                            <tr>
                              <td>{idx + 1}</td>
                              <td>{newdata.Party}</td>
                              <td>{newdata.Crop}</td>
                              <td>{newdata.GST_No}</td>
                              <td>{moment(newdata.Bill_date).format("DD-MM-YYYY")}</td>
                              <td>{newdata.Bags}</td>
                              <td>{newdata.Amount}</td>
                                    <td>{newdata.Bill_Amount -newdata.Amount }</td>
                                    <td>{newdata.Bill_Amount}</td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </Table>
                        </Modal.Body>
                      </Modal>
                    ) : null}
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Apmc;
