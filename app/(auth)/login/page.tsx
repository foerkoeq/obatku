import ObatkuLoginForm from "@/components/partials/auth/obatku-login-form";
import Image from "next/image";
import ObatkuCopyright from "@/components/partials/auth/obatku-copyright";
import ObatkuLogo from "@/components/partials/auth/obatku-logo";

const LoginPage = () => {
  return (
    <>
      <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
        <div className="overflow-y-auto flex flex-wrap w-full h-dvh">
          
          {/* Left Side - Branding */}
          <div className="lg:block hidden flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600 relative z-1 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <div className="max-w-[520px] pt-20 ps-20">
              <div className="mb-8">
                <ObatkuLogo />
              </div>
              
              {/* Hero Text */}
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white leading-tight">
                  Kelola Distribusi Obat
                  <span className="text-primary block">
                    Pertanian dengan Mudah
                  </span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Sistem terintegrasi untuk manajemen inventori, distribusi, dan pelaporan obat pertanian yang efisien dan akurat.
                </p>
              </div>

              {/* Features List */}
              <div className="mt-8 space-y-3 text-base">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Manajemen Inventori Real-time</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Tracking Distribusi Otomatis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Laporan Komprehensif</span>
                </div>
              </div>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute right-0 bottom-0 w-96 h-96 opacity-10">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 relative">
            <div className="h-full flex flex-col dark:bg-default-100 bg-white">
              <div className="max-w-[480px] md:px-[42px] md:py-[44px] p-7 mx-auto w-full text-2xl text-default-900 mb-3 h-full flex flex-col justify-center">
                
                {/* Mobile Logo */}
                <div className="flex justify-center items-center text-center mb-8 lg:hidden">
                  <ObatkuLogo />
                </div>
                
                {/* Login Header */}
                <div className="text-center 2xl:mb-10 mb-6">
                  <h2 className="text-2xl font-bold mb-2">Selamat Datang Kembali</h2>
                  <p className="text-default-500 text-base">
                    Masuk ke akun Anda untuk mengakses sistem manajemen obat pertanian
                  </p>
                </div>
                
                {/* Login Form */}
                <ObatkuLoginForm />
                
                {/* Support Information */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Butuh bantuan?</p>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        Hubungi administrator sistem jika mengalami kesulitan dalam mengakses akun Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-xs font-normal text-default-500 z-999 pb-6 text-center px-7">
                <ObatkuCopyright />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
