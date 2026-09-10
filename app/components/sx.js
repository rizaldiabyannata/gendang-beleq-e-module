// CSS declaration string -> React style object. The design ships every style as
// an inline CSS string, so this is the one adapter that keeps them verbatim.
const cache = new Map();

function split(css) {
  const out = [];
  let depth = 0, quote = '', start = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (quote) { if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ';' && depth === 0) { out.push(css.slice(start, i)); start = i + 1; }
  }
  out.push(css.slice(start));
  return out;
}

export function sx(css) {
  if (!css) return undefined;
  const hit = cache.get(css);
  if (hit) return hit;
  const obj = {};
  for (const decl of split(css)) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) continue;
    obj[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
  }
  cache.set(css, obj);
  return obj;
}
