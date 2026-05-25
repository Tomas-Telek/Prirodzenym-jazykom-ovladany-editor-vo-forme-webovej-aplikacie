import { getLCModel, callLC } from "./langchainClient";

export async function runEditAgent(opts: {
  apiKey: string;
  paragraph: string;
  command: string;
  language: string;
}) {
  const { apiKey, paragraph, command, language } = opts;

  const langName = language === 'sk' ? 'SLOVAK' : 'ENGLISH';

  const system = `You are a text editor. Instruction: Modify the paragraph based on user's command.
        
        Return ONLY the whole text with modified changes. No explanations, no quotation marks, no meta-comments in ${langName}. 
  `;



  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `PARAGRAPH TO EDIT:
                """
                ${paragraph}
                """

                USER COMMAND:
                ${command}`
      }
  ];

  const model = getLCModel(apiKey);
  const output = await callLC(model, messages);
  return output.trim();
}
