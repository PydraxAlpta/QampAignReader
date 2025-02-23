/**
 * @param {*} chapterJson
 * @param {string} baseUrl
 * @param {HTMLElement} output
 */
export function drawChapter(chapterJson, baseUrl, output) {
  if (!chapterJson) {
    return;
  }
  const name = chapterJson.name;
  const heading = document.createElement("h2");
  heading.textContent = name;
  output.appendChild(heading);
  const entries = chapterJson.entries;
  for (const entry of entries) {
    addPreamble(entry, baseUrl, output);
    const chatlog = document.createElement("div");
    chatlog.classList.add("chatlog");
    const messageGroup = document.createElement("div");
    chatlog.classList.add("chatlog__message-group");
    for (const message of entry.messages) {
      addMessage(message, messageGroup, baseUrl, entry.messages);
    }
    chatlog.appendChild(messageGroup);
    output.appendChild(chatlog);
  }
}

const shortFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});
const longFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "full",
  timeStyle: "short",
});

/**
 * @param {string} url
 * @param {string} baseUrl
 * @returns {string}
 */
function getSrc(url, baseUrl) {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

const fallbackImage = "https://placehold.co/100";
/**
 * @param {*} entry
 * @param {Element} output
 */
function addPreamble(entry, baseUrl, output) {
  const preamble = document.createElement("div");
  preamble.classList.add("preamble");
  const iconContainer = document.createElement("div");
  iconContainer.classList.add("preamble__guild-icon-container");
  const guildIcon = document.createElement("img");
  guildIcon.classList.add("preamble__guild-icon");
  guildIcon.src = getSrc(entry.guild?.iconUrl ?? fallbackImage, baseUrl);
  guildIcon.alt = "Guild icon";
  guildIcon.loading = "lazy";
  iconContainer.appendChild(guildIcon);
  preamble.appendChild(iconContainer);
  const entriesContainer = document.createElement("div");
  entriesContainer.classList.add("preamble__entries-container");
  const guildEntry = document.createElement("div");
  guildEntry.classList.add("preamble__entry");
  guildEntry.textContent = entry.guild?.name ?? "Guild Name"; // Fallback
  const channelEntry = document.createElement("div");
  channelEntry.classList.add("preamble__entry");
  channelEntry.textContent = entry.channel?.name ?? "Channel Name"; // Fallback
  entriesContainer.append(guildEntry, channelEntry);
  preamble.appendChild(entriesContainer);
  output.appendChild(preamble);
}

/**
 * @param {*} message
 * @param {Element} messageGroup
 * @param {string} baseUrl
 * @param {Array} messages
 */
function addMessage(message, messageGroup, baseUrl, messages) {
  const messageContainer = document.createElement("div");
  messageContainer.id = getMessageContainerId(message);
  messageContainer.classList.add("chatlog__message-container");
  messageContainer.dataset.messageId = message.id;
  const chatlogMessage = document.createElement("div");
  chatlogMessage.classList.add("chatlog__message");
  addMesageChatlogAside(message, baseUrl, chatlogMessage);
  addMessageChatlogPrimary(message, baseUrl, chatlogMessage, messages);
  messageContainer.appendChild(chatlogMessage);
  messageGroup.appendChild(messageContainer);
}

function getMessageContainerId(message) {
  return `chatlog__message-container-${message.id}`;
}

/**
 * @param {*} message
 * @param {string} baseUrl
 * @param {Element} chatlogMessage
 * @param {Array} messages
 */
function addMessageChatlogPrimary(message, baseUrl, chatlogMessage, messages) {
  const messagePrimary = document.createElement("div");
  messagePrimary.classList.add("chatlog__message-primary");
  addMessageChatlogReply(message, baseUrl, messagePrimary, messages);
  addMessageChatlogHeader(message, messagePrimary);
  addMessageChatlogContent(message, baseUrl, messagePrimary);
  addMesageChatlogEmbeds(message, baseUrl, messagePrimary);
  addMesageChatlogAttachments(message, baseUrl, messagePrimary);
  addMessageChatlogReactions(message, baseUrl, messagePrimary);
  chatlogMessage.appendChild(messagePrimary);
}

/**
 * @param {*} message
 * @param {string} baseUrl
 * @param {Element} messagePrimary
 * @param {Array} messages
 */
function addMessageChatlogReply(message, baseUrl, messagePrimary, messages) {
  if (message.type !== "Reply") {
    return;
  }
  const reference = message.reference;
  const replyMessage = messages.find((m) => m.id === reference.messageId);
  if (!replyMessage) {
    return;
  }
  const chatlogReply = document.createElement("div");
  chatlogReply.classList.add("chatlog__reply");
  const avatar = document.createElement("img");
  avatar.classList.add("chatlog__reply-avatar");
  avatar.src = getSrc(replyMessage.author.avatarUrl ?? fallbackImage, baseUrl);
  avatar.alt = "Avatar";
  avatar.loading = "lazy";
  chatlogReply.appendChild(avatar);
  const author = document.createElement("div");
  author.classList.add("chatlog__reply-author");
  author.style.color = replyMessage.author.color;
  author.textContent = replyMessage.author.nickname ?? replyMessage.author.name;
  chatlogReply.appendChild(author);
  const content = document.createElement("div");
  content.classList.add("chatlog__reply-content");
  const link = document.createElement("span");
  link.classList.add("chatlog__reply-link");
  link.addEventListener("click", (event) =>
    scrollToMessage(event, replyMessage.id)
  );
  const split = replyMessage.content.split("\n");
  link.innerHTML = getMessageContent(
    split[0] + (split[1] ? "..." : ""),
    replyMessage.inlineEmojis,
    baseUrl
  );
  content.appendChild(link);
  chatlogReply.appendChild(content);
  messagePrimary.appendChild(chatlogReply);
}

/**
 * @param {*} message
 * @param {string} baseUrl
 * @param {Element} messagePrimary
 */
function addMessageChatlogReactions(message, baseUrl, messagePrimary) {
  if (!message.reactions.length) {
    return;
  }
  const reactionsContainer = document.createElement("div");
  reactionsContainer.classList.add("chatlog__reactions");
  for (const reaction of message.reactions) {
    const reactionEl = document.createElement("div");
    reactionEl.classList.add("chatlog__reaction");
    reactionEl.title = reaction.emoji.code;
    const image = document.createElement("img");
    image.classList.add("chatlog__emoji");
    image.classList.add("chatlog__emoji--small");
    image.alt = reaction.emoji.name;
    image.src = getSrc(reaction.emoji.imageUrl, baseUrl);
    image.loading = "lazy";
    reactionEl.appendChild(image);
    const count = document.createElement("span");
    count.classList.add("chatlog__reaction-count");
    count.textContent = reaction.count;
    reactionEl.appendChild(count);
    reactionsContainer.appendChild(reactionEl);
  }
  messagePrimary.appendChild(reactionsContainer);
}

/**
 * @param {*} message
 * @param {string} baseUrl
 * @param {Element} messagePrimary
 */
function addMesageChatlogEmbeds(message, baseUrl, messagePrimary) {
  if (!message.embeds.length) {
    return;
  }
  for (const embed of message.embeds) {
    const embedEl = document.createElement("div");
    embedEl.classList.add("chatlog__embed");
    addVideoEmbed(embed, baseUrl, embedEl);
    messagePrimary.appendChild(embedEl);
  }
}

/**
 * @param {*} embed
 * @param {string} baseUrl
 * @param {Element} embedEl
 */
function addVideoEmbed(embed, baseUrl, embedEl) {
  if (!embed?.video?.url) {
    return;
  }
  const video = document.createElement("video");
  video.classList.add("chatlog__embed-generic-gifv");
  video.width = embed.video.width;
  video.height = embed.video.height;
  video.loop = true;
  video.addEventListener("mouseover", () => video.play());
  video.addEventListener("mouseout", () => video.pause());
  const source = document.createElement("source");
  source.src = getSrc(embed.video.url, baseUrl);
  source.alt = "Embedded gifv";
  video.appendChild(source);
  embedEl.appendChild(video);
}

/**
 * @param {*} message
 * @param {string} baseUrl
 * @param {Element} messagePrimary
 */
function addMesageChatlogAttachments(message, baseUrl, messagePrimary) {
  if (!message.attachments.length) {
    return;
  }
  for (const attachment of message.attachments) {
    const attachmentEl = document.createElement("div");
    attachmentEl.classList.add("chatlog__attachment");
    const link = document.createElement("a");
    link.href = getSrc(attachment.url, baseUrl);
    const image = document.createElement("img");
    image.classList.add("chatlog__attachment-media");
    image.src = getSrc(attachment.url, baseUrl);
    image.alt = "Image attachment";
    image.title = `Image: ${attachment.fileName ?? "Unknown file"} (${
      attachment.fileSizeBytes
    } bytes)`;
    image.loading = "lazy";
    link.appendChild(image);
    attachmentEl.appendChild(link);
    messagePrimary.appendChild(attachmentEl);
  }
}

/**
 * @param {string} content
 * @param {Array} inlineEmojis
 * @param {string} baseUrl
 * @returns {string}
 */
function getMessageContent(content, inlineEmojis, baseUrl) {
  if (inlineEmojis?.length) {
    for (const emoji of inlineEmojis) {
      content = content.replace(
        `:${emoji.code}:`,
        `<${emoji.isAnimated ? "a" : ""}:${emoji.code}:${emoji.id}>`
      );
    }
  }
  const replaced = globalThis["discord-markdown"].toHTML(content);
  const div = document.createElement("div");
  div.innerHTML = replaced;
  const emojis = div.querySelectorAll("img");
  emojis.forEach((img) => {
    const code = img.alt.replace(/:/g, "");
    const match = inlineEmojis.find((em) => em.code === code);
    img.classList.add("chatlog__emoji");
    img.src = getSrc(match?.imageUrl ?? img.src, baseUrl);
    img.alt = match?.name ?? img.alt;
    img.title = match?.code ?? code;
    img.loading = "lazy";
  });
  // for now, let's just put content as is. Have to figure out the markdown parsing. Maybe a library.
  return div.innerHTML;
  // return content;
}

/**
 * @param {*} message
 * @param {string} baseUrl
 * @param {Element} messagePrimary
 */
function addMessageChatlogContent(message, baseUrl, messagePrimary) {
  const chatlogContent = document.createElement("div");
  chatlogContent.classList.add("chatlog__content");
  chatlogContent.classList.add("chatlog__markdown");
  const chatlogMarkdown = document.createElement("span");
  chatlogMarkdown.innerHTML = getMessageContent(
    message.content,
    message.inlineEmojis,
    baseUrl
  );
  chatlogContent.appendChild(chatlogMarkdown);
  if (message.timestampEdited) {
    const time = new Date(String(message.timestampEdited));
    const editedTimestamp = document.createElement("span");
    editedTimestamp.classList.add("chatlog__edited-timestamp");
    editedTimestamp.title = longFormat.format(time);
    editedTimestamp.textContent = "(edited)";
    chatlogContent.appendChild(editedTimestamp);
  }
  messagePrimary.appendChild(chatlogContent);
}

/**
 * @param {*} message
 * @param {string} baseUrl
 * @param {Element} chatlogMessage
 */
function addMesageChatlogAside(message, baseUrl, chatlogMessage) {
  const messageAside = document.createElement("div");
  messageAside.classList.add("chatlog__message-aside");
  const avatar = document.createElement("img");
  avatar.classList.add("chatlog__avatar");
  avatar.src = getSrc(message.author?.avatarUrl ?? fallbackImage, baseUrl);
  avatar.alt = "Avatar";
  avatar.loading = "lazy";
  messageAside.appendChild(avatar);
  chatlogMessage.appendChild(messageAside);
}

/**
 * @param {*} message
 * @param {Element} messagePrimary
 */
function addMessageChatlogHeader(message, messagePrimary) {
  const chatlogHeader = document.createElement("div");
  chatlogHeader.classList.add("chatlog__header");
  const chatlogAuthor = document.createElement("span");
  chatlogAuthor.classList.add("chatlog__author");
  chatlogAuthor.style.color = message.author?.color;
  chatlogAuthor.title = message.author?.name;
  chatlogAuthor.textContent = message.author?.nickname ?? message.author?.name;
  chatlogAuthor.dataset.userId = message.author?.id;
  chatlogHeader.appendChild(chatlogAuthor);
  const chatlogTimestamp = document.createElement("span");
  chatlogTimestamp.classList.add("chatlog__timestamp");
  const time = new Date(String(message.timestamp));
  chatlogTimestamp.title = longFormat.format(time);
  const chatlogTimestampLink = document.createElement("a");
  chatlogTimestampLink.href = `#${getMessageContainerId(message)}`;
  chatlogTimestampLink.textContent = shortFormat.format(time);
  chatlogTimestamp.appendChild(chatlogTimestampLink);
  chatlogHeader.appendChild(chatlogTimestamp);
  messagePrimary.appendChild(chatlogHeader);
}
