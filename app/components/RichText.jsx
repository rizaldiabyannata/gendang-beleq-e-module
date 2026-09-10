'use client';

import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

// The teacher's writing surface. Everything the panel used to edit through a bare
// <textarea> comes through here instead.
//
// Two shapes. `simple` is one line of running text — a title, an option, a term —
// and keeps only the marks that make sense inside a sentence; its value is stored
// without the paragraph wrapper so a field that was plain text stays plain text
// until someone actually formats it. `full` is prose, and gets headings, lists and
// alignment on top.
//
// Superscript and subscript are the reason this exists at all. This is a physics
// module: W/m², f₁ and 5 × 10⁻³ were being typed as hand-picked unicode characters.

const STRIP = /^<p(?:\s[^>]*)?>([\s\S]*)<\/p>$/;

// What comes back out. `simple` unwraps the single paragraph TipTap always wraps
// text in, and an editor holding nothing returns an empty string rather than the
// empty paragraph TipTap represents that with.
function readOut(editor, simple) {
  if (editor.isEmpty) return '';
  const html = editor.getHTML();
  if (!simple) return html;
  const m = html.match(STRIP);
  return m && m[1].indexOf('<p') === -1 ? m[1] : html;
}

const BLOCKS = {
  heading: false, bulletList: false, orderedList: false, listItem: false,
  blockquote: false, codeBlock: false, horizontalRule: false,
};

export default function RichText({ value, onChange, simple, label, minHeight, placeholder }) {
  const last = React.useRef(value == null ? '' : String(value));

  const editor = useEditor({
    // Next prerenders this page, so the editor must not paint before hydration.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure(Object.assign(
        { link: { openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer nofollow' } } },
        simple ? BLOCKS : null,
      )),
      Superscript,
      Subscript,
      Highlight,
      ...(simple ? [] : [TextAlign.configure({ types: ['heading', 'paragraph'] })]),
    ],
    content: value == null ? '' : String(value),
    editorProps: {
      attributes: {
        class: 'gb-rte-body' + (simple ? ' gb-rte-simple' : ''),
        ...(label ? { 'aria-label': label } : null),
      },
    },
    onUpdate: ({ editor: e }) => {
      const out = readOut(e, simple);
      last.current = out;
      if (onChange) onChange(out);
    },
  }, [simple]);

  // The draft can also change from outside this component: another teacher session
  // publishes, or the panel resets the content. Rewriting on every render would
  // fight the person typing, so it only happens when the incoming value differs
  // from what this editor last emitted.
  React.useEffect(() => {
    if (!editor) return;
    const next = value == null ? '' : String(value);
    if (next === last.current) return;
    last.current = next;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return <div className="gb-rte" aria-busy="true"><div className="gb-rte-body" style={minHeight ? { minHeight } : undefined} /></div>;
  }

  const btn = (key, title, body, run, active) => (
    <button key={key} type="button" title={title} aria-label={title} aria-pressed={!!active}
      className={'gb-rte-btn' + (active ? ' is-on' : '')}
      onMouseDown={(e) => e.preventDefault()} onClick={run}>{body}</button>
  );

  const c = editor.chain().focus();
  const tools = [
    btn('b', 'Tebal', <b>B</b>, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold')),
    btn('i', 'Miring', <i>I</i>, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic')),
    btn('u', 'Garis bawah', <u>U</u>, () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline')),
    btn('s', 'Coret', <s>S</s>, () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike')),
    btn('sup', 'Pangkat atas', <span>x<sup>2</sup></span>, () => editor.chain().focus().toggleSuperscript().run(), editor.isActive('superscript')),
    btn('sub', 'Pangkat bawah', <span>x<sub>2</sub></span>, () => editor.chain().focus().toggleSubscript().run(), editor.isActive('subscript')),
    btn('mark', 'Sorot', <span className="gb-rte-mark">A</span>, () => editor.chain().focus().toggleHighlight().run(), editor.isActive('highlight')),
    btn('code', 'Kode', <span style={{ fontFamily: 'var(--font-jetbrains),ui-monospace,monospace' }}>{'{ }'}</span>, () => editor.chain().focus().toggleCode().run(), editor.isActive('code')),
  ];

  if (!simple) {
    tools.push(
      <span key="sep1" className="gb-rte-sep" aria-hidden="true" />,
      btn('h2', 'Judul', 'H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 })),
      btn('h3', 'Subjudul', 'H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 })),
      btn('ul', 'Daftar butir', '• —', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList')),
      btn('ol', 'Daftar bernomor', '1. —', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList')),
      btn('quote', 'Kutipan', '❝', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote')),
      <span key="sep2" className="gb-rte-sep" aria-hidden="true" />,
      btn('left', 'Rata kiri', '⯇', () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' })),
      btn('center', 'Rata tengah', '≡', () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' })),
    );
  }

  // A link needs a destination, and window.prompt is the one dialog this panel is
  // allowed to lean on: the teacher is signed in, on their own machine, and any
  // fuller dialog would be a second modal system for a single string.
  const setLink = () => {
    const now = editor.getAttributes('link').href || '';
    const url = window.prompt('Alamat tautan (kosongkan untuk menghapus)', now);
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  tools.push(
    <span key="sep3" className="gb-rte-sep" aria-hidden="true" />,
    btn('link', 'Tautan', '🔗', setLink, editor.isActive('link')),
    btn('clear', 'Hapus format', '⌫', () => editor.chain().focus().unsetAllMarks().clearNodes().run(), false),
    <span key="sep4" className="gb-rte-sep gb-rte-push" aria-hidden="true" />,
    btn('undo', 'Batalkan', '↺', () => editor.chain().focus().undo().run(), false),
    btn('redo', 'Ulangi', '↻', () => editor.chain().focus().redo().run(), false),
  );
  void c;

  return (
    <div className={'gb-rte' + (simple ? ' is-simple' : '')}>
      <div className="gb-rte-bar" role="toolbar" aria-label={'Format' + (label ? ' · ' + label : '')}>{tools}</div>
      <EditorContent editor={editor} style={minHeight ? { '--gb-rte-min': minHeight } : undefined} />
      {placeholder && editor.isEmpty ? <div className="gb-rte-ph">{placeholder}</div> : null}
    </div>
  );
}
