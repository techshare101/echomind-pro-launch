// Test Firebase connection
// Run this to verify Firebase is properly configured

import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export async function testFirebaseConnection() {
  try {
    console.log("🔥 Testing Firebase connection...");
    
    // Try to read from a test collection
    const snapshot = await getDocs(collection(db, "test"));
    
    console.log("✅ Firestore connection success!");
    console.log(`📊 Found ${snapshot.size} documents in 'test' collection`);
    
    return {
      success: true,
      documentCount: snapshot.size,
      message: "Firebase connected successfully"
    };
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    return {
      success: false,
      error: error.message,
      message: "Firebase connection failed"
    };
  }
}

// Auto-run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFirebaseConnection().then(result => {
    console.log("\n📋 Test Result:", result);
  });
}
