import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router'
import leftImage from './left-image.png';  // Replace with your image path
import rightImage from './right-image.png'; // Replace with your image path


function UpdateUser() {

    const [inputs, setInputs] = useState({});
    const history = useNavigate();
    const id = useParams().id;

    useEffect(() => {
        const fetchHandler = async () => {
            await axios
                .get(`http://localhost:5000/users/${id}`)
                .then((res) => res.data)
                .then((data) => setInputs(data.user));
        };
        fetchHandler();
    }, [id]);

    const sendRequest = async () => {
        await axios.put(`http://localhost:5000/users/update/${id}`, {
            name: String(inputs.name),
            gmail: String(inputs.gmail),
            qty: Number(inputs.qty),
            food: String(inputs.food)
        })
            .then((res) => res.data);
    }

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(inputs);
        sendRequest().then(() => history('/get'));
        alert("Order Update")
    }

    return (
       <div className="main-container">
            {/* Left Side Image */}
            <div className="left-side">
                <img src={leftImage} alt="Left Side Image" className="side-image" />
              </div>
            <div className="form-container">
              
      
              {/* Middle Form */}
              <div className="form-middle"><br></br>
                <h2 className="form-title">Update Your Order</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" name="name" onChange={handleChange} value={inputs.name} placeholder="Enter your name" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="gmail" className="form-label">Email Address</label>
                    <input type="email" className="form-control" id="gmail" name="gmail" onChange={handleChange} value={inputs.gmail} placeholder="Enter your email" />
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                  </div>
      
      
                  <div className="mb-3">
                    <label htmlFor="food" className="form-label">Food Item</label>
                    <input type="text" className="form-control" id="food" name="food" onChange={handleChange} value={inputs.food} placeholder="Enter food item" />
                  </div>
      
                  
                  <div className="mb-3">
                    <label htmlFor="qty" className="form-label">Quantity</label>
                    <input type="number" className="form-control" id="qty" name="qty" onChange={handleChange} value={inputs.qty} placeholder="Enter quantity" />
                  </div>
      
                  <button type="submit" className="btn btn-primary submit-btn">Submit</button>
                </form>
              </div>
      
              {/* Right Side Image */}
             
            </div>
            <div className="right-side">
                <img src={rightImage} alt="Right Side Image" className="side-image" />
              </div>
          </div>
    )
}

export default UpdateUser