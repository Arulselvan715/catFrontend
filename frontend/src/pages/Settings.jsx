import { Edit3, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api';

const emptyForm = { name: '', email: '', phone: '', active: true };

export function Settings({ contacts, loading, error, refresh }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (editingId) {
        await api.updateContact(editingId, form);
      } else {
        await api.createContact(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await refresh();
      setMessage('Emergency contact saved.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (contact) => {
    setEditingId(contact.id);
    setForm({ name: contact.name, email: contact.email || '', phone: contact.phone || '', active: contact.active });
  };

  const remove = async (id) => {
    if (!confirm('Remove this emergency contact?')) return;
    await api.deleteContact(id);
    await refresh();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Emergency Contact Info</h2>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Contact name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-cyan-400"
              placeholder="Family member"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Optional email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-cyan-400"
              placeholder="admin@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Phone number optional</span>
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-cyan-400"
              placeholder="+916380469868"
            />
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm({ ...form, active: event.target.checked })}
              className="h-4 w-4 accent-cyan-500 dark:accent-cyan-400"
            />
            Active for emergency alerts
          </label>
          <div className="flex gap-3">
            <button disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:bg-cyan-600 disabled:opacity-60 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">
              <Plus className="h-4 w-4" />
              {editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-transparent">
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>
          {message && <div className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200">{message}</div>}
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
        <div className="border-b border-slate-200 px-5 py-4 font-bold text-slate-900 dark:border-slate-800 dark:text-white">Saved Contacts</div>
        {loading ? (
          <div className="p-5 text-slate-400">Loading contacts...</div>
        ) : error ? (
          <div className="p-5 text-red-300">{error}</div>
        ) : contacts.length === 0 ? (
          <div className="p-5 text-slate-400">No emergency contacts saved.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{contact.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{contact.email || 'No email'} / {contact.phone || 'No phone'} / {contact.active ? 'Active' : 'Inactive'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(contact)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-400" aria-label="Edit contact">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(contact.id)} className="rounded-md border border-slate-200 p-2 text-red-500 hover:border-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-200 dark:hover:border-red-400 dark:hover:bg-transparent" aria-label="Remove contact">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
