import OTPDebugger from "@/components/debug/OTPDebugger";

export default function DebugOTPPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">CityMaid OTP Debug Tool</h1>
        <OTPDebugger />
      </div>
    </div>
  );
}
