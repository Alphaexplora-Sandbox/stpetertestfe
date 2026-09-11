import { fireEvent, render, screen } from '@testing-library/react';

import { App } from '../../src/App';

// Rendered into jsdom rather than through renderToString. The scaffold used
// server rendering because there was no DOM to render into; now that there is,
// react-dom/server would resolve to its browser build and need MessageChannel,
// which jsdom does not provide. Rendering for real also lets the same file
// assert on behaviour, which is what the coverage gate actually measures.

// Ids are handed in so the assertions do not depend on a random value, and so
// the component never needs crypto.randomUUID in a test environment.
const sequentialIds = () => {
  let next = 0;
  return () => `note-${++next}`;
};

describe('App, rendered', () => {
  it('renders the default service title', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('stpetertestfe');
  });

  it('renders a custom title', () => {
    render(<App title="custom" />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('custom');
  });
});

describe('App, driven like a user', () => {
  it('shows an empty state before anything is added', () => {
    render(<App />);

    expect(screen.getByTestId('empty-state')).toBeDefined();
    expect(screen.queryByTestId('note-list')).toBeNull();
  });

  it('adds a note and lists it', () => {
    render(<App createId={sequentialIds()} />);

    fireEvent.change(screen.getByTestId('note-title'), { target: { value: 'Ship it' } });
    fireEvent.change(screen.getByTestId('note-body'), { target: { value: 'today' } });
    fireEvent.click(screen.getByTestId('add-note'));

    expect(screen.getByTestId('note-item-title').textContent).toBe('Ship it');
    expect(screen.getByTestId('note-item-body').textContent).toBe('today');
    // The empty state has to be gone, not merely pushed down the page.
    expect(screen.queryByTestId('empty-state')).toBeNull();
  });

  it('clears the form after a successful add', () => {
    render(<App createId={sequentialIds()} />);

    fireEvent.change(screen.getByTestId('note-title'), { target: { value: 'First' } });
    fireEvent.click(screen.getByTestId('add-note'));

    // A form that keeps its text invites the same note being added twice.
    expect(screen.getByTestId<HTMLInputElement>('note-title').value).toBe('');
    expect(screen.getByTestId<HTMLTextAreaElement>('note-body').value).toBe('');
  });

  it('refuses a whitespace-only title and says why', () => {
    render(<App createId={sequentialIds()} />);

    fireEvent.change(screen.getByTestId('note-title'), { target: { value: '   ' } });
    fireEvent.click(screen.getByTestId('add-note'));

    expect(screen.getByTestId('note-error').textContent).toBe('Title is required.');
    expect(screen.queryByTestId('note-item')).toBeNull();
  });

  it('clears the error once a real title is submitted', () => {
    render(<App createId={sequentialIds()} />);

    fireEvent.change(screen.getByTestId('note-title'), { target: { value: ' ' } });
    fireEvent.click(screen.getByTestId('add-note'));
    expect(screen.getByTestId('note-error')).toBeDefined();

    fireEvent.change(screen.getByTestId('note-title'), { target: { value: 'Real' } });
    fireEvent.click(screen.getByTestId('add-note'));

    // An error message that outlives the problem trains people to ignore it.
    expect(screen.queryByTestId('note-error')).toBeNull();
  });

  it('omits the body paragraph when there is no body', () => {
    render(<App createId={sequentialIds()} />);

    fireEvent.change(screen.getByTestId('note-title'), { target: { value: 'Title only' } });
    fireEvent.click(screen.getByTestId('add-note'));

    expect(screen.queryByTestId('note-item-body')).toBeNull();
  });

  it('deletes only the note asked for', () => {
    render(
      <App
        createId={sequentialIds()}
        initialNotes={[
          { id: 'a', title: 'Keep me', body: '', createdAt: '2026-01-01T00:00:00.000Z' },
          { id: 'b', title: 'Delete me', body: '', createdAt: '2026-01-02T00:00:00.000Z' },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete Delete me' }));

    // Asserting the survivor, not the count: removing the wrong row leaves the
    // same count and would pass a count-only check.
    expect(screen.getAllByTestId('note-item-title').map((node) => node.textContent)).toEqual([
      'Keep me',
    ]);
  });

  it('lists seeded notes oldest first regardless of the order given', () => {
    render(
      <App
        initialNotes={[
          { id: 'b', title: 'Second', body: '', createdAt: '2026-01-02T00:00:00.000Z' },
          { id: 'a', title: 'First', body: '', createdAt: '2026-01-01T00:00:00.000Z' },
        ]}
      />,
    );

    expect(screen.getAllByTestId('note-item-title').map((node) => node.textContent)).toEqual([
      'First',
      'Second',
    ]);
  });
});
