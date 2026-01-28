"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsOfService() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
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
                className="text-xs sm:text-sm font-semibold text-black transition-colors hover:text-gray-700 whitespace-nowrap"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-black px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800 whitespace-nowrap"
              >
                Join for free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-12 sm:pb-16">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-8 sm:mb-12" variants={itemVariants}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4">
              Terms of{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500">
              Last updated: May 16th 2025
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 md:p-12 shadow-sm"
            variants={itemVariants}
          >
            <div className="prose prose-lg max-w-none">
              <div className="space-y-8 text-gray-700">
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
                    If you have any questions about these Terms of Service, please contact us at <a href="mailto:info@grupchat.net" className="text-purple-600 underline hover:text-purple-700">info@grupchat.net</a>. We will respond to your inquiries as promptly as possible.
                  </p>
                </section>
              </div>
            </div>
          </motion.div>

          <motion.div className="mt-8 text-center" variants={itemVariants}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
