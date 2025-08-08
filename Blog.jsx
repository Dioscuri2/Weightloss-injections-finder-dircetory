
import React, { useState, useEffect } from "react";
import { BlogPost } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User as UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AdSlot from "../components/common/AdSlot";
import SEOHead from "../components/seo/SEOHead";

function ArticleCard({ post }) {
  return (
    <Card className="group overflow-hidden border-0 shadow-elegant hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
      <div className="aspect-video bg-neutral-200 relative">
        {post.featured_image_url ? (
          <img 
            src={post.featured_image_url} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-100"></div>
        )}
      </div>
      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800">{tag}</Badge>
          ))}
        </div>
        <CardTitle className="text-xl group-hover:text-blue-700 transition-colors duration-300">
          <Link to={createPageUrl(`Article?slug=${post.slug}`)}>
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-neutral-600 line-clamp-3">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            <span>{post.author_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.published_date}>
              {format(new Date(post.published_date), "dd MMM yyyy")}
            </time>
          </div>
        </div>
        <Link to={createPageUrl(`Article?slug=${post.slug}`)} className="w-full">
          <Button variant="outline" className="w-full group-hover:gradient-brand group-hover:text-white group-hover:border-transparent transition-all duration-300">
            Read More
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const publishedPosts = await BlogPost.filter(
          { status: "published" },
          "-published_date"
        );
        setPosts(publishedPosts);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* SEO Head with Schema */}
      <SEOHead
        title="Weight Loss & Health Blog - Expert Insights & Patient Stories"
        description="Expert insights, patient stories, and practical advice on weight loss treatments, healthy living, and finding the right healthcare providers in the UK."
        keywords="weight loss blog, weight loss tips, patient stories, healthcare advice, UK weight loss, healthy lifestyle"
        schemas={[
          {
            type: "BreadcrumbList",
            data: {
              breadcrumbs: [
                { name: "Home", url: `${window.location.origin}${createPageUrl("Home")}` },
                { name: "Blog", url: `${window.location.origin}${createPageUrl("Blog")}` }
              ]
            }
          }
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
            Weight Loss & Health Blog
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Expert insights, patient stories, and practical advice on weight loss treatments, 
            healthy living, and finding the right healthcare providers in the UK.
          </p>
        </div>

        {/* AD PLACEMENT: Blog List Top */}
        <div className="mb-12">
          <AdSlot placementName="blog-list-top" />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-600">No blog posts have been published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
