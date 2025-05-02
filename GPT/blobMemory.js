// GPT/blobMemory.js
let history = [];

export function recordEvent(event) {
  history.push({
    timestamp: new Date().toISOString(),
    ...event
  });
}

export function getBlobHistory(name) {
  const relevant = history.filter(h => h.name === name);
  if (relevant.length === 0) return "No history yet.";

  return relevant.map(h => {
    const base = `At ${h.timestamp}, Blob ${h.name}`;
    if (h.type === 'eat') return `${base} ate ${h.emoji}.`;
    if (h.type === 'start') return `${base} started a new game looking for ${h.targetEmoji}.`;
    return `${base} had an event.`;
  }).join('\n');
}

export function resetBlobHistory(name) {
  history = history.filter(h => h.name !== name);
}
