import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import FloorPlanViewer from "../components/FloorPlanViewer";
import SANSChecker from "../components/SANSChecker";
import { ArrowRight, Shield, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense("ORg4AjUWIQA/Gnt2WhhQ1Fac11JW3xNYVF2R2FJe1RzdF9DZkwgOX1dQ19h5XtTcEVhWndceXFdQmY=")

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fire"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />

      <Features />

      {/* Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-4">Experience the Power</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our intuitive interface makes it easy to create and validate fire plans
              that meet all South African regulatory requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="h-[500px] glass-card overflow-hidden rounded-xl shadow-xl">
              <FloorPlanViewer className="w-full h-full" />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-4">Interactive 3D Visualization</h3>
              <p className="text-muted-foreground">
                Easily visualize and edit your fire plans in an interactive 3D environment.
                Place fire safety equipment, plan evacuation routes, and ensure compliance
                with SANS 10400 requirements.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 bg-primary/10 p-1.5 rounded-md mr-3">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Real-time Compliance Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      Instantly see compliance issues and get suggestions for corrections.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 bg-safety-muted p-1.5 rounded-md mr-3">
                    <BookOpen className="h-4 w-4 text-safety" />
                  </div>
                  <div>
                    <h4 className="font-medium">Built-in SANS Reference</h4>
                    <p className="text-sm text-muted-foreground">
                      Access relevant SANS clauses directly within the application.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 bg-fire-muted p-1.5 rounded-md mr-3">
                    <Users className="h-4 w-4 text-fire" />
                  </div>
                  <div>
                    <h4 className="font-medium">Collaborative Workflow</h4>
                    <p className="text-sm text-muted-foreground">
                      Seamlessly collaborate with team members and stakeholders.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/auth?register=true"
                className="btn-primary bg-fire text-white hover:bg-fire/90 inline-flex mt-4"
              >
                Try it Free for 14 Days
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SANS Compliance Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <h3 className="text-2xl font-bold mb-4">Comprehensive SANS Compliance</h3>
              <p className="text-muted-foreground">
                Our built-in SANS rule engine validates your fire plans against all relevant
                South African National Standards requirements, ensuring that your designs are
                fully compliant before submission.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-md mr-3">
                    <span className="font-bold text-primary">T</span>
                  </div>
                  <div>
                    <h4 className="font-medium">SANS 10400-T (Fire Protection)</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete validation of fire protection requirements, including escape
                      routes, fire resistance, and equipment placement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-md mr-3">
                    <span className="font-bold text-primary">W</span>
                  </div>
                  <div>
                    <h4 className="font-medium">SANS 10400-W (Water)</h4>
                    <p className="text-sm text-muted-foreground">
                      Validation of water supply requirements for fire protection systems,
                      including pressure calculations and valve placement.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/features"
                className="btn-secondary inline-flex mt-4"
              >
                Learn More About Compliance Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <SANSChecker className="shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-fire/5 -z-10"></div>
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-fire/5 rounded-full blur-3xl animate-pulse-subtle -z-10"></div>
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-subtle -z-10"></div>
        
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="heading-section mb-6">Ready to Transform Your Fire Planning Process?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join hundreds of fire engineers across South Africa who are creating
              SANS-compliant fire plans faster and more accurately than ever before.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/auth?register=true"
                className="btn-primary bg-fire text-white hover:bg-fire/90 h-12 px-8"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#"
                className="btn-secondary h-12 px-8"
              >
                Schedule a Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-fire flex items-center justify-center">
                  <span className="font-bold text-white">FP</span>
                </div>
                <span className="font-bold text-lg">FireFly</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Helping fire engineers create SANS-compliant fire plans with ease.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Testimonials</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Tutorials</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">SANS References</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">About Us</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2023 FireFly. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
