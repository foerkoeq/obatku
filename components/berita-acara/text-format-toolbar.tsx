'use client';

import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, Underline } from 'lucide-react';
import type { BATextFormat } from '@/lib/types/berita-acara';
import { cn } from '@/lib/utils';

interface TextFormatToolbarProps {
  format: BATextFormat;
  onChange: (format: BATextFormat) => void;
  className?: string;
}

export const TextFormatToolbar: React.FC<TextFormatToolbarProps> = ({
  format,
  onChange,
  className,
}) => {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-md border p-0.5', className)}>
      <Toggle
        size="sm"
        variant="outline"
        pressed={format.bold}
        onPressedChange={(pressed) => onChange({ ...format, bold: pressed })}
        aria-label="Bold"
        className="h-6 w-6 p-0 border-0"
      >
        <Bold className="h-3 w-3" />
      </Toggle>
      <Toggle
        size="sm"
        variant="outline"
        pressed={format.italic}
        onPressedChange={(pressed) => onChange({ ...format, italic: pressed })}
        aria-label="Italic"
        className="h-6 w-6 p-0 border-0"
      >
        <Italic className="h-3 w-3" />
      </Toggle>
      <Toggle
        size="sm"
        variant="outline"
        pressed={format.underline}
        onPressedChange={(pressed) => onChange({ ...format, underline: pressed })}
        aria-label="Underline"
        className="h-6 w-6 p-0 border-0"
      >
        <Underline className="h-3 w-3" />
      </Toggle>
    </div>
  );
};
