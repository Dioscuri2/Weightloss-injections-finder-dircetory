import React, { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '@/api/entities';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text

export default function EditBlogPost() {
  const [post, setPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    author_name: 'Admin',
    published_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    tags: [],
    meta_title: '',
    meta_description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [postId, setPostId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndLoadPost = async () => {
      try {
        const user = await User.me();
        if (user.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
          setPostId(id);
          const existingPost = await BlogPost.get(id);
          setPost({
            ...existingPost,
            tags: existingPost.tags || [],
            published_date: existingPost.published_date ? new Date(existingPost.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          });
        }
      } catch (e) {
        console.error("Error:", e);
        navigate(createPageUrl('Home'));
      } finally {
        setIsLoading(false);
      }
    };
    checkUserAndLoadPost();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));

    if (name === 'title') {
      setPost(prev => ({ ...prev, slug: slugify(value) }));
    }
  };

  const handleContentChange = (value) => {
    setPost(prev => ({ ...prev, content: value }));
  };

  const handleTagsChange = (e) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim());
    setPost(prev => ({ ...prev, tags: tagsArray }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Make sure tags is an array of strings
    const dataToSave = {
        ...post,
        tags: Array.isArray(post.tags) ? post.tags.filter(t => typeof t === 'string' && t.length > 0) : []
    };
    
    try {
      if (postId) {
        await BlogPost.update(postId, dataToSave);
      } else {
        const newPost = await BlogPost.create(dataToSave);
        setPostId(newPost.id);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate(createPageUrl('ManageBlog'));
      }, 1500);
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("Error saving post. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
            <Button variant="outline" onClick={() => navigate(createPageUrl('ManageBlog'))}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Posts
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">Post Title</Label>
                        <Input id="title" name="title" value={post.title} onChange={handleInputChange} placeholder="Your Amazing Blog Post Title" className="text-lg"/>
                    </div>
                    <div>
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input id="slug" name="slug" value={post.slug} onChange={handleInputChange} placeholder="your-amazing-blog-post-title" />
                        <p className="text-xs text-neutral-500 mt-1">URL: /article?slug={post.slug}</p>
                    </div>
                    <div>
                        <Label>Content</Label>
                        <ReactQuill theme="snow" value={post.content} onChange={handleContentChange} className="bg-white"/>
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant">
              <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input id="meta_title" name="meta_title" value={post.meta_title} onChange={handleInputChange} placeholder="SEO-friendly title for Google"/>
                </div>
                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea id="meta_description" name="meta_description" value={post.meta_description} onChange={handleInputChange} placeholder="Short description for search engine results"/>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar column */}
          <div className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={post.status} onValueChange={(value) => setPost(p => ({...p, status: value}))}>
                        <SelectTrigger id="status"><SelectValue placeholder="Set status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="published_date">Publish Date</Label>
                    <Input id="published_date" name="published_date" type="date" value={post.published_date} onChange={handleInputChange} />
                </div>
                <Button onClick={handleSave} disabled={isSaving || saveSuccess} className="w-full gradient-brand text-white">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : saveSuccess ? <CheckCircle className="w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                  {saveSuccess ? 'Saved!' : postId ? 'Update Post' : 'Save Post'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant">
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="author_name">Author</Label>
                  <Input id="author_name" name="author_name" value={post.author_name} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" value={Array.isArray(post.tags) ? post.tags.join(', ') : ''} onChange={handleTagsChange} placeholder="e.g., wegovy, mounjaro, guide"/>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant">
              <CardHeader><CardTitle>Excerpt</CardTitle></CardHeader>
              <CardContent>
                <Textarea name="excerpt" value={post.excerpt} onChange={handleInputChange} placeholder="A short summary of the post..." />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant">
              <CardHeader><CardTitle>Featured Image</CardTitle></CardHeader>
              <CardContent>
                <Input name="featured_image_url" value={post.featured_image_url} onChange={handleInputChange} placeholder="https://example.com/image.jpg"/>
                {post.featured_image_url && <img src={post.featured_image_url} alt="Preview" className="mt-4 rounded-lg w-full object-cover"/>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}