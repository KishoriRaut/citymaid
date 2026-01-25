"use client";

import { useState } from "react";

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", name: "Overview", icon: "📋" },
    { id: "collection", name: "Data Collection", icon: "📥" },
    { id: "usage", name: "Data Usage", icon: "🔧" },
    { id: "sharing", name: "Data Sharing", icon: "🤝" },
    { id: "security", name: "Data Security", icon: "🔒" },
    { id: "rights", name: "Your Rights", icon: "⚖️" },
    { id: "cookies", name: "Cookies", icon: "🍪" },
    { id: "contact", name: "Contact", icon: "📞" }
  ];

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Last updated: January 25, 2026<br/>
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{section.icon}</span>
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        {activeSection === "overview" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                CityMaid ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                platform and services.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using CityMaid, you agree to the collection and use of information in accordance with 
                this policy. If you disagree with any part of this policy, please do not use our platform.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                <h3 className="font-semibold text-blue-800 mb-2">Key Points:</h3>
                <ul className="space-y-1 text-blue-800">
                  <li>• We collect only necessary information to provide our services</li>
                  <li>• Your personal information is never sold to third parties</li>
                  <li>• We implement industry-standard security measures</li>
                  <li>• You have control over your personal data</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === "collection" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Name and contact details:</strong> Full name, phone number, email address</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Identification documents:</strong> Citizenship card, passport for verification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Location information:</strong> City, area, and address for service matching</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Professional details:</strong> Skills, experience, work preferences (for workers)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Device information:</strong> IP address, browser type, operating system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Usage data:</strong> Pages visited, time spent, actions taken on platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Cookies and similar technologies:</strong> To enhance user experience</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Communication Data</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Messages and inquiries:</strong> Communications between families and workers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Support requests:</strong> Customer service interactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Feedback and reviews:</strong> Ratings and comments provided</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === "usage" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Service Provision</h3>
                <p className="text-gray-700">
                  To connect families with suitable domestic workers, facilitate communications, 
                  and provide the core functionality of our platform.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Verification and Safety</h3>
                <p className="text-gray-700">
                  To verify user identities, conduct background checks, and maintain a safe 
                  environment for all platform users.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Platform Improvement</h3>
                <p className="text-gray-700">
                  To analyze usage patterns, improve our services, develop new features, and 
                  enhance user experience.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Communication</h3>
                <p className="text-gray-700">
                  To send important updates, service notifications, respond to inquiries, 
                  and provide customer support.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Legal Compliance</h3>
                <p className="text-gray-700">
                  To comply with legal obligations, protect our rights, prevent fraud, and 
                  ensure platform security.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "sharing" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
            
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">We Share Information With:</h3>
                <ul className="space-y-2 text-green-800">
                  <li>• <strong>Other users:</strong> Your profile information is shared with potential employers/employees</li>
                  <li>• <strong>Verification services:</strong> Background check and identity verification partners</li>
                  <li>• <strong>Payment processors:</strong> For processing unlock fees and other transactions</li>
                  <li>• <strong>Legal authorities:</strong> When required by law or to protect our rights</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">We Never Sell:</h3>
                <ul className="space-y-2 text-red-800">
                  <li>• Personal information to third-party marketers</li>
                  <li>• User data for advertising purposes</li>
                  <li>• Contact information without explicit consent</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Transfers</h3>
                <p className="text-gray-700">
                  In the event of a merger, acquisition, or sale of assets, user information may be 
                  transferred as part of the transaction. We will notify you of any such changes.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "security" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Security Measures</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Encryption:</strong> All data is encrypted using industry-standard protocols</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Secure servers:</strong> Data stored on secure, monitored servers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Access controls:</strong> Limited access to personal information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Regular audits:</strong> Periodic security assessments and updates</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Important Note</h3>
                <p className="text-yellow-800">
                  While we take reasonable measures to protect your information, no method of transmission 
                  over the internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Retention</h3>
                <p className="text-gray-700 mb-3">
                  We retain your information only as long as necessary to:
                </p>
                <ul className="space-y-1 text-gray-700 ml-4">
                  <li>• Provide our services</li>
                  <li>• Comply with legal obligations</li>
                  <li>• Resolve disputes</li>
                  <li>• Enforce our agreements</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === "rights" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">You Have the Right To:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">🔍</span>
                    <div>
                      <strong>Access:</strong> Request a copy of your personal information
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✏️</span>
                    <div>
                      <strong>Correct:</strong> Update inaccurate or incomplete information
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">🗑️</span>
                    <div>
                      <strong>Delete:</strong> Request deletion of your personal information
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">⏸️</span>
                    <div>
                      <strong>Restrict:</strong> Limit how we use your information
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">📤</span>
                    <div>
                      <strong>Port:</strong> Transfer your data to another service
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">How to Exercise Your Rights</h3>
                <p className="text-blue-800 mb-3">
                  To exercise any of these rights, please contact us at:
                </p>
                <p className="text-blue-800">
                  Email: privacy@citymaid.com.np<br/>
                  Phone: +977-1-1234567
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Deletion</h3>
                <p className="text-gray-700">
                  You can delete your account at any time from your profile settings. Upon deletion, 
                  your personal information will be removed from our active databases, though we may 
                  retain certain information as required by law or for legitimate business purposes.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "cookies" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What Are Cookies?</h3>
                <p className="text-gray-700">
                  Cookies are small text files stored on your device that help us provide better 
                  functionality and user experience.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Types of Cookies We Use</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Essential cookies:</strong> Required for basic platform functionality</li>
                  <li><strong>Performance cookies:</strong> Help us understand how you use our platform</li>
                  <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Marketing cookies:</strong> Used to show relevant advertisements (with consent)</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Managing Cookies</h3>
                <p className="text-gray-700">
                  You can control cookies through your browser settings. However, disabling certain 
                  cookies may affect your ability to use some features of our platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "contact" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy Questions</h3>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or how we handle your 
                  information, please contact our Data Protection Officer:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@citymaid.com.np<br/>
                    <strong>Phone:</strong> +977-1-1234567<br/>
                    <strong>Address:</strong> CityMaid Nepal, Putalisadak, Kathmandu, Nepal 44600
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Policy Updates</h3>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of 
                  any changes by posting the new policy on this page and updating the "Last 
                  updated" date. Changes are effective immediately upon posting.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Complaints</h3>
                <p className="text-blue-800">
                  If you believe we have violated your privacy rights, you can file a complaint 
                  with us or with the relevant data protection authority.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Policy */}
      <div className="mt-8 text-center">
        <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
          📄 Download Privacy Policy (PDF)
        </button>
      </div>
    </main>
  );
}
