import { useContext, useRef, useState } from "preact/hooks";
import {
  AgentContext,
  ChatContext,
  CommunityContext,
} from "@fluxapp/react-web";
import { getMe } from "@fluxapp/api";
import MessageToolbar from "./MessageToolbar";
import MessageReactions from "./MessageReactions";
import MessageReply from "./MessageReply";
import UIContext from "../../context/UIContext";
import { REACTION } from "utils/constants";
import { format } from "date-fns/esm";
import { getTimeSince } from "@fluxapp/utils";
import Avatar from "../../components/Avatar";
import EditorContext from "../../context/EditorContext";
import { Message, Profile } from "@fluxapp/types";
import MessageCards from "./MessageCards";

import styles from "./index.module.css";

export default function MessageItem({
  message,
  showAvatar,
  onOpenEmojiPicker,
  mainRef,
  perspectiveUuid,
  hideToolbar = false,
  noPadding = false,
  highlight = false,
  onReplyNavClick = () => null,
}) {
  const messageContent =
    message.editMessages[message.editMessages.length - 1].content;

  const messageRef = useRef<any>(null);

  const [showToolbar, setShowToolbar] = useState(false);

  const {
    state: { members },
  } = useContext(CommunityContext);

  const {
    methods: { addReaction, removeReaction },
  } = useContext(ChatContext);

  const {
    state: { currentReply, currentMessageEdit },
    methods: { setCurrentReply, setCurrentEditMessage },
  } = useContext(UIContext);

  const {
    methods: { setInputValue },
  } = useContext(EditorContext);

  const { state: agentState } = useContext(AgentContext);

  function onReplyClick() {
    setCurrentReply(message.id);
  }

  function onEditClick() {
    setCurrentEditMessage(message.id);
    setInputValue(messageContent);
  }

  async function onEmojiClick(utf: string) {
    const me = await getMe();

    const alreadyMadeReaction = message.reactions.find((reaction) => {
      return reaction.author === me.did && reaction.content === utf;
    });

    if (alreadyMadeReaction) {
      if (alreadyMadeReaction?.synced) {
        removeReaction({
          author: alreadyMadeReaction.author,
          data: {
            predicate: REACTION,
            target: `emoji://${alreadyMadeReaction.content}`,
            source: message.id,
          },
          proof: {
            invalid: false,
            key: "",
            signature: "",
            valid: true,
          },
          timestamp: alreadyMadeReaction.timestamp,
        });
      }
    } else {
      addReaction(message.id, utf);
    }
  }

  const author: Profile = members[message.author] || {};
  const replyAuthor: Profile = members[message?.replies[0]?.author] || {};
  const replyMessage: Message = message?.replies[0];
  const popularStyle: string = message.isPopular ? styles.popularMessage : "";
  const highlightStyle: string = highlight ? styles.highlightMessage : "";
  const noPaddingStyle: string = noPadding ? styles.noPaddingStyle : "";
  const isReplying: boolean = currentReply === message.id;
  const isEdited: boolean = message.editMessages.length > 1;
  const hasReactions: boolean = message.reactions.length > 0;
  const showAuthor: boolean = replyMessage || showAvatar;

  return (
    <div
      className={[
        styles.message,
        popularStyle,
        noPaddingStyle,
        highlightStyle,
        !message.synced ? styles.messageNotSynced : "",
      ].join(" ")}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      <div className={styles.messageItemWrapper}>
        {replyMessage && (
          <MessageReply
            replyAuthor={replyAuthor}
            replyMessage={replyMessage}
            onMessageClick={onReplyNavClick}
          ></MessageReply>
        )}
        <div>
          {showAuthor ? (
            <a href={author?.did}>
              <Avatar did={author?.did} url={author?.profileThumbnailPicture} />
            </a>
          ) : (
            showToolbar && (
              <small
                className={styles.timestampLeft}
                data-rh
                data-timestamp={format(
                  new Date(message.timestamp),
                  "EEEE, MMMM d, yyyy, HH:MM"
                )}
              >
                {format(new Date(message.timestamp), "HH:MM ")}
              </small>
            )
          )}
        </div>

        <div className={styles.messageItemContentWrapper}>
          {showAuthor && (
            <header className={styles.messageItemHeader}>
              <a href={author?.did} className={styles.messageUsername}>
                {author?.username || (
                  <j-skeleton width="xl" height="text"></j-skeleton>
                )}
              </a>
              <small
                className={styles.timestamp}
                data-rh
                data-timestamp={format(
                  new Date(message.timestamp),
                  "EEEE, MMMM d, yyyy, hh:mm b"
                )}
              >
                {getTimeSince(new Date(message.timestamp), new Date())}
              </small>
              {message.isPopular && (
                <j-tooltip title="Popular message">
                  <j-icon
                    className={styles.popularIcon}
                    size="xs"
                    name="magic"
                  ></j-icon>
                </j-tooltip>
              )}
            </header>
          )}

          <div
            ref={messageRef}
            className={styles.messageItemContent}
            style={{ display: "inline-flex" }}
            dangerouslySetInnerHTML={{
              __html: messageContent,
            }}
          ></div>

          {isEdited && (
            <small
              data-rh
              data-timestamp={format(
                new Date(
                  message.editMessages[
                    message.editMessages.length - 1
                  ].timestamp
                ),
                "EEEE, MMMM d, yyyy, hh:mm b"
              )}
              className={styles.timestamp}
              style={{ display: "inline-flex" }}
            >
              &nbsp;(edited)
            </small>
          )}

          {hasReactions && (
            <MessageReactions
              onEmojiClick={onEmojiClick}
              reactions={message.reactions}
            />
          )}

          <MessageCards
            message={message}
            perspectiveUuid={perspectiveUuid}
            mainRef={mainRef}
          />
        </div>

        {!hideToolbar && showToolbar && (
          <div className={styles.toolbarWrapper}>
            <MessageToolbar
              onReplyClick={onReplyClick}
              onOpenEmojiPicker={onOpenEmojiPicker}
              onEditClick={onEditClick}
              showEditIcon={agentState.did === message.author}
            />
          </div>
        )}
      </div>
    </div>
  );
}
