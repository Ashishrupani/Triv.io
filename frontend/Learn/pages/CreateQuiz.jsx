// src/App.jsx

import React, { useEffect, useState } from "react";

import "../styles/App.css";
import "../styles/CreateQuiz.css";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [notes, setNotes] = useState([]);

  const [noteText, setNoteText] = useState("");

  const [noteTitle, setNoteTitle] = useState("");

  const [previewId, setPreviewId] = useState(null);

  const [editing, setEditing] = useState(null);

  const [message, setMessage] = useState("");

  const LS_KEY = "notes_quiz_app_v1";

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);

    if (raw) {
      try {
        setNotes(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(notes));
  }, [notes]);

  function snippet(s, n = 40) {
    return (
      s.trim().replace(/\s+/g, " ").slice(0, n) + (s.length > n ? "..." : "")
    );
  }

  function addNoteFromText() {
    if (!noteText.trim()) {
      setMessage("Empty note — write or paste something first");
      return;
    }

    const n = {
      id: uid(),

      title: noteTitle.trim() || snippet(noteText, 40) || "Untitled note",

      content: noteText,

      createdAt: new Date().toISOString(),
    };

    setNotes((cur) => [n, ...cur]);

    setNoteText("");
    setNoteTitle("");

    setMessage("Note added");
    setTimeout(() => setMessage(""), 1600);
  }

  function handleFileUpload(e) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    files.forEach((f) => {
      const reader = new FileReader();

      reader.onload = (ev) => {
        const text = String(ev.target.result || "");

        const n = {
          id: uid(),
          title: f.name || snippet(text, 40),
          content: text,
          createdAt: new Date().toISOString(),
        };

        setNotes((cur) => [n, ...cur]);
      };

      reader.readAsText(f);
    });

    e.target.value = "";
  }

  function removeNote(id) {
    if (!confirm("Delete this note?")) return;

    setNotes((cur) => cur.filter((n) => n.id !== id));

    if (previewId === id) setPreviewId(null);
  }

  function startEdit(id) {
    const n = notes.find((x) => x.id === id);
    if (!n) return;

    setEditing(id);
    setNoteText(n.content);
    setNoteTitle(n.title);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveEdit() {
    setNotes((cur) =>
      cur.map((n) =>
        n.id === editing
          ? { ...n, title: noteTitle || n.title, content: noteText }
          : n
      )
    );

    setEditing(null);
    setNoteText("");
    setNoteTitle("");

    setMessage("Saved");
    setTimeout(() => setMessage(""), 1200);
  }

  function cancelEdit() {
    setEditing(null);
    setNoteText("");
    setNoteTitle("");
  }

  function exportJSON() {
    const payload = JSON.stringify(notes, null, 2);

    const url = URL.createObjectURL(
      new Blob([payload], { type: "application/json" })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "notes-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadNote(n) {
    const url = URL.createObjectURL(
      new Blob([n.content], { type: "text/plain" })
    );

    const a = document.createElement("a");
    a.href = url;

    a.download = (n.title || "note").replace(/[^a-z0-9-_.]/gi, "_") + ".txt";

    a.click();
    URL.revokeObjectURL(url);
  }

  async function generateQuizBackend() {
    if (!notes.length) {
      alert("Add some notes first");
      return;
    }

    setMessage("Sending notes to backend...");

    try {
      // const resp = await fetch('/api/generate-quiz', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ notes }) });

      // const data = await resp.json();

      alert("Backend not implemented. See code comments for contract.");
    } catch {
      setMessage("Failed to contact backend");
    } finally {
      setTimeout(() => setMessage(""), 1200);
    }
  }

  function generateLocalDemoQuiz() {
    if (!notes.length) {
      alert("Add notes first");
      return;
    }

    const longText = notes.map((n) => n.content).join("\n\n");

    const sentences = longText
      .split(/[.?!]\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    const questions = [];

    for (let i = 0; i < Math.min(6, sentences.length); i++) {
      const s = sentences[i];
      const words = s.split(/\s+/).filter(Boolean);

      const candidates = words.filter((w) => w.length > 3);
      if (!candidates.length) continue;

      const answer = candidates[Math.floor(Math.random() * candidates.length)];

      const choices = [answer];

      while (choices.length < 4) {
        const fake = scrambleWord(answer) + Math.floor(Math.random() * 10);

        if (!choices.includes(fake)) choices.push(fake);
      }

      shuffleArray(choices);

      questions.push({
        question: s.replace(answer, "_____"),
        choices,
        answerIndex: choices.indexOf(answer),
      });
    }

    if (!questions.length) {
      alert("Not enough content to make demo questions — add longer notes");
      return;
    }

    const html = questions
      .map(
        (q, i) =>
          `<div class='demo-q'><strong>Q${i + 1}.</strong> ${escapeHtml(
            q.question
          )}<div class='demo-choices'>${q.choices
            .map((c, idx) => `<span>${idx + 1}. ${escapeHtml(c)}</span>`)
            .join("")}</div></div>`
      )
      .join("");

    const w = window.open("", "_blank", "width=700,height=600");

    w.document.write(
      `<html><head><title>Local Demo Quiz</title><style>body{font-family:system-ui;padding:20px} .demo-q{margin-bottom:18px}.demo-choices span{display:inline-block;margin-right:12px;padding:6px;border-radius:6px;background:#f3f4f6}</style></head><body><h2>Local Demo Quiz</h2>${html}</body></html>`
    );
  }

  function scrambleWord(w) {
    if (w.length < 4) return w.split("").reverse().join("");
    const a = w.split("");
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.join("");
  }

  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  function escapeHtml(s) {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  }

  return (
    <>
      <header className="site-header">
        <div className="site-wrap">
          <a className="brand" href="/">
            Triv<span>.io</span>
          </a>

          <nav className="nav">
            <a href="#">Leaderboards</a>

            <a href="#">Join Quizzes</a>

            <a href="#">Profile</a>
          </nav>
        </div>
      </header>

      <div className="page">
        <div className="modal">
          <header className="topbar">
            <div className="title-block">
              <h1 className="logo">Notes → Quizzes</h1>

              <p className="subtitle">
                Paste notes or upload <code>.txt</code>/<code>.md</code>.
                Backend AI will be wired later.
              </p>
            </div>

            <div className="pill" aria-hidden>
              Notes: <strong>{notes.length}</strong>
            </div>
          </header>

          <main className="main-grid">
            <section className="panel editor" aria-labelledby="editor-heading">
              <h2 id="editor-heading" className="sr-only">
                Editor
              </h2>

              <label className="label">Title (optional)</label>

              <input
                className="input"
                placeholder="Optional note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />

              <label className="label" style={{ marginTop: 12 }}>
                Note
              </label>

              <textarea
                className="textarea"
                placeholder="Paste or type your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />

              <div
                className="controls"
                role="group"
                aria-label="editor controls"
              >
                {editing ? (
                  <>
                    <button
                      type="button"
                      className="btn primary"
                      onClick={saveEdit}
                    >
                      Save Edit
                    </button>

                    <button type="button" className="btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={addNoteFromText}
                  >
                    Add Note
                  </button>
                )}

                <label className="btn upload">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.md,text/plain"
                    multiple
                    style={{ display: "none" }}
                  />

                  <span className="upload-inner">Upload (.txt/.md)</span>
                </label>

                <button
                  type="button"
                  className="btn ghost"
                  onClick={exportJSON}
                  title="Export all notes as JSON"
                >
                  Export JSON
                </button>
              </div>

              <div className="hint" aria-live="polite">
                {message || "\u00A0"}
              </div>
            </section>

            <aside className="panel actions" aria-labelledby="actions-heading">
              <h2 id="actions-heading" className="sr-only">
                Actions & Notes
              </h2>

              <div
                className="big-actions"
                role="toolbar"
                aria-label="main actions"
              >
                <button
                  type="button"
                  className="btn wide gray"
                  onClick={generateLocalDemoQuiz}
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  className="btn wide publish"
                  onClick={generateQuizBackend}
                >
                  Publish Quiz
                </button>
              </div>

              <div className="notes-list" aria-live="polite">
                {notes.length === 0 ? (
                  <div className="empty">
                    No notes yet — add or upload some.
                  </div>
                ) : (
                  notes.map((n) => (
                    <article
                      key={n.id}
                      className="note-card"
                      aria-labelledby={`note-${n.id}-title`}
                    >
                      <div>
                        <h3 id={`note-${n.id}-title`} className="note-title">
                          {n.title}
                        </h3>

                        <div className="note-meta">
                          {new Date(n.createdAt).toLocaleString()} •{" "}
                          {n.content.split(/\s+/).filter(Boolean).length} words
                        </div>
                      </div>

                      <div className="note-actions">
                        <button
                          className="icon"
                          onClick={() =>
                            setPreviewId(previewId === n.id ? null : n.id)
                          }
                        >
                          {previewId === n.id ? "Hide" : "Preview"}
                        </button>

                        <button
                          className="icon"
                          onClick={() => startEdit(n.id)}
                        >
                          Edit
                        </button>

                        <button
                          className="icon"
                          onClick={() => downloadNote(n)}
                        >
                          Download
                        </button>

                        <button
                          className="icon danger"
                          onClick={() => removeNote(n.id)}
                        >
                          Delete
                        </button>
                      </div>

                      {previewId === n.id && (
                        <pre className="note-preview">{n.content}</pre>
                      )}
                    </article>
                  ))
                )}
              </div>
            </aside>
          </main>

          <footer className="foot">
            <strong>Next steps (backend):</strong>

            <ul>
              <li>
                Implement POST <code>/api/generate-quiz</code> that accepts JSON{" "}
                <code>{"{ notes: [...] }"}</code>.
              </li>

              <li>
                Have the backend call Gemini (or other model) and return
                structured JSON (questions, choices, answerIndex).
              </li>

              <li>Wire the backend response into the UI to render quizzes.</li>
            </ul>
          </footer>
        </div>
      </div>
    </>
  );
}
