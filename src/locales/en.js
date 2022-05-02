export default {
  translation: {
    validation: {
      attributes: {
        url: 'RSS feed URL',
      },
      rules: {
        url: 'The {{attribute}} must be a valid URL',
        notOneOf: 'The {{attribute}} already exists',
      },
    },
  },
};
