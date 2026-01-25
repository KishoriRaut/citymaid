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
                  "Bridging the gap between quality domestic work and families who need it most"
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
          Whether you're looking for reliable domestic help or seeking employment opportunities, 
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
    </main>
  );
}
