'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function ManageData() {
  const [activeTab, setActiveTab] = useState('overview');
  const [requestForm, setRequestForm] = useState({
    type: '',
    email: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let endpoint = '';
      let requestBody = {
        email: requestForm.email
      };

      // Determine endpoint and body based on active tab
      if (activeTab === 'export') {
        endpoint = '/api/data/export';
        requestBody.format = document.querySelector('input[name="format"]:checked')?.value || 'json';
      } else if (activeTab === 'correction') {
        endpoint = '/api/data/correction';
        requestBody.type = requestForm.type;
        requestBody.description = requestForm.description;
      }

      if (!endpoint) {
        throw new Error('Invalid request type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        // Reset form
        setRequestForm({
          type: '',
          email: '',
          description: ''
        });
      } else {
        throw new Error(data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Data request error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'export', label: 'Export Data', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
    { id: 'correction', label: 'Data Correction', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'retention', label: 'Data Retention', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav
          className="px-4 sm:px-6 py-6 lg:px-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="GrupChat Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GrupChat
              </span>
            </Link>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/privacy-policy"
                className="inline-flex items-center px-3 sm:px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-300 text-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Privacy Policy
              </Link>
            </motion.div>
          </div>
        </motion.nav>

        {/* Content */}
        <motion.main
          className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:px-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Data Management
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Manage your personal data, understand how we store and process your information, and exercise your data rights.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-2">
              <nav className="flex space-x-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Tab Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 md:p-12">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Data Rights</h2>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">Access Your Data</h3>
                    </div>
                    <p className="text-gray-700 mb-4">Request a copy of all personal information we have about you.</p>
                    <button 
                      onClick={() => setActiveTab('export')}
                      className="text-purple-600 font-medium hover:text-purple-700"
                    >
                      Export My Data →
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">Correct Your Data</h3>
                    </div>
                    <p className="text-gray-700 mb-4">Request corrections to inaccurate or incomplete information.</p>
                    <button 
                      onClick={() => setActiveTab('correction')}
                      className="text-blue-600 font-medium hover:text-blue-700"
                    >
                      Request Correction →
                    </button>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">Delete Your Account</h3>
                    </div>
                    <p className="text-gray-700 mb-4">Permanently delete your account and all associated data.</p>
                    <Link href="/delete-account" className="text-red-600 font-medium hover:text-red-700">
                      Delete Account →
                    </Link>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">Data Retention</h3>
                    </div>
                    <p className="text-gray-700 mb-4">Learn how long we keep your data and our retention policies.</p>
                    <button 
                      onClick={() => setActiveTab('retention')}
                      className="text-green-600 font-medium hover:text-green-700"
                    >
                      View Retention Policy →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Export Data Tab */}
            {activeTab === 'export' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Your Data</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">What's included in your data export?</h3>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Profile information (name, email, phone number)</li>
                    <li>• Pool participation history</li>
                    <li>• Transaction records</li>
                    <li>• Account settings and preferences</li>
                    <li>• Usage analytics (anonymized)</li>
                  </ul>
                </div>

                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="export-email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="export-email"
                      value={requestForm.email}
                      onChange={(e) => setRequestForm({...requestForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your registered email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data Format *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="format" value="json" className="text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="ml-2 text-gray-700">JSON (machine-readable)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="format" value="csv" className="text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-gray-700">CSV (spreadsheet-friendly)</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Request Data Export'}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Data exports are typically processed within 7-14 business days. You'll receive an email with a secure download link once your export is ready.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Data Correction Tab */}
            {activeTab === 'correction' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Data Correction</h2>
                
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="correction-email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="correction-email"
                      value={requestForm.email}
                      onChange={(e) => setRequestForm({...requestForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your registered email address"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="correction-type" className="block text-sm font-semibold text-gray-700 mb-2">
                      Type of Correction *
                    </label>
                    <select
                      id="correction-type"
                      value={requestForm.type}
                      onChange={(e) => setRequestForm({...requestForm, type: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                      required
                    >
                      <option value="">Select correction type</option>
                      <option value="personal-info">Personal Information (name, phone, etc.)</option>
                      <option value="transaction-data">Transaction Data</option>
                      <option value="pool-information">Pool Information</option>
                      <option value="account-settings">Account Settings</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="correction-description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description of Correction Needed *
                    </label>
                    <textarea
                      id="correction-description"
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                      rows={5}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 resize-none"
                      placeholder="Please describe what information is incorrect and what it should be changed to..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Correction Request'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Data Retention Tab */}
            {activeTab === 'retention' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Retention Policy</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How long we keep your data</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-gray-900">Active Account Data</p>
                          <p className="text-gray-600">Retained while your account is active and in use</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-gray-900">Account Deletion</p>
                          <p className="text-gray-600">Data deleted within 30 days of account deletion request</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-gray-900">Legal Compliance</p>
                          <p className="text-gray-600">Some data retained for up to 90 days for legal and fraud prevention purposes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Types of data and retention periods</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-200">
                            <th className="text-left py-2 text-blue-900">Data Type</th>
                            <th className="text-left py-2 text-blue-900">Retention Period</th>
                            <th className="text-left py-2 text-blue-900">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="text-blue-800">
                          <tr className="border-b border-blue-100">
                            <td className="py-2">Profile Information</td>
                            <td className="py-2">Active account + 30 days</td>
                            <td className="py-2">Service provision</td>
                          </tr>
                          <tr className="border-b border-blue-100">
                            <td className="py-2">Transaction History</td>
                            <td className="py-2">Active account + 90 days</td>
                            <td className="py-2">Legal compliance</td>
                          </tr>
                          <tr className="border-b border-blue-100">
                            <td className="py-2">Usage Analytics</td>
                            <td className="py-2">24 months</td>
                            <td className="py-2">Service improvement</td>
                          </tr>
                          <tr>
                            <td className="py-2">Support Tickets</td>
                            <td className="py-2">36 months</td>
                            <td className="py-2">Quality assurance</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-semibold text-yellow-800 mb-1">Important Note</h3>
                        <p className="text-yellow-700">
                          Even after account deletion, some anonymized and aggregated data may be retained indefinitely for statistical analysis and service improvement, but this data cannot be used to identify you personally.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {submitted && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted</h3>
                  <p className="text-gray-600 mb-6">Your request has been submitted successfully. We'll process it within 7-14 business days.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
