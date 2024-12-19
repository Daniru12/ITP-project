import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';

function PdfCom({ pdfile }) { // Destructure props
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div>
      {pdfile ? ( // Use pdfile directly
        <Document
          file={pdfile}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
            <Page
              key={page}
              pageNumber={page}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      ) : (
        <p>PDF File Not Available</p>
      )}
      <p>
        Page {pageNumber} of {numPages}
      </p>
    </div>
  );
}

export default PdfCom;
