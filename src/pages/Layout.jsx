
"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Home", path: "/" },
    { name: "Playground", path: "/playground" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        :root {
          --primary: #000000;
          --secondary: #666666;
          --accent: #0070f3;
          --text-primary: #000000;
          --text-secondary: #666666;
          --text-tertiary: #999999;
          --border: #eaeaea;
          --background: #ffffff;
          --background-secondary: #fafafa;
          --gradient-start: #7928ca;
          --gradient-end: #ff0080;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .border-gradient {
          border: 1px solid transparent;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, var(--gradient-start), var(--gradient-end)) border-box;
        }
        
        .hover-lift {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .glass-effect {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .text-balance {
          text-wrap: balance;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="group">
              <img src="/uploads/logo-dark.svg" alt="High-Growth Digital Logo" className="h-7 transition-transform duration-200 group-hover:scale-105" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/contact">
                <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[var(--border)]">
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-[var(--text-primary)] bg-gray-50"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2"
              >
                <Button className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg text-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--background-secondary)] border-t border-[var(--border)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="inline-block mb-4">
                <img src="/uploads/logo-dark.svg" alt="High-Growth Digital Logo" className="h-8" />
              </Link>
              <p className="text-[var(--text-secondary)] mb-4 max-w-md text-sm leading-relaxed">
                Your technical co-pilot for go-to-market strategy, outbound automation, and tech stack integration. 
                One consultant for a unified, revenue-focused strategy.
              </p>
              <div className="flex items-center space-x-2 text-[var(--accent)]">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Revenue-Focused. AI-Powered.</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Specializations</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>Go-to-Market Strategy</li>
                <li>AI-Powered Outbound</li>
                <li>HubSpot & CRM Integration</li>
                <li>Performance Marketing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Get Started</h3>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <p>$250/hour consulting</p>
                <p>Projects from $2,500</p>
                <Link href="/contact" className="text-[var(--accent)] hover:underline font-medium">
                  Book Strategy Call
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-tertiary)]">
            <p>&copy; 2025 High-Growth Digital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
