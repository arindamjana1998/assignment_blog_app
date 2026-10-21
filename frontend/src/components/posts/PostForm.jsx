import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postFormSchema } from '../../schemas/postSchemas';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Card from '../common/Card';
import { estimateReadingTime } from '../../utils/stringHelpers';

export const PostForm = ({
  defaultValues = { title: '', content: '' },
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Publish Article',
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  const titleValue = watch('title') || '';
  const contentValue = watch('content') || '';
  const readingTime = estimateReadingTime(contentValue);

  return (
    <Card padding="p-6 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Input with Character Counter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Article Title <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-xs ${
                titleValue.length > 170 ? 'text-amber-600 font-semibold' : 'text-slate-400'
              }`}
            >
              {titleValue.length} / 180
            </span>
          </div>
          <Input
            name="title"
            placeholder="e.g. Architecting Scalable RESTful Services with Node.js"
            error={errors.title?.message}
            {...register('title')}
          />
        </div>

        {/* Content Textarea with Live Metadata */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="content" className="block text-sm font-medium text-slate-700">
              Content / Story <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400">
              ~{readingTime} min read ({contentValue.trim().split(/\s+/).filter(Boolean).length} words)
            </span>
          </div>
          <Textarea
            name="content"
            rows={12}
            placeholder="Write your article here..."
            error={errors.content?.message}
            {...register('content')}
          />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!isDirty && defaultValues.title !== ''}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PostForm;
