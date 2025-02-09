document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".chatlog__markdown-pre--multiline")
    .forEach((e) => hljs.highlightBlock(e));
  document
    .querySelectorAll(".chatlog__sticker--media[data-source]")
    .forEach((e) => {
      const anim = lottie.loadAnimation({
        container: e,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: e.getAttribute("data-source"),
      });
      anim.addEventListener(
        "data_failed",
        () => (e.innerHTML = "<strong>[Sticker cannot be rendered]</strong>")
      );
    });
});
function scrollToMessage(event, id) {
  const element = document.getElementById("chatlog__message-container-" + id);
  if (!element) return;
  event.preventDefault();
  element.classList.add("chatlog__message-container--highlighted");
  window.scrollTo({
    top:
      element.getBoundingClientRect().top -
      document.body.getBoundingClientRect().top -
      window.innerHeight / 2,
    behavior: "smooth",
  });
  window.setTimeout(
    () => element.classList.remove("chatlog__message-container--highlighted"),
    2000
  );
}
function showSpoiler(event, element) {
  if (!element) return;
  if (element.classList.contains("chatlog__attachment--hidden")) {
    event.preventDefault();
    element.classList.remove("chatlog__attachment--hidden");
  }
  if (element.classList.contains("chatlog__markdown-spoiler--hidden")) {
    event.preventDefault();
    element.classList.remove("chatlog__markdown-spoiler--hidden");
  }
}
