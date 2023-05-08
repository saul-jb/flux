import CommentItem from "../CommentItem";
import Editor from "../Editor";

import { useEffect, useMemo, useState } from "preact/hooks";
import { Message as MessageModel } from "utils/api";
import { useEntries } from "@fluxapp/react-web";
import { PerspectiveProxy } from "@perspect3vism/ad4m";

export default function CommentSection({
  perspective,
  source,
}: {
  perspective: PerspectiveProxy;
  source: string;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [comment, setComment] = useState("");

  const { entries: comments, model: Message } = useEntries({
    perspective,
    source: source || null,
    model: MessageModel,
  });

  async function submitComment() {
    try {
      if (comment.replace(/<[^>]*>?/gm, "").length > 0) {
        setIsCreating(true);
        await Message.create({ body: comment });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <j-box pt="900">
        <Editor onChange={(e) => setComment(e)}></Editor>
        <j-box pt="300">
          <j-button
            disabled={isCreating}
            loading={isCreating}
            size="sm"
            variant="primary"
            onClick={submitComment}
          >
            Make a comment
          </j-button>
        </j-box>
      </j-box>
      <j-box pt="900">
        <j-text variant="label">Comments ({comments.length})</j-text>
        <j-box>
          {comments.map((comment) => {
            return (
              <j-box key={comment.id} mt="400">
                <CommentItem
                  perspective={perspective}
                  comment={comment}
                ></CommentItem>
              </j-box>
            );
          })}
        </j-box>
      </j-box>
    </>
  );
}
