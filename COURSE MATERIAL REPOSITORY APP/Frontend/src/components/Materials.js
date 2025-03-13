import { useState, useEffect } from "react";
import './Materials.css';
import axios from 'axios';

const Materials = () => { 
   const [materials, setMaterials] = useState([]);

   useEffect(() => {
       axios.get('http://localhost:3001/materials')
       .then(response => {
           setMaterials(response.data);
       })
       .catch(error => {
           console.error('Error fetching materials:', error);        
       });               
   }, []);
    
   return (
       <div className="file-details">
           <style>
               {`
               .file-details {
                   background-color: rgba(255, 255, 255, 0.1);
                   border-radius: 5px;
                   padding: 15px;
                   margin-top: 20px;
                   color: white; 
               }
               
               .file-details p, .file-details h2 {
                   background-color: rgba(0, 0, 0, 0.8);
                   color: white;
                   padding: 5px;
                   border-radius: 5px;
               }

               .file-link {
                   display: inline-block;
                   padding: 10px;
                   margin: 5px 0;
                   background-color: #fff;
                   color: #000;
                   border-radius: 5px;
                   text-decoration: none;
                   transition: background-color 0.3s ease;
               }

               .file-link:hover {
                   background-color: #ddd;
               }

               .file-link img {
                   width: 16px;
                   height: 16px;
                   vertical-align: middle;
                   margin-right: 5px;
               }
               `}
           </style>

           <h2> Uploaded Materials </h2>
           <ul>
               {materials.map((material) => (
                   <li key={material._id}>
                       <p>Name: {material.name}</p>
                       <p>Unit: {material.unit}</p>
                       <p>Unit Name: {material.unitName}</p>
                       <p>Upload Date: {new Date(material.uploadDate).toLocaleDateString()}</p>
                       <p>
                           File Path: 
                           <a 
                               href={`http://localhost:3001/download/${material._id}`} 
                               className="file-link"
                               target="_blank" 
                               rel="noopener noreferrer"
                           > 
                               <img src="http://localhost:3000/pdf.png" alt="PDF Icon" />
                               {material.filePath.split('/').pop()}
                           </a>
                       </p>
                   </li>
               ))}
           </ul>
       </div>
   );
};

export default Materials;
