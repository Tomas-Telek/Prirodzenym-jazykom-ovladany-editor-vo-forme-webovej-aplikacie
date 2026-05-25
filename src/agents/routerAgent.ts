import { runEditAgent } from "./editAgent";
import { runCreativeAgent } from "./CreativeAgent";
import { getLCModel} from "./langchainClient";
import { z } from "zod";
import { jsPDF } from "jspdf";

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
    const taskStart = performance.now();
    let taskEnd;

    if (task.category === "undo") {
      if (updatedHistory.length > 0) {
        updatedParagraphs = updatedHistory[updatedHistory.length - 1];
        updatedHistory = updatedHistory.slice(0, -1);
      }
      continue; 
    }

    if (task.category !== "navigate" && task.category !== "font" && task.category !== "savePDF") {
      updatedHistory.push([...updatedParagraphs]);
    }



    switch (task.category) {

      case "structure":
        const action = task.structureAction;

        
        if (action === "delete") {
          updatedParagraphs = updatedParagraphs.filter((_, i) => i !== updatedIndex);
          updatedIndex = Math.max(0, updatedIndex - 1);
        } 
        else if (action === "add_after") {
          if (updatedParagraphs.length === 0) {
            updatedParagraphs = [""];
            updatedIndex = 0;
          } else {
            updatedParagraphs.splice(updatedIndex + 1, 0, "");
            updatedIndex = updatedIndex + 1;
          }
        }
        else if (action === "add_before") {
          updatedParagraphs.splice(updatedIndex, 0, "");
        }
        taskEnd = performance.now();
        console.log(`Task (${task.category}): ${Math.round(taskEnd - taskStart)}ms`);
        break;

      case "edit":
        const editedText = await runEditAgent({
          apiKey,
          paragraph: updatedParagraphs[updatedIndex],
          command: task.cleanCommand,
          language: language
        });
        updatedParagraphs[updatedIndex] = editedText;
        taskEnd = performance.now();
        console.log(`Task (${task.category}): ${Math.round(taskEnd - taskStart)}ms`);
        break;


      case "navigate":
        const target = task.navTarget;
          if (target === "none") break;

          let newIdx = updatedIndex;

          if (target === "next") {
            newIdx = Math.min(updatedParagraphs.length - 1, updatedIndex + 1);
          } else if (target === "prev") {
            newIdx = Math.max(0, updatedIndex - 1);
          } else if (target === "first") {
            newIdx = 0;
          } else if (target === "last") {
            newIdx = updatedParagraphs.length - 1;
          } else {
            const num = parseInt(target, 10);
            if (!isNaN(num)) {
              
              newIdx = Math.max(0, Math.min(updatedParagraphs.length - 1, num - 1));
            }
          }
          updatedIndex = newIdx;


          taskEnd = performance.now();
          console.log(`Task (${task.category}): ${Math.round(taskEnd - taskStart)}ms`);
          break;


      case "font":
        if (task.fontAction === "increase") {
          updatedFontSize += task.fontValue;
        } else if (task.fontAction === "decrease") {
          updatedFontSize = Math.max(8, updatedFontSize - task.fontValue);
        } else if (task.fontAction === "reset") {
          updatedFontSize = 16;
        }
        taskEnd = performance.now();
        console.log(`Task (${task.category}): ${Math.round(taskEnd - taskStart)}ms`);
        break;

      case "dictate":
        updatedParagraphs[updatedIndex] += (updatedParagraphs[updatedIndex] ? " " : "") + task.dictateContent;

        taskEnd = performance.now();
        console.log(`Task (${task.category}): ${Math.round(taskEnd - taskStart)}ms`);
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

        taskEnd = performance.now();
        console.log(`Task (${task.category}): ${Math.round(taskEnd - taskStart)}ms`);
        break;

      case "savePDF":
        const doc = new jsPDF();
        const removeDiacritics = (text: string) => {
          return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        
        let yPosition = 35;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const contentWidth = 170;
        const lineHeight = 7;
    
        paragraphs.forEach((para) => {
          const cleanText = removeDiacritics(para); 
          const lines: string[] = doc.splitTextToSize(cleanText, contentWidth);
          
          lines.forEach(line => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
          yPosition += 5;
        });
    
        doc.save("dokument.pdf");


        taskEnd = performance.now();
        console.log(`Task (${task.category}): ${Math.round(taskEnd - taskStart)}ms`);
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