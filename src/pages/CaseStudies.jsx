
"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles, BookOpen, TrendingUp } from "lucide-react";

export default function CaseStudies() {
  const [caseStudies, setCaseStudies] = useState([]);
  const [featuredStudies, setFeaturedStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCaseStudies = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getCaseStudies();
        const allStudies = response.data || [];
        setCaseStudies(allStudies);
        setFeaturedStudies(allStudies.filter(cs => cs.featured));
      } catch (error) {
        console.error("Failed to load case studies:", error);
      }
      setIsLoading(false);
    };
    loadCaseStudies();
  }, []);

  const CaseStudyCard = ({ study }) => (
    <Card className="hover-lift overflow-hidden group border-0 shadow-lg flex flex-col h-full">
      <div className="overflow-hidden">
        <img 
          src={study.image_url} 
          alt={study.title} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <CardContent className="p-6 flex-grow flex flex-col">
        <Badge variant="secondary" className="mb-3 w-fit bg-[var(--accent-gold)]/10 text-[var(--primary-navy)] border-[var(--accent-gold)]/20">
          {study.industry}
        </Badge>
        <h3 className="text-xl font-bold text-[var(--primary-navy)] mb-3 flex-grow">
          {study.title}
        </h3>
        <p className="text-[var(--text-light)] mb-4 text-sm">
          {study.challenge}
        </p>
        <Link href={`/case-studies/${study.id}`}>
          <Button variant="link" className="p-0 text-[var(--primary-navy)] font-semibold group-hover:text-[var(--accent-gold)] transition-colors">
            Read Case Study <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-[var(--bg-light)] via-white to-[var(--bg-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-[var(--accent-gold)]/10 text-[var(--primary-navy)] border-[var(--accent-gold)]/20">
            <BookOpen className="w-3 h-3 mr-1" />
            Proven Success
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--primary-navy)] mb-6">
            Our Impact in Action
          </h1>
          <p className="text-xl text-[var(--text-light)] max-w-3xl mx-auto">
            Explore how we've helped businesses like yours transform their marketing with AI-driven strategies and technology.
          </p>
        </div>

        {/* Featured Case Studies */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Skeleton className="h-[450px] rounded-2xl" />
            <Skeleton className="h-[450px] rounded-2xl" />
          </div>
        ) : (
          featuredStudies.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-[var(--primary-navy)] mb-8 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-[var(--accent-gold)]" />
                Featured Projects
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredStudies.map(study => (
                  <Card key={study.id} className="hover-lift overflow-hidden group border-0 shadow-2xl flex flex-col md:flex-row">
                    <div className="md:w-2/5 overflow-hidden">
                      <img 
                        src={study.image_url} 
                        alt={study.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="md:w-3/5">
                      <CardContent className="p-8">
                        <Badge variant="secondary" className="mb-3 bg-[var(--accent-gold)]/10 text-[var(--primary-navy)] border-[var(--accent-gold)]/20">
                          {study.industry}
                        </Badge>
                        <h3 className="text-2xl font-bold text-[var(--primary-navy)] mb-3">
                          {study.title}
                        </h3>
                        <p className="text-[var(--text-light)] mb-4">
                          {study.challenge}
                        </p>
                        <div className="flex items-center space-x-2 text-green-600 font-semibold mb-6">
                          <TrendingUp className="w-5 h-5" />
                          <span>{study.results}</span>
                        </div>
                        <Link href={`/case-studies/${study.id}`}>
                          <Button className="bg-[var(--primary-navy)] hover:bg-[var(--primary-navy)]/90 text-white rounded-full group">
                            Read Full Story <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        )}

        {/* All Case Studies */}
        <div>
          <h2 className="text-3xl font-bold text-[var(--primary-navy)] mb-8">
            All Case Studies
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Skeleton className="h-[400px] rounded-xl" />
              <Skeleton className="h-[400px] rounded-xl" />
              <Skeleton className="h-[400px] rounded-xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map(study => (
                <CaseStudyCard key={study.id} study={study} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
