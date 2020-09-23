import Discord from "discord.js";
import { JSDOM } from "jsdom";
import fs from "fs";
import { numberComma } from "../../../functions";
import { bot } from "../bot";
try {
  var template = fs.readFileSync(`${__dirname}/template.html`).toString();
} catch (err) {
  console.error(err);
}
export function messagesToHtml(
  messages: Discord.Collection<string, Discord.Message | Discord.PartialMessage>
): Buffer {
  messages = messages.sort((m1, m2, k1, k2) => parseInt(k1) - parseInt(k2));
  const firstMsg = messages.first();
  const id = firstMsg.channel.id;
  messages = messages.filter((m) => m.channel.id === id);
  const dom = new JSDOM();
  const document = dom.window.document;
  const parentDiv = document.createElement("div");
  document.body.appendChild(parentDiv);
  parentDiv.id = "parent";
  const infoDiv = document.createElement("div");
  infoDiv.id = "info";
  parentDiv.appendChild(infoDiv);
  const img = document.createElement("img");
  const dmChannel = <Discord.DMChannel>firstMsg.channel;
  img.setAttribute(
    "src",
    dmChannel?.recipient?.displayAvatarURL({ dynamic: true }) ||
      firstMsg?.guild?.iconURL({ dynamic: true })
  );
  img.style.borderRadius = "24%";
  img.style.marginRight = "20px";
  infoDiv.appendChild(img);
  const textDiv = document.createElement("div");
  textDiv.style.display = "grid";
  const p1 = document.createElement("h3");
  textDiv.appendChild(p1);
  p1.innerHTML =
    firstMsg.guild?.name ||
    `${dmChannel.recipient.username} (${dmChannel.recipient.id})`;
  if (!dmChannel) {
    const p2 = document.createElement("h4");
    p2.innerHTML = "#" + (<Discord.TextChannel>firstMsg.channel).name;
    textDiv.appendChild(p2);
  }
  "" + infoDiv.appendChild(textDiv);
  const messagesDiv = document.createElement("div");
  messagesDiv.id = "messages";
  parentDiv.appendChild(messagesDiv);
  let lastMessage: Discord.Message | Discord.PartialMessage;
  messages.forEach((message) => {
    if (
      lastMessage?.author?.id === message.author.id &&
      message.createdTimestamp - lastMessage.createdTimestamp < 5 * 60 * 1000
    ) {
    } else {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add(message.author.id, "messageDiv");
      messagesDiv.appendChild(messageDiv);
      const img = document.createElement("img");
      img.setAttribute("src", message.author.displayAvatarURL());
      img.className = "avatarImg";
      messageDiv.appendChild(img);
      const contentsDiv = document.createElement("div");
      contentsDiv.className = "contentsDiv";
      messageDiv.appendChild(contentsDiv);
      const usernameDiv = document.createElement("div");
      usernameDiv.className = "userNameDiv";
      contentsDiv.appendChild(usernameDiv);
      const userName = document.createElement("p");
      userName.style.color = message.member?.displayHexColor || "#fff";
      userName.className = "userName";
      userName.textContent =
        message.member?.displayName || message.author.username;
      const dateEl = document.createElement("p");
      const date = message.createdAt;
      dateEl.textContent = date.toUTCString();
      dateEl.className = "messageDate";
      usernameDiv.appendChild(userName);
      usernameDiv.appendChild(dateEl);
    }
    const messageGroupDiv = document.createElement("div");
    messageGroupDiv.className = "messageGroup";
    const elements = document.getElementsByClassName("contentsDiv");
    elements[elements.length - 1].append(messageGroupDiv);
    const textContents = document.createElement("div");
    textContents.classList.add("messageText");
    let content = message.content;
    let resultContent = "";
    for (let i = 0; i < content.length; i++) {
      if (content[i] === "<") {
        const start = i;
        while (content[i] !== ">" && i < content.length && i < 2000) i++;
        if (content[i] === ">") {
          const end = i + 1;
          const type = content.charAt(start + 1);
          let id = content.substring(start + 2, end - 1);
          if (type === "#") {
            const channel = message.mentions.channels.find((c) => c.id === id);
            if (channel) {
              const span = document.createElement("span");
              span.className = "mention";
              span.textContent = "#" + channel.name;
              textContents.appendChild(span);
              continue;
            }
          } else if (type === "@") {
            const user = message.mentions.users.find((u) => u.id === id);
            if (user) {
              const span = document.createElement("span");
              span.className = "mention";
              span.textContent = "@" + user.username;
              textContents.appendChild(span);
              continue;
            }
            const role = message.mentions.roles.find((r) => r.id === id);
            if (role) {
              const span = document.createElement("span");
              span.className = "mention";
              span.textContent = "@" + role.name;
              span.style.backgroundColor = role.hexColor;
              textContents.appendChild(span);
              continue;
            }
          } else if (type === ":") {
            id = id.split(":").pop();
            const emoji = bot.emojis.cache.find((e) => e.id === id);
            if (emoji) {
              const img = document.createElement("img");
              img.src = emoji.url;
              img.className = "inlineEmoji";
              textContents.appendChild(img);
              continue;
            }
          }
        }
        resultContent += content.substring(start, i);
      }
      if (content[i]) resultContent += content[i];
    }
    if (resultContent.length > 0) textContents.append(resultContent);
    messageGroupDiv.append(textContents);
    if (message.embeds.length > 0) {
      const embedContainer = document.createElement("div");
      embedContainer.className = "embedContainer";
      message.embeds.forEach((embed) => {
        const embedWrapper = document.createElement("div");
        embedWrapper.className = "embedWrapper";
        embedWrapper.style.borderColor = embed.hexColor;
        const embedDiv = document.createElement("div");
        embedWrapper.appendChild(embedDiv);
        embedDiv.className = "embed";
        if (embed.author) {
          const embedAuthor = document.createElement("div");
          embedAuthor.className = "embedAuthor";
          embedDiv.appendChild(embedAuthor);
          if (embed.author.iconURL) {
            const embedAuthorImg = document.createElement("img");
            embedAuthorImg.src = embed.author.iconURL;
            embedAuthorImg.className = "embedAuthorImg";
            embedAuthor.appendChild(embedAuthorImg);
          }
          if (embed.author.url) {
            const embedAuthorA = document.createElement("a");
            embedAuthorA.className = "link embedAuthorTxt";
            embedAuthorA.href = embed.author.url;
            embedAuthorA.textContent = embed.author.name;
            embedAuthor.appendChild(embedAuthorA);
          } else {
            const embedAuthorT = document.createElement("text");
            embedAuthorT.textContent = embed.author.name;
            embedAuthorT.className = "embedAuthorTxt";
            embedAuthor.appendChild(embedAuthorT);
          }
        }
        if (embed.title) {
          const embedTitle = document.createElement("div");
          embedTitle.className = "embedTitle";
          if (embed.url) {
            const embedTitleA = document.createElement("a");
            embedTitleA.href = embed.url;
            embedTitleA.className = "link";
            embedTitleA.textContent = embed.title;
            embedTitle.appendChild(embedTitleA);
          } else {
            const embedTitleTxt = document.createElement("p");
            embedTitleTxt.textContent = embed.title;
            embedTitle.appendChild(embedTitleTxt);
          }
          embedDiv.appendChild(embedTitle);
        }
        if (embed.description) {
          const embedDesc = document.createElement("div");
          embedDesc.textContent = embed.description;
          embedDesc.className = "embedDesc";
          embedDiv.appendChild(embedDesc);
        }
        if (embed.fields?.length > 0) {
          const fieldsContainer = document.createElement("div");
          fieldsContainer.className = "embedFieldsContainer";
          embedDiv.appendChild(fieldsContainer);
          embed.fields.forEach((field) => {
            const fieldDiv = document.createElement("div");
            fieldDiv.className = "embedField";
            const fieldTitle = document.createElement("div");
            fieldTitle.className = "embedFieldTitle";
            fieldTitle.textContent = field.name;
            const fieldValue = document.createElement("div");
            fieldValue.className = "embedFieldValue";
            fieldValue.textContent = field.value;
            fieldDiv.appendChild(fieldTitle);
            fieldDiv.appendChild(fieldValue);
            fieldsContainer.appendChild(fieldDiv);
          });
        }
        if (embed.image) {
          const embedImg = document.createElement("img");
          embedImg.className = "embedImg";
          embedImg.src = embed.image.url;
          embedImg.style.width = embed.image.width + "px";
          embedImg.style.height = embed.image.height + "px";
          embedDiv.appendChild(embedImg);
        }
        if (embed.thumbnail) {
          const embedThumb = document.createElement("img");
          embedThumb.className = "embedThumb";
          embedThumb.src = embed.thumbnail.url;
          embedThumb.style.height = embed.thumbnail.height + "px";
          embedThumb.style.width = embed.thumbnail.width + "px";
          embedDiv.appendChild(embedThumb);
        }
        if (embed.footer) {
          const embedFooter = document.createElement("div");
          embedFooter.className = "embedFooter";
          if (embed.footer.iconURL) {
            const img = document.createElement("img");
            img.className = "embedFooterImg";
            img.src = embed.footer.iconURL || embed.footer.proxyIconURL;
            embedFooter.appendChild(img);
          }
          if (embed.footer.text) {
            const text = document.createElement("span");
            text.className = "embedFooterTxt";
            text.textContent = embed.footer.text;
            if (embed.timestamp)
              text.textContent += ` • ${new Date(
                embed.timestamp
              ).toUTCString()}`;
            embedFooter.appendChild(text);
          }
          embedDiv.appendChild(embedFooter);
        }
        embedContainer.appendChild(embedWrapper);
      });
      messageGroupDiv.appendChild(embedContainer);
    }
    if (message.attachments.size > 0) {
      const attachmentsDiv = document.createElement("div");
      attachmentsDiv.className = "attachments";
      message.attachments.forEach((attachment) => {
        const attachmentEl = document.createElement("a");
        attachmentEl.href = attachment.url;
        attachmentEl.className = "attachment";
        attachmentEl.textContent =
          "Attachment | " +
          attachment.name +
          ` | ${numberComma(attachment.size)} bytes`;
        attachmentsDiv.appendChild(attachmentEl);
      });
      messageGroupDiv.append(attachmentsDiv);
    }
    if (message.reactions.cache.size > 0) {
      const reactions = document.createElement("div");
      reactions.className = "reactionsDiv";
      message.reactions.cache.forEach((reaction) => {
        let reactionDiv = document.createElement("div");
        reactionDiv.className = "reactionDiv";
        let reactionEl;
        if (reaction.emoji.url) {
          reactionEl = document.createElement("img");
          reactionEl.src = reaction.emoji.url;
        } else {
          reactionEl = document.createElement("span");
          reactionEl.textContent = reaction.emoji.name;
          reactionEl.style.marginTop = "-3px";
        }
        reactionEl.className = "reaction";
        reactionDiv.appendChild(reactionEl);
        const reactionCount = document.createElement("span");
        reactionCount.className = "reactionCount";
        reactionCount.textContent = numberComma(reaction.count);
        reactionDiv.appendChild(reactionCount);
        reactions.appendChild(reactionDiv);
      });
      messageGroupDiv.append(reactions);
    }
    lastMessage = message;
  });

  return Buffer.from(template + parentDiv.outerHTML);
}
