import React, { useEffect, useState } from "react";
import axios from "axios";
import UploadModal from './UploadMaterials'

const ViewModal = () => {
  const [units, setUnits] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(true); // Track visibility of the first modal

  const openUploadModal = () => {
    setShowViewModal(false); // Close the first modal
    setShowUploadModal(true); // Open the second modal
  };

  const closeUploadModal = () => {
    setShowUploadModal(false); // Close the second modal
    setShowViewModal(true); // Reopen the first modal
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/materials")
      .then((response) => {
        setUnits(response.data);
      })
      .catch((error) => {
        console.log("Error fetching materials:", error);
      });
  }, []);

  return (
    <div>
      <style>
        {`
          body {
            background-color: #080710;
            color: white;
            font-family: Arial, sans-serif;
          }
          .background {
            width: 430px;
            height: 520px;
            position: absolute;
            transform: translate(-50%,-50%);
            left: 50%;
            top: 50%;
          }
          .background .shape {
            height: 200px;
            width: 200px;
            position: absolute;
            border-radius: 50%;
          }
          .shape:first-child {
            background: linear-gradient(#1845ad, #23a2f6);
            left: -130px;
            top: -0px;
          }
          .shape:last-child {
            background: linear-gradient(to right, #ff512f, #f09819);
            right: -80px;
            bottom: -50px;
          }
          form {
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          table {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
          }
          th, td {
            padding: 10px;
            border: 1px solid white;
            text-align: center;
          }
          .modal-1, .modal-2 {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #1c1c1c;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
            color: white;
            z-index: 1000; /* Ensure it appears above other elements */
            width: 400px;
            position: relative;
          }
          .modal-content {
            width: 100%;
            height: auto;
          }
          .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999; /* Overlay sits behind the modal */
          }
          .close {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
            color: white;
            z-index: 1001; /* Ensure it's above the modal */
          }
          .close:hover {
            color: red;
          }
        `}
      </style>
      {showViewModal && (
        <div className="background">
          <div className="shape"></div>
          <div className="shape"></div>
        </div>
      )}
      {showViewModal && (
        <form>
          <h2>Recent Uploads</h2>
          <table>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Unit Name</th>
                <th>Option</th>
              </tr>
            </thead>
            <tbody>
              {units.length > 0 ? (
                units.map((unit) => (
                  <tr key={unit._id}>
                    <td>{unit.unit}</td>
                    <td>{unit.name}</td>
                    <td>
                      <button className="btn" type="button" onClick={openUploadModal}>
                        Add
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No materials available</td>
                </tr>
              )}
            </tbody>
          </table>
        </form>
      )}
      {showUploadModal && (
        <>
          <div className="overlay"></div> {/* Dim the background */}
          <div className="modal-1">
            <span className="close" onClick={closeUploadModal}>
              &times;
            </span>
            <div className="modal-content">
              <UploadModal CloseModal={closeUploadModal} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewModal;
