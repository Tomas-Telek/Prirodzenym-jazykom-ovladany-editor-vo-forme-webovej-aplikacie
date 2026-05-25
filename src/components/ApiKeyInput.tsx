type Props = {
  value: string;
  onChange: (v: string) => void;
  language: string;
};

export default function ApiKeyInput({ value, onChange, language }: Props) {
  return (
    <div className="api-key-container">
      <label className="api-key-label">
        <span>🔐</span>{language === 'sk' ? ' OpenAI API Kľúč:' : ' OpenAI API Key:'}
      </label>
      <input
        type="password"
        className="api-key-input"
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <small style={{ display: 'block', marginTop: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
        {language === 'sk' 
          ? 'Kľúč je uložený len lokálne v pamäti aplikácie.' 
          : 'The key is stored only locally in the application\'s memory.'}
      </small>
    </div>
  );
}
