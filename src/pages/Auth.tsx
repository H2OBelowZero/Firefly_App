
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthForm from "../components/AuthForm";

const Auth = () => {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    // Check URL params for register flag
    const searchParams = new URLSearchParams(location.search);
    const registerParam = searchParams.get("register");
    setIsRegister(registerParam === "true");
  }, [location.search]);

  const toggleMode = () => {
    setIsRegister(!isRegister);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-transparent -z-10"></div>
      
      {/* Animated background shapes */}
      <div className="absolute top-20 right-[10%] w-72 h-72 bg-fire/5 rounded-full blur-3xl animate-pulse-subtle -z-10"></div>
      <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-subtle -z-10"></div>
      
      {/* Header */}
      <header className="py-5">
        <div className="container mx-auto px-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-fire flex items-center justify-center">
              <span className="font-bold text-white">FP</span>
            </div>
            <span className="font-bold text-lg">FirePlan</span>
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2 lg:pr-12">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 animate-fade-in">
                {isRegister ? "Join South Africa's Fire Plan Revolution" : "Welcome Back to FirePlan"}
              </h1>
              <p className="text-muted-foreground mb-6 animate-fade-in animate-delay-100">
                {isRegister
                  ? "Create fire plans that meet all SANS 10400 requirements with ease. Start your journey to faster, more accurate fire planning today."
                  : "Continue creating compliant fire plans with South Africa's leading fire planning platform."}
              </p>
              
              <div className="space-y-4 animate-fade-in animate-delay-200">
                <div className="flex items-start">
                  <div className="bg-safety-muted p-2 rounded-full mr-3">
                    <svg className="h-5 w-5 text-safety" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">SANS 10400 Compliance</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatic validation against all relevant SANS requirements
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-safety-muted p-2 rounded-full mr-3">
                    <svg className="h-5 w-5 text-safety" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Interactive Design Tools</h3>
                    <p className="text-sm text-muted-foreground">
                      Powerful CAD integration for floor plan annotation
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-safety-muted p-2 rounded-full mr-3">
                    <svg className="h-5 w-5 text-safety" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Automated Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate complete submission-ready documentation
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 animate-fade-in animate-delay-300">
              <AuthForm isRegister={isRegister} onToggleMode={toggleMode} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2023 FirePlan. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
