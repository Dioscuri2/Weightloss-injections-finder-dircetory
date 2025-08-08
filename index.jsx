import Layout from "./Layout.jsx";

import Home from "./Home";

import Providers from "./Providers";

import Medications from "./Medications";

import Profile from "./Profile";

import UploadProviders from "./UploadProviders";

import Provider from "./Provider";

import ManageProviderPricing from "./ManageProviderPricing";

import Blog from "./Blog";

import Article from "./Article";

import ManageProviderImages from "./ManageProviderImages";

import ManageProviderWebsites from "./ManageProviderWebsites";

import ManageBlog from "./ManageBlog";

import EditBlogPost from "./EditBlogPost";

import AppSecurity from "./AppSecurity";

import TermsOfService from "./TermsOfService";

import PrivacyPolicy from "./PrivacyPolicy";

import ManageProviderData from "./ManageProviderData";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Providers: Providers,
    
    Medications: Medications,
    
    Profile: Profile,
    
    UploadProviders: UploadProviders,
    
    Provider: Provider,
    
    ManageProviderPricing: ManageProviderPricing,
    
    Blog: Blog,
    
    Article: Article,
    
    ManageProviderImages: ManageProviderImages,
    
    ManageProviderWebsites: ManageProviderWebsites,
    
    ManageBlog: ManageBlog,
    
    EditBlogPost: EditBlogPost,
    
    AppSecurity: AppSecurity,
    
    TermsOfService: TermsOfService,
    
    PrivacyPolicy: PrivacyPolicy,
    
    ManageProviderData: ManageProviderData,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Providers" element={<Providers />} />
                
                <Route path="/Medications" element={<Medications />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/UploadProviders" element={<UploadProviders />} />
                
                <Route path="/Provider" element={<Provider />} />
                
                <Route path="/ManageProviderPricing" element={<ManageProviderPricing />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/Article" element={<Article />} />
                
                <Route path="/ManageProviderImages" element={<ManageProviderImages />} />
                
                <Route path="/ManageProviderWebsites" element={<ManageProviderWebsites />} />
                
                <Route path="/ManageBlog" element={<ManageBlog />} />
                
                <Route path="/EditBlogPost" element={<EditBlogPost />} />
                
                <Route path="/AppSecurity" element={<AppSecurity />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/ManageProviderData" element={<ManageProviderData />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}