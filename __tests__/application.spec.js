/* eslint-disable jest/no-done-callback, no-useless-escape, jest/no-standalone-expect */

import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

const getFixturePath = (filename) => path.join('..', '__fixtures__', filename);

const readFixture = (filename) => {
  const fixturePath = getFixturePath(filename);
  const rss = fs.readFileSync(new URL(fixturePath, import.meta.url), 'utf-8');
  return rss;
};

const rss1 = readFixture('rss1.xml');
const rssUrl = 'https://ru.hexlet.io/lessons.rss';

const html = readFixture('document.html');
const htmlUrl = 'https://ru.hexlet.io';

const corsProxy = 'https://allorigins.hexlet.app';

let responseHandler;

const getResponseHandler = (page) => (currentRssUrl, data) => (
  page.route(`${corsProxy}/*`, (route) => {
    const url = new URL(route.request().url());
    if (url.pathname !== '/get') {
      console.error('Expect proxified url to have "get" pathname');
      return route.fulfill({ status: 500 });
    }

    if (!url.searchParams.get('disableCache')) {
      console.error('Expect proxified url to have "disableCache" param');
      return route.fulfill({ status: 500 });
    }

    if (url.searchParams.get('url') !== currentRssUrl) {
      console.error('Expect proxified url to have "url" param with correct url');
      return route.fulfill({ status: 500 });
    }

    return route.fulfill({
      status: 200,
      contentType: 'text/xml',
      body: JSON.stringify({ contents: data }),
    });
  })
);

test.beforeEach(async ({ page }) => {
  responseHandler = getResponseHandler(page);

  await page.goto('http://localhost:8080');
  await page.waitForTimeout(300);
});

test('adding', async ({ page }) => {
  page.on('console', console.log);

  await responseHandler(rssUrl, rss1);

  await page.locator('input[aria-label="url"]').type(rssUrl);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('text=RSS успешно загружен', {})).toBeVisible();
});

test('validation (unique)', async ({ page }) => {
  responseHandler(rssUrl, rss1);

  await page.locator('input[aria-label="url"]').type(rssUrl);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('text=RSS успешно загружен', {})).toBeVisible();

  await page.locator('input[aria-label="url"]').type(rssUrl);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('text=RSS уже существует', {})).toBeVisible();
});

test('validation (valid url)', async ({ page }) => {
  await page.locator('input[aria-label="url"]').type('wrong');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('text=Ссылка должна быть валидным URL', {})).toBeVisible();
});

test('handling non-rss url', async ({ page }) => {
  responseHandler(htmlUrl, html);
  await page.locator('input[aria-label="url"]').type(htmlUrl);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('text=Ресурс не содержит валидный RSS', {})).toBeVisible();
});

test('handling network error', async ({ page }) => {
  page.route(`${corsProxy}/*`, (route) => route.abort('internetdisconnected'));

  await page.locator('input[aria-label="url"]').type(rssUrl);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('text=Ошибка сети', {})).toBeVisible();
});

test.describe('load feeds', () => {
  test('render feed and posts', async ({ page }) => {
    responseHandler(rssUrl, rss1);

    await page.locator('input[aria-label="url"]').type(rssUrl);
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Новые уроки на Хекслете', {})).toBeVisible();
    await expect(page.locator('text=Практические уроки по программированию', {})).toBeVisible();
    await expect(page.locator('text=Агрегация / Python: Деревья', {})).toBeVisible();
    await expect(page.locator('text=Traversal / Python: Деревья', {})).toBeVisible();
  });
});

test('modal', async ({ page }) => {
  responseHandler(rssUrl, rss1);

  await page.locator('input[aria-label="url"]').type(rssUrl);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('text=Агрегация / Python: Деревья', {})).toHaveClass('fw-bold');
  await page.locator('text=Просмотр').first().click();
  const modalBody = await page.locator('text=Цель: Научиться извлекать из дерева необходимые данные');
  await expect(modalBody).toBeVisible();
  await page.locator('text=Закрыть').first().click();
  await expect(modalBody).not.toBeVisible();
  await expect(page.locator('a:has-text("Агрегация / Python: Деревья")', {})).not.toHaveClass('fw-bold');
});
