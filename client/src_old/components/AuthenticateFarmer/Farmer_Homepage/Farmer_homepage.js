import React from 'react'
import "./Farmer_homepage.css"

function Farmer_homepage() {
  return (
      <>
     <div id="carouselExampleDark" className="carousel carousel-dark slide" data-bs-ride="carousel">
    <div className="carousel-indicators">
      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" className="active"
        aria-current="true" aria-label="Slide 1"></button>
      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="1" aria-label="Slide 2"></button>
      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="2" aria-label="Slide 3"></button>
    </div>
    <div className="carousel-inner">
      <div className="carousel-item active" data-bs-interval="10000">
        <img src="imgs/slider1.jpeg" className="d-block w-100" alt="..." height="600px" width="900px"/>
        <div className="carousel-caption d-none d-md-block">
          <h5>First slide label</h5>
          <p>Some representative placeholder content for the first slide.</p>
        </div>
      </div>
      <div className="carousel-item" data-bs-interval="2000">
        <img src="imgs/slider2.jpg" className="d-block w-100" alt="..." height="600px" width="900px"/>
        <div className="carousel-caption d-none d-md-block">
          <h5>Second slide label</h5>
          <p>Some representative placeholder content for the second slide.</p>
        </div>
      </div>
      <div className="carousel-item">
        <img src="imgs/Overview.jpg" className="d-block w-100" alt="..." height="600px" width="900px"/>
        <div className="carousel-caption d-none d-md-block">
          <h5>Third slide label</h5>
          <p>Some representative placeholder content for the third slide.</p>
        </div>
      </div>
    </div>
    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="prev">
      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Previous</span>
    </button>
    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="next">
      <span className="carousel-control-next-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Next</span>
    </button>
  </div>



 <div className="allcard">

  <div id="cardsec1" className="card-group" >
    <div className="card" id="card1">
      <img src="imgs/Crop Recommendation.jpg" id="cardimg1" className="card-img-top" alt="Crop Recommendation & Yield Pradiction"/>
      <div className="card-body">
        <h5 className="card-title">Crop Recommendation & Yield Pradiction</h5>
        <p className="card-text">
          

          If a farmer wants to know which crops will produce a good yield. For this, information such as the district, the current season, the crop he wishes to plant, the size of his farm, the amount of nitrogen, phosphorus, and potassium, and finally the pH level must be entered. With this information, a crop with a high yield can be predicted and recommended to the farmer.

        </p>
      </div>
      <div className="card-footer">
        <small className="text-muted">link</small>
      </div>
    </div>

    <div className="card" id="card2">
      <img src="imgs/Disease Prediction.jpg" id="cardimg2"className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">Disease Detection</h5>
        <p className="card-text">
          If a crop is found to be infected with a disease. The farmer can upload a photo of the damaged plant. The disease would be displayed, and approaches to save the crop would be given to the farmer. The farmer would also be advised to use pesticides and insecticides.

        </p>
      </div>
      <div className="card-footer">
        <small className="text-muted">link</small>
      </div>
    </div>

    <div className="card" id="card3">
      <img src="imgs/Alert And Update System.jpg" id="cardimg3"className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">Alert & Update</h5>
        <p className="card-text">

        The beneficiary scheme section lists all of the current and new schemes that are helpful to farmers. The schemes that a farmer applied for, the schemes that were approved for the farmer, and the schemes that were denied for various reasons are all shown here.
      </p>
      </div>
      <div className="card-footer">
        <small className="text-muted">link</small>
      </div>
    </div>
  </div>


  <div id="cardsec2" className="card-group" >
    <div className="card" id="card4">
      <img src="imgs/Weather1.jpg" id="cardimg4"className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">Weather </h5>
        <p className="card-text">
          Forecasting the weather is also done here. If the weather changes, the farmer will be notified so that they can save their crop. A cotton crop, for example, will suffer if it rains. So the farmers are warned ahead of time that it is going to rain. Farmers will be notified that the humidity has increased and there is a greater chance of rain.

         </p>
      </div>
      <div className="card-footer">
        <small className="text-muted">link</small>
      </div>
    </div>

    <div className="card" id="card5">
      <img src="imgs/Expert talk.png" id="cardimg5"className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">Expert Talk</h5>
        <p className="card-text">
          A useful method of expert talks is also introduced on the website, through which farmers may interact with experts with more competence in the subject to improve their farming and the land, which will ultimately contribute to the farmer's improvement.
          Expert also help them which crop they will need according to their land and other information related to land or crop,


        </p>
      </div>
      <div className="card-footer">
        <small className="text-muted">link</small>
      </div>
    </div>

    <div className="card" id="card6">
      <img src="imgs/Chatbot Grow.jpg" id="cardimg6"className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">Chatbot GrowFarm</h5>
        <p className="card-text">
          
          The portal uses a chat bot system so that farmers may communicate with it about any issues or support they need to use the site, such as crop recommendations information on new schemes, and much more that is relevant to the features of the site.
        </p>
      </div>
      <div className="card-footer">
        <small className="text-muted">link</small>
      </div>
    </div>
  </div>
</div>

<h4 id="overview_content">Overview</h4>
  <div id="overview">
    A centralised  system that includes each basic details of the farmer including their  personal information, communication details, farm location and details, field information, yield information, credit, insurance, and qualification in order to create an individual digital profile of every farmer in the state and to create a common database for advancing agriculture. This system can be used by the government and policymakers to implement new programmes and subsidies for farmers who qualify for them. The information gathered from farmers will be used to digitise contract farming and direct buying and selling.e maintained in a protected database utilising the system also contains recommendation systems (such as advice for fertilisers, seeds, and crops), alert/update systems (such as weather warnings), and disease detection. The portal contains a method to send out notifications for new government programmes as well as the fertilisation and harvesting times for the crop to the farmers.
    

  </div>
    </>
  )
}

export default Farmer_homepage