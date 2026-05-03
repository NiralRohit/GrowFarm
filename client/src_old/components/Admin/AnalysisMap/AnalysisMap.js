import React, { useState } from "react";

function Form() {
  const [values, setValues] = useState([{ value: "" } , { value: ""} ]);

  const handleChange = (event, index) => {
    const updatedValues = [...values];
    updatedValues[index].value = event.target.value;
    setValues(updatedValues);
  };

console.log(values)

  const handleSubmit = async event => {
    event.preventDefault();
    try {
      const response = await fetch("https://your-api-endpoint.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ values })
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style = {{marginTop : "100px"}}>
      {values.map((value, index) => (
        <input
          key={index}
          type="text"
          name={`value${index}`}
          placeholder={`Value ${index + 1}`}
          value={value.value}
          onChange={event => handleChange(event, index)}
        />
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}

export default Form;
