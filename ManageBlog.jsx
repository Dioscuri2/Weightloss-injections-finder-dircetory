import React, { useState, useEffect } from 'react';
import { BlogPost } from '@/api/entities';
import { User } from '@/api/entities';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Edit, Trash2, FileEdit, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ManageBlog() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndFetchPosts = async () => {
      try {
        const user = await User.me();
        if (user.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        fetchPosts();
      } catch (e) {
        navigate(createPageUrl('Home'));
      }
    };
    checkUserAndFetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const allPosts = await BlogPost.list('-created_date');
      setPosts(allPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await BlogPost.delete(postId);
        fetchPosts(); // Refresh the list after deleting
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("There was an error deleting the post. Please try again.");
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
            <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin Tools
            </Link>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-800">Manage Blog Posts</h1>
                    <p className="text-neutral-600">Create, edit, and manage all your articles.</p>
                </div>
                <Link to={createPageUrl('EditBlogPost')}>
                    <Button className="gradient-brand text-white">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create New Post
                    </Button>
                </Link>
            </div>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length > 0 ? (
                  posts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}
                               className={post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.published_date ? format(new Date(post.published_date), 'dd MMM yyyy') : 'Not set'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link to={createPageUrl(`EditBlogPost?id=${post.id}`)}>
                           <Button variant="outline" size="icon">
                             <Edit className="w-4 h-4" />
                           </Button>
                        </Link>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="4" className="h-24 text-center">
                      No posts found. <Link to={createPageUrl('EditBlogPost')} className="text-blue-600 font-semibold">Create one now!</Link>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}