import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = "Ketik dan tekan Enter atau koma untuk menambah tag...",
  disabled = false,
  className = "",
  maxTags,
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      if (!maxTags || value.length < maxTags) {
        onChange([...value, trimmedTag]);
      }
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Check if user typed a comma
    if (inputValue.includes(",")) {
      const tags = inputValue.split(",");
      const newTags = tags.slice(0, -1); // All except the last one
      const remainingInput = tags[tags.length - 1]; // The last one after comma
      
      // Add all valid tags
      newTags.forEach(tag => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !value.includes(trimmedTag)) {
          if (!maxTags || value.length < maxTags) {
            onChange([...value, trimmedTag]);
          }
        }
      });
      
      setInputValue(remainingInput);
    } else {
      setInputValue(inputValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(value.length - 1);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Display existing tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge
              key={index}
              className="px-2 py-1 text-sm flex items-center gap-1 hover:bg-secondary/80 bg-secondary text-secondary-foreground"
            >
              <span>{tag}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Input field */}
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled || (maxTags ? value.length >= maxTags : false)}
      />
      
      {/* Helper text */}
      <div className="text-xs text-muted-foreground">
        {maxTags && (
          <span className="mr-2">
            {value.length}/{maxTags} tag{value.length !== 1 ? 's' : ''}
          </span>
        )}
        <span>
          Tekan Enter atau gunakan koma (,) untuk menambah tag
        </span>
      </div>
    </div>
  );
}; 