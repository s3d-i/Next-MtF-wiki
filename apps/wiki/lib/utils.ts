function isClient() {
  return typeof window !== 'undefined';
}

function isElementInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function isElementInScrollContainerView(
  el: HTMLElement,
  container: HTMLElement,
) {
  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return (
    elRect.top >= containerRect.top &&
    elRect.bottom <= containerRect.bottom &&
    elRect.left >= containerRect.left &&
    elRect.right <= containerRect.right
  );
}

function getUrlWithoutHash(url: string) {
  const index = url.indexOf('#');
  return index >= 0 ? url.substring(0, index) : url;
}

export {
  isClient,
  isElementInViewport,
  isElementInScrollContainerView,
  getUrlWithoutHash,
};
