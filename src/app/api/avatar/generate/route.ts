import { NextRequest, NextResponse } from 'next/server';
import { createAvatar } from '@dicebear/core';
import { 
  lorelei, 
  avataaars, 
  openPeeps, 
  personas, 
  bigSmile, 
  funEmoji, 
  pixelArt, 
  bottts, 
  thumbs, 
  micah,
  notionists,
  adventurer
} from '@dicebear/collection';

const styleMap = {
  'lorelei': lorelei,
  'avataaars': avataaars,
  'open-peeps': openPeeps,
  'personas': personas,
  'big-smile': bigSmile,
  'fun-emoji': funEmoji,
  'pixel-art': pixelArt,
  'bottts': bottts,
  'thumbs': thumbs,
  'micah': micah,
  'notionists': notionists,
  'adventurer': adventurer,
};

export async function POST(request: NextRequest) {
  try {
    const { style, seed, size = 128 } = await request.json();
    
    if (!style || !seed) {
      return NextResponse.json(
        { error: 'Style and seed are required' },
        { status: 400 }
      );
    }

    const avatarStyle = styleMap[style as keyof typeof styleMap];
    if (!avatarStyle) {
      return NextResponse.json(
        { error: 'Invalid avatar style' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avatar = createAvatar(avatarStyle as any, {
      seed,
      size,
      // Add some common options for better variety
      backgroundColor: ['b6e3f4', 'c0aede', 'ffdfbf', 'd1d4f9', 'ffd5dc'],
    });

    const svg = avatar.toString();
    const dataUri = await avatar.toDataUri();

    return NextResponse.json({
      svg,
      dataUri,
      seed,
      style
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate avatar' },
      { status: 500 }
    );
  }
}