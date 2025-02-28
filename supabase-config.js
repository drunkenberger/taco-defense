// Supabase configuration
// IMPORTANT: Replace these values with your actual Supabase project URL and anon key
// You can find these in your Supabase project dashboard under Settings > API
const SUPABASE_URL = 'https://hfipedffscpbybhjprxn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmaXBlZGZmc2NwYnliaGpwcnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2OTA5NjgsImV4cCI6MjA1NjI2Njk2OH0.fXFVZi43IdfyvZPMsMB-uBMOBYSYErnIHvkHeCp82Vw';

// SETUP INSTRUCTIONS:
// 1. Create a new Supabase project at https://supabase.com
// 2. In the SQL editor, create a leaderboard table with the following SQL:
/*
CREATE TABLE public.leaderboard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  email TEXT,
  game_version TEXT,
  date_submitted TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster sorting by score
CREATE INDEX leaderboard_score_idx ON public.leaderboard (score DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read the leaderboard
CREATE POLICY "Allow public read access" ON public.leaderboard
  FOR SELECT USING (true);

-- Create a policy that allows anyone to insert into the leaderboard
CREATE POLICY "Allow public insert access" ON public.leaderboard
  FOR INSERT WITH CHECK (true);
*/
// 3. Replace the SUPABASE_URL and SUPABASE_KEY constants above with your project values
// 4. Enjoy your new leaderboard functionality!

// Initialize Supabase client
let supabaseClient;

// Initialize Supabase when the window loads
window.addEventListener('load', () => {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase client initialized');
    
    // Load the leaderboard initially
    fetchLeaderboard();
  } else {
    console.error('Supabase library not loaded');
  }
});

// Fetch leaderboard data from Supabase
async function fetchLeaderboard() {
  if (!supabaseClient) {
    console.error('Supabase client not initialized');
    return [];
  }
  
  try {
    console.log('Fetching leaderboard data from Supabase...');
    const { data, error } = await supabaseClient
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    console.log('Leaderboard data:', data);
    return data || [];
  } catch (err) {
    console.error('Exception fetching leaderboard:', err);
    return [];
  }
}

// Submit a score to the leaderboard
async function submitScore(playerName, score, email) {
  if (!supabaseClient) {
    console.error('Supabase client not initialized');
    return false;
  }
  
  // Validate inputs
  if (!playerName || playerName.trim() === '') {
    playerName = 'Anonymous';
  }
  
  if (typeof score !== 'number' || score < 0) {
    console.error('Invalid score:', score);
    return false;
  }
  
  try {
    console.log(`Submitting score: ${playerName}, ${score}, email: ${email || 'none'}`);
    const { data, error } = await supabaseClient
      .from('leaderboard')
      .insert([
        { 
          player_name: playerName.trim(),
          score: score,
          email: email && email.trim() !== '' ? email.trim() : null,
          game_version: '1.0',
          date_submitted: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error submitting score:', error);
      return false;
    }
    
    console.log('Score submitted successfully:', data);
    
    // Reload the leaderboard
    const leaderboardData = await fetchLeaderboard();
    
    // If we have a global function to update the leaderboard display, call it
    if (typeof updateLeaderboardDisplay === 'function') {
      updateLeaderboardDisplay(leaderboardData);
    }
    
    return true;
  } catch (err) {
    console.error('Exception submitting score:', err);
    return false;
  }
}

// Share score on Twitter
function shareOnTwitter(playerName, score) {
  const text = `I just fed ${score} chupacabras in Taco Defense! Can you beat my score? #TacoDefense #tocesnearme`;
  const url = window.location.href;
  
  // Open Twitter share dialog
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank', 'width=550,height=420');
}

// Share score on Facebook
function shareOnFacebook(playerName, score) {
  const url = window.location.href;
  
  // Open Facebook share dialog
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'width=550,height=420');
}

// Remove the duplicate event listeners that conflict with the ones in sketch.js
// Initialize share buttons only if they don't have event listeners yet
document.addEventListener('DOMContentLoaded', () => {
  const twitterButton = document.getElementById('twitter-share');
  const facebookButton = document.getElementById('facebook-share');
  
  // Only add event listeners if they don't already exist from sketch.js
  if (twitterButton && !twitterButton._hasClickListener) {
    twitterButton.addEventListener('click', () => {
      shareOnTwitter(window.playerName || 'Anonymous', window.gameScore || 0);
    });
    twitterButton._hasClickListener = true;
  }
  
  if (facebookButton && !facebookButton._hasClickListener) {
    facebookButton.addEventListener('click', () => {
      shareOnFacebook(window.playerName || 'Anonymous', window.gameScore || 0);
    });
    facebookButton._hasClickListener = true;
  }
}); 