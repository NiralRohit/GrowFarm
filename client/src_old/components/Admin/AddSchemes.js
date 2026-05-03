import React from 'react'
import { useEffect, useState } from 'react';
import { MultiSelect } from "react-multi-select-component";

export default function AddSchemes() {

    const [Title, setTitle] = useState("tryyk");
    const [Description, setDescription] = useState("try");
    const [Benefits, setBenefits] = useState("try");
    const [How, setHow] = useState("try");
    const [More, setMore] = useState("try");
    const [Start, setStart] = useState("try");
    const [Expired, setExpired] = useState("try");
    const [Farmertype, setFarmertype] = useState([]);
    const [Category, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);
    const options = Category;
      const [selected, setSelected] = useState([]);


const add_category = item => {
  setCategory([...Category, item])
}
const add_type = item => {
  setFarmertype([...Farmertype, item])
}

const remove_category = item => {
  let ind = Category.indexOf(item)
  if (ind >= 0){
    Category.splice(ind, 1)
  }
  setCategory([...Category]);
}
const remove_type = item => {
  let ind = Farmertype.indexOf(item)
  if (ind >= 0){
    Farmertype.splice(ind, 1)
  }
  setFarmertype([...Farmertype]);
}


const Forcat = ({value , id}) => {
  return  (
    <>
<div>
    <label for={id}>{value}</label>
  <input
    type="checkbox"
    checked={Category.indexOf(value)>=0}
    id={id}
    value={value}
    onChange={ (event) => { setCategory()
     if (event.target.checked){
       add_category(event.target.value)
     }else{
      remove_category(event.target.value)
     }
    }
}
 />
</div>
   </>
)

}
const ForType = ({value , id}) => {
  return  (
    <>
<div>
    <label for={id}>{value}</label>
  <input
    type="checkbox"
    checked={Farmertype.indexOf(value)>=0}
    id={id}
    value={value}
    onChange={ (event) => { setFarmertype()
     if (event.target.checked){
       add_type(event.target.value)
     }else{
      remove_type(event.target.value)
     }
    }
}
 />
</div>
   </>
)

}


let arr = ["Cat-1", "Cat-2", "Cat-3"]

let category_compo = arr.map((item, ind) => {
    <Forcat value={item} id={ind} />
})

console.log(category_compo, "category_compo")
console.log(Category, "main")
console.log(options, "mainoptions")
console.log(Farmertype, "Type")

    const handleSubmit = async (e) => {
        e.preventDefault();
      setLoading(true);
      
      fetch("http://localhost:8000/scheme/add", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            Title,
            Description,
            Benefits,
            How,
            More,
            Start,
            Expired,
            Category,
            Farmertype,
            loading,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
console.log(data)
console.log("done")
if(data.status == "ok"){
alert(data.result)
}else{
  alert(data.error)
}
// console.log(res)
        });
        }

  return (
    <>
     <div>
     <h3>Add New Scheme</h3>
      <form onSubmit={handleSubmit} >
         <div className="mb-3">
         <label>Scheme Title</label>
         <textarea
           // type="email"
           className="form-control"
           placeholder="Enter Scheme Title"
           onChange={ (event) => setTitle(event.target.value)}
         />
       </div> 
         <div className="mb-3">
         <label>Description</label>
         <textarea
           // type="email"
           className="form-control"
           placeholder="Enter Scheme Description"
           onChange={ (event) => setBenefits(event.target.value)}
         />
       </div> 
         <div className="mb-3">
         <label>Benefits</label>
         <textarea
           // type="email"
           className="form-control"
           placeholder="Enter Scheme Benefits"
           onChange={ (event) => setDescription(event.target.value)}
         />
       </div> 
         <div className="mb-3">
         <label>How to claim Scheme</label>
         <textarea
           // type="email"
           className="form-control"
           placeholder="Info about how to claim a scheme"
           onChange={ (event) => setHow(event.target.value)}
         />
       </div> 
         <div className="mb-3">
         <label>More Info About Scheme</label>
         <textarea
           // type="email"
           className="form-control"
           placeholder="Info about scheme"
           onChange={ (event) => setMore(event.target.value)}
         />
       </div> 
         {/* <div className="mb-3">
         <label>Start Date</label>
         <input
           type="date"
           className="form-control"
           placeholder="Enter the Scheme Start Date"
           onChange={ (event) => setStart(event.target.value)}
         />
       </div>  */}
         <div className="mb-3">
         <label>Expired Date</label>
         <input
          type="date"
           className="form-control"
           placeholder="Enter Last Date of Scheme "
           onChange={ (event) => setExpired(event.target.value)}
         />
       </div> 
         {/* <div className="mb-3">
         <label>Type</label>
         <input
           // type="email"
           className="form-control"
           placeholder="Enter your mobilenumber"
           onChange={ (event) => setType(event.target.value)}
         />
       </div>  */}
        
       <div>
    </div>


<p>Select Category</p>
  <div className="mb-3">
    
  <Forcat value="ST" id="id12"/>
<Forcat value="SC" id="id12" />
       {/* <Forcat value="Cat-3" id="id12" /> */}
  </div>
    
  <p>Select Farmer Type</p>
<div className="mb-3">
<ForType value="Small" id="id12" />
       <ForType value="Medium" id="id12" />
       {/* <ForType value="Cat-3" id="id12" /> */}
</div>
   



       
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
      </div>
    </>
  )
}

