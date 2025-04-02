import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const RepoDisplay = () => {
  const { unitName } = useParams(); 
  const [notes, setNotes] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found. User might not be authenticated.");
          return;
        }

        const response = await fetch(`http://10.1.33.99:3001/notes/${unitName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          throw new Error(` Failed to fetch notes. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(" API Response Data:", data);

        if (data && Array.isArray(data) && data.length > 0) {
          setNotes(data[0]?.filePath || []); 
          setName(data[0]?.unit || "");
        } else {
          console.warn(" No notes found for this unit.");
          setError("No notes available for this unit.");
        }
      } catch (err) {
        console.error(" Error fetching notes:", err);
        setError("Unable to fetch notes for this unit.");
      }
    };

    fetchNotes();
  }, [unitName]);

  const handleDownload = async (unit, filePath) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error(" No token found. User might not be authenticated.");
        return;
      }

      const encodedUnitName = encodeURIComponent(unit);
      const encodedFileName = encodeURIComponent(filePath.split("/").pop());
      const url = `http://10.1.33.99:3001/download/${encodedUnitName}/${encodedFileName}`;     

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(` Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filePath.split("/").pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "20px", marginBottom: "10px", color: "#333", textAlign: "left" }}>
        Materials for {name} ({unitName})
      </h1>
      {error && <p style={{ color: "red", marginBottom: "10px", textAlign: "left" }}>{error}</p>}
      <ul style={{ listStyleType: "none", padding: 0, margin: 0, textAlign: "left" }}>
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <li key={index} style={{ marginBottom: "10px", display: "block" }}>
              <button
                onClick={() => handleDownload(note.unitName, note.filePath)}
                style={{
                  textDecoration: "none",
                  color: "#007BFF",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  textAlign: "left",
                  display: "block",
                }}
              >
                {note.unitName} 
              </button>
            </li>
          ))
        ) : (
          <p style={{ color: "#555", fontSize: "14px", textAlign: "left" }}>No notes available for this unit.</p>
        )}
      </ul>
    </div>
  );
};

export default RepoDisplay;
