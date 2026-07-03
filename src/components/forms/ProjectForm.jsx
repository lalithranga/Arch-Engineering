import { useState, useEffect } from 'react';
import { Input, Textarea, Select, FileInput } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '../../utils/constants.js';
import {
  uploadCompanyAsset,
  uploadCompanyAssets,
  deleteCompanyAsset,
  fetchProjectImages,
  addProjectImage,
  deleteProjectImage,
  MAX_GALLERY_IMAGES,
} from '../../services/supabase.js';

const EMPTY_PROJECT = {
  title: '',
  category: PROJECT_CATEGORIES[0],
  location: '',
  description: '',
  status: PROJECT_STATUSES[1].value, // defaults to 'completed'
  is_featured: false,
  client: '',
  completion_date: '',
  project_manager: '',
  image_path: '',
};

/**
 * ProjectForm.jsx
 * ----------------------------------------------------------------------
 * Used inside AdminDashboard for both "Add Project" and "Edit Project".
 * Pass an existing `project` to edit it, or omit it to create a new one.
 *
 * Handles TWO upload concerns:
 *   1. Cover image (single file) — stored on projects.image_path, used
 *      as the admin-table thumbnail and as the first carousel slide.
 *   2. Gallery images (up to MAX_GALLERY_IMAGES files) — stored as rows
 *      in project_images, rendered as the public carousel after the cover.
 *
 * SECURITY NOTE: this form is only ever rendered behind the
 * <ProtectedRoute> guard (see App.jsx), and every upload/insert here is
 * only possible because the signed-in user's JWT satisfies the RLS
 * policies on the `company-assets` bucket and `project_images` table
 * (see README "Storage Policies"). An anonymous visitor calling these
 * service functions directly via devtools would get a 403 regardless.
 * ----------------------------------------------------------------------
 */
export default function ProjectForm({ project, onSubmit, onCancel, isSaving }) {
  const isEditing = Boolean(project?.id);
  const [formData, setFormData] = useState(project ?? EMPTY_PROJECT);
  const [coverFile, setCoverFile] = useState(null);

  // Existing gallery rows (when editing) — loaded once on mount so the
  // admin can see + remove current gallery images, not just add new ones.
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    // Only fetch when editing an existing project — a brand-new project
    // has no id yet and therefore no gallery rows to load.
    if (isEditing) {
      fetchProjectImages(project.id)
        .then(setExistingImages)
        .catch((err) => console.error('[ProjectForm] Failed to load gallery:', err.message));
    }
  }, [isEditing, project?.id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleCoverChange(e) {
    setCoverFile(e.target.files?.[0] ?? null);
  }

  function handleGalleryChange(e) {
    const files = Array.from(e.target.files ?? []);
    const remainingSlots = MAX_GALLERY_IMAGES - (existingImages.length - removedImageIds.length);

    if (files.length > remainingSlots) {
      setUploadError(
        `You can add up to ${MAX_GALLERY_IMAGES} gallery images total. ` +
          `${remainingSlots > 0 ? `Only ${remainingSlots} more slot(s) available.` : 'Remove an existing image first.'}`
      );
    } else {
      setUploadError('');
    }

    setNewGalleryFiles(files.slice(0, Math.max(remainingSlots, 0)));
  }

  function markExistingImageForRemoval(imageId) {
    setRemovedImageIds((prev) => [...prev, imageId]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploadError('');
    setIsUploading(true);

    let coverPath = formData.image_path;

    try {
      // --- 1. Cover image: only re-upload if a new file was chosen ---
      if (coverFile) {
        const previousCoverPath = formData.image_path;
        coverPath = await uploadCompanyAsset(coverFile, 'projects');

        if (isEditing && previousCoverPath && previousCoverPath !== coverPath) {
          await deleteCompanyAsset(previousCoverPath).catch(() => {
            console.warn('[ProjectForm] Could not clean up previous cover image:', previousCoverPath);
          });
        }
      }

      // --- 2. For a brand-new project, we need its id BEFORE we can attach
      // gallery images to it — but calling the real onSubmit (passed down
      // from AdminDashboard) also closes this form (setView('list')),
      // which unmounts this component. So for NEW projects, gallery upload
      // must happen here first, then onSubmit last. For EDITS, we already
      // know the id (project.id), so the order doesn't matter as much —
      // but we keep it consistent either way: galleries finish before
      // onSubmit is called, never after.
      const projectId = project?.id ?? null;

      if (isEditing) {
        // --- 3a. EDITING: remove marked images, upload new ones, using
        // the id we already have — all BEFORE onSubmit closes the form.
        for (const imageId of removedImageIds) {
          const imageRow = existingImages.find((img) => img.id === imageId);
          await deleteProjectImage(imageId);
          if (imageRow?.image_path) {
            await deleteCompanyAsset(imageRow.image_path).catch(() => {
              console.warn('[ProjectForm] Could not clean up removed gallery image:', imageRow.image_path);
            });
          }
        }

        if (newGalleryFiles.length > 0) {
          const uploadedPaths = await uploadCompanyAssets(newGalleryFiles, 'projects');
          const startOrder = existingImages.length;
          await Promise.all(
            uploadedPaths.map((path, index) => addProjectImage(projectId, path, startOrder + index))
          );
        }

        // --- 4a. NOW save the project row + close the form.
        await onSubmit({ ...formData, image_path: coverPath });
      } else {
        // --- 3b. CREATING: we don't have a project id until AFTER the
        // insert succeeds, so onSubmit must run first here — but we read
        // its return value BEFORE letting the closing side effect inside
        // it matter, since the gallery upload below still needs to finish
        // while this component is conceptually "in flight," even though
        // the parent may have already started unmounting it.
        const savedProject = await onSubmit({ ...formData, image_path: coverPath });
        const newProjectId = savedProject?.id;

        if (newGalleryFiles.length > 0 && newProjectId) {
          const uploadedPaths = await uploadCompanyAssets(newGalleryFiles, 'projects');
          await Promise.all(
            uploadedPaths.map((path, index) => addProjectImage(newProjectId, path, index))
          );
        } else if (newGalleryFiles.length > 0 && !newProjectId) {
          // This should no longer happen now that handleFormSubmit in
          // AdminDashboard returns the saved row — but if it ever does,
          // fail loudly instead of silently dropping the gallery photos.
          throw new Error(
            'Project was saved, but gallery images could not be attached because no project id was returned.'
          );
        }
      }
    } catch (err) {
      setUploadError('Upload failed. Check your connection and try again.');
      console.error('[ProjectForm] save failed:', err.message);
      return; // don't close the form on failure — let the admin retry
    } finally {
      setIsUploading(false);
    }
  }

  const visibleExistingImages = existingImages.filter((img) => !removedImageIds.includes(img.id));
  const gallerySlotsUsed = visibleExistingImages.length + newGalleryFiles.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        id="title"
        name="title"
        label="Project Title"
        placeholder="Riverside Office Tower"
        required
        value={formData.title}
        onChange={handleChange}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Select
          id="category"
          name="category"
          label="Category"
          required
          options={PROJECT_CATEGORIES}
          value={formData.category}
          onChange={handleChange}
        />
        <Select
          id="status"
          name="status"
          label="Status"
          required
          options={PROJECT_STATUSES}
          value={formData.status}
          onChange={handleChange}
        />
      </div>

      <Input
        id="location"
        name="location"
        label="Location"
        placeholder="Colombo, Sri Lanka"
        required
        value={formData.location}
        onChange={handleChange}
      />

      {/* --- Featured on homepage toggle --- */}
      <label className="flex items-center gap-3 rounded-sm border border-slate-200 bg-surface-subtle px-4 py-3 cursor-pointer hover:border-brand transition-colors">
        <input
          type="checkbox"
          name="is_featured"
          checked={formData.is_featured}
          onChange={handleChange}
          className="h-4 w-4 rounded-sm border-slate-300 text-brand focus:ring-brand"
        />
        <div>
          <p className="text-sm font-medium text-ink">Feature on homepage</p>
          <p className="text-xs text-ink-faint">
            Tick this to show this project in the "Featured Projects" section on the homepage.
            Works for both Ongoing and Completed projects. Max 8 featured at once.
          </p>
        </div>
      </label>

      <Textarea
        id="description"
        name="description"
        label="Description"
        placeholder="Scope of work, square footage, notable details…"
        required
        value={formData.description}
        onChange={handleChange}
      />

      {/* --- Detail-page fields (all optional — shown on /projects/:id) --- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Input
          id="client"
          name="client"
          label="Client"
          placeholder="e.g. ABC Holdings (Pvt) Ltd"
          value={formData.client}
          onChange={handleChange}
        />
        <Input
          id="completion_date"
          name="completion_date"
          label="Completion Date"
          placeholder="e.g. Dec 2024"
          value={formData.completion_date}
          onChange={handleChange}
        />
        <Input
          id="project_manager"
          name="project_manager"
          label="Project Manager"
          placeholder="e.g. J. Perera"
          value={formData.project_manager}
          onChange={handleChange}
        />
      </div>
      <p className="text-xs text-ink-faint -mt-2">
        These three fields are optional and appear on the project's detail page.
        Leave any blank to hide that box.
      </p>

      {/* --- Cover image (single file) --- */}
      <FileInput
        id="image"
        label={isEditing ? 'Replace Cover Image' : 'Cover Image'}
        required={!isEditing}
        onChange={handleCoverChange}
      />
      {isEditing && (
        <p className="text-xs text-ink-faint">
          Leave blank to keep the current cover image. The cover image is
          always shown first in the carousel.
        </p>
      )}

      {/* --- Gallery images (multi-file) --- */}
      <div className="flex flex-col gap-3 rounded-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-soft">
            Gallery Images <span className="text-ink-faint">({gallerySlotsUsed}/{MAX_GALLERY_IMAGES})</span>
          </p>
        </div>

        {visibleExistingImages.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {visibleExistingImages.map((img) => (
              <li key={img.id} className="relative">
                <div className="h-16 w-20 rounded-sm bg-surface-subtle" />
                <button
                  type="button"
                  onClick={() => markExistingImageForRemoval(img.id)}
                  className="absolute -right-2 -top-2 rounded-full bg-white text-xs text-red-600 shadow-card px-1.5 py-0.5 hover:bg-red-50"
                  aria-label="Remove this image"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <FileInput
          id="gallery"
          label={null}
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
        />
        <p className="text-xs text-ink-faint">
          Select up to {MAX_GALLERY_IMAGES} photos total (cover image not included in this count).
          These appear as a rotating carousel on the public site.
        </p>
      </div>

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving || isUploading}>
          {isEditing ? 'Save Changes' : 'Add Project'}
        </Button>
      </div>
    </form>
  );
}