export function handleStructureAction(
  paragraphs: string[],
  currentIndex: number,
  action: "add_after" | "add_before" | "delete" | "none"
) {
  let updatedParagraphs = [...paragraphs];
  let updatedIndex = currentIndex;

  if (action === "delete") {
    updatedParagraphs = updatedParagraphs.filter((_, i) => i !== currentIndex);
    updatedIndex = Math.max(0, currentIndex - 1);
  } 
  else if (action === "add_after") {
    if (updatedParagraphs.length === 0) {
      updatedParagraphs = [""];
      updatedIndex = 0;
    } else {
      updatedParagraphs.splice(currentIndex + 1, 0, "");
      updatedIndex = currentIndex + 1;
    }
  } 
  else if (action === "add_before") {
    updatedParagraphs.splice(currentIndex, 0, "");
  }

  return { paragraphs: updatedParagraphs, index: updatedIndex };
}


export function calculateNewIndex(
  target: string, 
  currentIndex: number, 
  totalParagraphs: number
): number {
  if (target === "none") return currentIndex;

  let newIdx = currentIndex;

  if (target === "next") {
    newIdx = Math.min(totalParagraphs - 1, currentIndex + 1);
  } else if (target === "prev") {
    newIdx = Math.max(0, currentIndex - 1);
  } else if (target === "first") {
    newIdx = 0;
  } else if (target === "last") {
    newIdx = totalParagraphs - 1;
  } else {
    const num = parseInt(target, 10);
    if (!isNaN(num)) {
      newIdx = Math.max(0, Math.min(totalParagraphs - 1, num - 1));
    }
  }

  return newIdx;
}