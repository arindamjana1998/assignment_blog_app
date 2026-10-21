import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import postService from '../services/postService';
import PostForm from '../components/posts/PostForm';
import Alert from '../components/common/Alert';
import { getErrorMessage } from '../utils/errorHandler';

export const CreatePostPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const res = await postService.createPost(formData);
      const createdPost = res.data?.post;

      toast.success('Article published successfully!');
      if (createdPost?.slug) {
        navigate(`/posts/${createdPost.slug}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Write an Article
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Share your ideas, tutorials, or stories with readers around the world
        </p>
      </div>

      {serverError && (
        <Alert variant="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <PostForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Publish Article"
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default CreatePostPage;
