import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { FaUpload, FaFilePdf } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState([]);
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select a resume first!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log(data);

      toast.success(data.message);

      setResumeText(data.text);
      setSkills(data.skills);
      setScore(data.score);
      setSuggestions(data.suggestions);
      setSummary(data.summary);
      fetchHistory();

      setLoading(false);


    } catch (error) {
      console.log(error);

      setLoading(false);

      toast.error("Upload failed!");
    }
  };

  const fetchHistory = async () => {
  try {
    const response = await fetch("http://localhost:5000/history");
    const data = await response.json();

    setHistory(data);
  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  fetchHistory();
}, []);
const deleteResume = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/history/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    toast.success(data.message);

    fetchHistory();
  } catch (error) {
    console.log(error);

    toast.error("Delete failed!");
  }
};

  const generatePDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("AI Resume Analyzer Report", 20, 20);

  doc.setFontSize(14);
  doc.text(`Resume Score: ${score}/100`, 20, 40);

  doc.text("Skills Found:", 20, 55);

  let y = 65;

  skills.forEach((skill) => {
    doc.text("- " + skill, 25, y);
    y += 10;
  });

  y += 5;
  doc.text("Suggestions:", 20, y);
  y += 10;

  suggestions.forEach((item) => {
    doc.text("- " + item, 25, y);
    y += 10;
  });
  
  y += 10;
doc.text("AI Feedback:", 20, y);
y += 10;

const splitSummary = doc.splitTextToSize(summary, 170);
doc.text(splitSummary, 20, y);

  doc.save("Resume_Report.pdf");
};

  return (
  <div className="app">
    <div className="container">

      <header className="header">
  <h1>🤖 AI Resume Analyzer</h1>
  <p>Upload your resume and get AI-powered analysis instantly.</p>
</header>

      <div className="upload-box">
  <input
    type="file"
    accept=".pdf,.doc,.docx"
    onChange={handleFileChange}
  />
  <p>📄 Upload your Resume (PDF/DOC/DOCX)</p>
</div>

      <br />
      <br />

      
  <button
  onClick={handleUpload}
  disabled={loading}
  style={{
    padding: "12px 25px",
    background: "#0d6efd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: loading ? "not-allowed" : "pointer",
    fontSize: "16px",
  }}
>
  <FaUpload style={{ marginRight: "8px" }} />

  {loading ? "Analyzing Resume..." : "Upload Resume"}
</button>

      <br />
<br />

<button
  onClick={generatePDF}
  style={{
    padding: "12px 25px",
    background: "green",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
    fontSize: "16px",
  }}
>
  <FaFilePdf style={{ marginRight: "8px" }} />
  Download Report
</button>

      {file && (
        <div>
          <h3>Selected Resume:</h3>
          <p>{file.name}</p>
        </div>
      )}

      {resumeText && (
        <div style={{ marginTop: "30px" }}>
          <h2>Resume Content</h2>

          <textarea
            rows="15"
            cols="40"
            value={resumeText}
            readOnly
          />

          <div style={{ marginTop: "20px" }}>
            <div className="score-card">
  <h2>🎯 Resume Score</h2>
  <h1>{score}/100</h1>
</div>
            <div
  style={{
    width: "300px",
    height: "20px",
    backgroundColor: "#ddd",
    margin: "10px auto",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
  <div
    style={{
      width: `${score}%`,
      height: "100%",
      backgroundColor:
        score >= 80 ? "green" : score >= 50 ? "orange" : "red",
    }}
  ></div>
</div>

            <h3>Skills Found</h3>

            <div>
  {skills.map((skill, index) => (
    <span key={index} className="skill-badge">
      {skill}
    </span>
  ))}
</div>

          </div>
         {suggestions.length > 0 && (
  <div className="card">
    <h2>💡 Suggestions</h2>

    <ul style={{ listStyle: "none", padding: 0 }}>
      {suggestions.map((item, index) => (
        <li key={index}>✅ {item}</li>
      ))}
    </ul>
  </div>
)}

{summary && (
  <div className="card">
    <h2>🤖 AI Resume Feedback</h2>
    <p>{summary}</p>
  </div>
)}

                </div>
      )}

      {history.length > 0 && (
  <div
    style={{
      marginTop: "40px",
      textAlign: "left",
    }}
  >
    <h2>📜 Previous Resume Reports</h2>
    <input
  type="text"
  placeholder="🔍 Search by Skill..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="search-box"
/>

    {history
  .filter((item) =>
    item.skills.join(" ").toLowerCase().includes(search.toLowerCase())
  )
  .map((item) => (
      <div
        key={item._id}
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "15px",
          marginTop: "15px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Resume Score : {item.score}/100</h3>

        <p>
          <strong>Skills :</strong>{" "}
          {item.skills.join(", ")}
        </p>

        <p>
          <strong>AI Feedback :</strong>{" "}
          {item.summary}
        </p>

        <small>
          {new Date(item.createdAt).toLocaleString()}
        </small>
        <button
  onClick={() => deleteResume(item._id)}
  style={{
    marginTop: "10px",
    padding: "8px 15px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  🗑 Delete
</button>
      </div>
    ))}
  </div>
)}

          <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </div>
);
}

export default App;