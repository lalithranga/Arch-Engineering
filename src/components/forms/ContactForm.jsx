import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Input, Textarea } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { submitContactMessage } from '../../services/supabase.js';

const INITIAL_FORM = { name: '', email: '', phone: '', message: '' };

/**
 * ContactForm.jsx
 * ----------------------------------------------------------------------
 * Public-facing form. Per the RLS policies in the README, anonymous
 * visitors are allowed to INSERT into `contact_messages` but cannot
 * read, update, or delete any row (including their own) — this keeps
 * the inbox private to admins while still letting anyone submit.
 * ----------------------------------------------------------------------
 */
export default function ContactForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      await submitContactMessage(formData);
      setStatus('success');
      setFormData(INITIAL_FORM);
    } catch (err) {
      setStatus('error');
      setErrorMessage('Something went wrong sending your message. Please try again, or call us directly.');
      console.error('[ContactForm] submit failed:', err.message);
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-brand-light bg-brand-light/40 px-6 py-12 text-center">
        <CheckCircle2 className="h-8 w-8 text-brand" strokeWidth={1.5} />
        <h3 className="font-display text-lg font-semibold text-ink">Message sent</h3>
        <p className="max-w-sm text-sm text-ink-soft">
          Thanks for reaching out — our team will get back to you within one business day.
        </p>
        <Button variant="secondary" size="sm" onClick={() => setStatus('idle')}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="name"
          name="name"
          label="Full Name"
          placeholder="John Carter"
          required
          value={formData.name}
          onChange={handleChange}
        />
        <Input
          id="phone"
          name="phone"
          label="Phone Number"
          type="tel"
          placeholder="+64 21 555 0192"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <Input
        id="email"
        name="email"
        label="Email Address"
        type="email"
        placeholder="john@company.com"
        required
        value={formData.email}
        onChange={handleChange}
      />

      <Textarea
        id="message"
        name="message"
        label="Project Details"
        placeholder="Tell us about your project — scope, timeline, location…"
        required
        value={formData.message}
        onChange={handleChange}
      />

      {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}

      <Button type="submit" isLoading={status === 'submitting'} className="self-start">
        Send Message
      </Button>
    </form>
  );
}
