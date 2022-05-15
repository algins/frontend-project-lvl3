import * as yup from 'yup';

export default (t) => {
  yup.setLocale({
    mixed: {
      notOneOf: t('validationError.notOneOf'),
    },
    string: {
      url: t('validationError.url'),
    },
  });
};
