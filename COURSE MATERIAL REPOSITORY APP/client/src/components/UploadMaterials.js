import './UploadMaterials.css';
import { useState } from "react";
import axios from 'axios';

const UploadMaterials = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [unit, setUnit] = useState('');
    const [unitName, setUnitName] = useState('');
    const [uploadDate, setUploadDate] = useState('');
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState(''); 

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors([]);  // Clear any previous errors

        // Check if a file is selected
        if (!file) {
            setErrors([{ msg: 'Please select a file to upload' }]);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', email);
        formData.append('name', name);
        formData.append('unit', unit);
        formData.append('unitName', unitName);
        formData.append('uploadDate', uploadDate);

        axios.post('http://10.1.33.99:3001/upload', formData)
            .then(result => {
                console.log(result);
                setSuccessMessage('File uploaded successfully!'); 
                
                setName('');
                setEmail('');
                setUnit('');
                setUnitName('');
                setUploadDate('');
                setFile(null);
                setErrors([]); 
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    const errorMessages = err.response.data.errors || [{ msg: 'Upload failed' }];
                    setErrors(errorMessages);
                } else {
                    setErrors([{ msg: 'Upload failed' }]);
                    console.error('Error: ', err);
                }
            });
    };

    return (
        <div>
            <style>
                {`
                    body {
                        background-color: #080710;
                    }
                         h2{
    font-weight: 500;
    line-height: 40px;
    text-align: center;
    margin-top: -53px;
  }
    label {
    font-weight: 500;
    line-height: 20px;
    text-align: left;
    margin-top: 0px;
    }
                    form {
                        height: 600px;
                        width: 320px;
                        background-color: rgba(255, 255, 255, 0.13);
                        position: absolute;
                        transform: translate(-50%, -50%);
                        top:50%;
                        left: 50%;
                        border-radius: 10px;
                        backdrop-filter: blur(10px);
                        border: 2px solid rgba(255, 255, 255, 0.1);
                        box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
                        padding: 50px 35px;
                    }
                `}
            </style>
            <div className="background-1">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>
            <form onSubmit={handleSubmit}>
                <h2>Upload Materials</h2>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Enter your name of the unit"
                        autoComplete="off"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter email"
                        autoComplete="off"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <label htmlFor="unit">Unit</label>
                    <input
                        type="text"
                        id="unit"
                        placeholder="Enter Unit"
                        autoComplete="off"
                        name="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                    />
                    
                    <label htmlFor="unitName">File Name</label>
                    <input
                        type="text"
                        id="unitName"
                        placeholder="Enter name of file"
                        autoComplete="off"
                        name="unitName"
                        value={unitName}
                        onChange={(e) => setUnitName(e.target.value)}
                    />
                    
                    <label htmlFor="uploadDate">Upload Date</label>
                    <input
                        type="date"
                        id="uploadDate"
                        autoComplete="off"
                        name="uploadDate"
                        value={uploadDate}
                        onChange={(e) => setUploadDate(e.target.value)}
                    />
                    
                    <label htmlFor="file">File</label>
                    <input
                        type="file"
                        id="file"
                        accept='.pdf, .png, .jpg, .mp4'
                        autoComplete="off"
                        className='file'
                        name="file"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>
                <button type="submit">Upload</button>
            </form>

            {/* Display Errors */}
            {errors.length > 0 && (
                <ul>
                    {errors.map((error, index) => (
                        <li key={index} style={{ color: 'red' }}>{error.msg}</li>
                    ))}
                </ul>
            )}

            {/* Display Success Message */}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
    );
};

export default UploadMaterials;
