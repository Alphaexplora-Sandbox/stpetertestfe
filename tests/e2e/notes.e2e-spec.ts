import { expect, test } from '@playwright/test';

/**
 * Drives the deployed page the way a person would.
 *
 * These are deliberately the same rules the unit tests cover, asserted through
 * the browser: a unit test proves the rule, this proves the rule is wired to
 * something you can click. Selectors are data-testid only, so a copy change
 * does not fail a test about behaviour.
 */
test.describe('notes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('starts empty and says so', async ({ page }) => {
    // An empty list with no message reads as a page that failed to load.
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('note-list')).toHaveCount(0);
  });

  test('adds a note and shows it in the list', async ({ page }) => {
    await page.getByTestId('note-title').fill('Ship the pipeline');
    await page.getByTestId('note-body').fill('dev, uat, then main');
    await page.getByTestId('add-note').click();

    await expect(page.getByTestId('note-item')).toHaveCount(1);
    await expect(page.getByTestId('note-item-title')).toHaveText('Ship the pipeline');
    await expect(page.getByTestId('note-item-body')).toHaveText('dev, uat, then main');
    // The empty state has to go away, not just be covered by the list.
    await expect(page.getByTestId('empty-state')).toHaveCount(0);
  });

  test('clears the form after a successful add', async ({ page }) => {
    await page.getByTestId('note-title').fill('First');
    await page.getByTestId('add-note').click();

    // A form that keeps its text invites the same note being added twice.
    await expect(page.getByTestId('note-title')).toHaveValue('');
    await expect(page.getByTestId('note-body')).toHaveValue('');
  });

  test('refuses a blank title and says why', async ({ page }) => {
    // Whitespace, not empty: "   " is truthy, so a naive check accepts it and
    // the list grows a row with no visible label. The API refuses the same
    // input with a 400.
    await page.getByTestId('note-title').fill('   ');
    await page.getByTestId('add-note').click();

    await expect(page.getByTestId('note-error')).toHaveText('Title is required.');
    await expect(page.getByTestId('note-item')).toHaveCount(0);
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('deletes only the note asked for', async ({ page }) => {
    await page.getByTestId('note-title').fill('Keep me');
    await page.getByTestId('add-note').click();
    await page.getByTestId('note-title').fill('Delete me');
    await page.getByTestId('add-note').click();
    await expect(page.getByTestId('note-item')).toHaveCount(2);

    await page.getByRole('button', { name: 'Delete Delete me' }).click();

    // Asserting the survivor, not just the count. A delete that removed the
    // wrong row leaves the same count and would pass a count-only check.
    await expect(page.getByTestId('note-item')).toHaveCount(1);
    await expect(page.getByTestId('note-item-title')).toHaveText('Keep me');
  });

  test('shows the service name as the page heading', async ({ page }) => {
    // Cheap, and it is the assertion that catches the wrong deployment
    // answering on the right URL.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('stpetertestfe');
  });
});
