"use client";

import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqs: FAQ[] = [
    // General Questions
    {
      question: "What is CityMaid?",
      answer: "CityMaid is a trusted platform that connects families and individuals with verified domestic workers across Nepal. We provide a safe and reliable way to find skilled domestic help for cooking, cleaning, childcare, elderly care, and other household services.",
      category: "general"
    },
    {
      question: "How does CityMaid work?",
      answer: "CityMaid works as a marketplace where families can post their requirements and domestic workers can find job opportunities. Families can browse profiles, check worker details, and contact verified workers. Workers can create profiles, showcase their skills, and apply for suitable positions.",
      category: "general"
    },
    {
      question: "Is CityMaid available in my city?",
      answer: "CityMaid is currently available in major cities across Nepal including Kathmandu, Pokhara, Biratnagar, Lalitpur, Bharatpur, Birgunj, and Dharan. We are continuously expanding our services to other cities.",
      category: "general"
    },

    // For Families
    {
      question: "How do I find a domestic worker?",
      answer: "You can browse through available workers on our platform, filter by location, skills, and availability. Once you find a suitable worker, you can unlock their contact information for a small fee and directly contact them to discuss your requirements.",
      category: "families"
    },
    {
      question: "How are workers verified?",
      answer: "All workers on CityMaid go through a thorough verification process including identity verification, skill assessment, and background checks. We also collect references and conduct interviews to ensure the safety and reliability of our workers.",
      category: "families"
    },
    {
      question: "What services do domestic workers provide?",
      answer: "Our workers provide various services including cooking, cleaning, childcare, elderly care, laundry, dishwashing, and general household help. You can specify your requirements when posting a job or searching for workers.",
      category: "families"
    },
    {
      question: "How much does it cost to hire a domestic worker?",
      answer: "The cost varies depending on the worker's skills, experience, location, and the type of work. Workers typically charge monthly salaries ranging from NPR 8,000 to NPR 25,000. The exact amount is negotiated between you and the worker.",
      category: "families"
    },
    {
      question: "What is the contact unlock fee?",
      answer: "We charge a small verification fee of Rs. 299 to unlock a worker's contact information. This helps protect workers from spam and ensures only serious inquiries are made. The fee is refundable if you hire the worker through our platform.",
      category: "families"
    },

    // For Workers
    {
      question: "How do I register as a domestic worker?",
      answer: "Registration is free! Simply create an account, fill in your personal details, skills, experience, and availability. You'll need to provide identification documents and undergo our verification process before your profile becomes active.",
      category: "workers"
    },
    {
      question: "What documents do I need to register?",
      answer: "You'll need a valid citizenship card or passport, recent photographs, and any skill certificates you may have. We also require references from previous employers if available.",
      category: "workers"
    },
    {
      question: "How much does it cost to register?",
      answer: "Registration for domestic workers is completely free. We don't charge any registration or subscription fees. You only pay a small commission when you get a job through our platform.",
      category: "workers"
    },
    {
      question: "How do I get jobs through CityMaid?",
      answer: "Once your profile is verified, families can view your profile and contact you directly. You can also browse job postings and apply for positions that match your skills and preferences. Keep your profile updated to increase your chances of getting hired.",
      category: "workers"
    },

    // Payments & Safety
    {
      question: "How do I pay for services?",
      answer: "Payment arrangements are made directly between you and the worker. Most workers prefer monthly payments in cash or bank transfer. We recommend discussing payment terms before starting work.",
      category: "payments"
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your payment information. The small unlock fee is processed through secure payment gateways.",
      category: "payments"
    },
    {
      question: "What if I'm not satisfied with the worker?",
      answer: "We recommend discussing any issues directly with the worker first. If problems persist, you can contact our support team for mediation. We also have a rating and review system to help maintain quality standards.",
      category: "safety"
    },
    {
      question: "How do you ensure safety for both families and workers?",
      answer: "We implement multiple safety measures including thorough verification processes, secure communication channels, rating systems, and a dedicated support team to handle any issues. We also provide guidelines for safe hiring practices.",
      category: "safety"
    },

    // Technical Support
    {
      question: "I forgot my password. How do I reset it?",
      answer: "Click on the 'Forgot Password' link on the login page. Enter your registered email address, and we'll send you instructions to reset your password.",
      category: "technical"
    },
    {
      question: "How do I update my profile information?",
      answer: "Log in to your account and go to the 'My Profile' section. You can update your personal information, skills, availability, and other details there. Don't forget to save your changes.",
      category: "technical"
    },
    {
      question: "Is CityMaid available on mobile?",
      answer: "Yes, our website is fully responsive and works well on mobile devices. We're also working on a dedicated mobile app that will be available soon.",
      category: "technical"
    }
  ];

  const categories = [
    { id: "all", name: "All Questions", count: faqs.length },
    { id: "general", name: "General", count: faqs.filter(f => f.category === "general").length },
    { id: "families", name: "For Families", count: faqs.filter(f => f.category === "families").length },
    { id: "workers", name: "For Workers", count: faqs.filter(f => f.category === "workers").length },
    { id: "payments", name: "Payments", count: faqs.filter(f => f.category === "payments").length },
    { id: "safety", name: "Safety", count: faqs.filter(f => f.category === "safety").length },
    { id: "technical", name: "Technical Support", count: faqs.filter(f => f.category === "technical").length }
  ];

  const filteredFAQs = activeCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about CityMaid services, registration, payments, and more.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleExpanded(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                  expandedItems.includes(index) ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedItems.includes(index) && (
              <div className="px-6 pb-4">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No questions found in this category.</p>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Still have questions?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a 
            href="/pages/contact" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Contact Support
          </a>
          <a 
            href="/" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Browse Workers
          </a>
        </div>
      </div>
    </main>
  );
}
