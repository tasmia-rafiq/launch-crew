'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export function TagsInput({ value = [], onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    if (!tag.trim() || value.includes(tag.trim())) return;
    onChange([...value, tag.trim()]);
    setInput('');
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleKeyDown = (e: { key: string; preventDefault: () => void; }) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="startup-form_input !py-1 border border-muted rounded-lg flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-ring">
      {value.map((tag, index) => (
        <Badge key={index} variant="default" className="flex items-center gap-1 h-[28px] !text-white">
          {tag}
          <button type="button" onClick={() => removeTag(index)} className="ml-1 cursor-pointer">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        id="tags"
        name="tags"
        className="!px-0 !text-[14px] !text-[#414141] font-medium placeholder:text-black-300 border-none focus-visible:ring-0 flex-1 min-w-[100px]"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tags and press enter"
      />
    </div>
  );
}