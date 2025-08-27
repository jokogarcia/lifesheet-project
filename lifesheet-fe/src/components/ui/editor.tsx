import React, { useState, useEffect } from 'react';
import { EditorState, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { markdownToDraft, draftToMarkdown } from 'markdown-draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

interface RichTextEditorProps {
  content: string;
  onContentUpdate: (content: string) => void;
    style?: React.CSSProperties;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onContentUpdate, style }) => {
  const [editorState, setEditorState] = useState(() => {
    if (content) {
      const contentState = convertFromRaw(markdownToDraft(content));
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const markdown = draftToMarkdown(convertToRaw(editorState.getCurrentContent()));
    onContentUpdate(markdown);
  }, [editorState, onContentUpdate]);

  return (
    <div className="editor-container" style={style}>
      <Editor
        editorState={editorState}
        onEditorStateChange={setEditorState}
        wrapperStyle={{ height: '100%' , border: '1px solid #F1F1F1', borderRadius: '8px' }}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'history'],
          inline: { options: ['bold', 'italic', 'underline'] },
          blockType: { options: ['Normal', 'H1', 'H2', 'H3', 'Blockquote'] },
          list: { options: ['unordered', 'ordered'] },
        }}
      />
    </div>
  );
};

export default RichTextEditor;
