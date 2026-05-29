export function shouldSaveHistory(category: string): boolean {
  const nonSavingCategories = ["navigate", "font", "savePDF", "undo"];
  return !nonSavingCategories.includes(category);
}


export function handleUndo(history: string[][], currentParagraphs: string[], currentIndex: number) {
  if (history.length > 0) {
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    let validatedIndex = currentIndex;
    if (currentIndex < 0 || currentIndex >= previousState.length) {
      validatedIndex = 0;
    }

    return { 
      paragraphs: previousState, 
      history: newHistory,
      index: validatedIndex 
    };
  }
  
  return { 
    paragraphs: currentParagraphs, 
    history: history,
    index: currentIndex 
  };
}