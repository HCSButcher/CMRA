import axios from 'axios'
import { useState } from 'react'

const CommentModal = () => {
    const [unit, setUnit] =useState('');
    const [comments, setComments] =useState('')
    const [errors, setErrors] = useState('')
    
    const handleSubmit = (e) => {
            e.preventDefault();
            axios.post('http://localhost:3001/comments', {unit, comments})
            .then (result => {
                console.log(result)
            })
            .catch (err => {
                if (err.response) {
                    setErrors(err.response.data.errors)
                } else {
                    console.error('Error:', err);
                }
            });
        }

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
                        height: 400px;
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
                 <label htmlFor="Comment">Comment</label>
                    <textarea  
                        rows='4'
                        cols='40'                                        
                        id="comments"
                        placeholder="Enter comment"
                        autoComplete="off"
                        name="comments"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    /> 
                    <button  type='submit' >Send</button>
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

export default CommentModal
