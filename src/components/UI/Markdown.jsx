import React from 'react';

/** Rendu markdown minimal (titres, listes, gras, italique) sans dépendance. */
function inline(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith('**')) parts.push(<strong key={i++}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith('`')) parts.push(<code key={i++} style={{ background: 'rgba(0,0,0,0.06)', padding: '0 4px', borderRadius: 4 }}>{token.slice(1, -1)}</code>);
    else parts.push(<em key={i++}>{token.slice(1, -1)}</em>);
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function Markdown({ content, style }) {
  if (!content) return null;
  const lines = String(content).split('\n');
  const blocks = [];
  let list = [];

  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} style={{ margin: '0.5rem 0 1rem', paddingLeft: '1.2rem', lineHeight: 1.7 }}>
          {list.map((item, i) => <li key={i}>{inline(item)}</li>)}
        </ul>
      );
      list = [];
    }
  };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    if (/^\s*[-*•]\s+/.test(line)) {
      list.push(line.replace(/^\s*[-*•]\s+/, ''));
      return;
    }
    flush();
    if (!line.trim()) return;
    if (line.startsWith('### ')) {
      blocks.push(<h4 key={blocks.length} style={{ margin: '1rem 0 0.4rem', fontSize: '0.95rem' }}>{inline(line.slice(4))}</h4>);
    } else if (line.startsWith('## ')) {
      blocks.push(<h3 key={blocks.length} style={{ margin: '1.4rem 0 0.5rem', fontSize: '1.05rem', color: 'var(--primary)' }}>{inline(line.slice(3))}</h3>);
    } else if (line.startsWith('# ')) {
      blocks.push(<h2 key={blocks.length} style={{ margin: '1.4rem 0 0.5rem', fontSize: '1.15rem' }}>{inline(line.slice(2))}</h2>);
    } else {
      blocks.push(<p key={blocks.length} style={{ margin: '0.4rem 0', lineHeight: 1.7 }}>{inline(line)}</p>);
    }
  });
  flush();

  return <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', ...style }}>{blocks}</div>;
}
