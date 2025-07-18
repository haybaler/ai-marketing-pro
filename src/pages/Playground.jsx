"use client"

import { useState } from "react";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
  CheckCircle,
  AlertCircle,
  Search,
  BarChart3,
  Clock
} from "lucide-react";

export default function Playground() {
  // Stage 1: Context Analysis
  const [url, setUrl] = useState("");
  const [analysisStage, setAnalysisStage] = useState('idle'); // idle, analyzing, completed, failed
  const [contextId, setContextId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [analysisSummary, setAnalysisSummary] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Stage 2: AI Chat
  const [selectedModel, setSelectedModel] = useState('openai');
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Generate a simple user ID for demo purposes
  const userId = "demo-user-123";

  const handleAnalyzeUrl = async () => {
    if (!url) return;
    
    setAnalysisStage('analyzing');
    setProgress(0);
    setAnalysisError(null);
    setContextId(null);
    setAnalysisSummary(null);

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await apiClient.analyzeContext({ url, userId });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success) {
        setContextId(result.contextId);
        setAnalysisSummary(result.summary);
        setAnalysisStage('completed');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
      
    } catch (error) {
      setAnalysisStage('failed');
      
      // Parse error details if available
      let errorMessage = error.message;
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.details) {
          errorMessage = errorData.details;
        }
      } catch {
        // Use original error message if not JSON
      }
      
      setAnalysisError(errorMessage);
      setProgress(0);
      console.error('URL analysis error:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!contextId || !question) return;
    
    setIsGenerating(true);
    setChatError(null);
    setResponse("");

    try {
      const result = await apiClient.chatWithContext({ 
        contextId, 
        question,
        model: selectedModel 
      });
      
      setResponse(result.content);
    } catch (error) {
      setChatError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy text');
    }
  };

  const handleShare = () => {
    if (navigator.share && response) {
      navigator.share({
        title: 'AI Marketing Insights',
        text: response
      });
    }
  };

  const handleReset = () => {
    setUrl("");
    setAnalysisStage('idle');
    setContextId(null);
    setProgress(0);
    setAnalysisSummary(null);
    setAnalysisError(null);
    setQuestion("");
    setResponse("");
    setChatError(null);
  };

  const getProgressStage = () => {
    if (progress < 30) return "Crawling website...";
    if (progress < 60) return "Analyzing content...";
    if (progress < 90) return "Researching competitors...";
    return "Finalizing analysis...";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Marketing Playground
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Analyze any website with AI-powered insights, then ask questions to get personalized marketing strategies
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Stage 1: Context Analysis */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Step 1: Website Analysis
            </CardTitle>
            <p className="text-sm text-gray-600">
              Enter a website URL to analyze its content and competitive landscape
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={analysisStage === 'analyzing'}
              />
            </div>

            <Button
              onClick={handleAnalyzeUrl}
              disabled={!url || analysisStage === 'analyzing'}
              className="w-full"
            >
              {analysisStage === 'analyzing' ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Website
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {analysisStage === 'analyzing' && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  {getProgressStage()}
                </p>
              </div>
            )}

            {/* Analysis Results */}
            {analysisStage === 'completed' && analysisSummary && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-green-800">Analysis Complete!</p>
                    <div className="flex gap-4 text-sm text-green-700">
                      <span>📄 {analysisSummary.pagesAnalyzed} pages analyzed</span>
                      <span>🔍 {analysisSummary.searchTerms} search terms</span>
                      <span>📊 {analysisSummary.competitorData} competitors found</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Analysis Error */}
            {analysisStage === 'failed' && analysisError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <p className="font-medium text-red-800">Analysis Failed</p>
                  <p className="text-sm text-red-700">{analysisError}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Stage 2: AI Chat */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              Step 2: AI Insights
            </CardTitle>
            <p className="text-sm text-gray-600">
              Ask questions about marketing strategy based on the analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      GPT-4
                    </div>
                  </SelectItem>
                  <SelectItem value="anthropic">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Claude 3.5 Sonnet
                    </div>
                  </SelectItem>
                  <SelectItem value="openrouter">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      OpenRouter
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Input */}
            <div className="space-y-2">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="Ask about marketing strategy, competitive analysis, target audience, etc."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={analysisStage !== 'completed' || isGenerating}
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleAskQuestion}
              disabled={analysisStage !== 'completed' || !question || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Get AI Insights
                </>
              )}
            </Button>

            {/* Prerequisites Notice */}
            {analysisStage !== 'completed' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Complete website analysis first to unlock AI insights
                </AlertDescription>
              </Alert>
            )}

            {/* Chat Error */}
            {chatError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <p className="font-medium text-red-800">Generation Failed</p>
                  <p className="text-sm text-red-700">{chatError}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Response Section */}
      {response && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                AI Marketing Insights
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedModel === 'openai' ? 'GPT-4' : 
                   selectedModel === 'anthropic' ? 'Claude 3.5' : 'OpenRouter'}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {response}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      {(analysisStage !== 'idle' || response) && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={handleReset}>
            <Sparkles className="h-4 w-4 mr-2" />
            Start New Analysis
          </Button>
        </div>
      )}
    </div>
  );
}