import React, { useEffect, useState, useContext } from "react";
import { Button, Card } from "react-bootstrap";
import "./Exper_Talk.css";
import { AppContext } from "../Farmer_account/appContext";

function ExpertTalk() {
  const [Expertlist, setExpertlist] = useState([]);
  const [chatbox, setchatbox] = useState(false);
  const [ExpertEmail, setExpertEmail] = useState("");
  const [Chatboxexpertname, setChatboxexpertname] = useState("");
  const { socket } = useContext(AppContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const auth = localStorage.getItem("user");

  useEffect(() => {
    getschemedata();
  }, []);

  function getschemedata() {
    fetch(`http://localhost:8000/expert/list_of_experts`, {
      method: "GET",
      crossDomain: true,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setExpertlist(data);
      });
  }

  function handelemit(Expertlistnew) {
    console.log("called");
    console.log(Expertlistnew.Email);
    socket.emit("join-in-expertroom", {
      content: "Join done",
      to: "tototo",
      Farmer: JSON.parse(auth).Mobilenum,
      expert_email: Expertlistnew.Email,
    });
    socket.off("get-roommessages").on("get-roommessages", (data) => {
      console.log(data);
      setMessages(data);
    });

    setchatbox(true);
    setChatboxexpertname(Expertlistnew.Name);
    setExpertEmail(Expertlistnew.Email);
  }
  console.log(messages);
  function handleSubmit(e) {
    e.preventDefault();
    socket.emit("send-message-in-expertroom", {
      content: message,
      roomid: JSON.parse(auth).Mobilenum + ExpertEmail,
      to: Chatboxexpertname,
      From: JSON.parse(auth).Name,
      Farmer_number: JSON.parse(auth).Mobilenum,
      expert: ExpertEmail,
    });
  }

  return (
    <>
      <div className="MainExpertlist" style={{ marginTop: "100px" }}>
        ExpertTalk
        <br />
        {Expertlist.map((Expertlistnew) => {
          return (
            <>
              <div
                className="Expertlistcard"
                style={{ width: "180px" }}
                onClick={() => handelemit(Expertlistnew)}
              >
                <p value={Expertlistnew.Name}>{Expertlistnew.Name}</p>
                <p value={Expertlistnew.Email}>{Expertlistnew.Email}</p>
              </div>
              <br />
            </>
          );
        })}
      </div>
      {chatbox ? (
        <>
          <div
            className="Chatboxcontainer"
            style={{ marginTop: "100px", marginLeft: "300px" }}
          >

<h1>{Chatboxexpertname}</h1>
            <h1>{ExpertEmail}</h1>
            {messages.map((newmessages, idx) => {
              return (
<>
                <p>{newmessages.content}</p>
</>
              )
            })}

         
            <div>
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Send Msg</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div><br />
                <Button type="submit">Submit</Button>
              </form>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export default ExpertTalk;
