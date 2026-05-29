import { runEditAgent } from "./editAgent";
import { runCreativeAgent } from "./CreativeAgent";
import { getLCModel} from "./langchainClient";
import { z } from "zod";
import { handleUndo, shouldSaveHistory } from "../utils/historyUtils";
import { exportToPDF } from "../utils/pdfUtils";
import { 
  handleStructureAction,
  calculateNewIndex,
  calculateNewFontSize
} from "../utils/editorUtils";

export async function runRouterAgent(opts: {
  apiKey: string;
  command: string;
  paragraphs: string[];
  currentIndex: number;
  history_: string[][];
  fontSize: number;
  language: string;
}) {
  const { apiKey, command, paragraphs, currentIndex, history_, fontSize, language } = opts;

  const routerStart = performance.now();

  const langName = language === 'sk' ? 'SLOVAK' : 'ENGLISH';



  const taskScheme = z.object({
    tasks: z.array(
      z.object({
        category: z.enum([
          "edit", "creative", "navigate", "structure", "undo", "font", "dictate","savePDF"
        ]).describe(`
          - edit: Modifying existing text (grammar, tone, translation, empty the paragraph).
          - creative: New content, poems, metaphors, or story continuation, or adding information to text.
          - navigate: Moving between paragraphs.
          - structure: Creating or deleting entire paragraphs.
          - undo: Reverting the last action.
          - font: Changing font size.
          - dictate: Adding raw dictated text to current paragraph.
          - savePDF: Saving the document as a PDF.
        `),
        cleanCommand: z.string().describe("Clear, grammatically correct version of the user's instruction just that part, that id for edit or creative agent.in " + langName + ". None if not creative, or edit."),

        creativeMode: z.enum(["append", "replace", "none"])
        .describe(`Only for 'creative' category: 
          - 'append': User wants to continue/expand the story (add to existing).
          - 'replace': User wants to rewrite, use metaphors, change POV, or write a poem (replace existing).
          - 'none': For other categories.`),

        structureAction: z.enum(["add_after", "add_before", "delete", "none"])
        .describe("Only for 'structure' category. What to do with the paragraph. 'none' means no structural change."),

        fontAction: z.enum(["increase", "decrease", "reset", "none"])
        .describe("Only for 'fontUP' and 'fontDOWN' categories. How to adjust the font size. 'none' means no change."),

        fontValue: z.number()
       .describe("The numeric value by which to change the font (e.g., 3, 5, 10). If not specified, default to 2. 'none' means no change."),

        navTarget: z.string()
        .describe(`Target for 'navigate' category. 
          Use: 'next', 'prev', 'first', 'last'. 
          If user names a specific number (e.g. 'go to paragraph 5'), return that number as a string.
          Current index is ${currentIndex + 1}, total paragraphs: ${paragraphs.length}.
          If not navigating, return 'none'.`),

        dictateContent: z.string()
        .describe(`Only for 'dictate' category. 
          Extract the ACTUAL text the user wants to write. 
          STRICTLY REMOVE all introductory phrases like "write", "input"... 
          Fix grammar and add a period at the end if missing. 
          If not dictating, return 'none'.`)
      })
    )
  });


  const model = getLCModel(apiKey);


  const structuredLlm = model.withStructuredOutput(taskScheme);

  const system = `You are an Intelligent Task Planner for a text editor.
                  Your goal is to decompose the user's voice command into a sequence of atomic tasks.
                  If the command is complex, break it down into multiple steps. 
                  Like if the command is reffering to a different paragraph, first navigate to it, then edit.
                  If command has multiplicity like 5 times do undo then plan 5 times to undo.
                  if the user is reffering to a rnage of paragrafs like "all" than plan to do it on all paragrafs one by one combinating navigation and the task required.
                  `;


  const decision = await structuredLlm.invoke([
    { role: "system", content: system },
    { role: "user", content: `Command: "${command}"` }
  ]);

  console.log("Router Agent Decision:", decision);
  let updatedParagraphs = [...paragraphs];
  let updatedIndex = currentIndex;
  let updatedHistory = [...history_];
  let updatedFontSize = fontSize;

  const routerEnd = performance.now();
  console.log(`Router Agent: ${Math.round(routerEnd - routerStart)}ms`);

  for (const task of decision.tasks) {

    if (task.category === "undo") {
      const result = handleUndo(updatedHistory, updatedParagraphs, updatedIndex);
      updatedParagraphs = result.paragraphs;
      updatedHistory = result.history;
      updatedIndex = result.index;
      continue;
    }

    if (shouldSaveHistory(task.category)) {
      updatedHistory.push([...updatedParagraphs]);
    }



    switch (task.category) {

      case "structure":
        const { paragraphs: newParas, index: newIndex } = handleStructureAction(
            updatedParagraphs,
            updatedIndex,
            task.structureAction as "add_after" | "add_before" | "delete" | "none"
          );
          
          updatedParagraphs = newParas;
          updatedIndex = newIndex;
          break;

      case "edit":
        const editedText = await runEditAgent({
          apiKey,
          paragraph: updatedParagraphs[updatedIndex],
          command: task.cleanCommand,
          language: language
        });
        updatedParagraphs[updatedIndex] = editedText;
        break;


      case "navigate":
        updatedIndex = calculateNewIndex(
          task.navTarget, 
          updatedIndex, 
          updatedParagraphs.length
        );
        
        break;


      case "font":
        updatedFontSize = calculateNewFontSize(
          task.fontAction as "increase" | "decrease" | "reset" | "none",
          updatedFontSize,
          task.fontValue
        );
        break;

      case "dictate":
        updatedParagraphs[updatedIndex] += (updatedParagraphs[updatedIndex] ? " " : "") + task.dictateContent;
        break;

      case "creative":
        const generatedText = await runCreativeAgent({
          apiKey,
          paragraph: updatedParagraphs[updatedIndex],
          prevParagraph: updatedIndex > 0 ? updatedParagraphs[updatedIndex - 1] : null,
          nextParagraph: updatedIndex < updatedParagraphs.length - 1 ? updatedParagraphs[updatedIndex + 1] : null,
          command: task.cleanCommand,
          language: language
        });
        if (task.creativeMode === "append") {
          updatedParagraphs[updatedIndex] = `${updatedParagraphs[updatedIndex]} ${generatedText}`;
        } else {
          updatedParagraphs[updatedIndex] = generatedText;
        }

        break;

      case "savePDF":
        exportToPDF(updatedParagraphs);
        break;

      
    }
  }


  return {
    paragraphs: updatedParagraphs,
    currentIndex: updatedIndex,
    history: updatedHistory,
    fontSize: updatedFontSize
  };
}