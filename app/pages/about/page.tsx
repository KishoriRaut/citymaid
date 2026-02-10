"use client";

import { useState } from "react";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("mission");

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">About CityMaid</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connecting trusted domestic workers with families across Nepal through our innovative platform
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center mb-8 border-b">
        {["mission", "story", "services", "values"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        {activeTab === "mission" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                CityMaid (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a trusted platform that connects families and individuals with verified domestic workers across Nepal. We provide a safe and reliable way to find skilled domestic help for cooking, cleaning, childcare, elderly care, and other household services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We&apos;re not just a platform; we&apos;re a community dedicated to creating meaningful employment opportunities and improving household management across Nepal.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                At CityMaid, our mission is to revolutionize the domestic work industry in Nepal by 
                creating a transparent, reliable, and efficient platform that connects skilled domestic 
                workers with families who need their services.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We strive to empower domestic workers by providing them with fair employment opportunities, 
                while ensuring families have access to trustworthy and verified professionals for their 
                household needs.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                <p className="text-blue-800 font-medium">
                  &quot;Bridging the gap between quality domestic work and families who need it most&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "story" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                CityMaid was born from a personal experience. Our founder witnessed the challenges 
                that both families and domestic workers faced in finding reliable connections. 
                Families struggled to find trustworthy help, while skilled workers had limited 
                access to fair employment opportunities.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Starting in 2023, we began building a platform that would address these challenges 
                head-on. Through extensive research and conversations with hundreds of families and 
                domestic workers across Nepal, we developed a system that prioritizes trust, 
                transparency, and fairness.
              </p>
              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                  <div className="text-gray-600">Families Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
                  <div className="text-gray-600">Verified Workers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">7</div>
                  <div className="text-gray-600">Major Cities</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">For Families</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Verified and background-checked domestic workers
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Wide range of services (cooking, cleaning, childcare, elderly care)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Flexible scheduling and payment options
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Secure communication and booking system
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Rating and review system for quality assurance
                  </li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">For Workers</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Free registration and profile creation
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Access to verified job opportunities
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Fair wage guidance and negotiation support
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Skill development and training resources
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Secure and timely payment processing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "values" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Trust & Safety</h3>
                <p className="text-gray-700">
                  We prioritize the safety and security of both families and workers through 
                  rigorous verification processes and secure platform features.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Dignity & Respect</h3>
                <p className="text-gray-700">
                  We believe domestic work deserves respect and recognition. Every worker on our 
                  platform is treated with dignity and provided with fair opportunities.
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Transparency</h3>
                <p className="text-gray-700">
                  We maintain complete transparency in our processes, pricing, and policies to 
                  build lasting trust with our community.
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Empowerment</h3>
                <p className="text-gray-700">
                  We empower domestic workers with tools, training, and opportunities to grow 
                  professionally and achieve financial independence.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Join Our Community</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Whether you&apos;re looking for reliable domestic help or seeking employment opportunities, 
          CityMaid is here to connect you with the right match.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Find Domestic Help
          </a>
          <a 
            href="/" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Find Work Opportunities
          </a>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">citymaid60@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-gray-600">+977 9841317273</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Office</p>
                    <p className="text-gray-600">Talchhikhel 15, Satdobato</p>
                    <p className="text-gray-600">Lalitpur, Nepal</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Business Hours:</strong> Sunday to Friday 9AM - 5PM
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-900">How We Can Help</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">For Families</h4>
                  <p className="text-blue-700 text-sm">
                    Find verified domestic workers for cooking, cleaning, childcare, and elderly care services.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">For Workers</h4>
                  <p className="text-green-700 text-sm">
                    Create your profile, get verified, and connect with families seeking your services.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">Support</h4>
                  <p className="text-purple-700 text-sm">
                    Need help? Reach out to us via email, WhatsApp, or visit our office during business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
