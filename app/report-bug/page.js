'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ReportBug() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bugType: '',
    description: '',
    steps: '',
    device: '',
    priority: 'medium'
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportId, setReportId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          bugType: formData.bugType,
          description: formData.description,
          steps: formData.steps,
          device: formData.device,
          priority: formData.priority
        })
      });

      const data = await response.json();

      if (data.success) {
        setReportId(data.reportId);
        setSubmitted(true);
      } else {
        throw new Error(data.message || 'Failed to submit bug report');
      }
    } catch (error) {
      console.error('Bug report error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 w-full bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="flex h-12 sm:h-14 items-center justify-between rounded-full bg-gray-100/80 backdrop-blur-xl px-3 sm:px-6 border border-gray-200/50 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-auto">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="GrupChat"
                width={28}
                height={28}
                className="h-6 w-6 sm:h-7 sm:w-7"
              />
              <span className="text-sm sm:text-base font-semibold text-black whitespace-nowrap">
                GrupChat
              </span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/sign-in"
                className="text-xs sm:text-sm font-semibold text-purple-700 transition-colors hover:text-purple-800 whitespace-nowrap"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-purple-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white transition-colors hover:bg-purple-700 whitespace-nowrap"
              >
                Join for free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-12 sm:pb-16">
        <motion.main
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-sm">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">Report A Bug</h1>
              <p className="text-base sm:text-lg text-gray-500">
                Help us improve GrupChat by reporting any bugs or issues you encounter.
              </p>
            </motion.div>

            {!submitted ? (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-colors text-black placeholder-gray-400"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-colors text-black placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="bugType" className="block text-sm font-semibold text-black mb-2">
                      Bug Type *
                    </label>
                    <select
                      id="bugType"
                      name="bugType"
                      required
                      value={formData.bugType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-colors text-black bg-white"
                    >
                      <option value="">Select bug type</option>
                      <option value="app-crash">App Crash</option>
                      <option value="payment-issue">Payment Issue</option>
                      <option value="ui-bug">UI/Display Bug</option>
                      <option value="performance">Performance Issue</option>
                      <option value="feature-not-working">Feature Not Working</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-semibold text-black mb-2">
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-colors text-black bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="device" className="block text-sm font-semibold text-black mb-2">
                    Device Information
                  </label>
                  <input
                    type="text"
                    id="device"
                    name="device"
                    value={formData.device}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-colors text-black placeholder-gray-400"
                    placeholder="e.g., iPhone 12, Android Samsung Galaxy S21, etc."
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-black mb-2">
                    Bug Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-colors text-black placeholder-gray-400"
                    placeholder="Describe the bug in detail. What happened? What did you expect to happen?"
                  />
                </div>

                <div>
                  <label htmlFor="steps" className="block text-sm font-semibold text-black mb-2">
                    Steps to Reproduce
                  </label>
                  <textarea
                    id="steps"
                    name="steps"
                    rows={4}
                    value={formData.steps}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-colors text-black placeholder-gray-400"
                    placeholder="1. Go to... 2. Click on... 3. The bug occurs..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 text-white py-4 px-8 rounded-full font-semibold text-lg shadow-sm hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Submitting Report...
                    </div>
                  ) : (
                    'Submit Bug Report'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-black mb-4">Thank You!</h2>
                <p className="text-gray-500 mb-4">
                  Your bug report has been submitted successfully. Our team will review it and get back to you if we need more information.
                </p>
                {reportId && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-purple-700">
                      <strong>Report ID:</strong> {reportId}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      Please save this ID for your records.
                    </p>
                  </div>
                )}
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-300"
                >
                  Return to Home
                </Link>
              </motion.div>
            )}

            <motion.div
              className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-purple-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-black mb-2">Alternative Contact</h3>
                  <p className="text-gray-600">
                    If you're having trouble with this form, you can send your bug report directly to{' '}
                    <a href="mailto:info@grupchat.net" className="underline hover:text-purple-700">
                      info@grupchat.net
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.main>
      </section>
    </div>
  );
}
