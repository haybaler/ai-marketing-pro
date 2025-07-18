"use client"

import React, { useState } from "react";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, 
  Wand2, 
  Bot, 
  MessageCircle, 
  Globe, 
  Copy, 
  Share2, 
  Mail,
  Zap,
  CheckCircle
} from "lucide-react";

export default function Playground() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!url || !prompt) return;
    
    setIsLoading(true);
    setError(null);
    setResponse("");

    try {
      const result = await apiClient.generateMarketingContent({ url, prompt });
      const data = await result.json();
      
      if (data && data.content) {
        setResponse(data.content);
      } else {
        throw new Error("Invalid response structure from AI service.");
      }
    } catch (err) {
      setError("An error occurred while generating the response. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text');
    }
  };

  const handleShare = () => {
    if (navigator.share && response) {
      navigator.share({
        title: 'Marketing Insights',
        text: response
      });
    }
  };

  const handleEmail = () => {
    if (!response) return;
    const subject = encodeURIComponent('Marketing Strategy Insights');
    const body = encodeURIComponent(response);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const ResponseDisplay = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Analyzing website & generating strategic insights...</span>
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
    }
    if (error) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      );
    }
    if (response) {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Strategic Analysis Complete</span>
            </div>
            <div className="text-xs text-green-700">
              ✓ Website analyzed with Firecrawl ✓ Market research via Serper ✓ Analysis powered by NVIDIA NIM
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed">
            <div className="whitespace-pre-wrap">{response}</div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            
            {navigator.share && (
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            )}
            
            <Button
              onClick={handleEmail}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="text-center text-[var(--text-tertiary)]">
        <MessageCircle className="mx-auto h-12 w-12 mb-4" />
        <p>Enter your website URL and ask a marketing question to get strategic insights.</p>
      </div>
    );
  };

  const exampleQuestions = [
    "How can I improve my website's conversion rate?",
    "What's the best way to position my product against competitors?",
    "How should I optimize my pricing strategy?",
    "What marketing channels should I prioritize for growth?"
  ];

  return (
    <div className="min-h-screen py-20 bg-[var(--background-secondary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
           <Badge className="mb-8 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white border-0 px-3 py-1 text-xs font-medium">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Marketing AI Advisor
            </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 text-balance">
            Get Personalized Marketing Strategy
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto text-balance">
            Enter your website URL and ask any marketing question. Our AI will analyze your site, research your market, and provide strategic insights tailored specifically to your business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Card */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-[var(--text-primary)]">
                <Wand2 className="w-6 h-6" />
                Your Business Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* URL Input */}
                <div>
                  <Label htmlFor="url" className="text-[var(--text-primary)] font-medium flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4" />
                    Website URL *
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-base"
                    required
                  />
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    We'll analyze your website and research your market to provide contextual advice
                  </p>
                </div>

                {/* Question Input */}
                <div>
                  <Label htmlFor="question" className="text-[var(--text-primary)] font-medium mb-2 block">
                    Your Marketing Question *
                  </Label>
                  <Textarea
                    id="question"
                    placeholder="e.g., 'How can I improve my homepage conversion rate?' or 'What's the best pricing strategy for my SaaS product?'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-32 text-base"
                    required
                  />
                </div>
                
                {/* Example Questions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Popular questions:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {exampleQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(question)}
                        className="text-left text-sm p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        "{question}"
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || !prompt || !url}
                  className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-lg py-6 disabled:opacity-50"
                >
                  {isLoading ? "Analyzing & Generating Insights..." : "Get Strategic Advice"}
                  {!isLoading && <Sparkles className="w-5 h-5 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Output Card */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-[var(--text-primary)]">
                <Bot className="w-6 h-6" />
                Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[500px]">
              <ResponseDisplay />
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack Info */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                Powered by Advanced AI Stack
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Our AI playground combines Firecrawl for website analysis, Serper for competitive research, 
                and NVIDIA NIM for strategic insights - giving you the most comprehensive marketing advice possible.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}