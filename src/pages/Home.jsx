
"use client"

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Target, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Sparkles,
  Layers,
  Clock,
  DollarSign,
  Wand2
} from "lucide-react";

export default function Home() {
  const coreServices = [
    {
      icon: Target,
      title: "Cold Outbound Mastery",
      description: "Full implementation with Clay, Smartleads, Instantly, and other cutting-edge tools to generate qualified leads at scale."
    },
    {
      icon: Brain,
      title: "HubSpot Implementation",
      description: "Complete setup and optimization of your HubSpot ecosystem for maximum marketing automation and lead nurturing."
    },
    {
      icon: Zap,
      title: "Tech Stack Integration",
      description: "Connect your disconnected tools and systems for seamless data flow and unified marketing operations."
    },
    {
      icon: Layers,
      title: "Brand Positioning & Design",
      description: "Strategic brand positioning with complete guidelines and professional Figma files for consistent execution."
    }
  ];

  const achievements = [
    { number: "$6M+", label: "E-comm Revenue Scaled" },
    { number: "248%", label: "Increase in Qualified Leads" },
    { number: "65%", label: "Operational Cost Reduction via AI" },
    { number: "75%", label: "Boost in User App Adoption" }
  ];

  const projectExamples = [
    {
      title: "Cold Outbound Implementation",
      description: "Full setup with Clay, Smartleads, Instantly + campaign optimization"
    },
    {
      title: "Brand Positioning Package",
      description: "Complete brand guidelines with professional Figma files"
    },
    {
      title: "HubSpot Marketing Automation",
      description: "End-to-end setup and workflow optimization"
    }
  ];

  const painPoints = [
    "Working with multiple agencies that don't align on strategy",
    "Tech stack full of disconnected tools and data silos",
    "Budget constraints but need professional results",
    "Outbound campaigns that generate zero qualified leads",
    "HubSpot sitting unused while leads slip through cracks",
    "Brand inconsistency across all agency touchpoints"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 bg-gradient-to-b from-white to-[var(--background-secondary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <Badge className="mb-8 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white border-0 px-3 py-1 text-xs font-medium">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Swiss Army Knife for Early-Stage Companies
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-8 leading-tight text-balance">
              Streamline Your Agencies.{" "}
              <span className="gradient-text">Connect Your Systems.</span>
            </h1>
            
            <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-3xl mx-auto leading-relaxed text-balance">
              I work alongside your existing agencies and tech stacks to refocus efforts on low-cost, high-conversion, 
              revenue producing activities. Start focusing on marketing and stop chasing Reddit / LinkedIn Influencers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/contact">
                <Button 
                  size="lg" 
                  className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-8 py-4 rounded-xl text-base font-semibold hover-lift group shadow-lg"
                >
                  Book Free Strategy Call
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/playground">
                <Button 
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 rounded-xl text-base font-semibold hover-lift group shadow-sm border-gray-300"
                >
                  Try the AI Playground
                  <Wand2 className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Pricing Preview */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>$250/hour consulting</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-[var(--border)]"></div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Projects starting at $2,500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 text-balance">
              Tired of Vanity Metrics That Don't Pay the Bills?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto text-balance">
              Most early-stage companies waste budget on high-cost, low-conversion activities instead of focusing on what actually drives revenue.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((pain, index) => (
              <Card key={index} className="border border-red-100 bg-red-50/30 hover-lift transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-[var(--text-primary)] font-medium text-sm leading-relaxed">{pain}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-24 bg-[var(--background-secondary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 text-balance">
              Refocus Your Marketing on What Actually Converts
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto text-balance">
              I work with your existing agencies to eliminate high-cost, low-conversion activities and double down 
              on proven revenue-generating systems that actually move the needle.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreServices.map((service, index) => (
              <Card key={index} className="hover-lift border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Agency Collaboration */}
          <div className="mt-20 text-center">
            <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-white">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
                  How I Work With Your Existing Setup
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Agency Collaboration</h4>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      I work alongside your existing agencies to provide technical oversight and ensure a cohesive, revenue-focused strategy.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Startup Speed</h4>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      Fast, hands-on execution without the agency fluff. I build systems and run campaigns focused on measurable outcomes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 text-balance">
              Proven, Measurable Results
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto text-balance">
              I help early-stage companies achieve rapid, tangible growth by focusing on battle-tested, revenue-driven strategies.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl hover:bg-gray-50/50 transition-colors">
                <div className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-2 gradient-text">
                  {stat.number}
                </div>
                <div className="text-[var(--text-secondary)] font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Examples & Pricing */}
      <section className="py-24 bg-[var(--background-secondary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 text-balance">
              Transparent Pricing. No Surprises.
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto text-balance">
              Choose hourly consulting for ongoing strategy or fixed-price projects for specific implementations.
            </p>
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            <Card className="shadow-lg border-0 hover-lift bg-white">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Hourly Consulting</h3>
                <div className="text-5xl font-bold text-[var(--text-primary)] mb-2">$250<span className="text-xl text-[var(--text-secondary)]">/hour</span></div>
                <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">Perfect for ongoing strategy, technical troubleshooting, and hands-on implementation support.</p>
                <ul className="text-left space-y-3 text-[var(--text-primary)]">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />Direct access to technical expertise</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />Real-time problem solving</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />Flexible engagement model</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 hover-lift bg-white">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Project-Based</h3>
                <div className="text-5xl font-bold text-[var(--text-primary)] mb-2">$2,500<span className="text-xl text-[var(--text-secondary)]"> ряд</span></div>
                <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">Fixed-price delivery for specific implementations with defined scope and timeline.</p>
                <ul className="text-left space-y-3 text-[var(--text-primary)]">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />Predictable budget</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />Defined deliverables</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />Complete implementation</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Project Examples */}
          <div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-12 text-center">Popular $2,500 Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projectExamples.map((project, index) => (
                <Card key={index} className="hover-lift border-0 shadow-sm bg-white">
                  <CardContent className="p-8">
                    <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-4">{project.title}</h4>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{project.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-[var(--gradient-start)]" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Ready to Build a Revenue-Focused Growth Engine?
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed text-balance">
            Let's discuss how we can untangle your tech stack, focus your strategy, and 
            build a predictable pipeline of qualified leads for your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button 
                size="lg" 
                className="bg-white hover:bg-white/90 text-[var(--gradient-start)] px-8 py-4 rounded-xl text-base font-semibold hover-lift shadow-lg"
              >
                Book Free Strategy Call
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
