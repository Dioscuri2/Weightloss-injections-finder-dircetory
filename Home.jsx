
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Provider, Medication } from "@/api/entities";
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  Shield, 
  Clock,
  ArrowRight,
  Award,
  Users,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdSlot from "@/components/common/AdSlot"; // Fixed import path

import HeroSection from "../components/home/HeroSection";
import QuickStats from "../components/home/QuickStats";
import FeaturedProviders from "../components/home/FeaturedProviders";
import PopularMedications from "../components/home/PopularMedications";
import GuideCTA from "../components/common/GuideCTA"; // Import the new component
import SEOHead from "../components/seo/SEOHead";

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [medications, setMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const [providersData, medicationsData] = await Promise.race([
        Promise.all([
          Provider.list("-trust_score", 6).catch(() => []),
          Medication.list("", 4).catch(() => [])
        ]),
        timeoutPromise
      ]);

      setProviders(providersData || []);
      setMedications(medicationsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Unable to load some content due to temporary connectivity issues. Please try refreshing the page.");
      // Set fallback data so the page still works
      setProviders([]);
      setMedications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `${createPageUrl("Providers")}?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen">
      {/* SEO Head with Schema */}
      <SEOHead
        title="Find Trusted UK Weight Loss Injection Providers"
        description="Compare verified UK providers for Wegovy, Mounjaro, Saxenda and more weight loss injections. All providers are fully regulated and patient-reviewed."
        keywords="weight loss injections, Wegovy, Mounjaro, Saxenda, UK providers, weight loss treatment, obesity medication, GLP-1"
        schemas={[
          {
            type: "WebSite",
            data: {
              name: "WeightLoss Injections Finder",
              url: window.location.origin,
              potentialAction: {
                "@type": "SearchAction",
                target: `${window.location.origin}/providers?search={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            }
          },
          {
            type: "Organization",
            data: {
              name: "WeightLoss Injections Finder",
              url: window.location.origin,
              logo: `${window.location.origin}/logo.png`,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+44-123-456-7890",
                contactType: "customer service"
              }
            }
          }
        ]}
      />

      <HeroSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onKeyPress={handleKeyPress}
      />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Error message with retry option */}
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center justify-between">
              <div>
                <strong className="font-bold">Notice: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
              <Button 
                onClick={loadData} 
                variant="outline" 
                size="sm"
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* AD PLACEMENT: Homepage Banner Middle */}
        <AdSlot placementName="homepage-banner-middle" className="my-8" />

        <QuickStats providers={providers} />
        
        <FeaturedProviders providers={providers} isLoading={isLoading} />
        
        {/* New Guide CTA Section */}
        <GuideCTA />

        <PopularMedications medications={medications} providers={providers} isLoading={isLoading} />

        {/* Trust Section */}
        <section className="text-center py-16 bg-white rounded-3xl shadow-elegant">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2">
                Trusted & Regulated
              </Badge>
            </div>
            
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">
              Why Choose Our Directory?
            </h2>
            <p className="text-lg text-neutral-600 mb-12">
              Every provider is thoroughly vetted and meets strict UK regulatory standards
            </p>

            {/* AD PLACEMENT: Trust Section Ad */}
            <div className="mb-8">
              <AdSlot placementName="homepage-trust-section-ad" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Verified Providers</h3>
                <p className="text-sm text-neutral-600 text-center">
                  All providers are GPHC registered and CQC regulated
                </p>
              </div>

              <div className="flex flex-col items-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Quality Assured</h3>
                <p className="text-sm text-neutral-600 text-center">
                  MHRA compliant with GMC registered doctors
                </p>
              </div>

              <div className="flex flex-col items-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Patient Reviews</h3>
                <p className="text-sm text-neutral-600 text-center">
                  Real reviews from verified patients
                </p>
              </div>
            </div>

            <div className="mt-12">
              <Link to={createPageUrl("Providers")}>
                <Button className="gradient-brand text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Explore All Providers
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
