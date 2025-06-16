export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const extractHeadings = () => {
  const mainElement = document.getElementById('markdown-content');
  if (!mainElement) {
    return [];
  }

  const headings = mainElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const items: TocItem[] = [];

  for (const heading of headings) {
    const level = Number.parseInt(heading.tagName.charAt(1));
    const text = heading.textContent?.trim() || '';
    const id = heading.id;

    if (id && text) {
      items.push({ id, text, level });
    }
  }

  return items;
};

export const scrollToHeading = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};
