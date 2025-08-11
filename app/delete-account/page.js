'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function DeleteAccount() {
  const [formData, setFormData] = useState({
    email: '',
    reason: '',
    confirmation: '',
    additionalComments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/data/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          reason: formData.reason,
          confirmation: formData.confirmation,
          additionalComments: formData.additionalComments
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        throw new Error(data.message || 'Failed to submit deletion request');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
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

  if (submitted) {
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

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
          <motion.div
            className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            >
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your account deletion request has been submitted successfully. We will process your request within 30 days and send you a confirmation email.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Request ID:</strong> DEL-{Date.now().toString().slice(-6)}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Please save this ID for your records.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              Return to Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

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
          className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:px-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 md:p-12">
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Delete Account
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We're sorry to see you go. Please fill out the form below to request account deletion. 
                This action cannot be undone and all your data will be permanently removed.
              </p>
            </motion.div>

            {/* Warning Notice */}
            <motion.div 
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8"
              variants={itemVariants}
            >
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Important Notice</h3>
                  <p className="text-sm text-red-700">
                    Account deletion is permanent and cannot be undone. All your pools, transactions, and personal data will be deleted within 30 days.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.form onSubmit={handleSubmit} variants={itemVariants}>
              <div className="space-y-6">
                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your registered email address"
                    required
                  />
                </motion.div>

                {/* Reason for Deletion */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Deletion *
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="no-longer-need">No longer need the service</option>
                    <option value="privacy-concerns">Privacy concerns</option>
                    <option value="found-alternative">Found an alternative</option>
                    <option value="technical-issues">Technical issues</option>
                    <option value="account-security">Account security concerns</option>
                    <option value="other">Other</option>
                  </select>
                </motion.div>

                {/* Confirmation */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                    Type "DELETE MY ACCOUNT" to confirm *
                  </label>
                  <input
                    type="text"
                    id="confirmation"
                    name="confirmation"
                    value={formData.confirmation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Type DELETE MY ACCOUNT"
                    required
                  />
                </motion.div>

                {/* Additional Comments */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="additionalComments" className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    id="additionalComments"
                    name="additionalComments"
                    value={formData.additionalComments}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 resize-none"
                    placeholder="Let us know how we could have served you better..."
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.div className="flex flex-col sm:flex-row gap-4 pt-4" variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={isSubmitting || formData.confirmation !== 'DELETE MY ACCOUNT'}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Processing...
                      </div>
                    ) : (
                      'Delete My Account'
                    )}
                  </button>
                  
                  <Link
                    href="/privacy-policy"
                    className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300 text-center"
                  >
                    Cancel
                  </Link>
                </motion.div>
              </div>
            </motion.form>

            {/* Information Section */}
            <motion.div className="mt-8 pt-8 border-t border-gray-200" variants={itemVariants}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens when you delete your account?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-purple-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Your account and profile will be permanently deleted within 30 days
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-purple-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  All your pools, contributions, and transaction history will be removed
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-purple-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Some data may be retained for up to 90 days for legal compliance
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-purple-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  You will receive an email confirmation once deletion is complete
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
