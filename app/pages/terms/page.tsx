"use client";

import { useState } from "react";

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", name: "Overview", icon: "📋" },
    { id: "acceptance", name: "Acceptance", icon: "✅" },
    { id: "user-responsibilities", name: "User Responsibilities", icon: "👤" },
    { id: "prohibited-uses", name: "Prohibited Uses", icon: "🚫" },
    { id: "payments", name: "Payments", icon: "💰" },
    { id: "liabilities", name: "Liabilities", icon: "⚖️" },
    { id: "termination", name: "Termination", icon: "🛑" },
    { id: "disputes", name: "Disputes", icon: "⚔️" }
  ];

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Terms of Service</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Last updated: January 25, 2026<br/>
          These terms govern your use of CityMaid platform and services.
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
                Welcome to CityMaid! These Terms of Service (&quot;Terms&quot;) govern your access to and use of 
                our platform, website, and services (collectively, the &quot;Service&quot;). By using CityMaid, 
                you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                CityMaid is a platform that connects families seeking domestic workers with verified 
                domestic workers seeking employment opportunities in Nepal. We act as an intermediary 
                to facilitate safe and reliable connections between parties.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                <h3 className="font-semibold text-blue-800 mb-2">Important:</h3>
                <p className="text-blue-800">
                  Please read these Terms carefully before using our Service. If you do not agree to 
                  these Terms, you may not access or use our platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "acceptance" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">By Using Our Service, You Agree To:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Be legally bound by these Terms and our Privacy Policy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Provide accurate, current, and complete information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Maintain and update your information as needed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Accept responsibility for all activities under your account</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Eligibility</h3>
                <p className="text-gray-700 mb-3">
                  You must be at least 18 years old to use our Service. By using CityMaid, you 
                  represent and warrant that:
                </p>
                <ul className="space-y-1 text-gray-700 ml-4">
                  <li>• You are at least 18 years of age</li>
                  <li>• You have the legal capacity to enter into these Terms</li>
                  <li>• You are not prohibited from using our Service under applicable laws</li>
                  <li>• You will comply with all applicable laws and regulations</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Account Security</h3>
                <p className="text-yellow-800">
                  You are responsible for maintaining the confidentiality of your account credentials 
                  and for all activities that occur under your account. Notify us immediately of any 
                  unauthorized use of your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "user-responsibilities" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">For Families/Employers:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Provide accurate job descriptions and requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Pay agreed-upon wages on time and in full</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Provide safe working conditions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Treat workers with respect and dignity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Provide fair working hours and rest periods</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">For Domestic Workers:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Provide accurate skills, experience, and availability information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Perform duties professionally and diligently</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Maintain confidentiality of employer information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Communicate honestly about capabilities and limitations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Adhere to agreed-upon work schedules</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">For All Users:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Communicate respectfully and professionally</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Report any safety concerns or violations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Use the platform only for legitimate purposes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === "prohibited-uses" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Uses</h2>
            
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">You May NOT:</h3>
                <ul className="space-y-2 text-red-800">
                  <li>• Use the Service for any illegal or unauthorized purpose</li>
                  <li>• Harass, abuse, or harm other users</li>
                  <li>• Post false, misleading, or fraudulent information</li>
                  <li>• Discriminate based on race, religion, gender, caste, or ethnicity</li>
                  <li>• Solicit personal information from other users for unauthorized purposes</li>
                  <li>• Attempt to gain unauthorized access to our systems</li>
                  <li>• Use automated tools to access or scrape the platform</li>
                  <li>• Interfere with or disrupt the Service or servers</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Specific Prohibitions</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900">For Families:</h4>
                    <p className="text-gray-700">
                      Do not exploit workers, withhold payment, or engage in any form of labor abuse.
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900">For Workers:</h4>
                    <p className="text-gray-700">
                      Do not misrepresent qualifications, abandon work without notice, or engage in theft.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Consequences of Violations</h3>
                <p className="text-yellow-800">
                  Violation of these prohibitions may result in immediate account suspension, 
                  permanent ban, and possible legal action.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "payments" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments and Fees</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Platform Fees</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Contact Unlock Fee:</strong> Rs. 299 to access worker contact information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Homepage Feature Fee:</strong> Rs. 299 to feature your post on homepage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Service Commission:</strong> Small percentage of successful placements</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Terms</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• All fees are non-refundable unless specified otherwise</li>
                  <li>• Payments are processed through secure payment gateways</li>
                  <li>• We reserve the right to change fees with prior notice</li>
                  <li>• Salary negotiations are between families and workers directly</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Refund Policy</h3>
                <p className="text-green-800 mb-2">
                  <strong>Contact Unlock Fees:</strong> Non-refundable service charge for accessing verified contact information and platform services.
                </p>
                <p className="text-green-800 mb-2">
                  <strong>Homepage Feature Fees:</strong> Non-refundable service charge for featuring posts on homepage.
                </p>
                <p className="text-green-800 text-sm">
                  Users should conduct thorough due diligence, including interviews and reference checks, before making hiring decisions. The platform acts as an intermediary and does not guarantee hiring outcomes.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "liabilities" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Liabilities and Disclaimers</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Liability</h3>
                <p className="text-gray-700 mb-3">
                  CityMaid acts as an intermediary platform and is not responsible for:
                </p>
                <ul className="space-y-1 text-gray-700 ml-4">
                  <li>• The quality of work performed by domestic workers</li>
                  <li>• Payment disputes between families and workers</li>
                  <li>• Personal injury or property damage</li>
                  <li>• Misconduct by either party</li>
                  <li>• Verification of all user-provided information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Responsibility</h3>
                <p className="text-gray-700">
                  Users are responsible for conducting their own due diligence, including background 
                  checks, reference verification, and personal interviews before entering into any 
                  employment arrangement.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Limitation of Liability</h3>
                <p className="text-red-800">
                  To the maximum extent permitted by law, CityMaid shall not be liable for any 
                  indirect, incidental, special, or consequential damages arising from your use 
                  of our Service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Indemnification</h3>
                <p className="text-gray-700">
                  You agree to indemnify and hold CityMaid harmless from any claims, damages, or 
                  expenses arising from your use of the Service or violation of these Terms.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "termination" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Termination</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by You</h3>
                <p className="text-gray-700">
                  You may terminate your account at any time by:
                </p>
                <ul className="space-y-1 text-gray-700 ml-4 mt-2">
                  <li>• Using the account deletion feature in your profile settings</li>
                  <li>• Contacting our support team</li>
                  <li>• Simply ceasing to use the Service</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by CityMaid</h3>
                <p className="text-gray-700">
                  We may suspend or terminate your account immediately if you:
                </p>
                <ul className="space-y-1 text-gray-700 ml-4 mt-2">
                  <li>• Violate these Terms of Service</li>
                  <li>• Engage in fraudulent or illegal activities</li>
                  <li>• Harm other users or the platform</li>
                  <li>• Fail to provide accurate information</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Effect of Termination</h3>
                <p className="text-yellow-800">
                  Upon termination, your right to use the Service ceases immediately. We may 
                  retain certain information as required by law or for legitimate business purposes.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "disputes" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Dispute Resolution Process</h3>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">1.</span>
                    <span>Direct communication between parties to resolve issues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">2.</span>
                    <span>Mediation through CityMaid support team</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">3.</span>
                    <span>Arbitration if mediation fails</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">4.</span>
                    <span>Legal action as last resort</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h3>
                <p className="text-gray-700">
                  These Terms shall be governed by and construed in accordance with the laws of 
                  Nepal, without regard to its conflict of law principles.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Jurisdiction</h3>
                <p className="text-gray-700">
                  Any disputes arising from these Terms or your use of the Service shall be 
                  resolved in the courts of Kathmandu, Nepal.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Contact for Disputes</h3>
                <p className="text-blue-800">
                  For dispute resolution assistance, contact us at:<br/>
                  Email: disputes@citymaid.com.np<br/>
                  Phone: +977-1-1234567
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agreement Statement */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Acknowledgment</h3>
        <p className="text-gray-700">
          By using CityMaid, you acknowledge that you have read, understood, and agree to be bound 
          by these Terms of Service and our Privacy Policy. If you do not agree, please do not use 
          our platform.
        </p>
      </div>

      {/* Contact */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Questions about these Terms? Contact us at legal@citymaid.com.np
        </p>
      </div>
    </main>
  );
}
