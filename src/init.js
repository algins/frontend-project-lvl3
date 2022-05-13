import axios from 'axios';
import i18next from 'i18next';
import differenceWith from 'lodash/differenceWith.js';
import first from 'lodash/first.js';
import isEqual from 'lodash/isEqual.js';
import omit from 'lodash/omit.js';
import uniqueId from 'lodash/uniqueId.js';
import { setLocale, string } from 'yup';
import resources from './locales/index.js';
import parseRss from './parser.js';
import watch from './watcher.js';

const getUrlSchema = (urls) => string().required().url().notOneOf(urls);

const getProxyUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', true);
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
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
    newPosts: [],
    posts: [],
    previewPost: null,
  };

  const elements = {
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('form'),
    urlInput: document.getElementById('url-input'),
    submitButton: document.querySelector('[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    readMoreButton: document.querySelector('.read-more'),
  };

  const watchedState = watch(state, elements, t);

  const updatePosts = () => {
    const { feeds, posts } = watchedState;
    feeds.forEach(({ id, url }) => {
      const proxyUrl = getProxyUrl(url);
      axios
        .get(proxyUrl)
        .then(({ data: { contents } }) => {
          const { items } = parseRss(contents);

          const previousItems = posts
            .filter(({ feedId }) => feedId === id)
            .map((post) => omit(post, ['id', 'feedId']));

          const newItems = differenceWith(items, previousItems, isEqual);
          const newPosts = newItems.map((item) => ({ id: uniqueId(), feedId: id, ...item }));

          watchedState.newPosts = newPosts;
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
            const { items, ...restProps } = parseRss(contents);
            const feedId = uniqueId();
            const feed = { id: feedId, url, ...restProps };
            const feedPosts = items.map((item) => ({ id: uniqueId(), feedId, ...item }));

            watchedState.form.processState = 'filling';
            watchedState.feeds = [feed, ...feeds];
            watchedState.newPosts = feedPosts;
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
      lng: 'ru',
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
