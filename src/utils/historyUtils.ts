export function handleUndo(history: string[][], currentParagraphs: string[]) {
  if (history.length > 0) {
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    return { paragraphs: previousState, history: newHistory };
  }
  return { paragraphs: currentParagraphs, history: history };
}

export function shouldSaveHistory(category: string): boolean {
  const nonSavingCategories = ["navigate", "font", "savePDF", "undo"];
  return !nonSavingCategories.includes(category);
}