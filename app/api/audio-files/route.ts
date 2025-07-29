import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const audioDir = join(process.cwd(), 'public', 'audio', 'ambient')
    const files = await readdir(audioDir)
    
    // Filter for audio files only
    const audioFiles = files.filter(file => {
      const ext = file.toLowerCase()
      return ext.endsWith('.mp3') || 
             ext.endsWith('.wav') || 
             ext.endsWith('.ogg') || 
             ext.endsWith('.m4a') ||
             ext.endsWith('.flac')
    })
    
    return NextResponse.json(audioFiles)
  } catch (error) {
    console.error('Error reading audio directory:', error)
    return NextResponse.json([], { status: 500 })
  }
} 