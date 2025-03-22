
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, FileCheck } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-transparent -z-10"></div>
      
      {/* Animated background shapes */}
      <div className="absolute top-20 right-[10%] w-72 h-72 bg-fire/5 rounded-full blur-3xl animate-pulse-subtle -z-10"></div>
      <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-subtle -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full px-3 py-1 mb-6 border border-border bg-background/80 backdrop-blur-sm">
            <span className="badge badge-fire">New</span>
            <span className="text-sm ml-2">SANS 10400 Compliance Tool</span>
          </div>
          
          {/* Heading */}
          <h1 className="heading-hero mb-6 animate-fade-in">
            Create SANS-Compliant Fire Plans with{" "}
            <span className="text-fire">Precision</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg text-muted-foreground mb-8 animate-fade-in animate-delay-100">
            The intelligent assistant for fire engineers in South Africa. Design, validate, 
            and submit fire plans that meet all regulatory requirements with ease.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in animate-delay-200">
            <Link to="/auth?register=true" className="btn-primary bg-fire text-white hover:bg-fire/90 h-12 px-8">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/features" className="btn-secondary h-12 px-8">
              Explore Features
            </Link>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left animate-fade-in animate-delay-300">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-safety-muted p-2 rounded-md">
                <ShieldCheck className="h-5 w-5 text-safety" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Regulatory Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic validation against SANS 10400-T & W requirements
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-md">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">AI-Powered Assistance</h3>
                <p className="text-sm text-muted-foreground">
                  Intelligent suggestions and design optimization
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-fire-muted p-2 rounded-md">
                <FileCheck className="h-5 w-5 text-fire" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Streamlined Submission</h3>
                <p className="text-sm text-muted-foreground">
                  Automated documentation and municipal submission
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
