

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Search,
  Heart,
  User,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Upload, // Added new import for Upload icon
  DollarSign, // Added new import for DollarSign icon
  Newspaper, // Added icon for Blog
  Image, // Added new import for Image icon
  Globe, // Added new import for Globe icon
  FileEdit, // Added new icon
  DatabaseZap // Added new icon
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User as UserSDK } from "@/api/entities"; // Import User SDK
import PWAInstaller from "./components/common/PWAInstaller";
import PWAManager from "./components/common/PWAManager";
import PWAManifest from "./components/common/PWAManifest";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Footer from "./components/common/Footer"; // Import the new Footer component

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
    mobileOnly: false,
  },
  {
    title: "Providers",
    url: createPageUrl("Providers"),
    icon: Search,
    mobileOnly: false,
  },
  {
    title: "Medications",
    url: createPageUrl("Medications"),
    icon: Heart,
    mobileOnly: false,
  },
  {
    title: "Blog",
    url: createPageUrl("Blog"),
    icon: Newspaper,
    mobileOnly: false,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
    mobileOnly: false,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = await UserSDK.me();
        if (user && user.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false); // User exists but not admin, or user is null
        }
      } catch (error) {
        // Silently handle errors - don't break the app
        console.warn('Unable to check admin status:', error.message);
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [location]); // Re-check on location change in case of login/logout

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <style>
          {`
            :root {
              --primary-blue: #2563eb;
              --primary-blue-light: #3b82f6;
              --primary-blue-dark: #1d4ed8;
              --accent-green: #10b981;
              --accent-orange: #f59e0b;
              --neutral-50: #f8fafc;
              --neutral-100: #f1f5f9;
              --neutral-200: #e2e8f0;
              --neutral-300: #cbd5e1;
              --neutral-600: #475569;
              --neutral-700: #334155;
              --neutral-800: #1e293b;
              --neutral-900: #0f172a;
            }

            .glass-effect {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .gradient-brand {
              background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%);
            }

            .shadow-elegant {
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05),
                          0 10px 10px -5px rgba(0, 0, 0, 0.02);
            }

            /* PWA Styles */
            .pwa-standalone {
              user-select: none;
              -webkit-user-select: none;
              -webkit-touch-callout: none;
            }

            .app-offline {
              filter: grayscale(0.5);
            }

            .app-offline::before {
              content: 'Offline Mode';
              position: fixed;
              top: 10px;
              right: 10px;
              background: #ef4444;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              z-index: 1000;
            }

            /* iOS PWA Status Bar */
            @supports (padding-top: env(safe-area-inset-top)) {
              .pwa-standalone {
                padding-top: env(safe-area-inset-top);
              }
            }

            /* Animation utilities */
            @keyframes slide-in-from-top {
              from {
                opacity: 0;
                transform: translateY(-100%);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes slide-in-from-bottom {
              from {
                opacity: 0;
                transform: translateY(100%);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fade-in {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            .animate-in {
              animation-duration: 300ms;
              animation-fill-mode: both;
            }

            .slide-in-from-top {
              animation-name: slide-in-from-top;
            }

            .slide-in-from-bottom {
              animation-name: slide-in-from-bottom;
            }

            .fade-in {
              animation-name: fade-in;
            }

            .ios-install-modal {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              padding: 20px;
            }

            .ios-install-modal .modal-content {
              background: white;
              border-radius: 12px;
              padding: 24px;
              max-width: 320px;
              text-align: center;
            }

            .ios-install-modal h3 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 8px;
              color: #1f2937;
            }

            .ios-install-modal p {
              color: #6b7280;
              margin-bottom: 16px;
            }

            .ios-install-modal ol {
              text-align: left;
              margin-bottom: 20px;
              color: #374151;
            }

            .ios-install-modal li {
              margin-bottom: 8px;
              padding-left: 8px;
            }

            .ios-install-modal .share-icon {
              display: inline-block;
              margin-left: 4px;
              padding: 2px 6px;
              background: #f3f4f6;
              border-radius: 4px;
              font-size: 16px;
            }

            .ios-install-modal button {
              background: #2563eb;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              width: 100%;
            }

            .update-notification {
              position: fixed;
              top: 20px;
              right: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              z-index: 1000;
              padding: 16px;
              max-width: 300px;
            }

            .update-notification .notification-content p {
              margin: 0 0 12px 0;
              font-weight: 500;
              color: #1f2937;
            }

            .update-notification button {
              background: #2563eb;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
              margin-right: 8px;
            }

            .update-notification button:last-child {
              background: #6b7280;
              margin-right: 0;
            }
          `}
        </style>

        {/* PWA Components */}
        <PWAManifest />
        <PWAManager />
        <PWAInstaller />

        {/* Desktop Header */}
        <header className="hidden md:block sticky top-0 z-40 glass-effect shadow-elegant">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-800 tracking-tight">
                    WeightLoss Injections Finder
                  </h1>
                  <p className="text-xs text-neutral-600 font-medium">UK Provider Directory</p>
                </div>
              </Link>

              <nav className="flex items-center gap-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      location.pathname === item.url
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-neutral-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>

              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="glass-effect border-neutral-200">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="py-6">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-neutral-800">WeightLoss Injections Finder</h2>
                        <p className="text-sm text-neutral-600">UK Provider Directory</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-3">Quick Links</h3>
                        <div className="space-y-2">
                          <Button variant="ghost" className="w-full justify-start">
                            <MapPin className="w-4 h-4 mr-3" />
                            Find Nearby Providers
                          </Button>
                          <Button variant="ghost" className="w-full justify-start">
                            <Phone className="w-4 h-4 mr-3" />
                            Contact Support
                          </Button>
                          <Button variant="ghost" className="w-full justify-start">
                            <Mail className="w-4 h-4 mr-3" />
                            Newsletter
                          </Button>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="pt-6 border-t border-neutral-200">
                          <h3 className="font-semibold text-neutral-800 mb-3">Admin Tools</h3>
                          <div className="space-y-2">
                            <Link to={createPageUrl("UploadProviders")} className="w-full">
                              <Button variant="ghost" className="w-full justify-start">
                                <Upload className="w-4 h-4 mr-3" />
                                Upload Provider Data
                              </Button>
                            </Link>
                            <Link to={createPageUrl("ManageProviderPricing")} className="w-full">
                              <Button variant="ghost" className="w-full justify-start">
                                <DollarSign className="w-4 h-4 mr-3" />
                                Manage Provider Pricing
                              </Button>
                            </Link>
                            <Link to={createPageUrl("ManageProviderData")} className="w-full">
                              <Button variant="ghost" className="w-full justify-start">
                                <DatabaseZap className="w-4 h-4 mr-3" />
                                AI Data Refresher
                              </Button>
                            </Link>
                            <Link to={createPageUrl("ManageProviderImages")} className="w-full">
                              <Button variant="ghost" className="w-full justify-start">
                                <Image className="w-4 h-4 mr-3" />
                                Find Provider Images
                              </Button>
                            </Link>
                            <Link to={createPageUrl("ManageProviderWebsites")} className="w-full">
                              <Button variant="ghost" className="w-full justify-start">
                                <Globe className="w-4 h-4 mr-3" />
                                Find Provider Websites
                              </Button>
                            </Link>
                            <Link to={createPageUrl("ManageBlog")} className="w-full">
                              <Button variant="ghost" className="w-full justify-start">
                                <FileEdit className="w-4 h-4 mr-3" />
                                Manage Blog Posts
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-neutral-200">
                        <div className="text-center">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Trusted Directory
                          </Badge>
                          <p className="text-xs text-neutral-600 mt-2">
                            All providers are verified and regulated
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* New Footer */}
        <Footer />

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-neutral-200">
          <div className="grid grid-cols-4 py-2">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center justify-center py-3 px-2 transition-all duration-300 ${
                  location.pathname === item.url
                    ? 'text-blue-700'
                    : 'text-neutral-500 hover:text-blue-700'
                }`}
              >
                <item.icon className={`w-5 h-5 mb-1 ${
                  location.pathname === item.url ? 'scale-110' : ''
                }`} />
                <span className="text-xs font-medium">{item.title}</span>
                {location.pathname === item.url && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-700 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Bottom Padding */}
        <div className="md:hidden h-20" />
      </div>
    </ErrorBoundary>
  );
}

