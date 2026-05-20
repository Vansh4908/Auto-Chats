import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, ShieldCheck, Mail, ArrowRight, RefreshCw } from 'lucide-react';

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const flow = searchParams.get('flow') || 'login';
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Resend countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    const result = await verifyOtp(email, code);
    if (result.success) {
      setSuccessMsg('Email verified successfully! Logging you in...');
      setTimeout(() => {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else if (!result.user.instagramConnected) {
          navigate('/connect-ig');
        } else {
          navigate('/dashboard'); // Standard home/dashboard
        }
      }, 1500);
    } else {
      setError(result.error || 'Invalid or expired code. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setError('');
    setSuccessMsg('');
    setIsResending(true);

    const result = await resendOtp(email);
    if (result.success) {
      setSuccessMsg('A new verification code has been sent to your email.');
      setResendTimer(60);
    } else {
      setError(result.error || 'Failed to resend code. Please try again later.');
    }
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow matching the flow theme */}
      <div 
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-[120px] rounded-full pointer-events-none transition-all duration-500 ${
          flow === 'signup' ? 'bg-orange-500/20' : 'bg-teal-500/20'
        }`} 
      />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className={`flex justify-center mb-6 transition-all duration-300 ${
          flow === 'signup' ? 'text-orange-500' : 'text-teal-500'
        }`}>
          <Utensils size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Enter Verification Code
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          We have sent a 6-digit verification code to <span className="font-semibold text-white">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#1f2937]/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-700/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg text-sm text-center">
                {successMsg}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 text-center mb-4">
                Verification Code
              </label>
              
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  maxLength={6}
                  required
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className={`bg-[#374151]/50 border text-center text-3xl font-bold tracking-[0.75em] text-white block w-full py-4 rounded-xl focus:ring-2 sm:text-3xl transition-all ${
                    flow === 'signup' 
                      ? 'border-gray-600 focus:ring-orange-500 focus:border-orange-500' 
                      : 'border-gray-600 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                  placeholder="000000"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all disabled:opacity-50 ${
                  flow === 'signup'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:ring-orange-500'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 focus:ring-teal-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900`}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
                {!isLoading && <ShieldCheck className="ml-2 h-5 w-5" />}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center justify-between space-y-4 border-t border-gray-700/50 pt-6 text-sm">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || isResending}
              className={`flex items-center space-x-2 font-medium transition-colors ${
                resendTimer > 0 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : flow === 'signup'
                    ? 'text-orange-500 hover:text-orange-400'
                    : 'text-teal-500 hover:text-teal-400'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              <span>
                {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Verification Code'}
              </span>
            </button>

            <Link 
              to={flow === 'signup' ? '/signup' : '/login'} 
              className="text-gray-400 hover:text-gray-300 transition-colors flex items-center"
            >
              Back to {flow === 'signup' ? 'Sign up' : 'Sign in'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
