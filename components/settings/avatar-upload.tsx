'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';

interface AvatarUploadProps {
  value: string;
  onChange: (value: string | File) => void;
  className?: string;
}

const AvatarUpload = ({ value, onChange, className }: AvatarUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const imageSrc = preview || value;

  return (
    <div className={`relative ${className}`}>
      <Avatar className="w-full h-full">
        <AvatarImage src={imageSrc} />
        <AvatarFallback>
          <Camera className="w-1/2 h-1/2 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute bottom-0 right-0 rounded-full"
        onClick={handleUploadClick}
      >
        <Camera className="w-4 h-4" />
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AvatarUpload; 