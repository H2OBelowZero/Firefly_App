
import React from "react";
import { 
  FileCheck, 
  Book, 
  Ruler, 
  AreaChart, 
  Droplets, 
  Lightbulb, 
  Building, 
  Upload 
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Book />,
      title: "SANS Rule Engine",
      description: "Comprehensive rule checks for SANS 10400-T and 10400-W compliance with automatic validation."
    },
    {
      icon: <Ruler />,
      title: "CAD Integration",
      description: "Seamless import and annotation of floor plans with component placement and measurement."
    },
    {
      icon: <AreaChart />,
      title: "Compliance Analysis",
      description: "Real-time compliance validation with detailed reports and auto-suggested corrections."
    },
    {
      icon: <Droplets />,
      title: "Water Systems Module",
      description: "Design and validate water-based fire protection systems with pressure and flow calculations."
    },
    {
      icon: <Lightbulb />,
      title: "AI Assistance",
      description: "Intelligent design suggestions and predictive compliance checking."
    },
    {
      icon: <Building />,
      title: "Occupancy Planning",
      description: "Automatic occupancy load calculations based on floor area and SANS occupancy factors."
    },
    {
      icon: <FileCheck />,
      title: "Documentation",
      description: "One-click generation of compliance certificates and fire department cover letters."
    },
    {
      icon: <Upload />,
      title: "Municipal Submission",
      description: "Streamlined submission process with forms pre-filled based on project data."
    }
  ];

  return (
    <section id="features" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="heading-section mb-4">Comprehensive Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designed specifically for South African fire engineers, our platform offers 
            everything you need to create fully compliant fire plans efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card p-6 card-hover"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="bg-primary/10 p-3 rounded-lg inline-flex mb-4">
                <div className="text-primary w-5 h-5">
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
