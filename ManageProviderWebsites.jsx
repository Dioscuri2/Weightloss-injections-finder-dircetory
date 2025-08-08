
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Provider } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import {
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";

export default function ManageProviderWebsites() {
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [providers, setProviders] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  const [loadingStates, setLoadingStates] = useState({});
  const [foundWebsites, setFoundWebsites] = useState({});
  const [errorStates, setErrorStates] = useState({});
  const [isFindingAll, setIsFindingAll] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

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
      const providersWithoutWebsite = allProviders.filter(p => !p.website);
      setProviders(providersWithoutWebsite);
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const findWebsiteForProvider = async (provider) => {
    setLoadingStates(prev => ({ ...prev, [provider.id]: true }));
    setErrorStates(prev => ({ ...prev, [provider.id]: null }));
    setFoundWebsites(prev => ({ ...prev, [provider.id]: "" }));

    try {
      const prompt = `Find the official website URL for the pharmacy or clinic named "${provider.name}". If they have a physical address, it is: ${provider.address || 'Not specified'}. The URL should be the main homepage of the business.`;

      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            website_url: { type: "string", format: "uri" }
          },
          required: ["website_url"]
        }
      });

      if (response && response.website_url && response.website_url.startsWith('http')) {
        setFoundWebsites(prev => ({ ...prev, [provider.id]: response.website_url }));
      } else {
        setErrorStates(prev => ({ ...prev, [provider.id]: "Could not find a valid website URL." }));
      }
    } catch (error) {
      console.error("Error finding website:", error);
      setErrorStates(prev => ({ ...prev, [provider.id]: "An error occurred during the search." }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  const saveWebsiteForProvider = async (providerId, websiteUrl) => {
    if (!websiteUrl || !websiteUrl.startsWith('http')) {
        setErrorStates(prev => ({ ...prev, [providerId]: "Invalid URL. Must start with http or https." }));
        return;
    }
    setLoadingStates(prev => ({ ...prev, [providerId]: true }));
    try {
      await Provider.update(providerId, { website: websiteUrl });
      setProviders(prev => prev.filter(p => p.id !== providerId));
      setFoundWebsites(prev => {
        const newState = { ...prev };
        delete newState[providerId];
        return newState;
      });
    } catch (error) {
      console.error("Error saving website:", error);
      setErrorStates(prev => ({ ...prev, [providerId]: "Failed to save the website URL." }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const handleFindAllWebsites = async () => {
    setIsFindingAll(true);
    // Use a sequential loop to avoid overwhelming the LLM or API rate limits
    for (const provider of providers) {
      await findWebsiteForProvider(provider);
    }
    setIsFindingAll(false);
  };
  
  const handleSaveAllWebsites = async () => {
    setIsSavingAll(true);
    setErrorStates(prev => ({ ...prev, global: null })); // Clear global error

    const websitesToSave = Object.entries(foundWebsites).filter(
      ([_, url]) => url && url.startsWith('http')
    );

    if (websitesToSave.length === 0) {
      setIsSavingAll(false);
      return;
    }

    const updatePromises = websitesToSave.map(([providerId, websiteUrl]) =>
      Provider.update(providerId, { website: websiteUrl })
    );

    try {
      await Promise.all(updatePromises);
      setFoundWebsites({}); // Clear the saved entries
      await loadProviders(); // Refresh the list of providers
    } catch (error) {
      console.error("Error bulk saving websites:", error);
      setErrorStates(prev => ({
        ...prev,
        global: "An error occurred during bulk save. Some websites may not have been saved.",
      }));
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleUrlChange = (providerId, value) => {
      setFoundWebsites(prev => ({...prev, [providerId]: value}))
  }

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
            Provider Website Finder
          </h1>
          <p className="text-lg text-neutral-600">
            Automatically find and assign websites to providers who are missing one.
          </p>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>
                Providers Missing Websites ({providers.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleFindAllWebsites} disabled={isFindingAll || providers.length === 0}>
                  {isFindingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Find All Websites
                </Button>
                <Button 
                  onClick={handleSaveAllWebsites} 
                  disabled={isSavingAll || Object.values(foundWebsites).every(url => !url)}
                  variant="default"
                  className="gradient-brand text-white"
                >
                  {isSavingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save All Found
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {errorStates.global && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorStates.global}</AlertDescription>
              </Alert>
            )}
            {isLoadingProviders ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                <p className="mt-4 text-neutral-600">Loading providers...</p>
              </div>
            ) : providers.length === 0 ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Great job! All providers have an assigned website.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {providers.map(provider => (
                  <div key={provider.id} className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-neutral-800">{provider.name}</h3>
                        <p className="text-sm text-neutral-500">{provider.address || "Address not specified"}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => findWebsiteForProvider(provider)}
                          disabled={loadingStates[provider.id]}
                        >
                          {loadingStates[provider.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                          Find Website
                        </Button>
                      </div>
                    </div>

                    {errorStates[provider.id] && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorStates[provider.id]}</AlertDescription>
                      </Alert>
                    )}

                    {foundWebsites[provider.id] !== undefined && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                          <Input
                            value={foundWebsites[provider.id] || ''}
                            onChange={(e) => handleUrlChange(provider.id, e.target.value)}
                            placeholder="Enter or edit found URL"
                            className="flex-grow bg-white"
                          />
                          <Button
                            size="sm"
                            onClick={() => saveWebsiteForProvider(provider.id, foundWebsites[provider.id])}
                            disabled={loadingStates[provider.id] || !foundWebsites[provider.id]}
                          >
                            {loadingStates[provider.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Website
                          </Button>
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
