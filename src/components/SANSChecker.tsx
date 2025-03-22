
import React, { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface ComplianceItem {
  id: string;
  description: string;
  status: "compliant" | "non-compliant" | "warning" | "info";
  regulation: string;
  details: string;
}

interface SANSCheckerProps {
  className?: string;
}

const SANSChecker: React.FC<SANSCheckerProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState<string>("sans-t");

  const complianceItems: Record<string, ComplianceItem[]> = {
    "sans-t": [
      {
        id: "t-1",
        description: "Fire escape route travel distance",
        status: "compliant",
        regulation: "SANS 10400-T 4.29",
        details: "Maximum travel distance of 45m to fire escape is met. Current maximum: 37m."
      },
      {
        id: "t-2",
        description: "Fire door clearance",
        status: "non-compliant",
        regulation: "SANS 10400-T 3.4.2.2",
        details: "Fire door clearance should be 3mm. Current clearance: 5mm."
      },
      {
        id: "t-3",
        description: "Fire extinguisher placement",
        status: "warning",
        regulation: "SANS 10400-T 4.37",
        details: "Fire extinguisher in south-east corner exceeds maximum 30m distance to access."
      },
      {
        id: "t-4",
        description: "Emergency lighting",
        status: "compliant",
        regulation: "SANS 10400-T 4.44",
        details: "Emergency lighting meets the minimum illumination requirements."
      }
    ],
    "sans-w": [
      {
        id: "w-1",
        description: "Water supply pressure",
        status: "compliant",
        regulation: "SANS 10400-W 4.3.2",
        details: "Water pressure meets minimum requirements of 300 kPa."
      },
      {
        id: "w-2",
        description: "Sprinkler coverage",
        status: "warning",
        regulation: "SANS 10400-W 4.4.3",
        details: "North-east corner may have insufficient sprinkler coverage."
      },
      {
        id: "w-3",
        description: "Water supply point placement",
        status: "compliant",
        regulation: "SANS 10400-W 4.2.3",
        details: "Water supply points are correctly placed within 60m intervals."
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-safety" />;
      case "non-compliant":
        return <XCircle className="h-5 w-5 text-fire" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-primary" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-safety-muted text-safety";
      case "non-compliant":
        return "bg-fire-muted text-fire";
      case "warning":
        return "bg-amber-100 text-amber-600";
      case "info":
        return "bg-primary/10 text-primary";
      default:
        return "";
    }
  };

  return (
    <div className={`glass-card p-5 ${className}`}>
      <h3 className="text-lg font-medium mb-4">SANS Compliance Checker</h3>
      
      {/* Tabs */}
      <div className="flex space-x-2 mb-4 border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "sans-t"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("sans-t")}
        >
          SANS 10400-T
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "sans-w"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("sans-w")}
        >
          SANS 10400-W
        </button>
      </div>
      
      {/* Compliance Items */}
      <div className="space-y-3">
        {complianceItems[activeTab].map((item) => (
          <div 
            key={item.id} 
            className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <div className="flex items-start">
              <div className="mt-0.5 mr-3">{getStatusIcon(item.status)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">{item.description}</h4>
                  <span 
                    className={`text-xs px-2 py-0.5 rounded-full ${getStatusClass(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {item.regulation}
                </p>
                <p className="text-sm">{item.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium">Compliance Score:</span>{" "}
          <span className={activeTab === "sans-t" ? "text-amber-500" : "text-safety"}>
            {activeTab === "sans-t" ? "75%" : "92%"}
          </span>
        </div>
        <button className="btn-secondary text-xs h-8 px-3">
          Generate Full Report
        </button>
      </div>
    </div>
  );
};

export default SANSChecker;
