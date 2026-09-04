import { hasSupabaseConfig, isDemoMode } from "@/lib/config";
export async function GET(){return Response.json({status:"ok",service:"social-growth-os",phase:"1-auth-persistence",demoMode:isDemoMode(),authConfigured:hasSupabaseConfig(),databaseConfigured:Boolean(process.env.DATABASE_URL),timestamp:new Date().toISOString()})}
