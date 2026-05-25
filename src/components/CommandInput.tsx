import React from "react";

type Props = {
  command: string;
  onChange: (s: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  language: string;
};

export default function CommandInput({ command, onChange, onSubmit, language }: Props) {
  return (
    <form onSubmit={onSubmit} className="command-form">
      <label className="command-label">
        {language === 'sk' ? 'Ručné zadanie príkazu:' : 'Command Interface:'}
      </label>
      
      <textarea
        className="command-textarea"
        placeholder={language === 'sk' ? "Skúste: 'Prejsť na nasledujúci odsek' alebo 'Zväčšiť text'..." : "Try: 'Go to the next paragraph' or 'Make text bigger'..."}
        value={command}
        onChange={(e) => onChange(e.target.value)}
      />

      <div style={{ textAlign: 'right' }}>
        <button type="submit" className="submit-button">
          {language === 'sk' ? 'Odoslať' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
