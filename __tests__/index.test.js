import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import init from '../src/init.js';

const fileUrl = fileURLToPath(import.meta.url);
const dirName = dirname(fileUrl);
const getFixturePath = (fileName) => join(dirName, '..', '__tests__', '__fixtures__', fileName);

beforeEach(async () => {
  const pathToHtml = getFixturePath('index.html');
  const html = await fs.readFile(pathToHtml, 'utf8');
  document.body.innerHTML = html;
});

test('init', () => {
  init();
  expect(true).toBeDefined();
});
