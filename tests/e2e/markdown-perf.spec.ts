import { test, expect } from '@playwright/test';
import * as path from 'path';
import { launchElectron } from '../helpers';

test('typing in large markdown file does not block main thread > 100ms', async () => {
  const fixturePath = path.resolve('tests/fixtures/p0-8/big.md');
  const app = await launchElectron();
  const win = await app.firstWindow();
  await win.waitForLoadState('domcontentloaded');

  await win.evaluate((p: string) => window.formatpad.dropFile(p), fixturePath);

  // Wait for preview to render the big file
  await win.waitForTimeout(1500);

  // Type 20 characters at the end of the editor and measure longest task
  const longestTask = await win.evaluate(async () => {
    return new Promise<number>((resolve) => {
      let maxDuration = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > maxDuration) maxDuration = entry.duration;
        }
      });
      observer.observe({ type: 'longtask', buffered: false });

      const editor = document.querySelector('.cm-content') as HTMLElement;
      if (editor) {
        editor.focus();
        // Type 20 characters rapidly
        for (let i = 0; i < 20; i++) {
          const event = new KeyboardEvent('keypress', { key: 'a', bubbles: true });
          document.execCommand('insertText', false, 'a');
        }
      }

      // Wait 600ms for any debounced renders to settle, then report
      setTimeout(() => {
        observer.disconnect();
        resolve(maxDuration);
      }, 600);
    });
  });

  // After AST cache + Mermaid debounce, no single task should exceed 100ms
  expect(longestTask).toBeLessThan(100);

  await app.close();
});
