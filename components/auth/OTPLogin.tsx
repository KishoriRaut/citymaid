"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { sendPhoneOTPClient, verifyPhoneOTPClient, getCurrentPhoneUserClient } from "@/lib/phone-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredRedirect, clearStoredRedirect, getPaymentUrl } from "@/lib/redirect-utils";

interface OTPLoginProps {
  onSuccess?: (user: any) => void;
  redirectTo?: string;
}

export default function OTPLogin({ onSuccess, redirectTo }: OTPLoginProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query params or stored redirect
  const getRedirectUrl = () => {
    // First check URL parameter
    const urlRedirect = searchParams?.get('redirect');
    if (urlRedirect) {
      return decodeURIComponent(urlRedirect);
    }
    
    // Then check stored redirect (for post unlock flow)
    const storedRedirect = getStoredRedirect();
    if (storedRedirect) {
      return getPaymentUrl(storedRedirect.postId);
    }
    
    // Finally use the prop or default
    return redirectTo || "/admin";
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number with country code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await sendPhoneOTPClient(phone);
      
      if (result.success) {
        setSuccess("OTP sent successfully! Please check your phone.");
        setStep("otp");
      } else {
        setError(result.error || "Failed to send OTP");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await verifyPhoneOTPClient(phone, otp);
      
      if (result.success && result.user) {
        setSuccess("Login successful! Redirecting...");
        
        const userProfile = await getCurrentPhoneUserClient();
        
        if (onSuccess) {
          onSuccess(result.user);
        }
        
        // Clear stored redirect after successful login
        clearStoredRedirect();
        
        // Redirect to appropriate URL
        const redirectUrl = getRedirectUrl();
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1500);
      } else {
        setError(result.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await sendPhoneOTPClient(phone);
      
      if (result.success) {
        setSuccess("OTP resent successfully!");
      } else {
        setError(result.error || "Failed to resend OTP");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    
    // Allow country code (+9779841234567) or local format
    if (value.startsWith('977')) {
      // Nepal format: +977 984-1234567
      if (value.length <= 3) {
        setPhone(`+${value}`);
      } else if (value.length <= 6) {
        setPhone(`+${value.slice(0, 3)} ${value.slice(3)}`);
      } else if (value.length <= 10) {
        setPhone(`+${value.slice(0, 3)} ${value.slice(3, 6)}-${value.slice(6)}`);
      } else {
        setPhone(`+${value.slice(0, 3)} ${value.slice(3, 6)}-${value.slice(6, 10)}${value.slice(10) ? value.slice(10) : ''}`);
      }
    } else if (value.startsWith('1')) {
      // US format: +1 (984) 123-4567
      if (value.length <= 1) {
        setPhone(`+${value}`);
      } else if (value.length <= 4) {
        setPhone(`+${value.slice(0, 1)} (${value.slice(1)}`);
      } else if (value.length <= 7) {
        setPhone(`+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4)}`);
      } else {
        setPhone(`+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 11)}`);
      }
    } else {
      // Default format for other countries or local numbers
      if (value.length <= 3) {
        setPhone(value);
      } else if (value.length <= 6) {
        setPhone(`${value.slice(0, 3)}-${value.slice(3)}`);
      } else {
        setPhone(`${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`);
      }
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Phone Login
          </h2>
          <p className="text-gray-600">
            {step === "phone" 
              ? "Enter your phone number to receive a verification code"
              : "Enter the 6-digit code sent to your phone"
            }
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800 text-sm">{success}</div>
            </div>
          )}

          {step === "phone" ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+977 984-1234567 or +1 (984) 123-4567"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Include country code (e.g., +977 for Nepal, +1 for US)
                </p>
              </div>

              <Button 
                onClick={handleSendOTP} 
                disabled={loading || phone.length < 10}
                className="w-full"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={handleOTPChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="text-sm text-gray-600 text-center">
                Code sent to: <span className="font-medium">{phone}</span>
              </div>

              <Button 
                onClick={handleVerifyOTP} 
                disabled={loading || otp.length < 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Resending..." : "Resend OTP"}
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                className="w-full"
              >
                ← Back to Phone Number
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>OTP expires in 5 minutes</p>
            <p>1 OTP per minute per phone number</p>
          </div>
        </div>
      </div>
    </div>
  );
}
