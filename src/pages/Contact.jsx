
"use client"

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function Contact() {
  useEffect(() => {
    // Load the Meetings Embed script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-[var(--accent-gold)]/10 text-[var(--primary-navy)] border-[var(--accent-gold)]/20">
            <Calendar className="w-3 h-3 mr-1" />
            Free Consultation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--primary-navy)] mb-6">
            Request Your Free Consultation
          </h1>
          <p className="text-xl text-[var(--text-light)] max-w-3xl mx-auto">
            Tell us about your business and marketing goals. We'll create a custom AI strategy just for you.
          </p>
        </div>

        {/* Meetings Embed */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div 
            className="meetings-iframe-container" 
            data-src="https://lp.highgrowthdigital.com/meetings/joshua-haydon/15-minute-discovery-call?embed=true"
          ></div>
        </div>

      </div>
    </div>
  );
}
