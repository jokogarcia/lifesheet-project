import React, { useState, useEffect } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { markdownToDraft, draftToMarkdown } from 'markdown-draft-js';
import { useIntl } from 'react-intl';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

interface RichTextEditorProps {
  content: string;
  onContentUpdate: (content: string) => void;
  style?: React.CSSProperties;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onContentUpdate, style }) => {
  const intl = useIntl();
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
        wrapperStyle={{ height: '80%', border: '1px solid #F1F1F1', borderRadius: '8px', paddingBottom: '80px' }}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'history'],
          inline: {
            options: ['bold', 'italic', 'underline'],
            bold: { title: intl.formatMessage({ id: 'editor.bold', defaultMessage: 'Bold' }) },
            italic: { title: intl.formatMessage({ id: 'editor.italic', defaultMessage: 'Italic' }) },
            underline: { title: intl.formatMessage({ id: 'editor.underline', defaultMessage: 'Underline' }) }
          },
          blockType: {
            options: ['Normal', 'H1', 'H2', 'H3', 'Blockquote'],
            title: intl.formatMessage({ id: 'editor.blockType', defaultMessage: 'Block Type' })
          },
          list: {
            options: ['unordered', 'ordered'],
            unordered: { title: intl.formatMessage({ id: 'editor.unorderedList', defaultMessage: 'Unordered List' }) },
            ordered: { title: intl.formatMessage({ id: 'editor.orderedList', defaultMessage: 'Ordered List' }) }
          },
          textAlign: {
            title: intl.formatMessage({ id: 'editor.textAlign', defaultMessage: 'Text Align' })
          },
          link: {
            title: intl.formatMessage({ id: 'editor.link', defaultMessage: 'Link' }),
            popupClassName: 'link-popup',
            linkCallback: undefined
          },
          history: {
            title: intl.formatMessage({ id: 'editor.history', defaultMessage: 'History' }),
            undo: { title: intl.formatMessage({ id: 'editor.undo', defaultMessage: 'Undo' }) },
            redo: { title: intl.formatMessage({ id: 'editor.redo', defaultMessage: 'Redo' }) }
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;
