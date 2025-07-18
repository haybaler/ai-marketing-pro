
"use client"

import { useState } from "react";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Target,
  Zap
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    company_size: "",
    industry: "",
    current_marketing_stack: "",
    ai_experience: "",
    consultation_type: "",
    budget_range: "",
    timeline: "",
    specific_goals: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await apiClient.submitConsultationRequest(formData);
      setSubmitStatus("success");
      setFormData({
        company_name: "",
        contact_person: "",
        email: "",
        phone: "",
        company_size: "",
        industry: "",
        current_marketing_stack: "",
        ai_experience: "",
        consultation_type: "",
        budget_range: "",
        timeline: "",
        specific_goals: ""
      });
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error submitting consultation request:", error);
    }
    
    setIsSubmitting(false);
  };

  const consultationTypes = [
    { value: "strategy", label: "AI Strategy Development", icon: Target },
    { value: "implementation", label: "Technology Implementation", icon: Zap },
    { value: "optimization", label: "Performance Optimization", icon: Sparkles },
    { value: "training", label: "Team Training & Support", icon: CheckCircle },
    { value: "comprehensive", label: "Comprehensive AI Overhaul", icon: ArrowRight }
  ];

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
            Let's Transform Your Marketing with AI
          </h1>
          <p className="text-xl text-[var(--text-light)] max-w-3xl mx-auto">
            Schedule a personalized consultation to discover how AI can revolutionize your marketing strategy and drive unprecedented growth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl font-bold text-[var(--primary-navy)]">
                  Request Your Free Consultation
                </CardTitle>
                <p className="text-[var(--text-light)] mt-2">
                  Tell us about your business and marketing goals. We'll create a custom AI strategy just for you.
                </p>
              </CardHeader>
              <CardContent>
                {submitStatus === "success" && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Thank you! Your consultation request has been submitted. We'll contact you within 24 hours.
                    </AlertDescription>
                  </Alert>
                )}
                
                {submitStatus === "error" && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      Something went wrong. Please try again or contact us directly.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company & Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company_name" className="text-[var(--primary-navy)] font-medium">
                        Company Name *
                      </Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => handleChange("company_name", e.target.value)}
                        placeholder="Your company name"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_person" className="text-[var(--primary-navy)] font-medium">
                        Contact Person *
                      </Label>
                      <Input
                        id="contact_person"
                        value={formData.contact_person}
                        onChange={(e) => handleChange("contact_person", e.target.value)}
                        placeholder="Your full name"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="text-[var(--primary-navy)] font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="your.email@company.com"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-[var(--primary-navy)] font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[var(--primary-navy)] font-medium">Company Size</Label>
                      <Select value={formData.company_size} onValueChange={(value) => handleChange("company_size", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                          <SelectItem value="small">Small (11-50 employees)</SelectItem>
                          <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                          <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="industry" className="text-[var(--primary-navy)] font-medium">
                        Industry
                      </Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleChange("industry", e.target.value)}
                        placeholder="e.g., E-commerce, SaaS, Healthcare"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* AI Experience & Consultation Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[var(--primary-navy)] font-medium">AI Experience Level</Label>
                      <Select value={formData.ai_experience} onValueChange={(value) => handleChange("ai_experience", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No AI experience</SelectItem>
                          <SelectItem value="basic">Basic (some exposure)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (actively using)</SelectItem>
                          <SelectItem value="advanced">Advanced (AI-first approach)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[var(--primary-navy)] font-medium">Budget Range</Label>
                      <Select value={formData.budget_range} onValueChange={(value) => handleChange("budget_range", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under_5k">Under $5,000</SelectItem>
                          <SelectItem value="5k_15k">$5,000 - $15,000</SelectItem>
                          <SelectItem value="15k_50k">$15,000 - $50,000</SelectItem>
                          <SelectItem value="50k_plus">$50,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Consultation Type */}
                  <div>
                    <Label className="text-[var(--primary-navy)] font-medium">Consultation Type *</Label>
                    <Select value={formData.consultation_type} onValueChange={(value) => handleChange("consultation_type", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select consultation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {consultationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Current Marketing Stack */}
                  <div>
                    <Label htmlFor="current_marketing_stack" className="text-[var(--primary-navy)] font-medium">
                      Current Marketing Stack
                    </Label>
                    <Textarea
                      id="current_marketing_stack"
                      value={formData.current_marketing_stack}
                      onChange={(e) => handleChange("current_marketing_stack", e.target.value)}
                      placeholder="Tell us about your current marketing tools and platforms (e.g., HubSpot, Google Analytics, Facebook Ads, etc.)"
                      className="mt-1 h-24"
                    />
                  </div>

                  {/* Timeline */}
                  <div>
                    <Label htmlFor="timeline" className="text-[var(--primary-navy)] font-medium">
                      Implementation Timeline
                    </Label>
                    <Input
                      id="timeline"
                      value={formData.timeline}
                      onChange={(e) => handleChange("timeline", e.target.value)}
                      placeholder="e.g., 3-6 months, ASAP, Q2 2024"
                      className="mt-1"
                    />
                  </div>

                  {/* Specific Goals */}
                  <div>
                    <Label htmlFor="specific_goals" className="text-[var(--primary-navy)] font-medium">
                      Specific Goals & Challenges *
                    </Label>
                    <Textarea
                      id="specific_goals"
                      value={formData.specific_goals}
                      onChange={(e) => handleChange("specific_goals", e.target.value)}
                      placeholder="Describe your marketing challenges and what you hope to achieve with AI (e.g., increase conversions, automate lead scoring, personalize customer journeys, etc.)"
                      className="mt-1 h-32"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[var(--primary-navy)] hover:bg-[var(--primary-navy)]/90 text-white py-4 rounded-full text-lg font-semibold hover-lift"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        Request Free Consultation
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Response Time */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-[var(--primary-navy)] to-[var(--primary-navy)]/90 text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-6 h-6 text-[var(--accent-gold)]" />
                  <h3 className="text-lg font-semibold">Quick Response</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  We respond to all consultation requests within 24 hours. Urgent inquiries are handled the same day.
                </p>
                <Badge className="bg-[var(--accent-gold)] text-[var(--primary-navy)]">
                  24-Hour Response Guarantee
                </Badge>
              </CardContent>
            </Card>

            {/* Consultation Types */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[var(--primary-navy)]">
                  Consultation Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultationTypes.map((type, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[var(--accent-gold)]/10 rounded-full flex items-center justify-center">
                        <type.icon className="w-4 h-4 text-[var(--primary-navy)]" />
                      </div>
                      <span className="text-[var(--text-dark)] font-medium">{type.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
