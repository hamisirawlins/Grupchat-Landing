'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPolicy() {
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
              Privacy Policy
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
                  <p className="leading-relaxed">
                    This privacy policy explains how we collect, use, and protect the personal information of our users when they use GrupChat.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                  <p className="mb-4">When you use our app, we may collect the following types of information:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>
                      <span className="font-semibold text-gray-900">Personal Information:</span> This includes your name, email address, and M-Pesa phone number details that you provide to set up your profile and use the app's features.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Transaction Data:</span> We collect information about the financial transactions you make through the app, including the amount, date, time, and other details related to money transfers and group fund pooling.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Usage Data:</span> We may collect information about how you use the app, such as the features you access, the pages you visit, and any errors that occur.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Cookies:</span> Our app/website uses cookies to enhance your user experience. Cookies are small data files stored on your device that help us understand how you use the app and enable certain functionalities.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>
                      <span className="font-semibold text-gray-900">Provisioning and Improving the App:</span> We use your personal and transaction data to enable the core functions of the app, such as facilitating group fund pooling, managing contributions, and processing M-Pesa transactions.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Customer Support:</span> We may use your information to respond to your inquiries, address your concerns, and provide you with customer support.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Analytics and Improvement:</span> We may use your usage data to analyze how the app is being used, identify areas for improvement, and develop new features.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Compliance and Security:</span> We may use your information to comply with legal requirements, protect against fraud, and ensure the security of the app and your transactions.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sharing Your Information</h2>
                  <p className="mb-4">We do not sell or rent your personal information to third parties. However, we may share your information in the following circumstances:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>
                      <span className="font-semibold text-gray-900">Service Providers:</span> We may share your information with third-party service providers, such as payment processors and cloud storage providers, who assist us in operating the app and providing services to you.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Legal Compliance:</span> We may disclose your information if required to do so by law or in response to valid requests by public authorities, such as a court or government agency.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Business Transfers:</span> In the event of a merger, acquisition, or sale of assets, we may transfer your information to the new owner or successor entity.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
                  <p className="leading-relaxed">
                    We take reasonable measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. This includes using encryption, access controls, and other security safeguards. However, no method of transmission over the internet or method of electronic storage is 100% secure, and we cannot guarantee the absolute security of your information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>
                      <span className="font-semibold text-gray-900">Access:</span> You can request access to the personal information we hold about you.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Correction:</span> You can request that we correct any inaccurate or incomplete personal information we hold about you.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Account Deletion:</span> You can request that we delete your account and all associated data. <Link href="/delete-account" className="text-purple-600 underline hover:text-purple-700">Click here to submit a deletion request</Link>.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-900">Data Portability:</span> You can request a copy of your personal information in a structured, commonly used, and machine-readable format.
                    </li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please visit our <Link href="/manage-data" className="text-purple-600 underline hover:text-purple-700">data management page</Link> or contact us at <a href="mailto:info@grupchat.net" className="text-purple-600 underline hover:text-purple-700">info@grupchat.net</a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
                  <p className="mb-4">We retain your data for as long as your account is active and as needed to provide you services. When you request account deletion:</p>
                  <ul className="list-disc ml-6 space-y-3">
                    <li>We will delete your account and associated data within 30 days of your request.</li>
                    <li>Some data may be retained for up to 90 days after deletion for legal compliance, fraud prevention, and dispute resolution purposes.</li>
                    <li>After 90 days, all data will be permanently deleted from our systems.</li>
                  </ul>
                  <p className="mt-4">
                    You can learn more about our data retention practices on our <Link href="/manage-data" className="text-purple-600 underline hover:text-purple-700">data management page</Link>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                  <p className="leading-relaxed">
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on our app or website. Your continued use of the app after such changes will be deemed your acceptance of the updated policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                  <p className="leading-relaxed">
                    If you have any questions or concerns about this privacy policy or our data practices, please contact us at <a href="mailto:info@grupchat.net" className="text-purple-600 underline hover:text-purple-700">info@grupchat.net</a>.
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
