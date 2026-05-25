import React, { useState, useRef, useEffect } from "react";
import ApiKeyInput from "./components/ApiKeyInput";
import CommandInput from "./components/CommandInput";
import EditorView from "./components/EditorView";
import { runRouterAgent } from "./agents/routerAgent";
import SpeechWhisper from "./components/SpeechWhisper";
import { Helmet, HelmetProvider } from 'react-helmet-async';


export default function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [command, setCommand] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [history_, setHistory] = useState<string[][]>([]);
  const [fontSize, setFontSize] = useState<number>(16);

  const [language, setLanguage] = useState<'sk' | 'en'>('sk');

  // const [paragraphs, setParagraphs] = useState<string[]>([
  //   "Welcome to the next generation of digital writing. This AI-native text editor is designed to bridge the gap between human thought and digital execution through the power of natural language.",
  //   "By leveraging an advanced multi-agent architecture, the system acts as a proactive co-author. It can restructure your ideas, refine your tone, and navigate through complex documents without a single mouse click.",
  //   "Try giving a voice command now, such as 'Make the first paragraph more professional' or 'Generate a creative summary of this text'."
  // ]);

    const [paragraphs, setParagraphs] = useState<string[]>([
    "Umelá inteligencia dnes transformuje spôsob, akým pristupujeme k tvorbe obsahu. Moderné systémy už nevyžadujú len manuálne zadávanie textu cez klávesnicu, ale dokážu porozumieť komplexným hlasovým pokynom v prirodzenom jazyku.",
    "Tento editor využíva architektúru autonómnych agentov, ktorí spracovávajú požiadavky používateľa. Vďaka integrácii modelu Whisper a technológie VAD je interakcia plynulá a prirodzená, čo umožňuje efektívnu editáciu bez nutnosti ovládania nahrávania. Integrácia takýchto technológií prináša novú úroveň interakcie medzi človekom a počítačom. Editor už nie je len pasívnym nástrojom na zápis znakov, ale stáva sa inteligentným partnerom, ktorý dokáže plynule rozvíjať autorove myšlienky, navrhovať štylistické vylepšenia a udržiavať konzistentný tón v celom dokumente.",
  ]);



  const stateRef = useRef({ currentIndex, paragraphs, history_, fontSize, language });

  useEffect(() => {
    stateRef.current = { currentIndex, paragraphs, history_, fontSize, language };
  }, [currentIndex, paragraphs, history_, fontSize, language]);

  async function handleSubmit(cmd: string) {
    if (!apiKey) {
      alert("Enter your OpenAI API key!");
      return;
    }
    if (!cmd.trim()) return;

    try {
      setLoading(true);
      console.log("Transcribed Text:", cmd);

      const results = await runRouterAgent({
        apiKey,
        command: cmd,
        paragraphs: stateRef.current.paragraphs,
        currentIndex: stateRef.current.currentIndex,
        history_: stateRef.current.history_,
        fontSize: stateRef.current.fontSize,
        language: stateRef.current.language // Odtiaľto sa berie VŽDY aktuálny jazyk pre AI
      });
      
      setParagraphs(results.paragraphs);
      setCurrentIndex(results.currentIndex);
      setHistory(results.history);
      setCommand("");
      setFontSize(results.fontSize);
    } catch (err) {
      console.error("Error calling agent:", err);
    } finally {
      setLoading(false);
    }
  }

  async function setLivePreview(text: string) {
    if (!text) return;
    setCommand(text);
  }

  async function handleSubmitForm(e?: React.FormEvent) {
    e?.preventDefault();
    await handleSubmit(command);
  }

  async function handleSubmitCommand(cmd: string) {
    setCommand(cmd);
    await handleSubmit(cmd);
  }

  const handleManualEdit = (index: number, newText: string) => {
    setParagraphs(prev => {
      const updated = [...prev];
      updated[index] = newText;
      setHistory(prev => [...prev, paragraphs]);
      return updated;
    });
  };

  return (
    <HelmetProvider>
    <div className="app-container" style={{ padding: '20px' }}>
      <Helmet>
          <html lang={language} />
          <title>
            {language === 'sk' 
              ? 'VoxEdit: Prirodzeným Jazykom Ovládaný Textový Editor' 
              : 'VoxEdit: Natural Language Driven Text Editor'}
          </title>
        </Helmet>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <div style={{ background: '#eee', padding: '5px', borderRadius: '8px', display: 'flex', gap: '5px' }}>
          <button 
            onClick={() => setLanguage('sk')}
            style={{ background: language === 'sk' ? '#007bff' : 'white', color: language === 'sk' ? 'white' : 'black' }}
          >
            SK
          </button>
          <button 
            onClick={() => setLanguage('en')}
            style={{ background: language === 'en' ? '#007bff' : 'white', color: language === 'en' ? 'white' : 'black' }}
          >
            EN
          </button>
        </div>
      </div>
      <h1 className="app-title"> {language === 'sk' ? 'VoxEdit: Prirodzeným Jazykom Ovládaný Textový Editor' : 'VoxEdit: Natural Language Driven Text Editor'} </h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <ApiKeyInput 
          value={apiKey} 
          onChange={setApiKey}  
          language={language}
          />
      </div>

      <div className="voice-controls-row" style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc',
        padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
          
          <SpeechWhisper 
            apiKey={apiKey} 
            onText={handleSubmitCommand} 
            language={language}
            setLivePreview={setLivePreview}
          />

          <div style={{ flex: 1 }}>
            <CommandInput
              command={command}
              onChange={setCommand}
              onSubmit={handleSubmitForm}
              language={language}
            />
          </div>
        </div>

        {loading && (
          <div className="agent-loading-status" style={{ marginTop: '10px' }}>
            <span className="loader-spin">⏳</span> 
            <span style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 500 }}>
               {language === 'sk' ? 'AI spracúva ...' : 'AI processing ...'}
            </span>
          </div>
        )}
      </div>

      <main className="editor-workspace" style={{ width: '100%' }}>
        <EditorView 
          paragraphs={paragraphs} 
          currentIndex={currentIndex} 
          fontSize={fontSize} 
          onManualEdit={handleManualEdit}
          language={language}
        />
      </main>
    </div>
    </HelmetProvider>
  );
}