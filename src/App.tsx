import { useState } from 'react';

import { addNote, byOldestFirst, removeNote, titleError, type Note } from './notes';

export interface AppProps {
  title?: string;
  /**
   * Seed rows, so a test can render a populated list without driving the form
   * first. Also what lets the server-rendered unit tests assert on markup that
   * only exists once there is something to show.
   */
  initialNotes?: readonly Note[];
}

export function App({ title = 'stpetertestfe', initialNotes = [] }: AppProps) {
  const [notes, setNotes] = useState<readonly Note[]>(initialNotes);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Validated on submit rather than on every keystroke. Marking a field
  // invalid before anyone has finished typing in it is noise, not feedback.
  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const problem = titleError(draftTitle);
    if (problem) {
      setError(problem);
      return;
    }

    setNotes((current) =>
      addNote(current, { title: draftTitle, body: draftBody }, crypto.randomUUID(), new Date()),
    );
    setDraftTitle('');
    setDraftBody('');
    setError(null);
  };

  const visible = byOldestFirst(notes);

  return (
    <main>
      <h1>{title}</h1>

      {/* Every hook a browser test needs is a data-testid. Selecting on CSS
          classes or text couples the suite to the styling and to the copy, so
          a wording change fails a test that has nothing to do with wording. */}
      <form onSubmit={submit} data-testid="note-form">
        <label htmlFor="note-title">Title</label>
        <input
          id="note-title"
          data-testid="note-title"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
        />

        <label htmlFor="note-body">Body</label>
        <textarea
          id="note-body"
          data-testid="note-body"
          value={draftBody}
          onChange={(event) => setDraftBody(event.target.value)}
        />

        <button type="submit" data-testid="add-note">
          Add note
        </button>
      </form>

      {/* role="alert" so the message reaches a screen reader when it appears,
          not only the sighted reader watching that part of the page. */}
      {error ? (
        <p role="alert" data-testid="note-error">
          {error}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p data-testid="empty-state">No notes yet. Add the first one.</p>
      ) : (
        <ul data-testid="note-list">
          {visible.map((note) => (
            <li key={note.id} data-testid="note-item">
              <h2 data-testid="note-item-title">{note.title}</h2>
              {note.body ? <p data-testid="note-item-body">{note.body}</p> : null}
              <button
                type="button"
                data-testid="delete-note"
                aria-label={`Delete ${note.title}`}
                onClick={() => setNotes((current) => removeNote(current, note.id))}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
