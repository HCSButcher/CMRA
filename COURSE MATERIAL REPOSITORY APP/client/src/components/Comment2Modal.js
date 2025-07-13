import React from 'react'
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

const Comment2Modal = () => {
    const [comments, setComments] = useState([]);

    //comments fetch
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://project-2-1u71.onrender.com/comments', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (Array.isArray(response.data)) {
                    setComments(response.data);
                } else {
                    console.error('Unexpected response format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching comments', error);
            }
        };
        fetchComments();
    }, []);

    //handle comment delete
    const commentDelete = (id) => {
        axios.delete(`http://10.1.33.9910.1.33.99:3001/comments/${id}`)
            .then(() => {
            setComments(comments.filter(comment =>comment._id !==id ))
            })
        .catch(error => console.error('Error deleting comments',error))
    }

  return (
      <div>
          <style>
              {`
                body {
       background-color: #080710;
        }
        form {
        align-items:center;
           background-color: rgba(255, 255, 255, 0.13);
           justify-content:center;
           width:70%, auto;
           margin-top:20px;
          }
        h1, h2 {
        margin-top: 80px;
    color: #f1f1f1;

    }
    table {    
    width:100%;
    border-collapse: collapse;
    text-align: center;
   
    }
    th, td{
    border: 1px solid white;
    text-align:left;
    padding: 15px;
    
    }
              `}
          </style>

         <h2>Comments</h2>
          <form>
              <table>
                  <thead>
                      <tr>
                          <th>Unit</th>
                          <th>Comment</th>
                          <th>Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      {comments && comments.length > 0 ? (
                          comments.map((comment) => (
                              <tr key={comment._id} >
                                  <td> {comment.unit} </td>
                                  <td> {comment.comments}</td>
                                  <td>
                                      <ul>
                                          <li className='btn' onClick={() =>commentDelete(comment._id)} >Delete</li>
                                      </ul>
                                  </td>                                  
                              </tr>
                          ))
                      ) : (
                              <tr>
                                  <td colSpan={'3'} >No Comments available</td>
                              </tr>
                      )}
                  </tbody>
              </table>
          </form>
      
    </div>
  )
}

export default Comment2Modal
