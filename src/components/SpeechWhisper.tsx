import { useState, useEffect, useRef } from "react";

export default function SpeechWhisper({ apiKey, onText, language, setLivePreview }: any) {
  const [isListening, setIsListening] = useState(false);
  const vadRef = useRef<any>(null);
  const queueRef = useRef(Promise.resolve());

 
  const langRef = useRef(language);
  const onTextRef = useRef(onText);
  const livePreviewRef = useRef(setLivePreview);
  const apiKeyRef = useRef(apiKey);

  
  useEffect(() => {
    langRef.current = language;
    onTextRef.current = onText;
    livePreviewRef.current = setLivePreview;
    apiKeyRef.current = apiKey;
  }, [language, onText, setLivePreview, apiKey]);

  
  async function processAudio(audioBlob: Blob) {
    if (!apiKeyRef.current) return;

    queueRef.current = queueRef.current.then(async () => {

      const totalStart = performance.now();
    
      const currentLang = langRef.current;
      const currentOnText = onTextRef.current;
      const currentPreview = livePreviewRef.current;
      const currentApiKey = apiKeyRef.current;


      if (currentLang === 'sk') {
        currentPreview("AI premýšľa..."); 
      } else {
        currentPreview("AI is thinking..."); 
      }

      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");
      formData.append("model", "whisper-1");
      formData.append("language", currentLang); 

      try {
        const sttStart = performance.now();
        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${currentApiKey}` },
          body: formData,
        });
        const data = await response.json();

        const sttEnd = performance.now();

        const sttDuration = Math.round(sttEnd - sttStart);

        if (data.text && data.text.trim().length > 0) {

          await currentOnText(data.text); 

          const totalDuration = Math.round(performance.now() - totalStart);
          console.log(`Transcription: "${data.text}" (STT: ${sttDuration}ms, Total: ${totalDuration}ms)`);
        }
      } catch (err) {
        console.error("Whisper Error:", err);
      } finally {
        currentPreview("");
      }
    });
  }

  useEffect(() => {
    let active = true;

    async function initVAD() {
      try {
        if (vadRef.current) return; 

        // @ts-ignore
        const { MicVAD } = window.vad;

        const myVad = await MicVAD.new({
          startOnLoad: false,
          redemptionMs: 1000,
          baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-lib@0.0.19/dist/",
          onSpeechEnd: (audio: Float32Array) => {
            // @ts-ignore
            const wavBuffer = window.vad.utils.encodeWAV(audio);
            const blob = new Blob([wavBuffer], { type: "audio/wav" });
            
            
            processAudio(blob);
          },
        });

        if (active) {
          vadRef.current = myVad;
        }
      } catch (e) {
        console.error("VAD init error:", e);
      }
    }

    initVAD();

    return () => {
      active = false;
      if (vadRef.current) vadRef.current.pause();
    };
  }, []);

   const toggleListening = async () => {

    if (!vadRef.current) return;

    if (isListening) {

      await vadRef.current.pause();

      setIsListening(false);

    } else {

      await vadRef.current.start();

      setIsListening(true);

    }

  }; 

  return (
    <div className="voice-control-wrapper">
      <button 
        onClick={toggleListening}
        className={`record-button ${isListening ? 'recording' : 'idle'}`}
      >
        <span>{isListening ? '⏹' : '🎤'}</span>
        {isListening ? (
          language === 'sk' ? ' Zastav AI poslúchanie' : ' Stop AI Listening'
        ) : (
          language === 'sk' ? ' Začni AI poslúchanie' : ' Start AI Listening'
        )}
      </button>

      <div className="status-area">
        {isListening && (
          <span className="status-text" style={{ color: '#ef4444' }}>
            {language === 'sk' ? 'AI poslúcha...' : 'AI is listening continuously...'}
          </span>
        )}
      </div>
    </div>
  );
}