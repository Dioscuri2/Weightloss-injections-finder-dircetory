
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Provider } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import {
  Image,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ManageProviderImages() {
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [providers, setProviders] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  const [loadingStates, setLoadingStates] = useState({});
  const [foundImages, setFoundImages] = useState({});
  const [errorStates, setErrorStates] = useState({});
  const [isFindingAll, setIsFindingAll] = useState(false);

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        const currentUser = await User.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl("Home");
          return;
        }
        setIsLoadingUser(false);
        loadProviders();
      } catch (error) {
        window.location.href = createPageUrl("Home");
      }
    };
    checkUserAndLoadData();
  }, []);

  const loadProviders = async () => {
    setIsLoadingProviders(true);
    try {
      const allProviders = await Provider.list();
      // Filter for providers that don't have an image_url or logo_url
      const providersWithoutImages = allProviders.filter(p => !p.image_url && !p.logo_url);
      setProviders(providersWithoutImages);
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const findImageForProvider = async (provider) => {
    if (!provider.website) {
      setErrorStates(prev => ({ ...prev, [provider.id]: "Provider has no website URL." }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, [provider.id]: true }));
    setErrorStates(prev => ({ ...prev, [provider.id]: null }));
    setFoundImages(prev => ({ ...prev, [provider.id]: null }));

    try {
      const prompt = `From the website ${provider.website}, find the direct URL of the company's official logo. The URL must be a direct link to an image file (ending in .png, .jpg, .jpeg, .svg, or .webp). If you cannot find a logo, find a high-quality image of their storefront or a professional corporate photo from the website. The URL should be absolute.`;

      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            image_url: { type: "string", format: "uri" }
          },
          required: ["image_url"]
        }
      });

      if (response && response.image_url) {
        // Validate if the URL is somewhat reasonable
        if (response.image_url.startsWith('http')) {
            setFoundImages(prev => ({ ...prev, [provider.id]: response.image_url }));
        } else {
            setErrorStates(prev => ({ ...prev, [provider.id]: "Found an invalid image path. Please add manually." }));
        }
      } else {
        setErrorStates(prev => ({ ...prev, [provider.id]: "Could not find a suitable image." }));
      }
    } catch (error) {
      console.error("Error finding image:", error);
      setErrorStates(prev => ({ ...prev, [provider.id]: "An error occurred during search." }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  const saveImageForProvider = async (providerId, imageUrl) => {
    setLoadingStates(prev => ({ ...prev, [providerId]: true }));
    try {
        await Provider.update(providerId, { image_url: imageUrl });
        // Remove the provider from the list after successful save
        setProviders(prev => prev.filter(p => p.id !== providerId));
    } catch (error) {
        console.error("Error saving image:", error);
        setErrorStates(prev => ({ ...prev, [providerId]: "Failed to save the image." }));
    } finally {
        setLoadingStates(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const handleFindAllImages = async () => {
    setIsFindingAll(true);
    // Create a series of functions that return promises to find an image for each provider
    const findPromises = providers.map(provider => () => findImageForProvider(provider));

    // Run promises sequentially to avoid overwhelming the service
    for (const findPromise of findPromises) {
      await findPromise();
    }

    setIsFindingAll(false);
  };

  if (isLoadingUser) {
    return <div className="min-h-screen flex items-center justify-center"><p>Verifying access...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            Provider Image Finder
          </h1>
          <p className="text-lg text-neutral-600">
            Automatically find and assign images to providers who are missing one. The tool uses the provider's website to find a suitable logo or storefront picture.
          </p>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Providers Missing Images ({providers.length})
              </CardTitle>
              <Button onClick={handleFindAllImages} disabled={isFindingAll || providers.length === 0}>
                {isFindingAll ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Find All Images
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingProviders ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                <p className="mt-4 text-neutral-600">Loading providers...</p>
              </div>
            ) : providers.length === 0 ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Great job! All providers have an assigned image.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {providers.map(provider => (
                  <div key={provider.id} className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-neutral-800">{provider.name}</h3>
                        <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          {provider.website} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => findImageForProvider(provider)}
                          disabled={loadingStates[provider.id] || !provider.website}
                        >
                          {loadingStates[provider.id] ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4 mr-2" />
                          )}
                          Find Image
                        </Button>
                      </div>
                    </div>

                    {errorStates[provider.id] && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errorStates[provider.id]}</AlertDescription>
                        </Alert>
                    )}

                    {foundImages[provider.id] && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                           <h4 className="font-semibold mb-2 text-neutral-800">Image Preview:</h4>
                           <div className="flex flex-col md:flex-row items-center gap-4">
                                <img src={foundImages[provider.id]} alt="Found image preview" className="w-32 h-32 object-contain border border-neutral-200 rounded-md bg-white"/>
                                <div className="flex-grow">
                                    <p className="text-xs text-neutral-600 break-all">{foundImages[provider.id]}</p>
                                    <Button
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => saveImageForProvider(provider.id, foundImages[provider.id])}
                                        disabled={loadingStates[provider.id]}
                                    >
                                        {loadingStates[provider.id] ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                        )}
                                        Save This Image
                                    </Button>
                                </div>
                           </div>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
