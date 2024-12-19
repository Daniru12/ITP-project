import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './send.css';
import PdfCom from './pdfCom'; // Ensure proper import of the component
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function SendPdf() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [allpdf, setAllPdf] = useState([]);
  const [pdfile, setPdfFile] = useState(null);

  // Fetch PDF files on component mount
  useEffect(() => {
    getPdfFiles();
  }, []);

  const getPdfFiles = async () => {
    try {
      const result = await axios.get('http://localhost:5000/getFiles');
      setAllPdf(result.data.data || []);
    } catch (error) {
      console.error('Error fetching PDF files:', error.message);
      alert('Failed to fetch PDF files. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !file) {
      alert('Title and file are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const result = await axios.post('http://localhost:5000/uploadfile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (result.data.status === 'success') {
        alert('Upload successful');
        setTitle('');
        setFile(null);
        getPdfFiles(); // Refresh the list
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error.message);
      alert('Error uploading the file. Please try again.');
    }
  };

  const showPdf = (pdf) => {
    setPdfFile(`http://localhost:5000/files/pdfs/${pdf}`);
  };

  return (
    <div className="pdf-container">
      {/* Left Side - Send PDF Form */}
      <div className="pdf-form-container">
        <h1>🍔
        Upload Report 🍔
        </h1>
        <form onSubmit={handleSubmit} className="pdf-form" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="title">Enter Report Name</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter...."
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pdf-upload">Upload Food Report</label>
            <input
              type="file"
              id="pdf-upload"
              name="pdf-file"
              accept="application/pdf"
              required
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button type="submit" className="send-btn">Upload</button>
        </form>
  
        {/* Show PDF Section */}
        {pdfile && (
          <div className="show-pdf-section">
            <h2>Viewing PDF</h2>
            <PdfCom pdfile={pdfile} />
          </div>
        )}
  
        {/* Image Section */}
        <div className="image-section">
          <img
            src="https://via.placeholder.com/600x400" // Replace with your image URL
            alt="Illustration or Concept"
          />
        </div>
      </div>
  
      {/* Right Side - Uploaded PDFs */}
      <div className="pdf-list-container">
        <div className="pdf-list">
          <h2>🥙 FOOD REPORTS 🥙</h2>
          {allpdf.length === 0 ? (
            <p>No PDF files uploaded yet.</p>
          ) : (
            allpdf.map((data) => (
              <div key={data._id} className="pdf-item">
                <h3>Report Name : {data.title}</h3>
                <button onClick={() => showPdf(data.pdf)}>Show Report</button>
                <a
                  href={`http://localhost:5000/files/pdfs/${data.pdf}`}
                  download
                  className="download-btn"
                >
                  Download Report
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
  
}

export default SendPdf;
