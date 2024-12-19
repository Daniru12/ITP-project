<<<<<<< Updated upstream
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import About from './components/About';
import Contact from './components/Contact';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Routes>
          <Route path="/" element={<><Hero /><FeaturedProducts /><Newsletter /></>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
=======


import './App.css';
import Home from './Components/Home/Home';
import Nav from './Components/Nav/Nav';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserDetails from './Components/UserDetails/UserDetails';
import Adduser from './Components/Adduser/Adduser';
import AboutUs from './Components/AboutUs/AboutUs';
import UpdateUser from './Components/UpdateUser/UpdateUser';
import Register from './Components/Register/Register';
import Login from './Components/Login/Login';
import ContactUs from './Components/ContactUs/ContactUs';
import SendPdf from './Components/SendPdf/SendPdf';
import imgUploader from './Components/imgUploader/imgUploader';
import FoodList from './Components/FoodList/FoodList';


function App() {
  return (

    <div className="App">
      <Nav />
      <Routes>
        <Route path="/" exact Component={Home} />
        <Route path="/mainhome" exact Component={Home} />
        <Route path="/add" exact Component={Adduser} />
        <Route path="/get" exact Component={UserDetails} />
        <Route path="/get/:id" exact Component={UpdateUser} />
        <Route path="/about" exact Component={AboutUs} />
        <Route path="/reg" exact Component={Register} />
        <Route path="/log" exact Component={Login} />
        <Route path="/con" exact Component={ContactUs} />
        <Route path="/sendpdf" exact Component={SendPdf} />
        <Route path="/img" exact Component={imgUploader} />
        <Route path="/food" exact Component={FoodList} />
      </Routes>
    </div>

  );
}

export default App;
>>>>>>> Stashed changes
