import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Card, ProgressBar, Spinner, Alert } from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import './yieldfinder.css';

const auth = localStorage.getItem('user');

export default function Yieldfinder() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Metadata from backend
  const [districts, setDistricts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [crops, setCrops] = useState([]);

  // Form state
  const [district, setDistrict] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("50");
  const [nitrogen, setNitrogen] = useState("69");
  const [phosphorus, setPhosphorus] = useState("50");
  const [potassium, setPotassium] = useState("40");
  const [ph, setPh] = useState("5.2");

  // Load dropdown metadata on mount
  useEffect(() => {
    axios.get('http://localhost:8000/yield-metadata')
      .then(res => {
        setDistricts(res.data.districts || []);
        setSeasons(res.data.seasons || []);
        setCrops(res.data.crops || []);
      })
      .catch(() => {
        // Fallback default values
        setSeasons(['Kharif', 'Rabi', 'Whole Year', 'Summer', 'Winter', 'Autumn']);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!district || !crop) {
      setError('Please select a district and crop.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.get(
        `http://localhost:8000/yield-predict?dist=${encodeURIComponent(district)}&season=${encodeURIComponent(season)}&crop=${encodeURIComponent(crop)}&area=${area}&N=${nitrogen}&P=${phosphorus}&K=${potassium}&Ph=${ph}`
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get yield prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return auth ? (
    <div className="yf-container">
      {/* Header */}
      <div className="yf-header">
        <h2>🌾 Yield Finder</h2>
        <p>Predict crop production and yield based on your district, season, soil parameters, and area.</p>
      </div>

      {/* Form */}
      <div className="yf-form-card">
        <form onSubmit={handleSubmit}>
          <div className="yf-form-grid">
            <div className="yf-field">
              <label>📍 District</label>
              <input
                list="district-list"
                className="yf-input"
                placeholder="e.g. KHEDA, ANAND"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
              <datalist id="district-list">
                {districts.map((d, i) => <option key={i} value={d} />)}
              </datalist>
            </div>

            <div className="yf-field">
              <label>🗓️ Season</label>
              <select className="yf-input" value={season} onChange={(e) => setSeason(e.target.value)}>
                {seasons.length > 0 ? seasons.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                )) : (
                  <>
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Whole Year">Whole Year</option>
                    <option value="Summer">Summer</option>
                  </>
                )}
              </select>
            </div>

            <div className="yf-field">
              <label>🌱 Crop</label>
              <input
                list="crop-list"
                className="yf-input"
                placeholder="e.g. Rice, Wheat, Cotton"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              />
              <datalist id="crop-list">
                {crops.map((c, i) => <option key={i} value={c} />)}
              </datalist>
            </div>

            <div className="yf-field">
              <label>📐 Area (Hectares)</label>
              <input
                type="number"
                className="yf-input"
                placeholder="Enter area"
                value={area}
                min="0.1"
                step="0.1"
                onChange={(e) => setArea(e.target.value)}
              />
            </div>

            <div className="yf-field">
              <label>🧪 Nitrogen (N)</label>
              <input type="number" className="yf-input" placeholder="0-140" value={nitrogen}
                min="0" max="300" onChange={(e) => setNitrogen(e.target.value)} />
            </div>

            <div className="yf-field">
              <label>🧪 Phosphorus (P)</label>
              <input type="number" className="yf-input" placeholder="0-145" value={phosphorus}
                min="0" max="300" onChange={(e) => setPhosphorus(e.target.value)} />
            </div>

            <div className="yf-field">
              <label>🧪 Potassium (K)</label>
              <input type="number" className="yf-input" placeholder="0-205" value={potassium}
                min="0" max="300" onChange={(e) => setPotassium(e.target.value)} />
            </div>

            <div className="yf-field">
              <label>⚗️ pH Level</label>
              <input type="number" className="yf-input" placeholder="3.5-9.5" value={ph}
                min="0" max="14" step="0.1" onChange={(e) => setPh(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="yf-submit-btn" disabled={loading}>
            {loading ? (
              <><Spinner animation="border" size="sm" /> &nbsp; Predicting...</>
            ) : (
              '🔍 Predict Yield'
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && <Alert variant="danger" className="yf-alert">{error}</Alert>}

      {/* Results */}
      {result && (
        <div className="yf-results">
          {/* Summary Cards */}
          <div className="yf-summary-grid">
            <div className="yf-stat-card yf-stat-production">
              <div className="yf-stat-icon">🏭</div>
              <div className="yf-stat-label">Predicted Production</div>
              <div className="yf-stat-value">{result.Production}</div>
              <div className="yf-stat-unit">Tonnes</div>
            </div>
            <div className="yf-stat-card yf-stat-yield">
              <div className="yf-stat-icon">📊</div>
              <div className="yf-stat-label">Yield per Hectare</div>
              <div className="yf-stat-value">{result.Yield}</div>
              <div className="yf-stat-unit">{result.Unit}</div>
            </div>
            <div className="yf-stat-card yf-stat-soil">
              <div className="yf-stat-icon">🌍</div>
              <div className="yf-stat-label">Soil Suitability</div>
              <div className="yf-stat-value">{result.SoilSuitability}%</div>
              <ProgressBar
                now={result.SoilSuitability}
                variant={result.SoilSuitability >= 70 ? "success" : result.SoilSuitability >= 50 ? "warning" : "danger"}
                style={{ height: '8px', marginTop: '8px' }}
              />
            </div>
            <div className="yf-stat-card yf-stat-weather">
              <div className="yf-stat-icon">🌡️</div>
              <div className="yf-stat-label">Weather</div>
              <div className="yf-stat-value">{result.Weather.Temperature}°C</div>
              <div className="yf-stat-unit">Humidity: {result.Weather.Humidity}%</div>
            </div>
          </div>

          {/* Charts */}
          <div className="yf-charts-grid">
            <div className="yf-chart-card">
              <ReactApexChart
                options={{
                  chart: { type: 'bar', height: 350 },
                  title: { text: 'Your Soil NPK vs Optimal', style: { fontSize: '16px', color: '#2d6a4f' } },
                  plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
                  dataLabels: { enabled: true, style: { fontSize: '12px', colors: ['#fff'] } },
                  stroke: { show: true, width: 2, colors: ['transparent'] },
                  xaxis: { categories: ['Nitrogen', 'Phosphorus', 'Potassium', 'pH'] },
                  fill: { opacity: 1 },
                  colors: ['#2d6a4f', '#95d5b2'],
                  legend: { position: 'top' }
                }}
                series={[
                  { name: 'Your Input', data: [parseFloat(nitrogen), parseFloat(phosphorus), parseFloat(potassium), parseFloat(ph)] },
                ]}
                type="bar"
                height={350}
              />
            </div>

            <div className="yf-chart-card">
              <ReactApexChart
                options={{
                  chart: { type: 'radialBar' },
                  title: { text: 'Soil Suitability Score', style: { fontSize: '16px', color: '#2d6a4f' } },
                  plotOptions: {
                    radialBar: {
                      hollow: { size: '60%' },
                      track: { background: '#e7e7e7' },
                      dataLabels: {
                        name: { show: true, fontSize: '16px', color: '#888' },
                        value: { show: true, fontSize: '30px', fontWeight: 'bold', color: '#2d6a4f' }
                      }
                    }
                  },
                  labels: ['Suitability'],
                  colors: [result.SoilSuitability >= 70 ? '#2d6a4f' : result.SoilSuitability >= 50 ? '#ffc107' : '#dc3545']
                }}
                series={[result.SoilSuitability]}
                type="radialBar"
                height={350}
              />
            </div>
          </div>

          {/* Recommendations */}
          {result.Recommendations && result.Recommendations.length > 0 && (
            <div className="yf-recommendations-card">
              <h5>💡 Yield Improvement Tips</h5>
              <ul>
                {result.Recommendations.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Method Info */}
          <div className="yf-method-info">
            <span>📋 Method: {result.Method}</span>
            {result.HistoricalRecords > 0 && (
              <span> | 📊 Based on {result.HistoricalRecords} historical records</span>
            )}
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="yf-login-required"><h2>Login Required</h2></div>
  );
}