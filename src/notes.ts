/**
 * The rules of a note, with no React in sight.
 *
 * Kept separate from the component on purpose. A rule that lives inside a
 * component can only be tested by rendering one, which makes the cheapest
 * tests in the suite depend on the most expensive machinery. It also mirrors
 * the .NET service this UI is modelled on, where the same rules live in the
 * domain rather than in the endpoint.
 */

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface DraftNote {
  title: string;
  body: string;
}

/**
 * Rejects a title that is empty or only whitespace.
 *
 * Whitespace is the case worth naming: `"   "` is truthy, so a plain falsy
 * check accepts it and the list grows a row with no visible label. The API
 * refuses the same input with a 400, so accepting it here would mean the UI
 * and the service disagree about what a note is.
 */
export function titleError(title: string): string | null {
  return title.trim().length === 0 ? 'Title is required.' : null;
}

/**
 * Returns a new list rather than mutating the one passed in.
 *
 * React compares by reference to decide whether to re-render, so a push()
 * onto the existing array updates the data and leaves the screen showing the
 * old list - a bug that looks like the click was never registered.
 */
export function addNote(notes: readonly Note[], draft: DraftNote, id: string, now: Date): Note[] {
  return [
    ...notes,
    {
      id,
      title: draft.title.trim(),
      body: draft.body.trim(),
      createdAt: now.toISOString(),
    },
  ];
}

export function removeNote(notes: readonly Note[], id: string): Note[] {
  return notes.filter((note) => note.id !== id);
}

/**
 * Oldest first, matching the order the API returns.
 *
 * Sorting on a copy for the same reason addNote builds a new array: sort()
 * works in place, so sorting the state array edits it behind React's back.
 */
export function byOldestFirst(notes: readonly Note[]): Note[] {
  return [...notes].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
