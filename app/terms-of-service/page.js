'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav
          className="px-6 py-6 lg:px-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="GrupChat Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GrupChat
              </span>
            </Link>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </motion.div>
          </div>
        </motion.nav>

        {/* Content */}
        <motion.main
          className="max-w-4xl mx-auto px-6 py-12 lg:px-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-purple-200/50 shadow-xl">
            <motion.h1
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Terms of Service
            </motion.h1>
            
            <motion.p
              className="text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Last updated: May 16th 2025
            </motion.p>

            <div className="prose prose-lg max-w-none">
              <motion.div
                className="space-y-8 text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                  <p className="leading-relaxed">
                    By using GrupChat, you agree to these Terms of Service. If you do not agree to these terms, please do not use our app or website. These terms constitute a legal agreement between you and GrupChat.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                  <p className="leading-relaxed mb-4">
                    GrupChat is a mobile and web application that allows users to pool money with friends and family through M-Pesa integration. Our service includes:
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Creating and managing group funding pools</li>
                    <li>Facilitating M-Pesa transactions</li>
                    <li>Tracking contributions and progress toward goals</li>
                    <li>Providing transparency in group activities</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
                  <p className="mb-4">As a user of GrupChat, you agree to:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>
                      <span className="font-semibold text-gray-900">Provide Accurate Information:</span> Provide accurate, current, and complete information when creating your account and using our services.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Account Security:</span> Keep your account credentials secure and notify us immediately of any unauthorized access to your account.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Legal Compliance:</span> Use the app in compliance with all applicable laws and regulations in your jurisdiction.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Respectful Use:</span> Treat other users with respect and refrain from harassment or abusive behavior.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Prohibited Activities</h2>
                  <p className="mb-4">You may not use GrupChat for any of the following prohibited activities:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>
                      <span className="font-semibold text-gray-900">Fraudulent Activity:</span> No fraudulent, deceptive, or misleading activities related to money pooling or transactions.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Illegal Activities:</span> No activities that violate local, national, or international laws.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">System Interference:</span> No unauthorized access, interference, or attempts to disrupt our systems or services.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Money Laundering:</span> No use of the platform for money laundering or financing illegal activities.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Transactions</h2>
                  <p className="leading-relaxed mb-4">
                    GrupChat facilitates transactions through M-Pesa integration. By using our service, you understand and agree that:
                  </p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>All transactions are subject to M-Pesa terms and conditions</li>
                    <li>Transaction fees may apply as disclosed in the app</li>
                    <li>We are not responsible for M-Pesa system failures or delays</li>
                    <li>You are responsible for ensuring sufficient funds for withdrawals</li>
                    <li>Disputed transactions should be reported immediately through our support channels</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
                  <p className="leading-relaxed">
                    Your privacy is important to us. Please review our <Link href="/privacy-policy" className="text-purple-600 underline hover:text-purple-700">Privacy Policy</Link> to understand how we collect, use, and protect your personal information. By using our service, you consent to the collection and use of your information as described in our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
                  <p className="leading-relaxed mb-4">
                    GrupChat is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we disclaim all warranties, express or implied. We are not liable for:
                  </p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Any indirect, incidental, or consequential damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Damages resulting from third-party services (including M-Pesa)</li>
                    <li>User disputes or disagreements within groups</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Account Termination</h2>
                  <p className="leading-relaxed">
                    We reserve the right to suspend or terminate your account at any time for violation of these terms, suspicious activity, or for any other reason we deem necessary. Upon termination, you will lose access to your account and any pending transactions will be handled according to our standard procedures.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
                  <p className="leading-relaxed">
                    We may update these Terms of Service from time to time to reflect changes in our service or legal requirements. We will notify users of significant changes through the app or via email. Continued use of the app after changes constitutes acceptance of the updated terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
                  <p className="leading-relaxed">
                    These Terms of Service are governed by and construed in accordance with the laws of Kenya. Any disputes arising from these terms or your use of GrupChat will be subject to the jurisdiction of Kenyan courts.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
                  <p className="leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at <a href="mailto:grupchatinfo@gmail.com" className="text-purple-600 underline hover:text-purple-700">grupchatinfo@gmail.com</a>. We will respond to your inquiries as promptly as possible.
                  </p>
                </section>
              </motion.div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
