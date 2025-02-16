export const scrollToBottom = (
  container: HTMLElement | null,
  smooth = false
) => {
  if (container?.children.length) {
    const lastElement = container?.lastChild as HTMLElement;

    lastElement?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
      inline: "nearest",
    });
  }
};

export const scrollToTop = (container: HTMLElement | null, smooth = false) => {
  if (container?.children.length) {
    const firstElement = container?.firstChild as HTMLElement;

    firstElement?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "start",
      inline: "nearest",
    });
  }
};