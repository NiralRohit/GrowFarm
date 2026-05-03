import axios from "axios";
import React, { Component } from "react";
import { Button, Spinner, Alert, ProgressBar, Badge } from "react-bootstrap";
import "./style.css";

// Supported crops (matching backend disease classes)
const CROP_OPTIONS = [
  { value: "Rice", label: "🌾 Rice" },
  { value: "Wheat", label: "🌾 Wheat" },
  { value: "Corn", label: "🌽 Corn (Maize)" },
  { value: "Cotton", label: "☁️ Cotton" },
  { value: "Sugarcane", label: "🎋 Sugarcane" },
  { value: "Tomato", label: "🍅 Tomato" },
  { value: "Potato", label: "🥔 Potato" },
  { value: "Chilli", label: "🌶️ Chilli" },
  { value: "Onion", label: "🧅 Onion" },
  { value: "Brinjal", label: "🍆 Brinjal" },
  { value: "Mango", label: "🥭 Mango" },
  { value: "Banana", label: "🍌 Banana" },
  { value: "Coconut", label: "🥥 Coconut" },
  { value: "Guava", label: "🍐 Guava" },
  { value: "Papaya", label: "🍈 Papaya" },
  { value: "Lemon", label: "🍋 Lemon" },
  { value: "Orange", label: "🍊 Orange" },
  { value: "Apple", label: "🍎 Apple" },
  { value: "Grape", label: "🍇 Grape" },
  { value: "Peach", label: "🍑 Peach" },
  { value: "Cherry", label: "🍒 Cherry" },
  { value: "Blueberry", label: "🫐 Blueberry" },
  { value: "Raspberry", label: "🫐 Raspberry" },
  { value: "Strawberry", label: "🍓 Strawberry" },
  { value: "Soybean", label: "🫘 Soybean" },
  { value: "Squash", label: "🎃 Squash" },
  { value: "Pepper", label: "🫑 Pepper (Bell)" },
  { value: "Tea", label: "🍃 Tea" },
  { value: "Coffee", label: "☕ Coffee" },
  { value: "Mustard", label: "🌼 Mustard" },
  { value: "Groundnut", label: "🥜 Groundnut" },
  { value: "Cucumber", label: "🥒 Cucumber" },
  { value: "Cauliflower", label: "🥦 Cauliflower" },
  { value: "Cabbage", label: "🥬 Cabbage" },
];

class App extends Component {
  state = {
    selectedFile: null,
    previewimg: null,
    selectedCrop: "",
    data: false,
    loading: false,
    error: null,
    result: null,
  };

  onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.setState({
        selectedFile: file,
        previewimg: URL.createObjectURL(file),
        data: false,
        error: null,
        result: null,
      });
    }
  };

  onCropChange = (event) => {
    this.setState({ selectedCrop: event.target.value, data: false, error: null, result: null });
  };

  onFileUpload = () => {
    if (!this.state.selectedFile) {
      this.setState({ error: "Please select an image file first!" });
      return;
    }
    if (!this.state.selectedCrop) {
      this.setState({ error: "Please select your crop type first!" });
      return;
    }

    this.setState({ loading: true, error: null, data: false });

    const formData = new FormData();
    formData.append("file", this.state.selectedFile, this.state.selectedFile.name);
    formData.append("crop", this.state.selectedCrop);

    axios
      .post("http://localhost:8000/disease-detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        this.setState({
          result: response.data,
          data: true,
          loading: false,
        });
      })
      .catch((err) => {
        this.setState({
          error: err.response?.data?.error || "Failed to analyze image. Please try again.",
          loading: false,
        });
      });
  };

  getSeverityBadge = (severity) => {
    const colors = { Healthy: "success", Mild: "warning", Moderate: "warning", Severe: "danger" };
    return <Badge bg={colors[severity] || "secondary"} style={{ fontSize: "14px", padding: "8px 16px" }}>{severity}</Badge>;
  };

  render() {
    const { result, previewimg, data, loading, error, selectedCrop } = this.state;

    return (
      <div style={{ marginTop: "100px", padding: "0 20px", maxWidth: "1000px", margin: "100px auto 40px" }}>
        <h3 style={{ textAlign: "center", color: "#2d6a4f", marginBottom: "30px" }}>
          🔬 AI Disease Detection
        </h3>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          Select your crop, upload a leaf photo, and our AI will analyze it for diseases
        </p>

        {/* Upload Section */}
        <div style={{
          background: "#f8f9fa", borderRadius: "12px", padding: "30px",
          textAlign: "center", border: "2px dashed #ccc", marginBottom: "30px"
        }}>

          {/* Crop Selection Dropdown */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "16px", fontWeight: "600", color: "#2d6a4f", display: "block", marginBottom: "8px" }}>
              🌱 Select Your Crop
            </label>
            <select
              value={selectedCrop}
              onChange={this.onCropChange}
              style={{
                padding: "10px 20px", fontSize: "16px", borderRadius: "8px",
                border: "2px solid #2d6a4f", backgroundColor: "white",
                color: "#333", minWidth: "250px", cursor: "pointer",
                outline: "none", appearance: "auto"
              }}
            >
              <option value="">-- Choose your crop --</option>
              {CROP_OPTIONS.map(crop => (
                <option key={crop.value} value={crop.value}>{crop.label}</option>
              ))}
            </select>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={this.onFileChange}
            style={{ marginBottom: "15px" }}
            id="leafImageInput"
          />
          <br />
          {previewimg && (
            <img
              src={previewimg}
              alt="Leaf preview"
              style={{ maxWidth: "300px", maxHeight: "250px", borderRadius: "8px", margin: "15px 0", objectFit: "cover", border: "3px solid #2d6a4f" }}
            />
          )}
          <br />
          <Button
            style={{ backgroundColor: "#2d6a4f", border: "none", padding: "10px 40px", fontSize: "16px" }}
            onClick={this.onFileUpload}
            disabled={loading || !this.state.selectedFile || !selectedCrop}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> &nbsp; Analyzing {selectedCrop} leaf with AI...
              </>
            ) : (
              `🔍 Analyze ${selectedCrop || "Leaf"}`
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && <Alert variant="danger" style={{ borderRadius: "8px" }}>{error}</Alert>}

        {/* Results Section */}
        {data && result && (
          <div className="disease-report">
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #2d6a4f, #40916c)",
              color: "white", padding: "20px", borderRadius: "12px 12px 0 0", textAlign: "center"
            }}>
              <h4 style={{ margin: 0 }}>🧬 Disease Detection Report</h4>
              <p style={{ margin: "5px 0 0", opacity: 0.8 }}>Powered by GrowFarm AI Engine</p>
            </div>

            <div style={{ background: "white", border: "1px solid #dee2e6", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "25px" }}>
              {/* Quick Summary */}
              <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", marginBottom: "25px", gap: "15px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>CROP</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#2d6a4f" }}>{result.Crop}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>DISEASE</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: result.Disease === "No Disease" ? "#28a745" : "#dc3545" }}>
                    {result.Disease}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>SEVERITY</div>
                  {this.getSeverityBadge(result.Severity)}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>CONFIDENCE</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>{result.Confidence}%</div>
                </div>
              </div>

              <hr />

              {/* Color Analysis */}
              <h5 style={{ color: "#2d6a4f", marginBottom: "15px" }}>📊 Leaf Color Analysis</h5>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <span>🟢 Healthy (Green): {result.ColorAnalysis.GreenRatio}%</span>
                  <ProgressBar now={result.ColorAnalysis.GreenRatio} variant="success" style={{ height: "12px" }} />
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <span>🟤 Damaged (Brown): {result.ColorAnalysis.BrownRatio}%</span>
                  <ProgressBar now={result.ColorAnalysis.BrownRatio} max={50} variant="warning" style={{ height: "12px" }} />
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <span>🟡 Stressed (Yellow): {result.ColorAnalysis.YellowRatio}%</span>
                  <ProgressBar now={result.ColorAnalysis.YellowRatio} max={50} variant="info" style={{ height: "12px" }} />
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <span>⚫ Dark Spots: {result.ColorAnalysis.DarkSpots}%</span>
                  <ProgressBar now={result.ColorAnalysis.DarkSpots} max={30} variant="danger" style={{ height: "12px" }} />
                </div>
              </div>

              <hr />

              {/* Cause */}
              <h5 style={{ color: "#2d6a4f", marginBottom: "10px" }}>🔎 Cause of Disease</h5>
              <p style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", lineHeight: "1.6" }}>
                {result.Cause}
              </p>

              {/* Suggestions */}
              <h5 style={{ color: "#2d6a4f", marginBottom: "10px" }}>💡 Prevention & Treatment</h5>
              <p style={{ background: "#f0f8f0", padding: "15px", borderRadius: "8px", lineHeight: "1.6", border: "1px solid #c3e6cb" }}>
                {result.Sugession}
              </p>

              {/* Alternative Diagnosis */}
              {result.AlternativeDiagnosis && result.AlternativeDiagnosis.length > 0 && (
                <>
                  <h5 style={{ color: "#2d6a4f", marginBottom: "10px", marginTop: "20px" }}>🔄 Other Possible Diagnoses for {result.Crop}</h5>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8f9fa" }}>
                        <th style={{ padding: "10px", border: "1px solid #dee2e6" }}>Disease</th>
                        <th style={{ padding: "10px", border: "1px solid #dee2e6" }}>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.AlternativeDiagnosis.map((alt, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: "10px", border: "1px solid #dee2e6" }}>{alt.Disease}</td>
                          <td style={{ padding: "10px", border: "1px solid #dee2e6" }}>{alt.Confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Health Score */}
              <div style={{
                marginTop: "25px", textAlign: "center", padding: "20px",
                background: "linear-gradient(135deg, #f8f9fa, #e9ecef)", borderRadius: "12px"
              }}>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Overall Plant Health Score</div>
                <div style={{ fontSize: "48px", fontWeight: "bold", color: result.SeverityColor }}>
                  {result.HealthScore}/100
                </div>
              </div>
            </div>
          </div>
        )}

        <br />
      </div>
    );
  }
}

export default App;
