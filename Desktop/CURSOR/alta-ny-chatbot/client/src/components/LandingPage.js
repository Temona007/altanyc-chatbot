import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  Upload, 
  Search, 
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8 text-alta-navy" />,
      title: "AI Chat Assistant",
      description: "Get instant answers about NYC real estate, properties, and market trends"
    },
    {
      icon: <Upload className="w-8 h-8 text-alta-navy" />,
      title: "Document Upload",
      description: "Upload property documents, contracts, and files for AI analysis"
    },
    {
      icon: <Search className="w-8 h-8 text-alta-navy" />,
      title: "Property Search",
      description: "Search through uploaded property listings and real estate data"
    },
    {
      icon: <Home className="w-8 h-8 text-alta-navy" />,
      title: "Central Park Properties",
      description: "Access curated Central Park area property listings and data"
    }
  ];

  const stats = [
    { number: "1000+", label: "Properties in Database" },
    { number: "24/7", label: "AI Assistant" },
    { number: "JSON", label: "File Support" },
    { number: "Real-time", label: "Property Updates" }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="https://res.cloudinary.com/luxuryp/images/w_960,c_limit,f_auto,q_auto/olp8z6j3v8n4kmoqh5sb/logo-horizontal-white-and-blue-1"
                alt="Alta New York Logo"
                className="h-10 w-auto"
              />
            </motion.div>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/upload')}
                className="btn-outline"
              >
                Upload Files
              </button>
              <button 
                onClick={() => navigate('/chat')}
                className="btn-primary"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-alta-charcoal mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Alta New York AI Assistant
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Chat with our AI assistant about NYC real estate, upload property documents, 
              and search through our comprehensive property database.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button 
                onClick={() => navigate('/chat')}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Start Chatting</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/upload')}
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Documents</span>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-alta-navy mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-alta-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl font-bold text-alta-charcoal mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              What Our AI Assistant Can Do
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Powerful AI tools to help you with NYC real estate research and property analysis
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="card hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-alta-charcoal ml-3">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About App Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-alta-charcoal mb-6">
                About This AI Assistant
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our AI-powered assistant is designed to help you navigate NYC real estate with ease. 
                Upload property documents, ask questions about neighborhoods, and get instant insights 
                from our comprehensive property database.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                The assistant can process various file formats including PDF, Word, Excel, and JSON files, 
                making it easy to analyze property listings, contracts, and market data. Get started by 
                chatting with our AI or uploading your first document.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-alta-navy" />
                  <span className="text-gray-600">AI Chat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-alta-navy" />
                  <span className="text-gray-600">File Upload</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-alta-navy" />
                  <span className="text-gray-600">Property Search</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-alta-navy to-alta-gold rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Supported Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5" />
                    <span>Real-time Chat</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Upload className="w-5 h-5" />
                    <span>Document Analysis</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Home className="w-5 h-5" />
                    <span>Property Database</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Search className="w-5 h-5" />
                    <span>Smart Search</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-alta-navy to-alta-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Try Our AI Assistant?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start chatting with our AI assistant or upload your first property document to get started.
            </p>
            <button 
              onClick={() => navigate('/chat')}
              className="bg-white text-alta-navy hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Start Your First Chat</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-alta-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="https://res.cloudinary.com/luxuryp/images/w_960,c_limit,f_auto,q_auto/olp8z6j3v8n4kmoqh5sb/logo-horizontal-white-and-blue-1"
                  alt="Alta New York Logo"
                  className="h-8 w-auto filter brightness-0 invert"
                />
              </div>
              <p className="text-gray-300">
                AI-powered NYC real estate assistant for property search, document analysis, and market insights.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/chat" className="text-gray-300 hover:text-white">Start Chat</a></li>
                <li><a href="/upload" className="text-gray-300 hover:text-white">Upload Files</a></li>
                <li><a href="https://altanewyork.com" className="text-gray-300 hover:text-white">Main Website</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">
                Visit our main website for contact information and to meet our team.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Alta New York Real Estate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
