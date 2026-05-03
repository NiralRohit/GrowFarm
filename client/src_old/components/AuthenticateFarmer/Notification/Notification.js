import React ,  { useContext, useState , useEffect} from 'react'
import { AppContext } from "../Farmer_account/appContext";
import Modal from "react-bootstrap/Modal";




function Notification() {
  
  
  const [notifidata , setNotifidata] = useState([]);
  const { socket } = useContext(AppContext);
  const auth = localStorage.getItem("user");
  const [show, setShow] = useState(true);

  
  useEffect(() => {
   
  socket.off("get-notification").once("get-notification", (data) => {
    const newone = data
    console.log(newone)
    setNotifidata(data)
  } );
  
}, []);
    


  

 

  return (
    <>
    {show ? (
                  <Modal
                    show={show}
                    backdrop="static"
                    keyboard={true}
                    size="xl"
                    onHide={() => setShow(false)}
                    dialogClassName="modal-190w"
                    aria-labelledby="example-custom-modal-styling-title"
                  >
                    <Modal.Header closeButton>
                      <Modal.Title id="example-custom-modal-styling-title">
                      <h1>Notificaations</h1>
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                     <h6>Hello</h6>
                     <div style={{marginTop : "100px"}}>Notification</div>
    {
      notifidata.map((dataa, ind) => {
        return(
          <>
          <h1>{dataa.content}</h1>
              </>
        )
       
    })
    }
                    </Modal.Body>
                  </Modal>
                ) : null}
    </>
  )
}

export default Notification