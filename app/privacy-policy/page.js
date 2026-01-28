"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
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
              Privacy{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500">
              Last updated: January 11th 2026
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 md:p-12 shadow-sm"
            variants={itemVariants}
          >
            <div className="prose prose-lg max-w-none">
              <div className="space-y-8 text-gray-700">
                <section>
                  <h2 className="text-2xl font-semibold text-black mb-4">
                    Introduction
                  </h2>
                  <p className="leading-relaxed text-gray-600">
                    This privacy policy explains how we collect, use, and
                    protect the personal information of our users when they use
                    GrupChat.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-black mb-4">
                    Information We Collect
                  </h2>
                  <p className="mb-4 text-gray-600">
                    When you use our app, we may collect the following types of
                    information:
                  </p>
                  <ul className="list-disc ml-6 space-y-3 text-gray-600">
                    <li>
                      <span className="font-semibold text-black">
                        Personal Information:
                      </span>{" "}
                      This includes your name, email address, and phone number
                      details that you provide to set up your profile and use
                      the app's features.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Goal and Progress Data:
                      </span>{" "}
                      We collect information about the goals, challenges, and
                      activities you create or participate in, including goal
                      details, progress updates, milestones, photos, status
                      updates, and any manually logged contributions or
                      financial tracking information you choose to share.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Transaction Data (Optional):
                      </span>{" "}
                      If you choose to use payment features, we collect
                      information about financial transactions you make through
                      the app, including the amount, date, time, and other
                      details related to money transfers and group fund pooling.
                      Payment features are optional, and you can use GrupChat
                      entirely through manual tracking.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Social and Activity Data:
                      </span>{" "}
                      We collect information about your interactions with goals,
                      including comments, updates, photos you upload, and your
                      participation in group activities. This helps create your
                      memory gallery and activity feed.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Usage Data:
                      </span>{" "}
                      We may collect information about how you use the app, such
                      as the features you access, the pages you visit, and any
                      errors that occur.
                    </li>
                    <li>
                      <span className="font-semibold text-black">Cookies:</span>{" "}
                      Our app/website uses cookies to enhance your user
                      experience. Cookies are small data files stored on your
                      device that help us understand how you use the app and
                      enable certain functionalities.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-black mb-4">
                    How We Use Your Information
                  </h2>
                  <ul className="list-disc ml-6 space-y-3 text-gray-600">
                    <li>
                      <span className="font-semibold text-black">
                        Provisioning and Improving the App:
                      </span>{" "}
                      We use your personal and goal data to enable the core
                      functions of the app, such as creating and tracking goals,
                      sharing progress updates, building memory galleries,
                      managing group activities, and processing optional payment
                      transactions when you choose to use payment features.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Customer Support:
                      </span>{" "}
                      We may use your information to respond to your inquiries,
                      address your concerns, and provide you with customer
                      support.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Analytics and Improvement:
                      </span>{" "}
                      We may use your usage data to analyze how the app is being
                      used, identify areas for improvement, and develop new
                      features.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Social Features:
                      </span>{" "}
                      We use your activity data to create activity feeds,
                      notifications, and memory galleries that help you and your
                      friends stay connected and celebrate shared experiences.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Compliance and Security:
                      </span>{" "}
                      We may use your information to comply with legal
                      requirements, protect against fraud, and ensure the
                      security of the app, your data, and any transactions you
                      choose to make.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-black mb-4">
                    Sharing Your Information
                  </h2>
                  <p className="mb-4 text-gray-600">
                    We do not sell or rent your personal information to third
                    parties. However, we may share your information in the
                    following circumstances:
                  </p>
                  <ul className="list-disc ml-6 space-y-3 text-gray-600">
                    <li>
                      <span className="font-semibold text-black">
                        Service Providers:
                      </span>{" "}
                      We may share your information with third-party service
                      providers, such as payment processors (when you use
                      payment features), cloud storage providers, and analytics
                      services, who assist us in operating the app and
                      providing services to you.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Group Members:
                      </span>{" "}
                      When you participate in a goal or activity, your progress
                      updates, photos, milestones, and contributions (including
                      manually tracked financial contributions) are visible to
                      other members of that group, as intended by the social
                      nature of the app.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Legal Compliance:
                      </span>{" "}
                      We may disclose your information if required to do so by
                      law or in response to valid requests by public authorities,
                      such as a court or government agency.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Business Transfers:
                      </span>{" "}
                      In the event of a merger, acquisition, or sale of assets,
                      we may transfer your information to the new owner or
                      successor entity.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-black mb-4">
                    Data Security
                  </h2>
                  <p className="leading-relaxed text-gray-600">
                    We take reasonable measures to protect your personal
                    information from unauthorized access, disclosure, alteration,
                    or destruction. This includes using encryption, access
                    controls, and other security safeguards. However, no method of
                    transmission over the internet or method of electronic
                    storage is 100% secure, and we cannot guarantee the absolute
                    security of your information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-black mb-4">
                    Your Rights
                  </h2>
                  <ul className="list-disc ml-6 space-y-3 text-gray-600">
                    <li>
                      <span className="font-semibold text-black">Access:</span>{" "}
                      You can request access to the personal information we hold
                      about you.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Correction:
                      </span>{" "}
                      You can request that we correct any inaccurate or
                      incomplete personal information we hold about you.
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Account Deletion:
                      </span>{" "}
                      You can request that we delete your account and all
                      associated data.{" "}
                      <Link
                        href="/delete-account"
                        className="text-purple-600 underline hover:text-purple-700 transition-colors"
                      >
                        Click here to submit a deletion request
                      </Link>
                      .
                    </li>
                    <li>
                      <span className="font-semibold text-black">
                        Data Portability:
                      </span>{" "}
                      You can request a copy of your personal information in a
                      structured, commonly used, and machine-readable format.
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-600">
                    To exercise these rights, please visit our{" "}
                    <Link
                      href="/manage-data"
                      className="text-purple-600 underline hover:text-purple-700 transition-colors"
                    >
                      data management page
                    </Link>{" "}
                    or contact us at{" "}
                    <a
                      href="mailto:info@grupchat.net"
                      className="text-purple-600 underline hover:text-purple-700 transition-colors"
                    >
                      info@grupchat.net
                    </a>
                    .
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-black mb-4">
                    Data Retention
                  </h2>
                  <p className="mb-4 text-gray-600">
                    We retain your data for as long as your account is active
                    and as needed to provide you services. When you request
                    account deletion:
                  </p>
                  <ul className="list-disc ml-6 space-y-3 text-gray-600">
                    <li>
                      We will delete your account and associated data within 30
                      days of your request.
                    </li>
                    <li>
                      Some data may be retained for up to 90 days after deletion
                      for legal compliance, fraud prevention, and dispute
                      resolution purposes.
                    </li>
                    <li>
                      After 90 days, all data will be permanently deleted from
                      our systems.
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-600">
                    You can learn more about our data retention practices on our{" "}
                    <Link
                      href="/manage-data"
                      className="text-purple-600 underline hover:text-purple-700 transition-colors"
                    >
                      data management page
                    </Link>
                    .
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-black mb-4">
                    Changes to This Privacy Policy
                  </h2>
                  <p className="leading-relaxed text-gray-600">
                    We may update this privacy policy from time to time. We will
                    notify you of any changes by posting the new policy on our
                    app or website. Your continued use of the app after such
                    changes will be deemed your acceptance of the updated policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-black mb-4">
                    Contact Us
                  </h2>
                  <p className="leading-relaxed text-gray-600">
                    If you have any questions or concerns about this privacy
                    policy or our data practices, please contact us at{" "}
                    <a
                      href="mailto:info@grupchat.net"
                      className="text-purple-600 underline hover:text-purple-700 transition-colors"
                    >
                      info@grupchat.net
                    </a>
                    .
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
