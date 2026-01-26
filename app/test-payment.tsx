"use client";

export default function TestPaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">🎉 NEW PAYMENT PAGE WORKING!</h1>
        <p className="text-xl text-gray-700 mb-8">This is the updated professional payment page</p>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Payment Features:</h2>
          <ul className="text-left space-y-2">
            <li>✅ Professional Design</li>
            <li>✅ Rs. 299 Payment Amount</li>
            <li>✅ QR Code Integration</li>
            <li>✅ File Upload Validation</li>
            <li>✅ Toast Notifications</li>
            <li>✅ Responsive Layout</li>
          </ul>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          If you see this page, the routing issue is fixed!
        </p>
      </div>
    </div>
  );
}
