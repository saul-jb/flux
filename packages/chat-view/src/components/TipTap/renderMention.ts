import { ReactRenderer } from "@tiptap/react";
import MentionList from "./MentionList";
import EmojiList from "./EmojiList";

export default function renderMention() {
  let reactRenderer = null as any;

  const container = document.getElementById("mentionWrapper");

  return {
    onStart: (props) => {
      const component = props.text === "@" ? MentionList : EmojiList;

      reactRenderer = new ReactRenderer(component, {
        props,
        editor: props.editor,
      });

      container.style.display = "block";
      container.append(reactRenderer.element);
    },
    onUpdate(props) {
      reactRenderer.updateProps(props);
    },
    onKeyDown(props) {
      return reactRenderer.ref?.onKeyDown(props);
    },
    onExit() {
      container.style.display = "none";
      container.innerHTML = "";
      reactRenderer.destroy();
    },
  };
}
