"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shuffle, RefreshCw } from "lucide-react";

interface AvatarPickerProps {
  value?: string;
  onChange: (avatarUrl: string) => void;
  seed?: string;
  className?: string;
}

const avatarStyles = [
  { key: "lorelei", name: "Lorelei", description: "Illustrated women" },
  { key: "avataaars", name: "Avataaars", description: "Cartoon avatars" },
  { key: "open-peeps", name: "Open Peeps", description: "Hand-drawn illustrations" },
  { key: "personas", name: "Personas", description: "Abstract faces" },
  { key: "big-smile", name: "Big Smile", description: "Colorful faces" },
  { key: "fun-emoji", name: "Fun Emoji", description: "Emoji-style avatars" },
  { key: "pixel-art", name: "Pixel Art", description: "8-bit style" },
  { key: "bottts", name: "Bottts", description: "Robot avatars" },
  { key: "thumbs", name: "Thumbs", description: "Thumbs up/down" },
  { key: "micah", name: "Micah", description: "Modern portraits" },
  { key: "notionists", name: "Notionists", description: "Notion-style avatars" },
  { key: "adventurer", name: "Adventurer", description: "Adventure characters" },
];

export default function AvatarPicker({ value: _value, onChange, seed = "", className }: AvatarPickerProps) {
  const [selectedStyle, setSelectedStyle] = useState("lorelei");
  const [currentSeed, setCurrentSeed] = useState(seed || "anonymous-user");
  const [avatarSvg, setAvatarSvg] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAvatar = useCallback(async (styleName: string, seedValue: string, shouldTriggerOnChange = true) => {
    setIsGenerating(true);
    try {
      // Use our own API endpoint to generate avatars server-side
      const response = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          style: styleName,
          seed: seedValue,
          size: 128
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate avatar');
      }
      
      const data = await response.json();
      setAvatarSvg(data.svg);
      
      // Store the data URI for the form
      if (shouldTriggerOnChange) {
        onChange(data.dataUri);
      }

    } catch (error) {
      console.error("Error generating avatar:", error);
      // Fallback to a simple placeholder
      const fallbackSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="60" fill="#e5e7eb"/>
        <circle cx="64" cy="48" r="20" fill="#9ca3af"/>
        <path d="M24 96 Q24 80 40 80 L88 80 Q104 80 104 96 L104 128 L24 128 Z" fill="#9ca3af"/>
      </svg>`;
      setAvatarSvg(fallbackSvg);
      
      if (shouldTriggerOnChange) {
        onChange(`data:image/svg+xml;base64,${btoa(fallbackSvg)}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Generate initial avatar on component mount
  useEffect(() => {
    generateAvatar(selectedStyle, currentSeed, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle style changes
  const handleStyleChange = (styleName: string) => {
    setSelectedStyle(styleName);
    generateAvatar(styleName, currentSeed, true);
  };

  // Handle seed changes
  const handleRandomize = () => {
    const randomSeed = Math.random().toString(36).substring(2, 15);
    setCurrentSeed(randomSeed);
    generateAvatar(selectedStyle, randomSeed, true);
  };

  const handleRefresh = () => {
    generateAvatar(selectedStyle, currentSeed, true);
  };

  return (
    <Card className={`${className} bg-white border border-gray-200`}>
      <CardHeader className="bg-white rounded-t-lg">
        <CardTitle className="text-lg">Choose Your Avatar</CardTitle>
        <CardDescription>
          Select a style and generate a unique avatar. Your avatar helps create a friendly, anonymous identity.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 bg-white rounded-b-lg">
        {/* Avatar Preview */}
        <div className="flex justify-center">
          <div className="relative">
            {avatarSvg ? (
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-lg overflow-hidden bg-white flex items-center justify-center">
                <div 
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: avatarSvg }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                <RefreshCw className={`h-8 w-8 text-gray-400 ${isGenerating ? 'animate-spin' : ''}`} />
              </div>
            )}
          </div>
        </div>

        {/* Style Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Avatar Style</Label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {avatarStyles.map((style) => (
              <Button
                key={style.key}
                variant={selectedStyle === style.key ? "default" : "outline"}
                className={`justify-start text-left h-auto py-2 px-3 transition-all ${
                  selectedStyle === style.key 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700" 
                    : "hover:bg-white hover:border-muted-foreground/50 bg-white"
                }`}
                onClick={() => handleStyleChange(style.key)}
                disabled={isGenerating}
              >
                <div>
                  <div className="font-medium text-sm">{style.name}</div>
                  <div className={`text-xs ${
                    selectedStyle === style.key 
                      ? "text-white/80" 
                      : "text-muted-foreground"
                  }`}>{style.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleRandomize}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
          >
            <Shuffle className="h-4 w-4" />
            Randomize
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Current Selection Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Style: <span className="font-medium">{avatarStyles.find(s => s.key === selectedStyle)?.name}</span></p>
          <p className="text-xs mt-1">
            Avatars are generated using your profile data to create a consistent, anonymous identity
          </p>
        </div>
      </CardContent>
    </Card>
  );
}