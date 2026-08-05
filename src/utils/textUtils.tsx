import React from 'react';

export function cleanMarkdownSymbols(text: string | null | undefined): string {
  if (!text) return '';
  let cleaned = text;

  // Convert any remaining Devanagari digits to English digits
  const devanagariDigits = '०१२३४५६७८९';
  const englishDigits = '0123456789';
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replace(new RegExp(devanagariDigits[i], 'g'), englishDigits[i]);
  }

  // Remove Markdown headings: #, ##, ###, ####, etc.
  cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');

  // Remove bold / italic markdown formatting: ***text***, **text**, *text*, ___text___, __text__, _text_
  cleaned = cleaned.replace(/[\*_]{3}(.*?)[\*_]{3}/g, '$1');
  cleaned = cleaned.replace(/[\*_]{2}(.*?)[\*_]{2}/g, '$1');
  cleaned = cleaned.replace(/[\*_]{1}(.*?)[\*_]{1}/g, '$1');

  // Strip remaining standalone asterisks, underscores, backticks
  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/\*/g, '');
  cleaned = cleaned.replace(/__/g, '');
  cleaned = cleaned.replace(/_/g, '');
  cleaned = cleaned.replace(/`/g, '');

  // Strip blockquote markers
  cleaned = cleaned.replace(/^>\s*/gm, '');

  // Convert bullet list hyphens or asterisks at start of lines into clean bullet points '• '
  cleaned = cleaned.replace(/^[\-\*]\s+/gm, '• ');

  return cleaned.trim();
}

interface CleanFormattedTextProps {
  content: string;
  className?: string;
}

export const CleanFormattedText: React.FC<CleanFormattedTextProps> = ({ content, className = '' }) => {
  const sanitized = cleanMarkdownSymbols(content);
  const lines = sanitized.split('\n');

  return (
    <div className={`space-y-2 ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        // Check if line looks like a section header (e.g. "1. Header", "Header:")
        const isHeader = /^\d+\.\s+[^\:]+$/i.test(trimmed) || (/^[^\:\.\,\!\?]{3,45}\:$/i.test(trimmed) && !trimmed.includes('•'));

        if (isHeader) {
          return (
            <h4 key={idx} className="font-serif font-bold text-[#D4AF37] text-sm sm:text-base mt-3 mb-1">
              {trimmed}
            </h4>
          );
        }

        if (trimmed.startsWith('•')) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2 my-0.5">
              <span className="text-[#D4AF37] font-bold text-xs shrink-0 mt-0.5">•</span>
              <span className="leading-relaxed">{trimmed.substring(1).trim()}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};
