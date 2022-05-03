import i18next from 'i18next';
import isEmpty from 'lodash/isEmpty.js';
import { setLocale, string } from 'yup';
import resources from './locales/index.js';
import watch from './watcher.js';

const validateUrl = (url, urls) => {
  const scheme = string().url().notOneOf(urls);
  try {
    scheme.validateSync(url);
    return [];
  } catch ({ errors }) {
    return errors;
  }
};

const runApp = () => {
  const state = {
    form: {
      isValid: true,
      errors: [],
    },
    urls: [],
  };

  const elements = {
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('form'),
    urlInput: document.getElementById('url-input'),
  };

  const watchedState = watch(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const { urls } = watchedState;
    const errors = validateUrl(url, urls);
    const isValid = isEmpty(errors);

    watchedState.form.isValid = isValid;
    watchedState.form.errors = errors;
    watchedState.urls = isValid ? [...urls, url] : urls;
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
          notOneOf: t('validation.rules.notOneOf'),
        },
        string: {
          url: t('validation.rules.url'),
        },
      });
      runApp();
    });
};
