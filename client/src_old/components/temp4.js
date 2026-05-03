import React from 'react'
import style from "./style.css"
import {useState} from 'react';
const auth = localStorage.getItem('user');

function Croprek() {

const [selectedFile , setSelectedFile] = useState(null);
const [input , setInput] = useState("");

const fileChangeHandler = (e) =>{
  setSelectedFile(e.target.files[0]);
}

const handleSubmit = (e) =>{
  const formData = new FormData();
  formData.append(
    "file",
    selectedFile,
    selectedFile.name
  );

  formData.append(
"username" , 
input
  )

  const requestOptions ={
    method : "POST" ,
    body : formData
  };

  fetch("http://127.0.0.1:8000/Crop_Diseas/" , requestOptions)
.then(response =>
  
  // console.log(response.json())
  console.log(response)
  )

}


  return (
    auth ?
    <>  
    <div style={{marginTop : "100px"}}><h2>Disease Prediction</h2>
    <form>
<fieldset>
  <input onChange={fileChangeHandler} name='image'  type="file" accept='.jpeg , .png ,.jpg'>
  </input>
</fieldset>
<button onClick={handleSubmit} >Upload</button>
    </form>
    </div>
    </>
  
    : 
     <>
    <div><h2>Login Require</h2></div>
    </>
  )
}

export default Croprek






import React from 'react'
import style from "./style.css"
import {useState} from 'react';
const auth = localStorage.getItem('user');

function Croprek() {

  const handleImageUpload = async (image) => {
    const formData = new FormData();
    formData.append("image", image);
    try {
    const response = await fetch("http://127.0.0.1:8000/Crop_Diseas/", {
    method: "POST",
    body: formData,
    });
    const data = await response.json();
    if (data) {
    console.log(data);
    // handle successful image processing
    } else {
    console.error("Error processing image");
    }
    } catch (err) {
    console.error(err);
    }
    };
    
    
    return (
    
      <div style={{marginTop : "100px"}}>
        <input type="file" onChange={(e) => handleImageUpload(e.target.files[0])} />
      </div>
    );                                            
}

export default Croprek