import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Newspaper,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  HardHat,
  ImageOff,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { Badge, Spinner, EmptyState } from '../components/ui/Card.jsx';
import ProjectForm from '../components/forms/ProjectForm.jsx';
import NewsForm from '../components/forms/NewsForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useProjects } from '../hooks/useProjects.js';
import { useNews } from '../hooks/useNews.js';
import { ADMIN_PANELS, COMPANY_NAME } from '../utils/constants.js';
import { formatShortDate } from '../utils/formatters.js';
import {
  createProject,
  updateProject,
  deleteProject,
  deleteCompanyAsset,
  fetchProjectImages,
  createNewsPost,
  updateNewsPost,
  deleteNewsPost,
} from '../services/supabase.js';

/**
 * AdminDashboard.jsx
 * ----------------------------------------------------------------------
 * Split-screen admin shell:
 *   - LEFT  panel: fixed-width side nav toggling between "Manage Projects"
 *             and "Manage News", plus sign-out.
 *   - RIGHT panel: the active section's data grid + add/edit form, shown
 *             as either a list view or a form view (toggled by local state).
 *
 * This page is only reachable through <ProtectedRoute> (see App.jsx),
 * which redirects unauthenticated visitors to /login before this
 * component ever mounts — so every mutation here additionally relies on
 * the Supabase RLS policies actually enforcing the same rule server-side.
 * Client-side route protection is a UX nicety, NOT the security boundary.
 * ----------------------------------------------------------------------
 */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activePanel, setActivePanel] = useState(ADMIN_PANELS.PROJECTS);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      {/* ============================== LEFT PANEL ============================== */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-5">
          <HardHat className="h-5 w-5 text-brand" strokeWidth={1.75} />
          <span className="font-display text-sm font-semibold text-ink leading-tight">
            {COMPANY_NAME}
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          <SideNavButton
            icon={LayoutGrid}
            label="Manage Projects"
            isActive={activePanel === ADMIN_PANELS.PROJECTS}
            onClick={() => setActivePanel(ADMIN_PANELS.PROJECTS)}
          />
          <SideNavButton
            icon={Newspaper}
            label="Manage News"
            isActive={activePanel === ADMIN_PANELS.NEWS}
            onClick={() => setActivePanel(ADMIN_PANELS.NEWS)}
          />
        </nav>

        <div className="border-t border-slate-100 p-4">
          <p className="truncate px-2 text-xs text-ink-faint" title={user?.email}>
            Signed in as {user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-ink-soft hover:bg-surface-subtle hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ============================== RIGHT PANEL ============================== */}
      <main className="flex-1 overflow-y-auto p-8 md:p-10">
        {activePanel === ADMIN_PANELS.PROJECTS && <ProjectsPanel />}
        {activePanel === ADMIN_PANELS.NEWS && <NewsPanel />}
      </main>
    </div>
  );
}

function SideNavButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors duration-200
        ${isActive ? 'bg-brand-light text-brand-dark' : 'text-ink-soft hover:bg-surface-subtle'}`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}

/* ============================================================================
   PROJECTS PANEL
   ========================================================================= */
function ProjectsPanel() {
  const { projects, isLoading, error, refetch } = useProjects();
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingProject, setEditingProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function openCreateForm() {
    setEditingProject(null);
    setView('form');
  }

  function openEditForm(project) {
    setEditingProject(project);
    setView('form');
  }

  async function handleFormSubmit(formValues) {
    setIsSaving(true);
    try {
      let saved;
      if (editingProject?.id) {
        saved = await updateProject(editingProject.id, formValues);
      } else {
        saved = await createProject(formValues);
      }
      await refetch();
      setView('list');
      return saved; // ProjectForm needs this to attach gallery images to the right project id
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(`Delete "${project.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(project.id);
    try {
      // Best-effort cleanup of every gallery image's storage file BEFORE
      // deleting the project row — once the project is gone, the cascade
      // (see schema.sql) removes the project_images rows automatically,
      // but it can't reach into Storage to delete the actual files.
      const galleryImages = await fetchProjectImages(project.id).catch(() => []);
      await Promise.all(galleryImages.map((img) => deleteCompanyAsset(img.image_path).catch(() => {})));

      await deleteProject(project.id);
      await deleteCompanyAsset(project.image_path).catch(() => {});
      await refetch();
    } finally {
      setDeletingId(null);
    }
  }

  if (view === 'form') {
    return (
      <PanelShell title={editingProject ? 'Edit Project' : 'Add New Project'}>
        <ProjectForm
          project={editingProject}
          isSaving={isSaving}
          onSubmit={handleFormSubmit}
          onCancel={() => setView('list')}
        />
      </PanelShell>
    );
  }

  return (
    <PanelShell
      title="Manage Projects"
      action={
        <Button onClick={openCreateForm} size="sm">
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      }
    >
      {isLoading && <Spinner label="Loading projects…" />}
      {!isLoading && error && (
        <EmptyState tone="error" title="Couldn't load projects." description={error.message} />
      )}
      {!isLoading && !error && projects.length === 0 && (
        <EmptyState title="No projects yet." description="Click 'Add Project' to publish your first one." />
      )}

      {!isLoading && !error && projects.length > 0 && (
        <DataTable
          columns={['Image', 'Title', 'Category', 'Status', 'Featured', 'Location', 'Added', '']}
          rows={projects.map((project) => (
            <tr key={project.id} className="border-b border-slate-100 last:border-0">
              <td className="py-3 pr-4">
                <div className="h-12 w-16 overflow-hidden rounded-sm bg-surface-subtle">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-faint">
                      <ImageOff className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 pr-4 text-sm font-medium text-ink">{project.title}</td>
              <td className="py-3 pr-4">
                <Badge tone="brand">{project.category}</Badge>
              </td>
              <td className="py-3 pr-4">
                <Badge tone={project.status === 'ongoing' ? 'sage' : 'neutral'}>
                  {project.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                </Badge>
              </td>
              <td className="py-3 pr-4">
                {project.is_featured && <Badge tone="brand">Featured</Badge>}
              </td>
              <td className="py-3 pr-4 text-sm text-ink-soft">{project.location}</td>
              <td className="py-3 pr-4 text-sm text-ink-faint">{formatShortDate(project.created_at)}</td>
              <td className="py-3 text-right">
                <RowActions
                  onEdit={() => openEditForm(project)}
                  onDelete={() => handleDelete(project)}
                  isDeleting={deletingId === project.id}
                />
              </td>
            </tr>
          ))}
        />
      )}
    </PanelShell>
  );
}

/* ============================================================================
   NEWS PANEL
   ========================================================================= */
function NewsPanel() {
  const { posts, isLoading, error, refetch } = useNews();
  const [view, setView] = useState('list');
  const [editingPost, setEditingPost] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function openCreateForm() {
    setEditingPost(null);
    setView('form');
  }

  function openEditForm(post) {
    setEditingPost(post);
    setView('form');
  }

  async function handleFormSubmit(formValues) {
    setIsSaving(true);
    try {
      if (editingPost?.id) {
        await updateNewsPost(editingPost.id, formValues);
      } else {
        await createNewsPost(formValues);
      }
      await refetch();
      setView('list');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(post) {
    const confirmed = window.confirm(`Delete "${post.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(post.id);
    try {
      await deleteNewsPost(post.id);
      if (post.image_path) {
        await deleteCompanyAsset(post.image_path).catch(() => {});
      }
      await refetch();
    } finally {
      setDeletingId(null);
    }
  }

  if (view === 'form') {
    return (
      <PanelShell title={editingPost ? 'Edit Post' : 'Add New Post'}>
        <NewsForm
          post={editingPost}
          isSaving={isSaving}
          onSubmit={handleFormSubmit}
          onCancel={() => setView('list')}
        />
      </PanelShell>
    );
  }

  return (
    <PanelShell
      title="Manage News"
      action={
        <Button onClick={openCreateForm} size="sm">
          <Plus className="h-4 w-4" /> Add Post
        </Button>
      }
    >
      {isLoading && <Spinner label="Loading posts…" />}
      {!isLoading && error && (
        <EmptyState tone="error" title="Couldn't load posts." description={error.message} />
      )}
      {!isLoading && !error && posts.length === 0 && (
        <EmptyState title="No posts yet." description="Click 'Add Post' to publish your first update." />
      )}

      {!isLoading && !error && posts.length > 0 && (
        <DataTable
          columns={['Image', 'Headline', 'Published', '']}
          rows={posts.map((post) => (
            <tr key={post.id} className="border-b border-slate-100 last:border-0">
              <td className="py-3 pr-4">
                <div className="h-12 w-16 overflow-hidden rounded-sm bg-surface-subtle">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-faint">
                      <ImageOff className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 pr-4 text-sm font-medium text-ink">{post.title}</td>
              <td className="py-3 pr-4 text-sm text-ink-faint">{formatShortDate(post.published_at)}</td>
              <td className="py-3 text-right">
                <RowActions
                  onEdit={() => openEditForm(post)}
                  onDelete={() => handleDelete(post)}
                  isDeleting={deletingId === post.id}
                />
              </td>
            </tr>
          ))}
        />
      )}
    </PanelShell>
  );
}

/* ============================================================================
   Shared small pieces used by both panels
   ========================================================================= */
function PanelShell({ title, action, children }) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {action}
      </div>
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-card">{children}</div>
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th key={col} className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

function RowActions({ onEdit, onDelete, isDeleting }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onEdit}
        className="rounded-sm p-2 text-ink-soft hover:bg-surface-subtle hover:text-brand transition-colors"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="rounded-sm p-2 text-ink-soft hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}