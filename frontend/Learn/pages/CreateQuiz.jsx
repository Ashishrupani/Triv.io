import React, { useEffect, useMemo, useState } from 'react';
import '../styles/CreateQuiz.css';
import { useNavigate } from "react-router-dom";


const STORAGE_KEY = 'triv_notes_v1';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CreateQuiz() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');
  const [previewId, setPreviewId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to parse stored notes', err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const totalWords = useMemo(() => notes.reduce((sum, note) => sum + (note.wordCount || 0), 0), [notes]);

  function resetForm() {
    setTitle('');
    setContent('');
    setEditingId(null);
  }

  function showStatus(message) {
    setStatus(message);
    setTimeout(() => setStatus(''), 1600);
  }

  function handleAdd() {
    if (!content.trim()) {
      showStatus('Paste or type some notes first.');
      return;
    }

    const body = content.trim();
    const nextNote = {
      id: editingId || uid(),
      title: title.trim() || body.slice(0, 60),
      content: body,
      createdAt: Date.now(),
      wordCount: body.split(/\s+/).filter(Boolean).length,
    };

    if (editingId) {
      setNotes((prev) => prev.map((note) => (note.id === editingId ? { ...note, ...nextNote } : note)));
      showStatus('Note updated.');
    } else {
      setNotes((prev) => [nextNote, ...prev]);
      showStatus('Note added.');
    }

    resetForm();
  }

  async function handleGenerateQuiz() {
    const response = await fetch('http://localhost:5000/api/upload-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query : "Make a 10 question quiz using these notes below", notes }),
    });

    if (response.ok) {
      const data = await response.json();
      setPreviewId(data.id);
      showStatus('Quiz generated successfully!');

      navigate("/quiz", { state: { quiz: data } });

    } else {
      showStatus('Failed to generate quiz.');
    }
  }
  function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = String(e.target?.result || '');
        if (!text.trim()) return;

        setNotes((prev) => [
          {
            id: uid(),
            title: file.name.replace(/\.[^.]+$/, '') || 'Uploaded note',
            content: text,
            createdAt: Date.now(),
            wordCount: text.split(/\s+/).filter(Boolean).length,
          },
          ...prev,
        ]);
      };
      reader.readAsText(file);
    });

    event.target.value = '';
    showStatus(`Imported ${files.length} file${files.length > 1 ? 's' : ''}.`);
  }

  function handleRemove(id) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (previewId === id) setPreviewId(null);
  }

  function handleEdit(note) {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDownload(note) {
    const blob = new Blob([note.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 40) || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClearAll() {
    if (!notes.length) return;
    if (confirm('Remove all staged notes?')) {
      setNotes([]);
      resetForm();
    }
  }

  return (
    <div className="create-quiz-page">
      <header className="site-header">
        <div className="site-wrap">
          <a className="brand" href="/">
            Triv<span>.io</span>
          </a>

          <nav className="nav">
            <a href="/leaderboard">Leaderboards</a>
            <a href="/quiz">Practice quiz</a>
            <a href="/profile">Profile</a>
          </nav>
        </div>
      </header>

      <main className="workspace">
        <section className="composer">
          <header className="composer__head">
            <div>
              <span className="composer__pill">Stage your notes</span>
              <h1>Paste text or upload study files.</h1>
              <p>
                Everything saves locally so you can prep content before the AI quiz generator launches.
                Once the endpoint goes live, these notes will be just one click away from becoming question sets.
              </p>
            </div>
            <div className="composer__meta">
              <strong>{notes.length}</strong>
              <span>notes staged</span>
            </div>
          </header>

          <label className="field-label">Title (optional)</label>
          <input
            className="field-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Organic Chemistry – Chapter 5"
          />

          <label className="field-label">Notes</label>
          <textarea
            className="field-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste lecture notes, summaries, or bullet lists here..."
          />

          <div className="composer__actions">
            <button type="button" className="btn primary" onClick={handleAdd}>
              {editingId ? 'Save changes' : 'Add note'}
            </button>
            <label className="btn ghost" style={{ cursor: 'pointer' }}>
              <input
                type="file"
                accept=".txt,.md,text/plain"
                multiple
                onChange={handleUpload}
                style={{ display: 'none' }}
              />
              Import files
            </label>
            <button type="button" className="btn ghost" onClick={resetForm}>
              Clear form
            </button>
            <button type="button" className="btn ghost" onClick={handleClearAll}>
              Clear all notes
            </button>
            <span className="composer__status">{status || '\u00A0'}</span>
          </div>

          <div className="coming-soon">
            <h2>Quiz generator coming soon</h2>
            <p>
              When the AI wiring finishes you’ll be able to pick a difficulty, generate questions, and share
              quizzes instantly. Keep staging your notes so launch day is seamless.
            </p>
            <button onClick={handleGenerateQuiz} type="button" className="btn primary">
              Generate quiz
            </button>
          </div>
        </section>

        <aside className="notes-pane">
          <header className="notes-pane__head">
            <h2>Staged notes</h2>
            <p>
              {notes.length ? `${totalWords} words ready` : 'Add a note to see it here. Everything stays local.'}
            </p>
          </header>

          {notes.length === 0 ? (
            <div className="notes-empty">
              <h3>No notes yet</h3>
              <p>Paste a block of text or drop a .txt / .md file to start staging your content.</p>
            </div>
          ) : (
            <ul className="notes-list">
              {notes.map((note) => (
                <li key={note.id} className="note-card">
                  <div>
                    <strong>{note.title}</strong>
                    <span>
                      {new Date(note.createdAt).toLocaleString()} • {note.wordCount} words
                    </span>
                  </div>
                  <div className="note-actions">
                    <button type="button" onClick={() => setPreviewId((id) => (id === note.id ? null : note.id))}>
                      {previewId === note.id ? 'Hide preview' : 'Preview'}
                    </button>
                    <button type="button" onClick={() => handleEdit(note)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDownload(note)}>
                      Download
                    </button>
                    <button type="button" className="danger" onClick={() => handleRemove(note.id)}>
                      Delete
                    </button>
                  </div>
                  {previewId === note.id && <pre className="note-preview">{note.content}</pre>}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
    </div>
  );
}
