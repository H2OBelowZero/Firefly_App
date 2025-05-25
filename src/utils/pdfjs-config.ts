import { pdfjs } from 'react-pdf';

// Set up PDF.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  const workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).toString();
  
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
}

export default pdfjs; 