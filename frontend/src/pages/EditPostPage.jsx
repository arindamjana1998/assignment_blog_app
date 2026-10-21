import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import postService from '../services/postService';
import PostForm from '../components/posts/PostForm';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorHandler';

export const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setServerError(null);
        const res = await postService.getPostById(id);
        const fetchedPost = res.data?.post;

        // Check ownership
        const authorId = fetchedPost?.author?._id || fetchedPost?.author;
        const isOwner = user && authorId?.toString() === user._id?.toString();
        const isAdmin = user?.role === 'admin';

        if (!isOwner && !isAdmin) {
          toast.error('You do not have permission to edit this article');
          navigate('/');
          return;
        }

        setPost(fetchedPost);
      } catch (err) {
        setServerError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, user, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const res = await postService.updatePost(id, formData);
      const updatedPost = res.data?.post;

      toast.success('Article updated successfully!');
      if (updatedPost?.slug) {
        navigate(`/posts/${updatedPost.slug}`);
      } else {
        navigate('/my-posts');
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (serverError && !post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Unable to Load Article</h2>
        <p className="text-slate-500 text-sm">{serverError}</p>
        <Link to="/">
          <Button variant="secondary" size="sm" leftIcon={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Edit Article
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your article title or content. Changing the title will update the URL slug.
          </p>
        </div>

        <Link to={`/posts/${post.slug}`}>
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
            View Current
          </Button>
        </Link>
      </div>

      {serverError && (
        <Alert variant="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <PostForm
        defaultValues={{
          title: post.title,
          content: post.content,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default EditPostPage;
