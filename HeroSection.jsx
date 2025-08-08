
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function HeroSection({ searchQuery, setSearchQuery, onSearch, onKeyPress }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              UK's Most Trusted Directory
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Trusted
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Weight Loss Injection Providers
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Compare verified UK providers for Wegovy, Mounjaro, Saxenda and more. 
            All providers are fully regulated and patient-reviewed.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-2xl p-2 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center flex-1 gap-3 px-4">
                    <Search className="w-5 h-5 text-neutral-400" />
                    <Input
                      placeholder="Search by location, provider name, or medication..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={onKeyPress}
                      className="border-0 bg-transparent text-lg placeholder:text-neutral-400 focus-visible:ring-0"
                    />
                  </div>
                  <Button 
                    onClick={onSearch}
                    className="gradient-brand text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Location Access */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-blue-200 font-medium">Popular locations:</span>
            {["London", "Manchester", "Birmingham", "Leeds", "Glasgow"].map((city) => (
              <Button
                key={city}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
                onClick={() => {
                  // Direct navigation to the providers page with location query parameter
                  window.location.href = `${createPageUrl("Providers")}?location=${encodeURIComponent(city)}`;
                }}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {city}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 fill-current text-slate-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
}
