import React, { useState, useEffect } from "react";
import { Provider } from "@/api/entities";
import { GenerateImage } from "@/api/integrations";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  Phone, 
  Globe, 
  Mail,
  CheckCircle,
  Award,
  Users,
  Calendar,
  CreditCard,
  Truck,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "../components/seo/SEOHead"; // Use the correct, shared SEOHead component

export default function ProviderPage() {
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    loadProvider();
  }, []);

  const loadProvider = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const providerId = urlParams.get('id');
      
      if (!providerId) {
        setError("No provider ID specified");
        return;
      }

      const providerData = await Provider.filter({ id: providerId });
      if (providerData.length === 0) {
        setError("Provider not found");
        return;
      }

      const providerRecord = providerData[0];
      setProvider(providerRecord);

      // Generate image if none exists
      if (!providerRecord.image_url && !providerRecord.logo_url) {
        generateProviderImage(providerRecord);
      }
    } catch (error) {
      console.error("Error loading provider:", error);
      setError("Failed to load provider details");
    } finally {
      setIsLoading(false);
    }
  };

  const generateProviderImage = async (providerData) => {
    setIsGeneratingImage(true);
    try {
      const prompt = `Professional medical facility or pharmacy storefront for ${providerData.name}, a ${providerData.type.toLowerCase()} in the UK. Modern, clean, healthcare environment with medical cross or pharmacy symbols. Professional lighting, welcoming atmosphere, UK medical facility aesthetic.`;
      
      const result = await GenerateImage({ prompt });
      if (result.url) {
        setGeneratedImage(result.url);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const trustScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-yellow-600 bg-yellow-100";
    return "text-orange-600 bg-orange-100";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-48 mb-8"></div>
            <div className="h-64 bg-neutral-200 rounded-xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Provider Not Found</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Link to={createPageUrl("Providers")}>
            <Button>Back to Providers</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const displayImage = provider.image_url || provider.logo_url || generatedImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* SEO Head with Schema */}
      <SEOHead
        title={`${provider.name} - ${provider.type}`}
        description={provider.description || `${provider.name} is a trusted ${provider.type.toLowerCase()} offering weight loss injection treatments in ${provider.coverage || 'the UK'}. ${provider.gphc_registered ? 'GPHC registered. ' : ''}${provider.cqc_regulated ? 'CQC regulated. ' : ''}Book your consultation today.`}
        keywords={`${provider.name}, weight loss injections, ${provider.type}, ${provider.coverage}, Wegovy, Mounjaro, Saxenda, UK weight loss provider`}
        image={displayImage}
        url={`${window.location.origin}${createPageUrl("Provider")}?id=${provider.id}`}
        type="website"
        schemas={[
          {
            type: provider.type === "Private Clinic" ? "MedicalBusiness" : "LocalBusiness",
            data: provider // Pass the entire provider object for schema generation
          },
          {
            type: "BreadcrumbList",
            data: {
              breadcrumbs: [
                { name: "Home", url: `${window.location.origin}${createPageUrl("Home")}` },
                { name: "Providers", url: `${window.location.origin}${createPageUrl("Providers")}` },
                { name: provider.name, url: `${window.location.origin}${createPageUrl("Provider")}?id=${provider.id}` }
              ]
            }
          }
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to={createPageUrl("Providers")} 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Providers
        </Link>

        {/* Hero Section */}
        <Card className="border-0 shadow-elegant mb-8 overflow-hidden">
          <div className="md:flex">
            {/* Provider Image */}
            <div className="md:w-1/3 aspect-square md:aspect-auto bg-gradient-to-br from-blue-100 to-blue-200 relative">
              {displayImage ? (
                <img 
                  src={displayImage} 
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              ) : isGeneratingImage ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-neutral-600">Generating image...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              )}
              
              {/* Trust Score Overlay */}
              <div className="absolute top-4 left-4">
                <Badge className={`${trustScoreColor(provider.trust_score)} border-0 font-bold`}>
                  {provider.trust_score}/10 Trust
                </Badge>
              </div>
            </div>

            {/* Provider Info */}
            <div className="md:w-2/3 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
                    {provider.name}
                  </h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-4">
                    {provider.type}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1 text-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-bold">{provider.rating || "4.8"}</span>
                  <span className="text-neutral-500">({provider.review_count || "120"})</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-800">Coverage</p>
                    <p className="text-neutral-600">{provider.coverage || "UK Wide"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-800">Wait Time</p>
                    <p className="text-neutral-600">{provider.wait_time || "Same day"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-800">Consultation</p>
                    <p className="text-neutral-600">From £{provider.consultation_fee || "49"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-800">Method</p>
                    <p className="text-neutral-600">{provider.consultation_method || "Online & In-person"}</p>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-2 mb-6">
                {provider.gphc_registered && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    GPHC Registered
                  </Badge>
                )}
                {provider.cqc_regulated && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    CQC Regulated
                  </Badge>
                )}
                {provider.mhra_compliant && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    MHRA Compliant
                  </Badge>
                )}
                {provider.gmc_doctors && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    GMC Doctors
                  </Badge>
                )}
              </div>

              {/* Contact Actions */}
              <div className="flex flex-wrap gap-3">
                {provider.website && (
                  <a href={provider.website} target="_blank" rel="noopener noreferrer">
                    <Button className="gradient-brand text-white">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </a>
                )}
                {provider.phone && (
                  <a href={`tel:${provider.phone}`}>
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      {provider.phone}
                    </Button>
                  </a>
                )}
                {provider.email && (
                  <a href={`mailto:${provider.email}`}>
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {provider.description && (
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle>About {provider.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 leading-relaxed">{provider.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Special Offers */}
            {provider.special_offers && (
              <Card className="border-0 shadow-elegant bg-gradient-to-r from-orange-50 to-orange-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Award className="w-5 h-5" />
                    Special Offers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700 font-medium">{provider.special_offers}</p>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle>Requirements & Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {provider.bmi_requirement && (
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">BMI Requirements</h4>
                    <p className="text-neutral-600">{provider.bmi_requirement}</p>
                  </div>
                )}
                
                {provider.delivery_options && (
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Delivery Options
                    </h4>
                    <p className="text-neutral-600">{provider.delivery_options}</p>
                  </div>
                )}

                {provider.locations && provider.locations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Service Locations</h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.locations.map((location, index) => (
                        <Badge key={index} variant="outline">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {provider.phone && (
                  <a href={`tel:${provider.phone}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors duration-300">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium">{provider.phone}</span>
                  </a>
                )}
                
                {provider.email && (
                  <a href={`mailto:${provider.email}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors duration-300">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium">{provider.email}</span>
                  </a>
                )}
                
                {provider.address && (
                  <div className="flex items-start gap-3 p-3 rounded-lg">
                    <MapPin className="w-4 h-4 text-neutral-400 mt-1" />
                    <span className="text-sm">{provider.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust & Safety */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Trust & Safety
                </Title>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Trust Score</span>
                  <Badge className={trustScoreColor(provider.trust_score)}>
                    {provider.trust_score}/10
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Patient Reviews</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{provider.rating || "4.8"}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">GPHC Registered</span>
                    {provider.gphc_registered ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-neutral-200"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">CQC Regulated</span>
                    {provider.cqc_regulated ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-neutral-200"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">MHRA Compliant</span>
                    {provider.mhra_compliant ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-neutral-200"></div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">GMC Doctors</span>
                    {provider.gmc_doctors ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-neutral-200"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}