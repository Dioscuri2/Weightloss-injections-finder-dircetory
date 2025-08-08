import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { 
  User as UserIcon, 
  MapPin, 
  Bell, 
  Heart, 
  Settings, 
  LogOut,
  Shield,
  Mail,
  Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Fixed: changed from Input to input
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    location: "",
    notifications: true,
    newsletter: false,
    favoriteProviders: [],
    searchHistory: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Load user preferences if they exist
      if (userData.preferences) {
        setPreferences({ ...preferences, ...userData.preferences });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Handle unauthenticated user
      await User.login();
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({ preferences });
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-neutral-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-elegant mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 gradient-brand rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                  {user?.full_name || 'User'}
                </h1>
                <p className="text-neutral-600 mb-4">{user?.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Account
                  </Badge>
                  <Badge variant="outline">
                    Member since {new Date(user?.created_date).getFullYear()}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="preferences" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white shadow-elegant">
            <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Favorites
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter your city or region"
                    value={preferences.location}
                    onChange={(e) => setPreferences({...preferences, location: e.target.value})}
                  />
                  <p className="text-sm text-neutral-600 mt-1">
                    This helps us show relevant providers in your area
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-800">Push Notifications</h4>
                    <p className="text-sm text-neutral-600">Get notified about new providers and offers</p>
                  </div>
                  <Switch
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-800">Newsletter</h4>
                    <p className="text-sm text-neutral-600">Receive weekly updates and health tips</p>
                  </div>
                  <Switch
                    checked={preferences.newsletter}
                    onCheckedChange={(checked) => setPreferences({...preferences, newsletter: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                onClick={savePreferences} 
                disabled={isSaving}
                className="gradient-brand text-white px-8 py-3"
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Favorite Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-neutral-600">
                    Browse providers and save your favorites for quick access
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={user?.full_name || ""}
                    disabled
                    className="bg-neutral-50"
                  />
                  <p className="text-sm text-neutral-600 mt-1">
                    Contact support to change your name
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-neutral-50"
                  />
                  <p className="text-sm text-neutral-600 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <h4 className="font-medium text-neutral-800 mb-4">Account Actions</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Shield className="w-4 h-4" />
                      Request Data Deletion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}