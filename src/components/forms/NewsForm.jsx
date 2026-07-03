import { useState } from 'react';
import { Input, Textarea, FileInput } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { uploadCompanyAsset, deleteCompanyAsset } from '../../services/supabase.js';

const EMPTY_POST = {
  title: '',
  summary: '',
  body: '',
  image_path: '',
};

/**
 * NewsForm.jsx
 * ----------------------------------------------------------------------
 * Add/Edit form for a single News & Media post. The cover image is
 * OPTIONAL here (unlike ProjectForm, where it's required) — a news post
 * can be a text-only announcement. Follows the same upload pattern as
 * ProjectForm's cover image: only re-uploads if a new file is chosen,
 * and cleans up the old storage object when replacing an image on edit.
 * ----------------------------------------------------------------------
 */
export default function NewsForm({ post, onSubmit, onCancel, isSaving }) {
  const isEditing = Boolean(post?.id);
  const [formData, setFormData] = useState(post ?? EMPTY_POST);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    setImageFile(e.target.files?.[0] ?? null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploadError('');

    let imagePath = formData.image_path || null;

    try {
      if (imageFile) {
        setIsUploading(true);
        const previousPath = formData.image_path;
        imagePath = await uploadCompanyAsset(imageFile, 'news');

        if (isEditing && previousPath && previousPath !== imagePath) {
          await deleteCompanyAsset(previousPath).catch(() => {
            console.warn('[NewsForm] Could not clean up previous image:', previousPath);
          });
        }
      }

      await onSubmit({ ...formData, image_path: imagePath });
    } catch (err) {
      setUploadError('Save failed. Check your connection and try again.');
      console.error('[NewsForm] save failed:', err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        id="title"
        name="title"
        label="Headline"
        placeholder="Arch Engineering completes new commercial complex"
        required
        value={formData.title}
        onChange={handleChange}
      />

      <Textarea
        id="summary"
        name="summary"
        label="Short Summary"
        placeholder="One or two sentences shown on the news card preview…"
        rows={2}
        required
        value={formData.summary}
        onChange={handleChange}
      />

      <Textarea
        id="body"
        name="body"
        label="Full Article"
        placeholder="The complete story…"
        rows={8}
        required
        value={formData.body}
        onChange={handleChange}
      />

      <FileInput
        id="image"
        label={isEditing ? 'Replace Cover Image (optional)' : 'Cover Image (optional)'}
        onChange={handleFileChange}
      />
      <p className="text-xs text-ink-faint -mt-2">
        Leave blank for a text-only post. {isEditing && 'Leave blank to keep the current image.'}
      </p>

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving || isUploading}>
          {isEditing ? 'Save Changes' : 'Publish Post'}
        </Button>
      </div>
    </form>
  );
}
