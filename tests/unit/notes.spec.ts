import { addNote, byOldestFirst, removeNote, titleError, type Note } from '../../src/notes';

const at = (iso: string, id: string, title = id): Note => ({
  id,
  title,
  body: '',
  createdAt: iso,
});

describe('titleError', () => {
  it('accepts a real title', () => {
    expect(titleError('Release checklist')).toBeNull();
  });

  it.each(['', '   ', '\t', '\n'])('refuses %j', (title) => {
    // Whitespace is the case that matters. "   " is truthy, so a plain falsy
    // check accepts it and the list grows a row with no visible label.
    expect(titleError(title)).toBe('Title is required.');
  });
});

describe('addNote', () => {
  it('appends a trimmed note', () => {
    const result = addNote([], { title: '  Padded  ', body: '  text  ' }, 'id-1', new Date(0));

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'id-1', title: 'Padded', body: 'text' });
  });

  it('does not mutate the list it was given', () => {
    // React compares by reference to decide whether to re-render, so a push()
    // onto the existing array updates the data and leaves the screen showing
    // the old list - which looks like the click was never registered.
    const original: Note[] = [];

    addNote(original, { title: 'One', body: '' }, 'id-1', new Date(0));

    expect(original).toHaveLength(0);
  });

  it('records when the note was created', () => {
    const result = addNote([], { title: 'One', body: '' }, 'id-1', new Date('2026-01-02T03:04:05Z'));

    expect(result[0].createdAt).toBe('2026-01-02T03:04:05.000Z');
  });
});

describe('removeNote', () => {
  it('removes only the note asked for', () => {
    const notes = [at('2026-01-01T00:00:00Z', 'a'), at('2026-01-02T00:00:00Z', 'b')];

    expect(removeNote(notes, 'a').map((note) => note.id)).toEqual(['b']);
  });

  it('leaves the list alone when the id is unknown', () => {
    const notes = [at('2026-01-01T00:00:00Z', 'a')];

    expect(removeNote(notes, 'missing')).toHaveLength(1);
  });
});

describe('byOldestFirst', () => {
  it('orders by creation time', () => {
    const notes = [at('2026-01-03T00:00:00Z', 'c'), at('2026-01-01T00:00:00Z', 'a')];

    expect(byOldestFirst(notes).map((note) => note.id)).toEqual(['a', 'c']);
  });

  it('does not sort the array in place', () => {
    // sort() mutates, so sorting the state array edits it behind React's back.
    const notes = [at('2026-01-03T00:00:00Z', 'c'), at('2026-01-01T00:00:00Z', 'a')];

    byOldestFirst(notes);

    expect(notes.map((note) => note.id)).toEqual(['c', 'a']);
  });
});
