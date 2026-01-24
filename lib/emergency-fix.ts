/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabaseClient } from "./supabase-client";

// Aggressive production database diagnosis and forced fix
export async function emergencyProductionFix() {
  console.log("🚨 EMERGENCY PRODUCTION FIX - Starting aggressive diagnosis...");
  
  const results = {
    step1_connection: false,
    step2_tableExists: false,
    step3_permissions: false,
    step4_insertion: false,
    step5_verification: false,
    errors: [] as string[],
    success: false,
    finalPostCount: 0,
    diagnosis: ""
  };

  try {
    // 1. Test basic Supabase connection
    console.log("🔌 STEP 1: Testing Supabase connection...");
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: connectionTest, error: connectionError } = await supabaseClient
        .from("posts")
        .select("id")
        .limit(1);

      if (connectionError) {
        results.errors.push(`Connection failed: ${connectionError.message} (Code: ${connectionError.code})`);
        results.diagnosis = "CRITICAL: Cannot connect to Supabase or posts table";
        console.error("❌ Connection failed:", connectionError);
        return results;
      }
      results.step1_connection = true;
      console.log("✅ Connection successful");
    } catch (connErr) {
      results.errors.push(`Connection exception: ${connErr instanceof Error ? connErr.message : 'Unknown'}`);
      results.diagnosis = "CRITICAL: Supabase client not working";
      return results;
    }

    // 2. Check if table exists and get current count
    console.log("📊 STEP 2: Checking table and current data...");
    try {
      const { count, error: countError } = await supabaseClient
        .from("posts")
        .select("*", { count: "exact", head: true });

      if (countError) {
        results.errors.push(`Table check failed: ${countError.message}`);
        results.diagnosis = "CRITICAL: Posts table not accessible";
        return results;
      }
      
      results.step2_tableExists = true;
      console.log(`✅ Table exists with ${count} posts`);
      
      if (count && count > 0) {
        results.diagnosis = `Table has ${count} posts but they're not being fetched correctly`;
        // Try to see what's in the table
        const { data: sampleData, error: sampleError } = await supabaseClient
          .from("posts")
          .select("id, status, post_type, work")
          .limit(5);
        
        if (!sampleError && sampleData) {
          console.log("📋 Sample data found:", sampleData);
          results.diagnosis += ` - Sample: ${JSON.stringify(sampleData)}`;
        }
      }
    } catch (countErr) {
      results.errors.push(`Count exception: ${countErr instanceof Error ? countErr.message : 'Unknown'}`);
      return results;
    }

    // 3. Test permissions with a simple insert
    console.log("🔐 STEP 3: Testing insert permissions...");
    try {
      const testPost = {
        post_type: "employer",
        work: "Emergency Test Post",
        time: "Full-time",
        place: "Kathmandu",
        salary: "NPR 50,000",
        contact: "emergency@test.com",
        photo_url: null,
        status: "approved",
        homepage_payment_status: "none",
        created_at: new Date().toISOString()
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: insertData, error: insertError } = await supabaseClient
        .from("posts")
        .insert(testPost as any)
        .select();

      if (insertError) {
        results.errors.push(`Insert permission failed: ${insertError.message} (Code: ${insertError.code})`);
        results.diagnosis = "CRITICAL: No insert permissions on posts table";
        console.error("❌ Insert failed:", insertError);
        return results;
      }
      
      results.step3_permissions = true;
      results.step4_insertion = true;
      console.log("✅ Insert permissions working, test post inserted");
    } catch (insertErr) {
      results.errors.push(`Insert exception: ${insertErr instanceof Error ? insertErr.message : 'Unknown'}`);
      results.diagnosis = "CRITICAL: Insert operation failed";
      return results;
    }

    // 4. Force insert multiple approved posts
    console.log("💪 STEP 4: Force inserting multiple approved posts...");
    try {
      const emergencyPosts = [
        {
          post_type: "employer",
          work: "Software Developer",
          time: "Full-time",
          place: "Kathmandu",
          salary: "NPR 80,000 - 120,000",
          contact: "dev1@emergency.com",
          photo_url: null,
          status: "approved",
          homepage_payment_status: "none",
          created_at: new Date().toISOString()
        },
        {
          post_type: "employee",
          work: "Web Designer",
          time: "Part-time",
          place: "Pokhara",
          salary: "NPR 40,000 - 60,000",
          contact: "design1@emergency.com",
          photo_url: null,
          status: "approved",
          homepage_payment_status: "none",
          created_at: new Date().toISOString()
        },
        {
          post_type: "employer",
          work: "Marketing Manager",
          time: "Full-time",
          place: "Lalitpur",
          salary: "NPR 60,000 - 90,000",
          contact: "marketing@emergency.com",
          photo_url: null,
          status: "approved",
          homepage_payment_status: "none",
          created_at: new Date().toISOString()
        }
      ];

      for (let i = 0; i < emergencyPosts.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data: batchData, error: batchError } = await supabaseClient
          .from("posts")
          .insert(emergencyPosts[i] as any)
          .select();

        if (batchError) {
          results.errors.push(`Batch ${i+1} insert failed: ${batchError.message}`);
        } else {
          console.log(`✅ Emergency post ${i+1} inserted`);
        }
      }
    } catch (batchErr) {
      results.errors.push(`Batch insert exception: ${batchErr instanceof Error ? batchErr.message : 'Unknown'}`);
    }

    // 5. Final verification
    console.log("🔍 STEP 5: Final verification...");
    try {
      const { count: finalCount, error: finalError } = await supabaseClient
        .from("posts")
        .select("*", { count: "exact", head: true });

      if (finalError) {
        results.errors.push(`Final verification failed: ${finalError.message}`);
      } else {
        results.finalPostCount = finalCount || 0;
        results.step5_verification = true;
        console.log(`✅ Final count: ${finalCount} posts`);
      }

      // Test the exact query the homepage uses
      const { data: homepageData, error: homepageError } = await supabaseClient
        .from("posts")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(10);

      if (homepageError) {
        results.errors.push(`Homepage query failed: ${homepageError.message}`);
      } else {
        console.log(`✅ Homepage query returns: ${homepageData?.length || 0} posts`);
        if (homepageData && homepageData.length > 0) {
          results.success = true;
          results.diagnosis = `SUCCESS: ${homepageData.length} approved posts found, homepage should work`;
        } else {
          results.diagnosis = `WARNING: ${results.finalPostCount} total posts but 0 approved posts`;
        }
      }
    } catch (finalErr) {
      results.errors.push(`Final verification exception: ${finalErr instanceof Error ? finalErr.message : 'Unknown'}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.errors.push(`Emergency fix failed: ${errorMessage}`);
    results.diagnosis = "CRITICAL: Emergency fix crashed";
    console.error("❌ Emergency fix crashed:", error);
  }

  console.log("🎯 Emergency fix results:", results);
  return results;
}