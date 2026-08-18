// Fill these in from your Supabase project: Project Settings > API
// SUPABASE_ANON_KEY is the public "anon" key — safe to expose here.
// Never put the "service_role" key in this file.
var SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
var SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
