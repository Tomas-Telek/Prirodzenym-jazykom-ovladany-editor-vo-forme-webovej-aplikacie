import { useEffect, useRef } from "react";
import "../index.css";

type Props = {
  paragraphs: string[];
  currentIndex: number;
  fontSize?: number;
  onManualEdit: (index: number, newText: string) => void;
};

export default function EditorView({ paragraphs, currentIndex, fontSize, onManualEdit}: Props) {
  const activeParagraphRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeParagraphRef.current) {
      activeParagraphRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  return (
    <div className="editor-container">
      
      <div className="blocks-wrapper">
        {paragraphs.map((p, i) => {
          const isActive = i === currentIndex;
          
          return (
            <div
              key={i}
              ref={isActive ? activeParagraphRef : null}
              className={`paragraph-block ${isActive ? "active" : ""}`}
              style={{ 
                fontSize: fontSize, 
                display: 'flex',      // Zabezpečí, že číslo a text sú vedľa seba
                alignItems: 'flex-start', 
                gap: '12px' 
              }}
            >
              
              <span 
                className="paragraph-number" 
                style={{ userSelect: 'none', marginTop: '2px' }}
              >
                {i + 1}
              </span>
              

              <div
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="paragraph-content"
                style={{ 
                  flex: 1, 
                  outline: 'none',
                  minHeight: '1.5em',
                  color: p ? 'inherit' : '#ccc'
                }}
                onBlur={(e) => {
                  const newText = e.currentTarget.innerText;
                  if (newText !== p) {
                    onManualEdit(i, newText);
                  }
                }}
              >
                {p}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}