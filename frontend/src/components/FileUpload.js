import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      console.log('📤 Uploading file:', selectedFile.name);
      
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Upload response:', response.data);

      if (response.data.success) {
        setUploadStatus(`✅ File "${selectedFile.name}" uploaded successfully! It's now available for chat queries.`);
        setSelectedFile(null);
        // Reset file input
        document.getElementById('fileInput').value = '';
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadStatus(`❌ Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h3>Upload Real Estate Documents</h3>
      <p>Upload PDF, Word, Excel, or text files to add them to the knowledge base.</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          style={{ marginBottom: '1rem' }}
        />
      </div>

      {selectedFile && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '6px' }}>
          <strong>Selected file:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </div>
      )}

      <button 
        className="btn" 
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>

      {uploadStatus && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          borderRadius: '6px',
          backgroundColor: uploadStatus.includes('✅') ? '#e8f5e8' : uploadStatus.includes('❌') ? '#ffebee' : '#fff3e0',
          color: uploadStatus.includes('✅') ? '#2e7d32' : uploadStatus.includes('❌') ? '#d32f2f' : '#f57c00'
        }}>
          {uploadStatus}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <h4>Supported File Types:</h4>
        <ul>
          <li>📄 PDF documents</li>
          <li>📝 Word documents (.doc, .docx)</li>
          <li>📊 Excel spreadsheets (.xls, .xlsx)</li>
          <li>📋 Text files (.txt)</li>
          <li>📈 CSV files</li>
        </ul>
        <p><strong>Note:</strong> Files are processed and indexed for AI search. Large files may take a few moments to process.</p>
      </div>
    </div>
  );
};

export default FileUpload;


