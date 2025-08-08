
import React, { useState, useEffect } from "react";
import { BlogPost } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Tag, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AdSlot from "../components/common/AdSlot";
import SEOHead from "../components/seo/SEOHead"; // Added this import

export default function Article() {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (!slug) {
          setError("No article specified.");
          setIsLoading(false);
          return;
        }

        const results = await BlogPost.filter({ slug: slug, status: "published" });
        if (results.length > 0) {
          const fetchedPost = results[0];
          setPost(fetchedPost);

          // SEO Optimization handled by SEOHead component now, removing direct DOM manipulation.
          // document.title = fetchedPost.meta_title || fetchedPost.title;
          // let metaDesc = document.querySelector('meta[name="description"]');
          // if (!metaDesc) {
          //   metaDesc = document.createElement('meta');
          //   metaDesc.name = 'description';
          //   document.head.appendChild(metaDesc);
          // }
          // metaDesc.content = fetchedPost.meta_description || fetchedPost.excerpt || "";

        } else {
          setError("Article not found or is not published.");
        }
      } catch (e) {
        console.error("Failed to fetch article:", e);
        setError("An error occurred while loading the article.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* SEO Head with Schema */}
      {post && (
        <SEOHead
          title={post.meta_title || post.title}
          description={post.meta_description || post.excerpt}
          keywords={post.tags && post.tags.length > 0 ? post.tags.join(', ') : undefined}
          image={post.featured_image_url}
          url={`${window.location.origin}${createPageUrl("Article")}?slug=${post.slug}`}
          type="article"
          schemas={[
            {
              type: "Article",
              data: post
            },
            {
              type: "BreadcrumbList",
              data: {
                breadcrumbs: [
                  { name: "Home", url: `${window.location.origin}${createPageUrl("Home")}` },
                  { name: "Blog", url: `${window.location.origin}${createPageUrl("Blog")}` },
                  { name: post.title, url: `${window.location.origin}${createPageUrl("Article")}?slug=${post.slug}` }
                ]
              }
            }
          ]}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-48 mb-8" />
            <Skeleton className="h-80 w-full mb-8" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Card className="p-8 max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-neutral-800 mb-2">Error Loading Article</h2>
              <p className="text-neutral-600 mb-6">{error}</p>
              <Link to={createPageUrl("Blog")}>
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </Card>
          </div>
        ) : (
          post && (
            <>
              <Link
                to={createPageUrl("Blog")}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Articles
              </Link>

              <article className="bg-white rounded-3xl shadow-elegant overflow-hidden">
                <header className="mb-8 p-8 pb-0 md:p-12 md:pb-0">
                  {post.featured_image_url && (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-auto max-h-[500px] object-cover rounded-2xl mb-8 shadow-elegant"
                    />
                  )}

                  <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-neutral-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.published_date}>
                        {format(new Date(post.published_date), "dd MMMM, yyyy")}
                      </time>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </header>

                <div className="p-8 md:p-12 pt-0">
                  <div className="grid lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                      <div className="prose prose-lg max-w-none prose-blue prose-img:rounded-xl prose-a:text-blue-600 hover:prose-a:text-blue-700">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Sidebar - Desktop Only */}
                    <div className="hidden lg:block lg:col-span-1">
                      <div className="sticky top-8 space-y-6">
                        <AdSlot placementName="blog-article-sidebar" />
                      </div>
                    </div>
                  </div>

                  {/* AD PLACEMENT: Mobile Mid-Content (show on mobile only) */}
                  <div className="lg:hidden my-8">
                    <AdSlot placementName="blog-article-middle" />
                  </div>

                  {/* AD PLACEMENT: Article Bottom */}
                  <div className="mt-12 pt-8 border-t border-neutral-200">
                    <AdSlot placementName="blog-article-bottom" />
                  </div>
                </div>
              </article>
            </>
          )
        )}
      </div>
    </div>
  );
}
