import axios from 'axios';
import i18next from 'i18next';
import differenceWith from 'lodash/differenceWith.js';
import first from 'lodash/first.js';
import isEqual from 'lodash/isEqual.js';
import uniqueId from 'lodash/uniqueId.js';
import { setLocale, string } from 'yup';
import resources from './locales/index.js';
import watch from './watcher.js';

const getUrlSchema = (urls) => string().url().notOneOf(urls);

const getProxyUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', true);
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
};

const parseRss = (rss) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rss, 'text/xml');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) {
    const error = new Error(errorNode.textContent);
    error.isParsingError = true;
    throw error;
  }

  return {
    title: doc.querySelector('channel > title').textContent,
    description: doc.querySelector('channel > description').textContent,
    items: [...doc.querySelectorAll('channel > item')].map((item) => ({
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
    })),
  };
};

const runApp = (t) => {
  const state = {
    form: {
      validationState: 'valid',
      validationError: null,
      processState: 'filling',
      processError: null,
    },
    feeds: [],
    posts: [],
  };

  const elements = {
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('form'),
    urlInput: document.getElementById('url-input'),
    submitButton: document.querySelector('[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  const watchedState = watch(state, elements);

  const updatePosts = () => {
    const { feeds, posts } = watchedState;
    feeds.forEach(({ id, url }) => {
      const proxyUrl = getProxyUrl(url);
      axios
        .get(proxyUrl)
        .then(({ data: { contents } }) => {
          const { items } = parseRss(contents);
          const currentPosts = items.map((item) => ({ feedId: id, ...item }));
          const previousPosts = posts.filter(({ feedId }) => feedId === id);
          const newPosts = differenceWith(currentPosts, previousPosts, isEqual);
          watchedState.posts = [...newPosts, ...posts];
        });
    });
    setTimeout(updatePosts, 5000);
  };

  updatePosts();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const { feeds, posts } = watchedState;
    const urls = feeds.map((feed) => feed.url);

    const urlSchema = getUrlSchema(urls);
    urlSchema
      .validate(url)
      .then(() => {
        watchedState.form.validationState = 'valid';
        watchedState.form.validationError = null;
        watchedState.form.processState = 'loading';
        watchedState.form.processError = null;

        const proxyUrl = getProxyUrl(url);
        axios
          .get(proxyUrl)
          .then(({ data: { contents } }) => {
            const id = uniqueId();
            const { items, ...rest } = parseRss(contents);
            const feed = { id, url, ...rest };
            const feedPosts = items.map((item) => ({ feedId: id, ...item }));

            watchedState.form.processState = 'filling';
            watchedState.feeds = [feed, ...feeds];
            watchedState.posts = [...feedPosts, ...posts];
          })
          .catch((error) => {
            watchedState.form.processState = 'error';

            switch (true) {
              case error.isAxiosError:
                watchedState.form.processError = t('processError.network');
                break;
              case error.isParsingError:
                watchedState.form.processError = t('processError.parsing');
                break;
              default:
                watchedState.form.processError = t('processError.unexpected');
                break;
            }
          });
      })
      .catch(({ errors }) => {
        watchedState.form.validationState = 'invalid';
        watchedState.form.validationError = first(errors);
      });
  });
};

export default () => {
  i18next
    .init({
      lng: 'en',
      resources,
    })
    .then((t) => {
      setLocale({
        mixed: {
          notOneOf: t('validationError.notOneOf'),
        },
        string: {
          url: t('validationError.url'),
        },
      });
      runApp(t);
    });
};
