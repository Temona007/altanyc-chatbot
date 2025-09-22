import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Trash2,
  FileText,
  Image,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'pending',
      progress: 0
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-6 h-6 text-blue-500" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
    if (fileType.includes('json')) return <FileText className="w-6 h-6 text-yellow-500" />;
    if (fileType.includes('image')) return <Image className="w-6 h-6 text-purple-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (fileItem) => {
    const formData = new FormData();
    formData.append('file', fileItem.file);

    try {
      setUploadedFiles(prev => prev.map(item => 
        item.id === fileItem.id 
          ? { ...item, status: 'uploading' }
          : item
      ));

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: progress }));
        },
      });

      setUploadedFiles(prev => prev.map(item => 
        item.id === fileItem.id 
          ? { ...item, status: 'completed', progress: 100 }
          : item
      ));

      return response.data;
    } catch (error) {
      setUploadedFiles(prev => prev.map(item => 
        item.id === fileItem.id 
          ? { ...item, status: 'error' }
          : item
      ));
      console.error('Upload error:', error);
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    const pendingFiles = uploadedFiles.filter(file => file.status === 'pending');
    
    for (const fileItem of pendingFiles) {
      await uploadFile(fileItem);
    }
    
    setIsUploading(false);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setUploadProgress({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Upload className="w-6 h-6 text-alta-navy" />
              <h1 className="text-xl font-semibold text-gray-800">Upload Documents</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {uploadedFiles.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => navigate('/chat')}
              className="btn-primary text-sm"
            >
              Go to Chat
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-alta-navy bg-alta-light-gray' 
                : 'border-gray-300 hover:border-alta-navy hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {isDragActive ? 'Drop files here' : 'Upload your documents'}
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-400">
              Supports PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, JSON files
            </p>
          </div>
        </motion.div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              {uploadedFiles.some(file => file.status === 'pending') && (
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload All'}
                </button>
              )}
            </div>

            <div className="space-y-4">
              {uploadedFiles.map((fileItem) => (
                <motion.div
                  key={fileItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getFileIcon(fileItem.file.type)}
                    <div>
                      <p className="font-medium text-gray-800">{fileItem.file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(fileItem.file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status and Progress */}
                    <div className="flex items-center space-x-2">
                      {fileItem.status === 'pending' && (
                        <span className="text-sm text-gray-500">Pending</span>
                      )}
                      {fileItem.status === 'uploading' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-alta-navy h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[fileItem.id] || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {uploadProgress[fileItem.id] || 0}%
                          </span>
                        </div>
                      )}
                      {fileItem.status === 'completed' && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm">Completed</span>
                        </div>
                      )}
                      {fileItem.status === 'error' && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">Error</span>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Supported File Types:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF documents (.pdf)</li>
                <li>• Word documents (.doc, .docx)</li>
                <li>• Excel spreadsheets (.xls, .xlsx)</li>
                <li>• Text files (.txt)</li>
                <li>• CSV files (.csv)</li>
                <li>• JSON files (.json)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Processing Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic text extraction</li>
                <li>• Vector embedding generation</li>
                <li>• Semantic search indexing</li>
                <li>• Real-time processing</li>
                <li>• Multi-language support</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FileUpload;
