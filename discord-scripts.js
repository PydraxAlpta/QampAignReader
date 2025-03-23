function showSpoiler(event) {
  const element = event.currentTarget;
  if (!element) return;
  if (element.classList.contains("chatlog__attachment--hidden")) {
    event.preventDefault();
    element.classList.remove("chatlog__attachment--hidden");
  }
  if (element.classList.contains("chatlog__markdown-spoiler--hidden")) {
    event.preventDefault();
    element.classList.replace(
      "chatlog__markdown-spoiler--hidden",
      "chatlog__markdown-spoiler"
    );
  }
}
