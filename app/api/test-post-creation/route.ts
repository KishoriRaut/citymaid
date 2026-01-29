import { NextResponse } from 'next/server';
import { createPost } from '@/lib/posts';

export async function GET() {
  try {
    // Test creating a sample post
    const testPost = {
      post_type: "employee" as const,
      work: "Software Developer",
      time: "Full-time",
      place: "Kathmandu",
      salary: "Rs. 50,000 - 80,000",
      contact: "test@example.com",
      photo_url: null
    };
    
    const { post, error } = await createPost(testPost);

    return NextResponse.json({ 
      success: !!post,
      post,
      error,
      testData: testPost,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
