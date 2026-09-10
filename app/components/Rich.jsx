'use client';

import React from 'react';
import DOMPurify from 'dompurify';

// Teacher-authored HTML on its way to a student's screen.
//
// Everything the panel writes comes from the TipTap schema, which cannot produce a
// script tag in the first place. This exists for the other doors: a row edited
// straight in the database, a payload restored from an old export, a teacher account
// someone else got into. Content authored by one person and rendered in thirty
// browsers gets sanitised, whatever produced it.
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sup', 'sub', 'mark', 'code',
  'a', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'pre', 'hr', 'span',
];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'style', 'class'];

// DOMPurify needs a DOM, and prerender has none. That is safe here rather than a
// hole, because of where the two kinds of content come from: at prerender the only
// content that exists is content-public.js, generated from our own repository, and
// anything a teacher wrote arrives from Supabase after hydration, by which point
// this runs in a browser. The two paths also agree on trusted input, so React does
// not see a hydration mismatch.
export function bersih(html) {
  const s = html == null ? '' : String(html);
  if (!s) return '';
  if (typeof window === 'undefined') return s;
  return DOMPurify.sanitize(s, { ALLOWED_TAGS, ALLOWED_ATTR, ALLOW_DATA_ATTR: false });
}

// True when the value carries no markup at all, which every field did before the
// editor existed. Such a value renders as a plain text node, so nothing that was
// never formatted starts going through dangerouslySetInnerHTML.
const PLAIN = /<[a-z!/][\s\S]*>/i;
export const isPlain = (v) => !PLAIN.test(v == null ? '' : String(v));

export default function Rich({ html, tag = 'div', className, style, block }) {
  const raw = html == null ? '' : String(html);
  const clean = React.useMemo(() => bersih(raw), [raw]);
  const Tag = tag;
  if (isPlain(raw)) return <Tag className={className} style={style}>{raw}</Tag>;
  return (
    <Tag
      className={(className ? className + ' ' : '') + (block ? 'gb-rich gb-rich-block' : 'gb-rich')}
      style={style}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
