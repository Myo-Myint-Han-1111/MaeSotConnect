"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shuffle, RefreshCw, Upload, ExternalLink, X } from "lucide-react";
import { compressAvatarImage, validateImageFile } from "@/lib/imageCompression";

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
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [avatarMode, setAvatarMode] = useState<"generated" | "uploaded">("generated");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateAvatar = useCallback(async (styleName: string, seedValue: string, shouldTriggerOnChange = true) => {
    setIsGenerating(true);
    try {
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
      
      if (shouldTriggerOnChange) {
        onChange(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.svg)}`);
      }

    } catch (error) {
      console.error("Error generating avatar:", error);
      
      const fallbackSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="60" fill="#e5e7eb"/>
        <circle cx="64" cy="48" r="20" fill="#9ca3af"/>
        <path d="M24 96 Q24 80 40 80 L88 80 Q104 80 104 96 L104 128 L24 128 Z" fill="#9ca3af"/>
      </svg>`;
      setAvatarSvg(fallbackSvg);
      
      if (shouldTriggerOnChange) {
        onChange(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [onChange]);

  useEffect(() => {
    generateAvatar(selectedStyle, currentSeed, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStyleChange = (styleName: string) => {
    setSelectedStyle(styleName);
    generateAvatar(styleName, currentSeed, true);
  };

  const handleRandomize = () => {
    const randomSeed = Math.random().toString(36).substring(2, 15);
    setCurrentSeed(randomSeed);
    generateAvatar(selectedStyle, randomSeed, true);
  };

  const handleRefresh = () => {
    generateAvatar(selectedStyle, currentSeed, true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    
    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setIsUploading(true);
    
    try {
      const compressionResult = await compressAvatarImage(file, 400, 0.8, 200);

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
        setAvatarMode("uploaded");
        onChange(dataUrl);
      };
      reader.readAsDataURL(compressionResult.file);

    } catch (error) {
      setUploadError("Failed to process image. Please try again.");
      console.error("Image upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveUpload = () => {
    setUploadedImage("");
    setAvatarMode("generated");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange(avatarSvg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg)}` : "");
  };

  const handleDiceBearEditor = () => {
    window.open("https://editor.dicebear.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <Card className={`${className} bg-white border border-gray-200`}>
      <CardHeader className="bg-white rounded-t-lg">
        <CardTitle className="text-lg">Choose Your Avatar</CardTitle>
        <CardDescription>
          Select a style and generate a unique avatar, or upload your own photo. You can also create custom avatars using the DiceBear editor. Your avatar helps create a friendly, anonymous identity.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 bg-white rounded-b-lg">
        <div className="flex gap-2 max-w-md mx-auto">
          <Button
            variant={avatarMode === "generated" ? "default" : "outline"}
            onClick={() => {
              setAvatarMode("generated");
              if (avatarSvg) {
                onChange(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg)}`);
              }
            }}
            className={`flex-1 ${
              avatarMode === "generated" 
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                : "hover:bg-white"
            }`}
          >
            Generated Avatar
          </Button>
          <Button
            variant={avatarMode === "uploaded" ? "default" : "outline"}
            onClick={() => setAvatarMode("uploaded")}
            className={`flex-1 ${
              avatarMode === "uploaded" 
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                : "hover:bg-white"
            }`}
          >
            Custom Avatar
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="relative">
            {avatarMode === "uploaded" && uploadedImage ? (
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-lg overflow-hidden bg-white">
                <Image 
                  src={uploadedImage} 
                  alt="Uploaded avatar" 
                  fill
                  className="object-cover"
                  sizes="128px"
                />
                <Button
                  onClick={handleRemoveUpload}
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : avatarMode === "generated" && avatarSvg ? (
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-lg overflow-hidden bg-white flex items-center justify-center">
                <div 
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: avatarSvg }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                <RefreshCw className={`h-8 w-8 text-gray-400 ${isGenerating || isUploading ? 'animate-spin' : ''}`} />
              </div>
            )}
          </div>
        </div>

        {avatarMode === "uploaded" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Your Photo</Label>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-white max-w-xs mx-auto"
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? "Processing..." : "Choose File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP. Max size: 50MB (will be compressed automatically)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Or Use DiceBear Avatar Editor</Label>
              <div className="space-y-2">
                <Button
                  onClick={handleDiceBearEditor}
                  variant="outline"
                  className="flex items-center gap-2 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:text-white transition-colors max-w-xs mx-auto"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open DiceBear Editor
                </Button>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Instructions:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Click the button above to open DiceBear editor</li>
                    <li>Customize your avatar with different styles and options</li>
                    <li>Download the avatar as PNG or SVG to your device</li>
                    <li>Return here and use &quot;Choose File&quot; to upload your custom avatar</li>
                  </ol>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                {uploadError}
              </div>
            )}
          </div>
        )}

        {avatarMode === "generated" && (
          <>
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

            <div className="flex gap-2 justify-center max-w-xs mx-auto">
              <Button
                onClick={handleRandomize}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 flex-1"
              >
                <Shuffle className="h-4 w-4" />
                Randomize
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isGenerating}
                className="flex items-center gap-2 flex-1"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </>
        )}

        {avatarMode === "generated" && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Style: <span className="font-medium">{avatarStyles.find(s => s.key === selectedStyle)?.name}</span></p>
            <p className="text-xs mt-1">
              Avatars are generated using your profile data to create a consistent, anonymous identity
            </p>
          </div>
        )}

        {avatarMode === "uploaded" && uploadedImage && (
          <div className="text-center text-sm text-muted-foreground">
            <p className="text-xs">
              Your uploaded photo has been compressed and optimized automatically
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}