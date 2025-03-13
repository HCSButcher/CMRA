import { useState } from "react"
import axios from 'axios'
const AnnouncementModal = () => {
    const [unit, setUnit] = useState('')
    const [date, setDate] = useState('')
    const [announcements, setAnnouncements]= useState('')
    const [errors, setErrors]= useState([]);

    const handleSubmit = (e) =>{
        e.preventDefault();             
        axios.post ('http://localhost:3001/announcements', {unit, date, announcements})
        .then (result =>{
            console.log(result);
          
        })
        .catch (err =>{
            if(err.response ) {                
                setErrors(err.response.data.errors);
            } else {               
                console.error('Error:', err);
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
                        textarea{
                        background-color: rgba(255, 255, 255, 0.13);

                        }
                    form {
                        height: 500px;
                        width: 360px;
                        background-color: rgba(255, 255, 255, 0.13);
                        position: absolute;
                        transform: translate(-50%, -50%);
                        top: 40%;
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
                <h2>Announcements</h2>
                <div className="form-group">
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
                <label htmlFor="uploadDate">Date</label>
                    <input
                        type="date"
                        id="date"
                        autoComplete="off"
                        name="uploadDate"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    <label htmlFor="unit">Announcement</label>
                    <textarea  
                        rows='4'
                        cols='40'                                        
                        id="announcements"
                        placeholder="Enter announcement"
                        autoComplete="off"
                        name="announcements"
                        value={announcements}
                        onChange={(e) => setAnnouncements(e.target.value)}
                    />                     
                </div>
                <button type="submit"> Send</button>
            </form>
            {errors.length > 0 && (
                <ul>
                    {errors.map((error, index) => (
                        <li key={index} style={{color: 'red'}}>{error.msg}  </li>
                    ))}
                </ul>
            )}           
    </div>
  )
}

export default AnnouncementModal
