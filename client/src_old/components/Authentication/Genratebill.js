import { alert } from "@material-tailwind/react";
import React, { useEffect, useContext, useState } from "react";
import "./Genratebill.css"

function Genratebill() {

  const [Bill_type, setBill_type] = useState("");
  const [GST_No, setGST_No] = useState();
  const [Party, setParty] = useState("");
  const [Trade_name, setTrade_name] = useState("");
  const [Crop, setCrop] = useState("");
  const [Bill_date, setBill_date] = useState(new Date().toLocaleDateString());
  const [Bags, setBags] = useState("");
  const [Kgs, setKgs] = useState("");
  const [Rate, setRate] = useState("");
  const [Amount, setAmount] = useState("");
  const [Commission_cost, setCommission_cost] = useState("");
  const [Labour_cost, setLabour_cost] = useState("");
  const [CGST, setCGST] = useState("");
  const [SGST, setSGST] = useState("");
  const [Bill_Amount, setBill_Amount] = useState("");
  const [Mobile, setMobile] = useState("");
  const [Name, setName] = useState("");

  // const [date, setDate] = useState(new Date().toLocaleDateString());
  const authtraderdata = localStorage.getItem("userTraderAccount");

  // setGST_No(JSON.parse(authtraderdata).GST_No)
  console.log(JSON.parse(authtraderdata).Name)
  console.log(JSON.parse(authtraderdata).Trade_Name)
  console.log(JSON.parse(authtraderdata).Mobile)
  console.log(Bags)
  console.log(Kgs)

  const lol = Bags * 20
  console.log(lol)


  const amountt = Bags * Rate
  console.log(amountt)

  const comimision_costt = (amountt / 100)
  const labour_costt = (amountt / 100)

  const SGSTt = (2.5 * amountt) / 100;
  const CGSTt = (2.5 * amountt) / 100;

  const totalBill_Amountt = amountt + SGST + CGST + labour_costt + comimision_costt


  useEffect(() => {
    setKgs(lol)
    setAmount(amountt)
    setCommission_cost(comimision_costt)
    setLabour_cost(labour_costt)
    setCGST(SGSTt)
    setSGST(CGSTt)
    setBill_Amount(totalBill_Amountt)
    setGST_No(JSON.parse(authtraderdata).GST_No)
    setName(JSON.parse(authtraderdata).Name)
    setTrade_name(JSON.parse(authtraderdata).Trade_Name)
    setMobile(JSON.parse(authtraderdata).Mobile)
  }, [lol, amountt, comimision_costt, labour_costt, SGSTt, CGSTt, totalBill_Amountt]);

  const handleSubmit = async (event) => {
    console.log("in")
    event.preventDefault();
    
      const response = await fetch(
        "http://localhost:8000/trader/create_bill",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Bill_type,
            GST_No,
            Party,
            Trade_name,
            Name,
            Crop,
            Mobile,
            Bill_date,
            Bags,
            Kgs,
            Rate,
            Amount,
            Commission_cost,
            Labour_cost,
            CGST,
            SGST,
            Bill_Amount
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      if(data.status == "ok"){
        window.alert("Bill Generate Successful")
      }
//     if (data.status === "ok"){
// alert("Bill Generate Successful")
//      }else{
//       alert("Somthing Wrong")
//      }
  
  };

  return (
    <>
      <div style={{ marginTop: "100px" }}></div>
      <form onSubmit={handleSubmit}>

        <br />


        <div className="formbox">
          <span className="tital">
            <div className="billdata" id="onebox">
              <label className="gleft" ><h3></h3></label>
              <input type="text" value={JSON.parse(authtraderdata).Trade_Name} />
            </div>
          </span>
          <div className="maindiv">
            <div className="div3">
              <div className="billdata" id="onebox">
                <label className="gleft">Name</label>
                <input type="text" value={JSON.parse(authtraderdata).Name} />
              </div>

              {/* <div className="billdata">
                  <label>GST_No</label>
                  <input type="text" value={JSON.parse(authtraderdata).GST_No} readOnly  />
                </div>
                <div className="billdata">
                  <label>Mobile bumber</label>
                  <input type="text" value={JSON.parse(authtraderdata).Mobile} readOnly  />
                </div> */}


              <div className="billdata" id="onebox">
                <label className="gleft">GST no</label>
                <input type="text" value={JSON.parse(authtraderdata).GST_No} />
              </div>


              <div className="billdata" id="onebox">
                <label className="gleft">Mobile num</label>
                <input type="text" value={JSON.parse(authtraderdata).Mobile} />
              </div>

            </div>
            <div className="div2">
              <div className="billdata" id="onebox">
                <label className="gleft">Select Bill Type</label>
                <select
                  className="billdata"
                  placeholder="Enter your mobilenumber"
                  onChange={(event) => setBill_type(event.target.value)}
                >
                  <option value={"Select Bill type"}>Bill type</option>
                  <option value={"Seller"}>Seller</option>
                  <option value={"Buyer"}>Buyer</option>
                </select>
              </div>

              <div className="billdata" id="onebox">
                <label className="gleft">Bill_date</label>
                <input type="text" value={Bill_date} readOnly />
              </div>
            </div>
            
            <div className="billdata" id="onebox">
              <label className="gleft"></label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter farmerid or Name"
                onChange={(event) => setParty(event.target.value)}
              />
            </div>
            <div className="vkdiv">
              <div className="billdata" id="onebox">
                <label className="gleft">Crop</label>
                <select name="" id="" onChange={(event) => setCrop(event.target.value)}>

                  <option value="Castor">Select Crop</option>
                  <option value="Castor">Castor</option>
                </select>
              </div>

              <div className="billdata" id="onebox">
                <label className="gleft">Bags</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Number of bags"
                  onChange={(event) =>
                    setBags(event.target.value)
                  }
                />
              </div>
              <p style={{color : "black"}}>Kilograms {Kgs}</p>

              <div className="billdata" id="onebox">
                <label className="gleft">Rates</label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter rates"
                  onChange={(event) =>
                    setRate(event.target.value)
                  }
                />
              </div>
              <p>Amount {Amount}</p>
            </div>
            <hr />
            <hr />
            
            <div className="lastvk">
              <p> Commission_cost :-{Commission_cost}</p><hr/>
              <p>Labour_cost :- {Labour_cost}</p><hr/>
              <p>CGST :- {CGST}</p><hr/>
              <p>SGST :- {SGST}</p><hr/>
              <p>Bill_Amount:- {Bill_Amount}</p><hr/>
            </div>

            {/* <div className="billdata">
                  <label>Kgs</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter your mobilenumber"
                      onChange={setKgs()}
                  />
                </div> */}

            <div></div>

          </div>
        </div>

        <div className="d-grid">
        <button type="submit" className="genbillbtn">
          Submit
        </button>
      </div>

      </form>
      
    
    </>
  )
}

export default Genratebill