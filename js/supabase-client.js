// Project Settings > API. SUPABASE_ANON_KEY is the "Publishable" key —
// safe to expose here. Never put the "Secret" or "service_role" key here.
var SUPABASE_URL = "https://rblwdsqxqvettacwzemq.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_fMJSyCAlBKVAlKXPkM02TQ_s23nW72E";

var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
