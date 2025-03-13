import React from 'react'
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

const Comment2Modal = () => {
    const [comments, setComments] = useState([]);

    //comments fetch
    useEffect(() => {
        axios.get('http://localhost:3001/comments')
            .then(response => {
                setComments(response.data);
            })
            .catch(error => {
                console.error('Error fetching data', error)
            })
    }, []);

    //handle comment delete
    const commentDelete = (id) => {
        axios.delete(`http://localhost:3001/comments/${id}`)
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
           background-color: rgba(255, 255, 255, 0.13);
          }
        h1, h2 {
    color: #444

    }
    table {
    padding :10px;
    }
    th, td{
    text-align:center;
    padding: 8px;
    }
              `}
          </style>

          <form>
              <h2>Comments</h2>
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
