
import React, { useState, useEffect } from "react";
import { Provider } from "@/api/entities";
import { Search, Filter, MapPin, Star, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import SearchFilters from "../components/providers/SearchFilters";
import ProviderCard from "../components/providers/ProviderCard";
import ProviderMap from "../components/providers/ProviderMap";
import AdSlot from "../components/common/AdSlot"; // Added import for AdSlot
import SEOHead from "../components/seo/SEOHead";

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    medication: "",
    medicationPriceRange: [0, 500],
    trustScore: [0],
    rating: [0],
    gphc_registered: null,
    cqc_regulated: null,
    mhra_compliant: null,
    gmc_doctors: null,
    sortBy: "-trust_score"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProviders();
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const locationParam = urlParams.get('location');
    const medicationParam = urlParams.get('medication');
    const sortByParam = urlParams.get('sortBy');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    if (locationParam) {
      setSearchQuery(locationParam);
    }

    if (medicationParam) {
      setFilters(prev => ({ 
        ...prev, 
        medication: medicationParam,
        sortBy: sortByParam || "medication_price_low"
      }));
    }
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchQuery, filters]);

  const loadProviders = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 15000)
      );

      const data = await Promise.race([
        Provider.list("-trust_score"),
        timeoutPromise
      ]);
      
      console.log("Loaded providers:", data);
      setProviders(data || []);
    } catch (error) {
      console.error("Error loading providers:", error);
      setError("Unable to load providers due to temporary connectivity issues. Please try again.");
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get the minimum price for a given medication from a provider
  const getMedicationPrice = (provider, medicationName) => {
    if (!medicationName || !provider.medications || !provider.medications[medicationName]) {
      return Infinity;
    }
    const dosages = provider.medications[medicationName];
    let minPrice = Infinity;
    for (const dosageKey in dosages) {
      if (Object.prototype.hasOwnProperty.call(dosages, dosageKey)) {
        const price = dosages[dosageKey];
        if (typeof price === 'number' && price < minPrice) {
          minPrice = price;
        }
      }
    }
    return minPrice === Infinity ? Infinity : minPrice;
  };

  const filterProviders = () => {
    let filtered = [...providers];

    // Search query filter (including location-based search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.name?.toLowerCase().includes(query) ||
        provider.coverage?.toLowerCase().includes(query) ||
        provider.address?.toLowerCase().includes(query) ||
        provider.type?.toLowerCase().includes(query) ||
        provider.description?.toLowerCase().includes(query) ||
        (provider.locations && provider.locations.some(loc => loc.toLowerCase().includes(query)))
      );
    }

    // Provider type filter
    if (filters.type) {
      filtered = filtered.filter(provider => provider.type === filters.type);
    }

    // Medication filter
    if (filters.medication) {
      filtered = filtered.filter(provider => {
        // Check if provider offers this medication
        const hasInName = provider.name?.toLowerCase().includes(filters.medication.toLowerCase());
        const hasInDescription = provider.description?.toLowerCase().includes(filters.medication.toLowerCase());
        const hasInMedications = provider.medications && Object.keys(provider.medications).some(
            medKey => medKey.toLowerCase() === filters.medication.toLowerCase()
        );
        
        return hasInName || hasInDescription || hasInMedications;
      });
    }

    // Medication price range filter (only when a specific medication is selected)
    if (filters.medication && filters.medicationPriceRange && filters.medicationPriceRange.length === 2) {
      filtered = filtered.filter(provider => {
        const medicationPrice = getMedicationPrice(provider, filters.medication);
        if (medicationPrice === Infinity) return false; // Provider doesn't offer this specific medication
        return medicationPrice >= filters.medicationPriceRange[0] && medicationPrice <= filters.medicationPriceRange[1];
      });
    }

    // Trust score filter
    if (filters.trustScore && filters.trustScore[0] > 0) {
      filtered = filtered.filter(provider => 
        (provider.trust_score || 0) >= filters.trustScore[0]
      );
    }

    // Rating filter
    if (filters.rating && filters.rating[0] > 0) {
      filtered = filtered.filter(provider => 
        (provider.rating || 0) >= filters.rating[0]
      );
    }

    // Certification filters
    if (filters.gphc_registered === true) {
      filtered = filtered.filter(provider => provider.gphc_registered === true);
    }
    if (filters.cqc_regulated === true) {
      filtered = filtered.filter(provider => provider.cqc_regulated === true);
    }
    if (filters.mhra_compliant === true) {
      filtered = filtered.filter(provider => provider.mhra_compliant === true);
    }
    if (filters.gmc_doctors === true) {
      filtered = filtered.filter(provider => provider.gmc_doctors === true);
    }

    // Sort
    if (filters.sortBy === "-trust_score") {
      filtered.sort((a, b) => (b.trust_score || 0) - (a.trust_score || 0));
    } else if (filters.sortBy === "medication_price_low" && filters.medication) {
      filtered.sort((a, b) => {
        const priceA = getMedicationPrice(a, filters.medication);
        const priceB = getMedicationPrice(b, filters.medication);
        // Put providers without the medication at the end
        if (priceA === Infinity && priceB === Infinity) return 0;
        if (priceA === Infinity) return 1;
        if (priceB === Infinity) return -1;
        return priceA - priceB;
      });
    } else if (filters.sortBy === "medication_price_high" && filters.medication) {
      filtered.sort((a, b) => {
        const priceA = getMedicationPrice(a, filters.medication);
        const priceB = getMedicationPrice(b, filters.medication);
        // Put providers without the medication at the end
        if (priceA === Infinity && priceB === Infinity) return 0;
        if (priceA === Infinity) return 1;
        if (priceB === Infinity) return -1;
        return priceB - priceA;
      });
    } else if (filters.sortBy === "-rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === "name") {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (filters.sortBy === "wait_time") {
      filtered.sort((a, b) => {
        const waitA = a.wait_time || "zz";
        const waitB = b.wait_time || "zz";
        return waitA.localeCompare(waitB);
      });
    }

    setFilteredProviders(filtered);
  };

  if (error && providers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Unable to Load Providers</h2>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Button onClick={loadProviders} className="gradient-brand text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* SEO Head with Schema */}
      <SEOHead
        title={`UK Weight Loss Providers${filters.medication ? ` - ${filters.medication} Specialists` : ''}${searchQuery ? ` in ${searchQuery}` : ''}`}
        description={`Find ${filteredProviders.length} verified UK weight loss injection providers${filters.medication ? ` specializing in ${filters.medication}` : ''}${searchQuery ? ` in ${searchQuery}` : ''}. Compare prices, read reviews, and book consultations with GPHC registered providers.`}
        keywords={`UK weight loss providers${filters.medication ? `, ${filters.medication} providers` : ''}${searchQuery ? `, ${searchQuery} weight loss clinics` : ''}, weight loss injections, GPHC registered, CQC regulated`}
        schemas={[
          {
            type: "BreadcrumbList",
            data: {
              breadcrumbs: [
                { name: "Home", url: `${window.location.origin}${createPageUrl("Home")}` },
                { name: "Providers", url: `${window.location.origin}${createPageUrl("Providers")}` }
              ]
            }
          }
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            UK Weight Loss Providers
          </h1>
          <div className="flex items-center justify-between mb-6">
            <p className="text-lg text-neutral-600">
              {filteredProviders.length} verified providers found
              {filters.medication && (
                <span className="ml-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {filters.medication} specialists
                  </Badge>
                </span>
              )}
              {searchQuery && (
                <span className="ml-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    in "{searchQuery}"
                  </Badge>
                </span>
              )}
            </p>
            <div className="text-sm text-neutral-500">
              {isLoading ? "Loading..." : `Sorted by ${filters.sortBy.replace("-", "").replace("_", " ")}`}
            </div>
          </div>

          {/* Error message for partial failures */}
          {error && providers.length > 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6" role="alert">
              <div className="flex items-center justify-between">
                <span className="text-sm">{error}</span>
                <Button onClick={loadProviders} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search by provider name, medication, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg border-neutral-200 focus:border-blue-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showMap ? "default" : "outline"}
                onClick={() => setShowMap(!showMap)}
                className="px-6 py-6"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {showMap ? "Hide Map" : "Show Map"}
              </Button>
            </div>
          </div>

          {/* AD PLACEMENT: Mobile Top (shown on mobile after search bar) */}
          <div className="md:hidden mb-6">
            <AdSlot placementName="provider-listing-mobile-top" />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8"> {/* Adjusted to lg:grid-cols-4 */}
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters 
              filters={filters}
              setFilters={setFilters}
              providers={providers}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="grid lg:grid-cols-4 gap-8"> {/* Nested grid for main content and ad sidebar */}
              {/* Main Results Column */}
              <div className="lg:col-span-3">
                {showMap && (
                  <div className="mb-8">
                    <ProviderMap providers={filteredProviders} />
                  </div>
                )}

                {isLoading ? (
                  <div className="grid gap-6">
                    {Array(6).fill(0).map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse">
                          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
                          <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : filteredProviders.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                      No providers found
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchQuery("");
                        setFilters({
                          type: "",
                          medication: "",
                          medicationPriceRange: [0, 500],
                          trustScore: [0],
                          rating: [0],
                          gphc_registered: null,
                          cqc_regulated: null,
                          mhra_compliant: null,
                          gmc_doctors: null,
                          sortBy: "-trust_score"
                        });
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {filteredProviders.map((provider, index) => (
                      <React.Fragment key={provider.id}>
                        <ProviderCard 
                          provider={provider} 
                          selectedMedication={filters.medication}
                        />
                        {/* AD PLACEMENT: Interstitial ads every 3rd provider */}
                        {(index + 1) % 3 === 0 && index < filteredProviders.length - 1 && (
                          <div className="my-4">
                            <AdSlot placementName="provider-listing-interstitial" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar for Ads (Desktop Only) */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  <AdSlot placementName="provider-listing-sidebar" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
