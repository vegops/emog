const getKey = (gameId) => `blob-history-${gameId}`;

export const saveBlobMessage = (gameId, message) => {
  if (!message || typeof message !== 'string') return;

  const key = getKey(gameId);
  const history = JSON.parse(localStorage.getItem(key) || '[]');

  const lastEntry = history.at(-1);
  if (lastEntry?.type === 'message' && lastEntry.text === message) return;

  history.push({
    type: 'message',
    text: message,
    timestamp: Date.now()
  });

  localStorage.setItem(key, JSON.stringify(history));
};

export const saveEatEvent = (gameId, emoji, isCorrect) => {
  if (!emoji) return;

  const key = getKey(gameId);
  const history = JSON.parse(localStorage.getItem(key) || '[]');

  history.push({
    type: 'eat',
    emoji,
    result: isCorrect ? 'correct' : 'wrong',
    timestamp: Date.now()
  });

  localStorage.setItem(key, JSON.stringify(history));
};

export const getBlobHistory = (gameId) => {
  const key = getKey(gameId);
  const history = JSON.parse(localStorage.getItem(key) || '[]');

  return history
    .map(entry => {
      if (entry.type === 'message') return `💬 ${entry.text}`;
      if (entry.type === 'eat') {
        return `🍽️ Ate emoji ${entry.emoji} — ${entry.result === 'correct' ? '✅ Correct' : '❌ Wrong'}`;
      }
      return '';
    })
    .join('\n');
};

export const clearBlobHistory = (gameId) => {
  localStorage.removeItem(getKey(gameId));
};
