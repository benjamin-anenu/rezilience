import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-sm border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        {language && (
          <span className="font-mono text-xs text-muted-foreground">{language}</span>
        )}
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-muted-foreground">{code}</code>
      </pre>
    </div>
  );
}
