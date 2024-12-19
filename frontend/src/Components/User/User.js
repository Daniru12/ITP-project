import React ,{useState,useEffect} from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './user.css'



function User(props) {

    const {_id,name,gmail,qty,food} = props.user;

    const history = useNavigate();

    const deleteHandeler = async () => {
        await axios.delete(`http://localhost:5000/users/delete/${_id}`)
        .then(res=>res.data)
        .then(()=>history("/get"));
        alert("Order Deleted")
    }



  return (
    <div className="user-details-card">
  <h1>ID: <span>{_id}</span></h1>
  <h1>Name: <span>{name}</span></h1>
  <h1>Gmail: <span>{gmail}</span></h1>
  <h1>Meal Type: <span>{food}</span></h1>
  <h1>Qty: <span>{qty}</span></h1>
  

  
  <div className="action-buttons">
    <Link to={`/get/${_id}`} className="update-btn">
      Update
    </Link>
    <button onClick={deleteHandeler} className="delete-btn">
      Delete
    </button>
  </div>
</div>


  )
}

export default User