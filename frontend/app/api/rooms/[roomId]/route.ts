import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    // Await the params Promise to get the actual params object
    const { roomId } = await params;

    // Validate roomId
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('collaborative-editor');
    
    // Find the room - the timeout is handled by the MongoDB client configuration
    const room = await db.collection('rooms').findOne({ roomId: roomId });
    
    // Instead of returning 404, return empty room data for new rooms (200 OK)
    return NextResponse.json(
      room || { 
        content: '', 
        language: 'javascript', 
        lastEditedAt: new Date(), 
        lastEditedBy: '' 
      }, 
      { status: 200 }
    );
  } catch (error) {
    const err = error as { message?: string; name?: string } | Error | unknown;
    console.error('Failed to load room:', error);
    // Check if it's a timeout/network error to return a more appropriate response
    if (err && typeof err === 'object' && 
        'name' in err && ((err as { name: string }).name === 'MongoNetworkError' || 
                         (err as { name: string }).name === 'MongoNetworkTimeoutError')) {
      return NextResponse.json({ error: 'Database timeout' }, { status: 408 });
    }
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    // Await the params Promise to get the actual params object
    const { roomId } = await params;

    // Validate roomId - ensure it's a proper string
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 });
    }

    const { content, language = 'javascript', username } = await request.json();
    
    // Normalize line endings to ensure consistency across platforms
    const normalizedContent = typeof content === 'string' 
      ? content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      : content;
    
    const client = await clientPromise;
    const db = client.db('collaborative-editor');
    const now = new Date();
    
    // Update with timeout handled by MongoDB client configuration
    await db.collection('rooms').updateOne(
      { roomId: roomId },
      {
        $set: { content: normalizedContent, language, lastEditedAt: now, lastEditedBy: username },
        $setOnInsert: { 
          createdAt: now,
          roomId: roomId  // Use roomId field instead of _id
        },
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as { message?: string; name?: string } | Error | unknown;
    console.error('Failed to save room:', error);
    // Check if it's a timeout/network error to return a more appropriate response
    if (err && typeof err === 'object' && 
        'name' in err && ((err as { name: string }).name === 'MongoNetworkError' || 
                         (err as { name: string }).name === 'MongoNetworkTimeoutError')) {
      return NextResponse.json({ error: 'Database timeout' }, { status: 408 });
    }
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}