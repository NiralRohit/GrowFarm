import React, { useState } from 'react';
import axios from "axios";
import { Card, ProgressBar, Spinner, Alert } from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import "./style.css";

const auth = localStorage.getItem('user');

export default function Croprek() {
  const [top5datacrop0, setTop5data0] = useState([]);
  const [Cropfert, setCropfert] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [Nitrogen, setNitrogen] = useState("85");
  const [City, setCity] = useState(auth ? JSON.parse(auth).Taluka : "");
  const [Phosphorus, setPhosphorus] = useState("70");
  const [Potassium, setPotassium] = useState("60");
  const [Ph, setPh] = useState("6");
  const [Rain, setRain] = useState("90");
  const [shownCrop, setshownCrop] = useState(false);
  const [showntop5, setshowntop5] = useState(false);

  const handleShow = (crop) => {
    setshownCrop(crop);
    setCropfert(crop.Fert);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!City) { setError('Please enter your city name.'); return; }
    setLoading(true);
    setError(null);
    setshowntop5(true);

    try {
      const { data } = await axios.get(
        `http://localhost:8000/crop-recommend?city=${encodeURIComponent(City)}&N=${Nitrogen}&P=${Phosphorus}&K=${Potassium}&ph=${Ph}&rain=${Rain}`
      );
      setTop5data0(data.Top);
    } catch (err) {
      setError('Failed to get crop recommendation. Please check the city name and try again.');
      setshowntop5(false);
    } finally {
      setLoading(false);
    }
  };

  let chartvalue = top5datacrop0.map(i => (i.Prob * 100));
  let Labalevalue = top5datacrop0.map(i => (i.Crop));

  return auth ? (
    <div className="cr-container">
      {/* Header */}
      <div className="cr-header">
        <h2>🌿 Crop Recommendation</h2>
        <p>Enter your soil parameters and city to find the best crops for your land</p>
      </div>

      {/* Form */}
      <div className="cr-form-card">
        <form onSubmit={handleSubmit}>
          <div className="cr-form-grid">
            <div className="cr-field cr-field-full">
              <label>📍 City / Taluka</label>
              <input type="text" className="cr-input" placeholder="Enter your city or taluka"
                defaultValue={City} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="cr-field">
              <label>🧪 Nitrogen (N)</label>
              <input type="number" className="cr-input" placeholder="0-140" defaultValue={Nitrogen}
                min="0" max="300" onChange={(e) => setNitrogen(e.target.value)} />
            </div>
            <div className="cr-field">
              <label>🧪 Phosphorus (P)</label>
              <input type="number" className="cr-input" placeholder="0-145" defaultValue={Phosphorus}
                min="0" max="300" onChange={(e) => setPhosphorus(e.target.value)} />
            </div>
            <div className="cr-field">
              <label>🧪 Potassium (K)</label>
              <input type="number" className="cr-input" placeholder="0-205" defaultValue={Potassium}
                min="0" max="300" onChange={(e) => setPotassium(e.target.value)} />
            </div>
            <div className="cr-field">
              <label>⚗️ pH Level</label>
              <input type="number" className="cr-input" placeholder="3.5-9.5" defaultValue={Ph}
                min="0" max="14" step="0.1" onChange={(e) => setPh(e.target.value)} />
            </div>
            <div className="cr-field">
              <label>🌧️ Rainfall (mm)</label>
              <input type="number" className="cr-input" placeholder="20-300" defaultValue={Rain}
                min="0" max="500" onChange={(e) => setRain(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="cr-submit-btn" disabled={loading}>
            {loading ? <><Spinner animation="border" size="sm" /> Analyzing...</> : '🔍 Find Best Crops'}
          </button>
        </form>
      </div>

      {error && <Alert variant="danger" className="cr-alert">{error}</Alert>}

      {/* Loading */}
      {loading && (
        <div className="cr-loading">
          <Spinner animation="grow" variant="success" />
          <p>Analyzing soil and weather data for {City}...</p>
        </div>
      )}

      {/* Top 5 Results */}
      {showntop5 && !loading && top5datacrop0.length > 0 && (
        <>
          <div className="cr-results-header">
            <h5>Top 5 crops for <b style={{ color: '#2d6a4f' }}>{City}</b> with NPK ({Nitrogen}, {Phosphorus}, {Potassium}), pH {Ph}, Rain {Rain}mm</h5>
          </div>

          <div className="cr-crops-grid">
            {top5datacrop0.map((crop, idx) => (
              <div key={idx} className={`cr-crop-card ${shownCrop && shownCrop.Crop === crop.Crop ? 'cr-crop-active' : ''}`}>
                <div className="cr-crop-rank">#{idx + 1}</div>
                <div className="cr-crop-img-wrapper">
                  <img src={`/crop_image/${crop.Crop}.jpg`} alt={crop.Crop}
                    className="cr-crop-img"
                    onError={(e) => { e.target.src = '/Profileimage.svg'; }} />
                </div>
                <h6 className="cr-crop-name">{crop.Crop}</h6>
                <div className="cr-crop-prob-label">Success Probability</div>
                <ProgressBar
                  animated now={crop.Prob * 100} max={100}
                  label={`${(crop.Prob * 100).toFixed(1)}%`}
                  variant={crop.Prob > 0.3 ? "success" : crop.Prob > 0.15 ? "warning" : "info"}
                  style={{ height: '22px', marginBottom: '14px', borderRadius: '11px' }}
                />
                <button className="cr-info-btn" onClick={() => handleShow(crop)}>
                  📊 View Analysis
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detailed Analysis */}
      {shownCrop && (
        <div className="cr-analysis-section" id="crop-analysis">
          <div className="cr-analysis-header">
            <h5>📊 Detailed Analysis for <b style={{ color: '#2d6a4f' }}>{shownCrop.Crop}</b></h5>
          </div>

          <div className="cr-charts-grid">
            <div className="cr-chart-card">
              <ReactApexChart
                options={{
                  chart: { type: "bar", height: 350 },
                  title: { text: "Soil NPK Analysis", style: { fontSize: '16px', color: '#2d6a4f' } },
                  plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
                  dataLabels: { enabled: true, style: { fontSize: '12px', colors: ['#fff'] } },
                  stroke: { show: true, width: 2, colors: ['transparent'] },
                  xaxis: { categories: ["Nitrogen", "Phosphorus", "Potassium", "pH"] },
                  fill: { opacity: 1 },
                  colors: ['#2d6a4f', '#95d5b2'],
                  legend: { position: 'top' }
                }}
                series={[
                  { name: "Your Soil", data: [parseFloat(Nitrogen), parseFloat(Phosphorus), parseFloat(Potassium), parseFloat(Ph)] },
                  { name: "Required", data: [shownCrop.Requir_Nitro, shownCrop.Require_Phosp, shownCrop.Require_cal, shownCrop.Requir_Ph] },
                ]}
                type="bar"
                height={380}
              />
            </div>

            <div className="cr-chart-card">
              <ReactApexChart
                options={{
                  chart: { type: "bar", height: 350 },
                  title: { text: "Weather Comparison", style: { fontSize: '16px', color: '#2d6a4f' } },
                  plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
                  dataLabels: { enabled: true, style: { fontSize: '12px', colors: ['#fff'] } },
                  stroke: { show: true, width: 2, colors: ['transparent'] },
                  xaxis: { categories: ["Rainfall (mm)", "Temperature (°C)", "Humidity (%)"] },
                  fill: { opacity: 1 },
                  colors: ['#1b4332', '#74c69d'],
                  legend: { position: 'top' }
                }}
                series={[
                  { name: "Current", data: [parseFloat(Rain), Math.round(shownCrop.User_temp), Math.round(shownCrop.User_humidity)] },
                  { name: "Required", data: [Math.round(shownCrop.Require_rain), Math.round(shownCrop.Require_temp), Math.round(shownCrop.Require_humidity)] },
                ]}
                type="bar"
                height={380}
              />
            </div>
          </div>

          {/* Fertilizer Suggestion */}
          {Cropfert && (
            <div className="cr-fert-card">
              <h6>🧪 Fertilizer Recommendations</h6>
              <p>{Cropfert}</p>
            </div>
          )}
        </div>
      )}

      {/* Pie Chart */}
      {showntop5 && !loading && top5datacrop0.length > 0 && (
        <div className="cr-pie-section">
          <div className="cr-pie-card">
            <h5>🥧 Success Distribution</h5>
            <div className="cr-pie-chart-wrapper">
              <ReactApexChart
                options={{
                  chart: { type: "pie" },
                  labels: Labalevalue,
                  colors: ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#95d5b2'],
                  legend: { position: 'bottom', fontSize: '14px' },
                  responsive: [{ breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }],
                }}
                series={chartvalue}
                type="pie"
                width={420}
              />
            </div>
          </div>
        </div>
      )}

      <br />
    </div>
  ) : (
    <div className="cr-login-required"><h2>Login Required</h2></div>
  );
}