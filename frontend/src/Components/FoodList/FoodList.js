import React from 'react'
import './food.css'
import Chicken from './chiken.jpg';
import hotdog from './hotdog.jpg';
import Fries from './Fries.jpg'
import Wraps from './Wraps.jpg'
import Pizza from './Pizza.jpg'
import ChickenSandwiches from './ChickenSandwiches.jpg'
import Tacos from './Tacos.jpg'
import Burger1 from './Burger1.jpg'
import { Link } from "react-router-dom";

function FoodList() {
    return (
        <div>
            <div class="container">
                <header>
                    <h1>Kegalle Brunch <span>45%</span></h1>
                    <div class="hy">
                        <h2>Special Offers</h2>
                        <p>Check out our latest discounts and promotions!</p>
                    </div>

                </header>
                <section class="menu">
                    <div class="item">
                        <img src={Chicken} alt="Pokemon Don Biryani" />
                        <h2>Chicken Nuggets</h2>
                        <p>10 pieces Serving</p>
                        <p class="price">Rs. 4,250</p>
                        <button className='logo-link'><Link to="/add">Order</Link></button>
                    </div>
                    <div class="item">
                        <img src={hotdog} alt="Professional Chicken Biryani" />
                        <h2>Hot Dogs</h2>
                        <p>1 hot dog Serving</p>
                        <p class="price">Rs. 1,200</p>
                        <button className='logo-link'><Link to="/add">Order</Link></button>
                    </div>

                    <div class="item">
                        <img src={Fries} alt="Pokemon Don Biryani" />
                        <h2>Fries</h2>
                        <p>Medium (about 4-5 oz) Serving</p>
                        <p class="price">Rs. 650</p>
                        <button className='logo-link'><Link to="/add">Order</Link></button>
                    </div>

                    <div class="item">
                        <img src={Wraps} alt="Pokemon Don Biryani" />
                        <h2>Wraps</h2>
                        <p>1 wrap Serving</p>
                        <p class="price">Rs. 2,250</p>
                        <button className='logo-link'><Link to="/add">Order</Link></button>
                    </div>
                </section>
            </div>
            <br></br>
            <div class="container">
                <header >
                    <h1>Kandy Brunch <span>25%</span></h1>
                </header>
                <section class="menu">
                    <div class="item">
                        <img src={Burger1} alt="Pokemon Don Biryani" />
                        <h2>Burger</h2>
                        <p>1 burger Serving</p>
                        <p class="price">Rs. 1,850</p>
                        <button className='logo-link'><Link to="/add">Order</Link></button>
                    </div>
                    <div class="item">
                        <img src={Pizza} alt="Pokemon Don Biryani" />
                        <h2>Pizza</h2>
                        <p>8 slices for a standard large pizza</p>
                        <p class="price">Rs 3,250</p>
                        <button className='logo-link'><Link to="/add">Order</Link></button>
                    </div>

                    <div class="item">
                        <img src={ChickenSandwiches} alt="Pokemon Don Biryani" />
                        <h2>Chicken Sandwiches</h2>
                        <p>1 sandwich Serving</p>
                        <p class="price">Rs. 1,200</p>
                        <button className='logo-link'><Link to="/add">Order</Link></button>
                    </div>

                    <div class="item">
                        <img src={Tacos} alt="Professional Chicken Biryani" />
                        <h2>Tacos</h2>
                        <p>3 tacos Serving</p>
                        <p class="price">Rs. 600</p>
                        <button className='logo-link'><Link to="/add">Order</Link></button>
                    </div>

                </section>
            </div>
        </div>
    )
}

export default FoodList