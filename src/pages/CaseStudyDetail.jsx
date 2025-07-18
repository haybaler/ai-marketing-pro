"use client"

import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Target, 
  Lightbulb, 
  TrendingUp,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function CaseStudyDetail({ id }) {
  const [caseStudy, setCaseStudy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCaseStudy = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const response = await apiClient.getCaseStudy(id);
        setCaseStudy(response.data);
      } catch (error) {
        console.error("Failed to load case study:", error);
      }
      setIsLoading(false);
    };
    
    loadCaseStudy();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-20 bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg-light)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen py-20 bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg-light)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--primary-navy)] mb-4">Case Study Not Found</h1>
          <Link href="/case-studies">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Case Studies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg-light)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/case-studies">
          <Button variant="outline" className="mb-8 hover-lift">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Case Studies
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <Badge className="mb-4 bg-[var(--accent-gold)]/10 text-[var(--primary-navy)] border-[var(--accent-gold)]/20">
            {caseStudy.industry}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--primary-navy)] mb-6 leading-tight">
            {caseStudy.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-[var(--text-light)]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Client: {caseStudy.client_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>9 Weeks Timeline</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={caseStudy.image_url} 
            alt={caseStudy.title}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card className="lg:col-span-2 shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-[var(--accent-gold)]" />
                <h2 className="text-2xl font-bold text-[var(--primary-navy)]">The Challenge</h2>
              </div>
              <p className="text-[var(--text-light)] leading-relaxed mb-6">
                {caseStudy.challenge}
              </p>
              
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-6 h-6 text-[var(--accent-gold)]" />
                <h2 className="text-2xl font-bold text-[var(--primary-navy)]">Our Solution</h2>
              </div>
              <p className="text-[var(--text-light)] leading-relaxed">
                {caseStudy.solution}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-[var(--primary-navy)] mb-6">Technologies Used</h3>
              <div className="space-y-3">
                {caseStudy.technologies_used?.map((tech, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-[var(--text-dark)] font-medium">{tech}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <Card className="shadow-lg border-0 mb-16">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-[var(--accent-gold)]" />
              <h2 className="text-2xl font-bold text-[var(--primary-navy)]">Results & Impact</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {caseStudy.metrics?.map((metric, index) => (
                <div key={index} className="bg-[var(--bg-light)] rounded-xl p-6">
                  <h4 className="font-semibold text-[var(--primary-navy)] mb-2">{metric.metric}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--text-light)]">Before:</span>
                    <span className="font-medium">{metric.before}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--text-light)]">After:</span>
                    <span className="font-medium">{metric.after}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-light)]">Improvement:</span>
                    <span className="font-bold text-green-600">{metric.improvement}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[var(--primary-navy)] to-[var(--primary-navy)]/90 rounded-xl p-6 text-white">
              <p className="text-lg leading-relaxed">
                <strong>Overall Impact:</strong> {caseStudy.results}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Process Details for Karius */}
        {caseStudy.client_name === "Karius" && (
          <Card className="shadow-lg border-0 mb-16">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[var(--primary-navy)] mb-8">Design Process</h2>
              
              <div className="space-y-8">
                <div className="border-l-4 border-[var(--accent-gold)] pl-6">
                  <h3 className="text-xl font-semibold text-[var(--primary-navy)] mb-3">Week 1-2: Discovery</h3>
                  <p className="text-[var(--text-light)] mb-4">
                    Content Review, User Research, Personas development. We received key performance metrics from Karius's marketing and research teams to optimize page speed and enhance Core Web Vitals.
                  </p>
                  <ul className="list-disc list-inside text-[var(--text-light)] space-y-1">
                    <li>Improve search engine performance</li>
                    <li>Turn visitors into prospects</li>
                    <li>Create effective information hub</li>
                    <li>Enable online test ordering</li>
                  </ul>
                </div>

                <div className="border-l-4 border-[var(--accent-gold)] pl-6">
                  <h3 className="text-xl font-semibold text-[var(--primary-navy)] mb-3">Week 3-5: Design</h3>
                  <p className="text-[var(--text-light)] mb-4">
                    Moodboards and Concept Development. We worked to balance human connection and AI innovation, creating concepts that reflect Karius's brand essence.
                  </p>
                  <ul className="list-disc list-inside text-[var(--text-light)] space-y-1">
                    <li>Brand consistency throughout the site</li>
                    <li>Prominent search feature implementation</li>
                    <li>Homepage concepts conveying patient stories</li>
                    <li>DNA and ladder connection illustration</li>
                  </ul>
                </div>

                <div className="border-l-4 border-[var(--accent-gold)] pl-6">
                  <h3 className="text-xl font-semibold text-[var(--primary-navy)] mb-3">Week 6-9: Prototype</h3>
                  <p className="text-[var(--text-light)] mb-4">
                    Clinical Data focus. The clinical evidence page now features a prominent search with auto-populating functionality to assist with spelling difficult pathogen names.
                  </p>
                </div>

                <div className="border-l-4 border-[var(--accent-gold)] pl-6">
                  <h3 className="text-xl font-semibold text-[var(--primary-navy)] mb-3">Week 10-12: Interactive Prototype</h3>
                  <p className="text-[var(--text-light)]">
                    Interactive Case Study development. Though designs were created for both mobile and desktop versions, development was postponed due to time and budget constraints.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[var(--primary-navy)] mb-4">
            Ready to Transform Your Brand?
          </h2>
          <p className="text-xl text-[var(--text-light)] mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help you achieve similar results with AI-powered marketing strategies.
          </p>
          <Link to={createPageUrl("Contact")}>
            <Button size="lg" className="bg-[var(--primary-navy)] hover:bg-[var(--primary-navy)]/90 text-white px-8 py-4 rounded-full text-lg font-semibold hover-lift">
              Start Your Project
              <ExternalLink className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}