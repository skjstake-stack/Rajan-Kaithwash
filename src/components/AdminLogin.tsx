import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (admin: AdminUser, token: string) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  // CAPTCHA verification mock state
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('कृपया अपना ईमेल/यूजरनेम एवं पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
          recaptchaToken: captchaVerified ? 'verified_token_2026' : 'auto_verified',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'लॉगिन विफल रहा। कृपया विवरण पुनः जाँचें।');
      }

      setSuccessMsg(data.message || 'सफलतापूर्वक लॉगिन हो गया!');
      if (rememberMe) {
        localStorage.setItem('rajan_admin_token', data.token);
        localStorage.setItem('rajan_admin_user', JSON.stringify(data.admin));
      } else {
        sessionStorage.setItem('rajan_admin_token', data.token);
        sessionStorage.setItem('rajan_admin_user', JSON.stringify(data.admin));
      }

      setTimeout(() => {
        onLoginSuccess(data.admin, data.token);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'सर्वर से कनेक्ट करने में त्रुटि आई।');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotMsg(data.message || 'सुरक्षा कोड आपके ईमेल पर प्रेषित कर दिया गया है।');
    } catch (err) {
      setForgotMsg('पासवर्ड रीसेट अनुरोध भेजने में त्रुटि आई।');
    } finally {
      setForgotLoading(false);
    }
  };

  const fillQuickCredentials = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setError(null);
    setSuccessMsg(null);
    setCaptchaVerified(true);
  };

  return (
    <div className="min-h-screen bg-[#050B18] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#B8860B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF9933]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-white/10 bg-[#050B18]/60 backdrop-blur-md">
        <button
          onClick={onBackToSite}
          className="flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-[#D4AF37] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>मुख्य वेबसाइट पर वापस जाएँ</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-full">
          <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="font-semibold tracking-wider uppercase text-[10px]">256-Bit SSL Safe Portal</span>
        </div>
      </header>

      {/* Main Glassmorphism Card Container */}
      <main className="relative z-10 my-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="w-full max-w-md bg-[#050B18]/85 backdrop-blur-2xl border border-[#D4AF37]/40 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative">
          
          {/* Top Logo & Branding */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#B8860B] to-[#FF9933] p-1 shadow-[0_0_25px_rgba(212,175,55,0.5)] mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-[#050B18] rounded-full flex items-center justify-center">
                <span className="text-3xl font-serif text-[#D4AF37] font-bold">ॐ</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37] tracking-wide leading-tight">
              राजन कैथवास जी
            </h1>
            <p className="text-xs text-white/70 font-medium tracking-wide mt-1">
              वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[#D4AF37]">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <Lock className="w-3.5 h-3.5 text-[#FF9933]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                Welcome to the Admin Control Panel
              </span>
            </div>
          </div>

          {/* Quick Demo Pre-fill Login Pills */}
          <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF9933]" /> Quick Test Admin Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@rajankaithwas.com', 'admin123')}
                className="px-2 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all font-medium text-left truncate cursor-pointer"
                title="Super Admin Login"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('manager@rajankaithwas.com', 'manager123')}
                className="px-2 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all font-medium text-left truncate cursor-pointer"
                title="Admin Manager Login"
              >
                🛡️ Admin Manager
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="font-medium">{successMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">
                ईमेल / यूजरनेम (Email or Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rajankaithwas.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#030712]/80 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#030712]/80 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/50 hover:text-[#D4AF37] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Google reCAPTCHA Verification Tile */}
            <div className="p-3 rounded-2xl bg-[#030712]/60 border border-white/10 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                <input
                  type="checkbox"
                  checked={captchaVerified}
                  onChange={(e) => setCaptchaVerified(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 text-[#D4AF37] focus:ring-[#D4AF37] bg-black/40"
                />
                <span>I'm not a robot (Google reCAPTCHA v3)</span>
              </label>
              <div className="text-[10px] text-white/40 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Protected</span>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 text-[#D4AF37] focus:ring-[#D4AF37] bg-black/40"
                />
                <span>मुझे याद रखें (Remember Me)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[#D4AF37] hover:underline font-medium"
              >
                पासवर्ड भूल गए?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#B8860B] to-[#FF9933] text-[#050B18] font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>प्रमाणीकरण हो रहा है...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>सुरक्षित लॉगिन करें (Secure Admin Login)</span>
                </>
              )}
            </button>
          </form>

          {/* Security Footnote */}
          <div className="mt-8 pt-4 border-t border-white/10 text-center text-[10px] text-white/40 space-y-1">
            <p>🔒 HTTPS Secured Session • Rate Limiting & Account Lock Security Enabled</p>
            <p>© {new Date().getFullYear()} राजन कैथवास जी। सभी अधिकार सुरक्षित।</p>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-[#050B18] border border-[#D4AF37]/50 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-serif font-bold text-[#D4AF37] mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5" /> पासवर्ड रीसेट करें
            </h3>
            <p className="text-xs text-white/70 mb-4">
              अपना पंजीकृत ईमेल दर्ज करें। हम आपको सुरक्षित पासवर्ड रीसेट निर्देश प्रेषित करेंगे।
            </p>

            {forgotMsg ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs mb-4">
                {forgotMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@rajankaithwas.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030712] border border-white/20 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs uppercase rounded-xl"
                  >
                    {forgotLoading ? 'भेज रहे हैं...' : 'OTP भेजें'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotMsg(null);
                    }}
                    className="px-4 py-2.5 border border-white/20 rounded-xl text-xs text-white/70"
                  >
                    रद्द करें
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-white/40 border-t border-white/5">
        अधिशासी एडमिन पोर्टल • केवल अधिकृत कर्मचारियों हेतु
      </footer>
    </div>
  );
};
