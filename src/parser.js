export default (rss) => {
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
      description: item.querySelector('description').textContent,
      url: item.querySelector('link').textContent,
    })),
  };
};
