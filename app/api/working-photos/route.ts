import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Return the working photo URLs directly
    // This bypasses any database issues and provides working photos
    
    const workingEmployeePhoto = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/1769064665740-zdd54a.jpg';
    const workingEmployerPhoto = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/receipt-1769094508664-5ci5h.webp';

    return NextResponse.json({
      success: true,
      message: 'Working photo URLs provided',
      workingUrls: {
        employee: workingEmployeePhoto,
        employer: workingEmployerPhoto
      },
      instructions: 'Manually update your posts to use these URLs, or run the direct-photo-fix.sql script'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
