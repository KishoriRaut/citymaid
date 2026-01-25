/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabaseClient } from "./supabase-client";

// Comprehensive production database setup and data seeding
export async function setupProductionDatabase() {
  console.log("🚀 Starting PRODUCTION database setup...");
  
  const results = {
    success: false,
    steps: [] as string[],
    errors: [] as string[],
    postsInserted: 0,
    tablesCreated: [] as string[],
  };

  try {
    // Step 1: Check if posts table exists
    console.log("📋 Step 1: Checking posts table...");
    
    if (!supabaseClient) {
      return {
        success: false,
        error: "Supabase client not initialized - missing environment variables",
        step: 1
      };
    }
    
    const { count, error: tableCheckError } = await supabaseClient
      .from("posts")
      .select("*", { count: "exact", head: true });

    if (tableCheckError) {
      if (tableCheckError.code === "PGRST116") {
        results.errors.push("Posts table does not exist. Please run database migrations first.");
        return results;
      } else {
        results.errors.push(`Error checking posts table: ${tableCheckError.message}`);
        return results;
      }
    }

    results.steps.push(`✅ Posts table exists with ${count || 0} rows`);
    
    // Step 2: Insert comprehensive test data
    console.log("📝 Step 2: Inserting comprehensive production data...");
    
    const productionPosts = [
      // Approved Employer Posts
      {
        post_type: "employer",
        work: "Software Development",
        time: "Full-time",
        place: "Kathmandu",
        salary: "NPR 80,000 - 120,000",
        contact: "hiring@techcompany.com",
        photo_url: null,
        status: "approved",
        homepage_payment_status: "none",
        created_at: new Date().toISOString()
      },
      {
        post_type: "employer",
        work: "Digital Marketing",
        time: "Full-time",
        place: "Lalitpur",
        salary: "NPR 40,000 - 60,000",
        contact: "marketing@agency.com",
        photo_url: null,
        status: "approved",
        homepage_payment_status: "none",
        created_at: new Date().toISOString()
      },
      {
        post_type: "employer",
        work: "Graphic Design",
        time: "Part-time",
        place: "Pokhara",
        salary: "NPR 30,000 - 45,000",
        contact: "design@studio.com",
        photo_url: null,
        status: "approved",
        homepage_payment_status: "none",
        created_at: new Date().toISOString()
      },
      
      // Approved Employee Posts
      {
        post_type: "employee",
        work: "Web Development",
        time: "Full-time",
        place: "Kathmandu",
        salary: "NPR 60,000 - 90,000",
        contact: "john.developer@email.com",
        photo_url: null,
        status: "approved",
        homepage_payment_status: "none",
        created_at: new Date().toISOString()
      },
      {
        post_type: "employee",
        work: "Content Writing",
        time: "Remote",
        place: "Anywhere",
        salary: "NPR 25,000 - 40,000",
        contact: "writer@content.com",
        photo_url: null,
        status: "approved",
        homepage_payment_status: "none",
        created_at: new Date().toISOString()
      },
      {
        post_type: "employee",
        work: "Social Media Management",
        time: "Part-time",
        place: "Bhaktapur",
        salary: "NPR 20,000 - 35,000",
        contact: "social@manager.com",
        photo_url: null,
        status: "approved",
        homepage_payment_status: "none",
        created_at: new Date().toISOString()
      },
      
      // Pending Posts (for testing approval system)
      {
        post_type: "employer",
        work: "Data Science",
        time: "Full-time",
        place: "Kathmandu",
        salary: "NPR 100,000 - 150,000",
        contact: "data@company.com",
        photo_url: null,
        status: "pending",
        homepage_payment_status: "none",
        created_at: new Date().toISOString()
      },
      {
        post_type: "employee",
        work: "Mobile App Development",
        time: "Contract",
        place: "Patan",
        salary: "NPR 70,000 - 100,000",
        contact: "mobile@dev.com",
        photo_url: null,
        status: "pending",
        homepage_payment_status: "none",
        created_at: new Date().toISOString()
      }
    ];

    // Insert posts in batches to avoid timeouts
    const batchSize = 5;
    for (let i = 0; i < productionPosts.length; i += batchSize) {
      const batch = productionPosts.slice(i, i + batchSize);
      
      const { data, error } = await supabaseClient
        .from("posts")
        .insert(batch as any)
        .select();

      if (error) {
        results.errors.push(`Failed to insert batch ${i / batchSize + 1}: ${error.message}`);
        console.error(`Batch insert error:`, error);
      } else {
        results.postsInserted += data?.length || 0;
        results.steps.push(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length || 0} posts`);
        console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted:`, data);
      }
    }

    // Step 3: Verify the data was inserted
    console.log("🔍 Step 3: Verifying inserted data...");
    const { count: finalCount, error: verifyError } = await supabaseClient
      .from("posts")
      .select("*", { count: "exact", head: true });

    if (verifyError) {
      results.errors.push(`Error verifying data: ${verifyError.message}`);
    } else {
      results.steps.push(`✅ Verification complete: ${finalCount} total posts in database`);
    }

    // Step 4: Check approved posts specifically
    const { count: approvedCount, error: approvedError } = await supabaseClient
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    if (approvedError) {
      results.errors.push(`Error checking approved posts: ${approvedError.message}`);
    } else {
      results.steps.push(`✅ Approved posts: ${approvedCount} (these will show on homepage)`);
    }

    // Step 5: Test the actual query that the homepage uses
    console.log("🧪 Step 5: Testing homepage query...");
    const { data: testData, error: testError } = await supabaseClient
      .from("posts")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10);

    if (testError) {
      results.errors.push(`Homepage query test failed: ${testError.message}`);
    } else {
      results.steps.push(`✅ Homepage query test: ${testData?.length || 0} posts returned`);
      if (testData && testData.length > 0) {
        results.steps.push(`✅ Sample post: ${(testData[0] as any).work} - ${(testData[0] as any).place}`);
      }
    }

    results.success = results.errors.length === 0 && results.postsInserted > 0;

    if (results.success) {
      results.steps.push("🎉 PRODUCTION DATABASE SETUP COMPLETE!");
      results.steps.push("✅ Your homepage should now show posts");
      results.steps.push("🔄 Refresh your Vercel page to see the posts");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.errors.push(`Unexpected error during setup: ${errorMessage}`);
    console.error("Production setup error:", error);
  }

  console.log("🎯 Production setup results:", results);
  return results;
}

// Quick fix for immediate data insertion
export async function quickFixProductionData() {
  console.log("⚡ Quick fix: Inserting minimal production data...");
  
  const quickPosts = [
    {
      post_type: "employer",
      work: "Software Development",
      time: "Full-time",
      place: "Kathmandu",
      salary: "NPR 80,000 - 120,000",
      contact: "quick@fix.com",
      photo_url: null,
      status: "approved",
      homepage_payment_status: "none",
      created_at: new Date().toISOString()
    },
    {
      post_type: "employee",
      work: "Web Design",
      time: "Part-time",
      place: "Pokhara",
      salary: "NPR 40,000 - 60,000",
      contact: "designer@quick.com",
      photo_url: null,
      status: "approved",
      homepage_payment_status: "none",
      created_at: new Date().toISOString()
    }
  ];

  try {
    if (!supabaseClient) {
      return {
        success: false,
        error: "Supabase client not initialized - missing environment variables",
        step: 4
      };
    }
    
    const { data, error } = await supabaseClient
      .from("posts")
      .insert(quickPosts as any)
      .select();

    if (error) {
      console.error("Quick fix failed:", error);
      return { success: false, error: error.message };
    } else {
      console.log("✅ Quick fix successful:", data);
      return { 
        success: true, 
        postsInserted: data?.length || 0,
        message: "Quick fix complete! Refresh your page to see posts."
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Quick fix error:", error);
    return { success: false, error: errorMessage };
  }
}
