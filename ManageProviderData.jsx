
import React, { useState, useEffect, useRef } from "react";
import { User } from "@/api/entities";
import { Provider } from "@/api/entities";
import { ArrowLeft, DatabaseZap, Info, RefreshCw, Loader2, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProviderRefreshRow from "../components/admin/ProviderRefreshRow";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ManageProviderData() {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [providers, setProviders] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [proposedChanges, setProposedChanges] = useState({});

  const providerRowRefs = useRef([]);
  // This effect ensures that providerRowRefs.current always has the correct number of refs
  // aligned with the current 'providers' state.
  // It effectively re-initializes refs when providers array changes length.
  useEffect(() => {
    providerRowRefs.current = providers.map(
      (_, i) => providerRowRefs.current[i] ?? React.createRef()
    );
  }, [providers]);


  useEffect(() => {
    const checkUserAndLoad = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl("Home");
          return;
        }
        const providerData = await Provider.list();
        setProviders(providerData);
      } catch (error) {
        console.error("Error loading user or providers:", error);
        window.location.href = createPageUrl("Home");
      } finally {
        setIsLoadingUser(false);
        setIsLoadingProviders(false);
      }
    };
    checkUserAndLoad();
  }, []);

  const handleProviderUpdate = (providerId, updatedData) => {
    setProviders(prevProviders =>
      prevProviders.map(p =>
        p.id === providerId ? { ...p, ...updatedData } : p
      )
    );
    // Also clear from proposed changes if it was updated individually
    handleNewDataAvailable(providerId, null);
  };
  
  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    for (const ref of providerRowRefs.current) {
      if (ref.current) {
        // We wrap in a try/catch to ensure one failure doesn't stop the whole process
        try {
          await ref.current.triggerRefresh();
        } catch (e) {
          console.error("Error refreshing a provider:", e);
        }
        // Add a small delay to avoid rate limiting or overwhelming the service
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    setIsRefreshingAll(false);
  };

  const handleNewDataAvailable = (providerId, data) => {
    setProposedChanges(prev => {
      const newChanges = { ...prev };
      if (data && Object.keys(data).length > 0) {
        newChanges[providerId] = data;
      } else {
        delete newChanges[providerId];
      }
      return newChanges;
    });
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    const changesToSave = { ...proposedChanges };
    const providerIdsToUpdate = Object.keys(changesToSave);

    const updatePromises = providerIdsToUpdate.map(id => {
       const updatePayload = Object.fromEntries(
        Object.entries(changesToSave[id]).filter(([_, value]) => value !== null)
      );
      return Provider.update(id, updatePayload);
    });

    try {
      await Promise.all(updatePromises);
      
      // Clear the proposed changes
      setProposedChanges({});

      // Reset the state of the child components that were just updated
      providerIdsToUpdate.forEach(id => {
        const providerIndex = providers.findIndex(p => p.id === id);
        if (providerIndex !== -1 && providerRowRefs.current[providerIndex]?.current) {
          providerRowRefs.current[providerIndex].current.resetState();
        }
      });
      
      // Fetch fresh data to re-render everything with new values
      const freshProviders = await Provider.list();
      setProviders(freshProviders);

    } catch(e) {
      console.error("Error during bulk save:", e);
      // Here you could set an error state to show in the UI
    } finally {
      setIsSavingAll(false);
    }
  };


  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <p>Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to={createPageUrl("Providers")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Providers
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2 flex items-center gap-3">
                <DatabaseZap className="w-8 h-8" />
                AI Data Refresher
              </h1>
              <p className="text-lg text-neutral-600 max-w-4xl">
                Use our AI agent to visit each provider's website and fetch the latest public information.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleRefreshAll} disabled={isRefreshingAll || isLoadingProviders} variant="outline" className="shrink-0">
                {isRefreshingAll ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh All
              </Button>
              <Button 
                onClick={handleSaveAll} 
                disabled={isSavingAll || Object.keys(proposedChanges).length === 0} 
                className="gradient-brand text-white shrink-0"
              >
                {isSavingAll ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Approve & Save All ({Object.keys(proposedChanges).length})
              </Button>
            </div>
          </div>
        </div>

        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <strong>How it works:</strong> Click "Refresh Data" for a provider. The AI will scan their website for new information. You'll then be shown a comparison to approve or discard the changes. Data is never updated automatically.
          </AlertDescription>
        </Alert>

        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle>Provider Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingProviders ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                ))
              ) : (
                providers.map((provider, index) => (
                  <ProviderRefreshRow 
                    key={provider.id} 
                    ref={providerRowRefs.current[index]}
                    provider={provider} 
                    onUpdate={handleProviderUpdate}
                    onNewDataAvailable={handleNewDataAvailable}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
