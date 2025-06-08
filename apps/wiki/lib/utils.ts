function isClient() {
  return typeof window !== "undefined";
}

function isElementInViewport (el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function isElementInScrollContainerView(el: HTMLElement, container: HTMLElement) {
  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return (
    elRect.top >= containerRect.top &&
    elRect.bottom <= containerRect.bottom &&
    elRect.left >= containerRect.left &&
    elRect.right <= containerRect.right
  );
}

export { isClient, isElementInViewport, isElementInScrollContainerView };