import React from 'react'
import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import "./findfarmer.css"

function Findfarmer() {

  const [Mobilenumfield, setMobilenumfield] = useState(false);
  const [Mobilenumfieldinput, setMobilenumfieldinput] = useState(true);
  const [Uniqeidfield, setUniqeidfield] = useState(false);
  const [Uniqeidfieldinput, setUniqeidfieldinput] = useState(false);
  const [selectAdharnumfield, setselectAdharnumfield] = useState(false);
  const [Adharnumfieldinput, setAdharnumfieldinput] = useState(false);
  const [Farmerdata, setFarmerdata] = useState([]);
  const [Farmerdataonselect, setFarmerdataonselect] = useState([]);
  const [Farmerdataonselecttable, setFarmerdataonselecttable] = useState(false);
  const [morebtntry, setmorebtntry] = useState();
  const [show, setShow] = useState(false);
  const [Farmertabledata, setFarmertabledata] = useState(true);
  const [Farmerfinderror, setFarmerfinderror] = useState(false);


  const selectMobilenum = (event) => {
    setMobilenumfieldinput(true)
    setUniqeidfieldinput(false)
    setAdharnumfieldinput(false)
  }
  const selectUniqeid = (e) => {
    setMobilenumfieldinput(false)
    setUniqeidfieldinput(true)
    setAdharnumfieldinput(false)
  }
  const selectAdharnum = (e) => {
    setMobilenumfieldinput(false)
    setUniqeidfieldinput(false)
    setAdharnumfieldinput(true)
  }

  useEffect(() => {
    getFarmerdata()
  }, [])

  function getFarmerdata() {
    // setFarmerdataonselecttable(false)
    fetch(`http://localhost:8000/admin/findallfarmers`)
      .then((response) => response.json())
      .then((data) => {
        const Farmer = data;
        setFarmerdata(Farmer);
      });
  }

  function handleSubmit1(e) {
    setFarmertabledata(false)

    console.log("hit")
    console.log(Mobilenumfield)
    e.preventDefault();
    fetch(`http://localhost:8000/admin/findfarmerbymobilenum/${Mobilenumfield}`, {
      method: "GET"
    })
      .then((response) => response.json())

      .then((data) => {
        console.warn(data)
        const Farmerdataonselect = data;
        setFarmerdataonselect(Farmerdataonselect);
        getFarmerdata()
        if (data._id) {
          setFarmerdataonselecttable(true)
        } else {
          setFarmerdataonselecttable(false)
          setFarmerfinderror(true)
        }

      });
  }
  function handleSubmit2(e) {
    setFarmertabledata(false)
    console.log("hit")
    console.log(Uniqeidfield)
    e.preventDefault();
    fetch(`http://localhost:8000/admin/findfarmerbyid/${Uniqeidfield}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data)
        const Farmerdataonselect = data;
        setFarmerdataonselect(Farmerdataonselect);
        getFarmerdata()
        if (data._id) {
          setFarmerdataonselecttable(true)
        } else {
          setFarmerdataonselecttable(false)
          setFarmerfinderror(true)
        }
      });
  }
  function handleSubmit3(e) {
    setFarmertabledata(false)
    console.log("hit")
    console.log(selectAdharnumfield)
    e.preventDefault();
    fetch(`http://localhost:8000/admin/findfarmerbyadharnum/${selectAdharnumfield}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data)
        const Farmerdataonselect = data;
        setFarmerdataonselect(Farmerdataonselect);
        getFarmerdata()
        if (data._id) {
          setFarmerdataonselecttable(true)
        } else {
          setFarmerdataonselecttable(false)
          setFarmerfinderror(true)
        }
      });
  }

  function handlemoreinfo(Id) {
    fetch(`http://localhost:8000/admin/findfarmerbyid/${Id}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((data) => {
        console.warn(data)
        getFarmerdata()
        setmorebtntry(data)
        setShow(true)
        console.log(Id)
      });
  }

  return (
    <>
      {/* <div style={{marginTop : "100px"}}>findfarmer</div> */}
      <div className="auth-wrapper_findf">
        <div className="auth-inner_findf">
          <form id="findfform">
            <h2 id="findfh2">Find Farmer</h2>
            <div className="radio_div">
              <label>
                <input className="radiobut_div"
                  type="radio"
                  name="subject"
                  onChange={(e) => selectMobilenum(e)}

                />Mobile Number
              </label>
              <label>
                <input className="radiobut_div"
                  type="radio"
                  name="subject"
                  onChange={(e) => selectUniqeid(e)}
                />Unique Id
              </label>
              <label>
                <input className="radiobut_div"
                  type="radio"
                  name="subject"
                  onChange={(e) => selectAdharnum(e)}
                />Adharcard Number
              </label>

            </div>

            {Mobilenumfieldinput ?
              <div className="mb-3">
                <label>Mobile Number</label>
                <input
                  // type="email"
                  className="form-control"
                  id="findfdata"
                  placeholder="Enter Your Mobilenumber"
                  onChange={(e) => setMobilenumfield(e.target.value)}
                />
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" id="findf_btn" onClick={handleSubmit1}>
                    Find Farmer
                  </button>
                </div>
              </div> : null
            }
            {Uniqeidfieldinput ?
              <div className="mb-3">
                <label>Uniqe Id</label>
                <input
                  // type="email"
                  className="form-control"
                  id="findfdata"

                  placeholder="Enter your Unique Id"
                  onChange={(e) => setUniqeidfield(e.target.value)}
                />
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" id="findf_btn" onClick={handleSubmit2}>
                    Find Farmer
                  </button>
                </div>
              </div> : null
            }
            {Adharnumfieldinput ?
              <div className="mb-3">
                <label>Adharcard Number</label>
                <input
                  // type="email"
                  className="form-control"
                  id="findfdata"
                  placeholder="Enter Your Adharcard Number"
                  onChange={(e) => setselectAdharnumfield(e.target.value)}
                />
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" id="findf_btn" onClick={handleSubmit3}>
                    Find Farmer
                  </button>
                </div>
              </div> : null
            }

          </form>


        </div>
      </div>
      <div className='tablebox'>
        <div>
          {Farmertabledata ?
            <Table striped bordered hover className='TableAllskims'>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Name</th>
                  <th>Unique ID</th>
                  <th>Farmers Mobile Number</th>
                </tr>
              </thead>
              <tbody >
                {Farmerdata.map((Farmer, idx) => {
                  return (
                    <>
                      <tr>
                        <td>{idx + 1}</td>
                        <td>{Farmer.Name}</td>
                        <td>{Farmer.Farmerid}</td>
                        <td>{Farmer.Mobilenum}</td>
                      </tr>

                      {show ?
                        <Modal
                          show={show}
                          onHide={() => setShow(false)}
                          dialogClassName="modal-90w"
                          aria-labelledby="example-custom-modal-styling-title"
                        >
                          <Modal.Header closeButton>
                            <Modal.Title id="example-custom-modal-styling-title">
                              Custom Modal Styling
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <p> {morebtntry.Name} </p>
                            <p> {morebtntry._id} </p>
                          </Modal.Body>
                        </Modal> : null
                      }
                    </>
                  )
                }
                )}

              </tbody>
            </Table>
            : null}

          {Farmerdataonselecttable ?
            <Table striped bordered hover className='TableAllskims'>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>More Info</th>
                </tr>
              </thead>
              <tbody>


                <>
                  <tr>
                    <td>1</td>
                    <td>{Farmerdataonselect.Id}</td>
                    <td>{Farmerdataonselect.Name}</td>
                    <td>{Farmerdataonselect.Mobilenum}</td>
                    <td onClick={() => handlemoreinfo(Farmerdataonselect.Id)} ><button>More Info</button></td>
                  </tr>

                  {show ?
                    <Modal
                      show={show}
                      onHide={() => setShow(false)}
                      dialogClassName="modal-90w"
                      aria-labelledby="example-custom-modal-styling-title"
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                          Custom Modal Styling
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <p> {morebtntry.Name} </p>
                        <p> {morebtntry._id} </p>
                      </Modal.Body>
                    </Modal> : null
                  }
                </>


              </tbody>
            </Table>
            : null}

          {Farmerfinderror ?
            <p style={{ color: "red" }}>Farmer Not Found</p>
            : null}




        </div>
      </div>
    </>
  )
}

export default Findfarmer