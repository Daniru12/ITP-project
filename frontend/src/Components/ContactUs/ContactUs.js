
import './conus.css';
import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import leftImage from './left-photo.png';
import rightImage from './right-photo.png';


function ContactUs() {

  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('service_nys1lco', 'template_jsa5kzc', form.current, {
        publicKey: 'DrGs-Uf9ZY2R0aReJ',
      })
      .then(
        () => {
          console.log('SUCCESS!');
          alert("Succsess");
        },
        (error) => {
          console.log('FAILED...', error.text);
          alert("Unsuccsess");
        },
      );
  };

  return (
    <div class="contact-container">
      <h1>Contact Us</h1>
      <img src={leftImage} alt="Left Decorative" class="left-photo" />
      <img src={rightImage} alt="Right Decorative" class="right-photo" />
      <form action="#" method="post" class="contact-form" ref={form} onSubmit={sendEmail}>
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="user_name" placeholder="Enter your name" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="user_email" placeholder="Enter your email" required />
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="4" placeholder="Write your message" required></textarea>
        </div>

        <button type="submit" class="submit-btn" >Submit</button>
      </form>
    </div>
  )
}

export default ContactUs