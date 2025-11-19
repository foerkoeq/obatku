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

// Badge color variants for tags
const badgeColors = [
  "bg-blue-500 text-white hover:bg-blue-600",
  "bg-purple-500 text-white hover:bg-purple-600",
  "bg-indigo-500 text-white hover:bg-indigo-600",
  "bg-teal-500 text-white hover:bg-teal-600",
  "bg-emerald-500 text-white hover:bg-emerald-600",
  "bg-amber-500 text-white hover:bg-amber-600",
  "bg-rose-500 text-white hover:bg-rose-600",
  "bg-cyan-500 text-white hover:bg-cyan-600",
  "bg-violet-500 text-white hover:bg-violet-600",
  "bg-fuchsia-500 text-white hover:bg-fuchsia-600",
];

export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = "Ketik dan tekan Enter atau koma untuk menambah tag...",
  disabled = false,
  className = "",
  maxTags,
}) => {
  const [inputValue, setInputValue] = useState("");

  // Ensure value is always an array
  const tags = Array.isArray(value) ? value : [];

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (!maxTags || tags.length < maxTags) {
        onChange([...tags, trimmedTag]);
      }
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Check if user typed a comma
    if (inputValue.includes(",")) {
      const inputTags = inputValue.split(",");
      const newTags = inputTags.slice(0, -1); // All except the last one
      const remainingInput = inputTags[inputTags.length - 1]; // The last one after comma
      
      // Collect all new valid tags
      const tagsToAdd: string[] = [];
      newTags.forEach(tag => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !tags.includes(trimmedTag) && !tagsToAdd.includes(trimmedTag)) {
          tagsToAdd.push(trimmedTag);
        }
      });
      
      // Add all valid tags at once
      if (tagsToAdd.length > 0) {
        const updatedTags = [...tags, ...tagsToAdd];
        const limitedTags = maxTags ? updatedTags.slice(0, maxTags) : updatedTags;
        onChange(limitedTags);
      }
      
      setInputValue(remainingInput);
    } else {
      setInputValue(inputValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags.length - 1);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Display existing tags with colored badges */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => {
            // Assign color based on index
            const colorClass = badgeColors[index % badgeColors.length];
            
            return (
              <Badge
                key={`${tag}-${index}`}
                className={`px-3 py-1.5 text-sm flex items-center gap-2 transition-all duration-200 border-0 ${colorClass}`}
              >
                <span className="font-medium">{tag}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(index);
                  }}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
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
        disabled={disabled || (maxTags ? tags.length >= maxTags : false)}
      />
      
      {/* Helper text */}
      <div className="text-xs text-muted-foreground">
        {maxTags && (
          <span className="mr-2">
            {tags.length}/{maxTags} tag{tags.length !== 1 ? 's' : ''}
          </span>
        )}
        <span>
          Tekan Enter atau gunakan koma (,) untuk menambah tag
        </span>
      </div>
    </div>
  );
}; 