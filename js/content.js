// ════════════════════════════════════════════════════════════
//  ORBIT — Content Library
//  Quotes · Study Tips · Science Facts · Breathing Insights
// ════════════════════════════════════════════════════════════

const CONTENT = {

  quotes: [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Gandhi" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "What we learn with pleasure, we never forget.", author: "Alfred Mercier" },
    { text: "Nothing is particularly hard if you divide it into small jobs.", author: "Henry Ford" },
    { text: "The secret of success is to do common things uncommonly well.", author: "John D. Rockefeller" },
    { text: "You are never too old to set another goal or dream a new dream.", author: "C.S. Lewis" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
    { text: "Strive for progress, not perfection.", author: "Unknown" },
    { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
    { text: "You don't have to see the whole staircase, just take the first step.", author: "MLK Jr." },
    { text: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison" },
    { text: "The secret to getting ahead is getting started.", author: "Agatha Christie" },
    { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
    { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
    { text: "Focus on the journey, not the destination.", author: "Greg Anderson" },
    { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
    { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
    { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
    { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
    { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  ],

  studyTips: [
    "Testing yourself on material beats rereading it by 50%.",
    "Studying in multiple locations improves long-term recall.",
    "The Pomodoro Technique was invented in 1987 by Francesco Cirillo.",
    "Spacing your study sessions across days triples retention.",
    "Teaching a concept to someone else is the fastest way to understand it.",
    "Handwriting notes beats typing for deeper comprehension.",
    "Your brain consolidates memories during sleep — rest is not laziness.",
    "Interleaving subjects (switching between them) improves mastery.",
    "The first 20 minutes after waking are ideal for reviewing hard material.",
    "Reading aloud to yourself improves retention by up to 25%.",
    "Color coding activates a different memory pathway than plain text.",
    "Brief 10-minute walks between sessions improve focus significantly.",
    "Explaining concepts in simple language reveals gaps in your understanding.",
    "Mind maps engage spatial memory — use them for complex topics.",
    "Drinking water before studying can improve cognitive performance by 14%.",
    "Background music at 60–70 BPM can improve study concentration.",
    "Flashcards work because retrieval practice strengthens neural pathways.",
    "The 80/20 rule: 20% of concepts typically cover 80% of exam questions.",
    "Summarizing each page you read forces active engagement with the material.",
    "Study before sleep — your hippocampus replays the day's learning at night.",
    "A cluttered desk creates cognitive friction — clear space, clear mind.",
    "The 'generation effect': creating your own examples beats memorizing given ones.",
    "Chewing gum while studying can improve test performance modestly.",
    "Anxiety about exams shrinks working memory — breathing resets this.",
    "Short study sessions with breaks outperform marathon sessions.",
    "Asking 'why' and 'how' questions deepens understanding beyond surface facts.",
    "Overlearning (studying past the point of knowing) builds confidence.",
    "The testing effect works even if you get the answer wrong — trying matters.",
    "Predict exam questions yourself before studying — it focuses attention.",
    "Environment-dependent memory: study in conditions similar to your exam.",
  ],

  scienceFacts: [
    "Your brain has approximately 86 billion neurons.",
    "Neurons can fire up to 200 times per second.",
    "The human brain uses roughly 20% of the body's total energy.",
    "Sleep deprivation of 24 hours impairs cognition like being legally drunk.",
    "Memory is not stored in one place — it's a reconstruction across brain networks.",
    "Exercise increases BDNF, a protein that literally grows new brain cells.",
    "The hippocampus is the brain's memory indexer — stress shrinks it.",
    "Memories are reconsolidated each time you recall them — they change slightly.",
    "The prefrontal cortex, seat of focus, isn't fully formed until age 25.",
    "REM sleep is when emotional memories are processed and integrated.",
    "Dopamine is a learning signal, not just a pleasure chemical.",
    "Flow states suppress activity in the self-referential part of your brain.",
    "Blue light delays melatonin production by up to 3 hours.",
    "The amygdala hijacks prefrontal focus during high stress.",
    "Context-dependent memory: same room can cue forgotten information.",
    "Your brain generates roughly 12–25 watts of electricity while active.",
    "Multitasking reduces IQ by about 10 points temporarily.",
    "The brain cannot distinguish between a real and vividly imagined experience.",
    "Deep breathing directly activates the parasympathetic nervous system.",
    "Music activates more areas of the brain simultaneously than any other stimulus.",
    "The default mode network (daydreaming) is involved in memory consolidation.",
    "Cold water on the face triggers the dive reflex, slowing heart rate.",
    "Emotions are processed 100 times faster than conscious thought.",
    "The brain's plasticity allows new neural pathways to form at any age.",
    "Spaced repetition exploits the 'forgetting curve' discovered in 1885.",
    "Stress hormones block the transfer of information to long-term memory.",
    "Curiosity primes the brain's reward circuits to encode learning better.",
    "Your working memory can hold about 4 chunks of information at once.",
    "Laughter genuinely increases alertness and short-term memory.",
    "Physical movement triggers cross-hemispheric brain activity.",
  ],

  breathingInsights: [
    "4-7-8 breathing activates your vagus nerve, calming the nervous system.",
    "Six breaths per minute is the optimal rate for heart rate variability.",
    "Box breathing is used by Navy SEALs to stay calm under pressure.",
    "Nasal breathing produces nitric oxide, which improves oxygen absorption.",
    "Slow exhales lower heart rate faster than slow inhales.",
    "Breath is the only autonomic function you can consciously control.",
    "Deep breathing reduces cortisol levels within minutes.",
    "Ancient yogic texts describe breath as the bridge between mind and body.",
    "Carbon dioxide sensitivity — not oxygen — is what makes you feel breathless.",
    "Coherent breathing (5 seconds in, 5 out) syncs brain and heart rhythms.",
    "Holding your breath briefly after exhale extends the calm response.",
    "Diaphragmatic breathing massages the vagus nerve along your torso.",
    "Athletes who breathe through the nose outperform those who mouth-breathe.",
    "A single deep breath can interrupt an anxiety spiral at the neural level.",
    "Breathing exercises predate meditation — found in records 5,000 years old.",
    "Slow breathing lowers blood pressure comparably to medication in some studies.",
    "Humming while exhaling activates additional vagal pathways.",
    "The left nostril connects to the right brain hemisphere and vice versa.",
    "Your breath rate changes before you consciously feel stressed.",
    "Breathwork before sleep can improve dream recall and REM quality.",
  ],

  challengeEndings: [
    { type: "challenge", text: "Can you complete one uninterrupted 25-minute session right now?", subtext: "Put your phone face down. One task. Begin." },
    { type: "challenge", text: "Write down the one thing you need to understand today.", subtext: "Not a list. Just one thing. Go." },
    { type: "challenge", text: "Open your notes before you open anything else.", subtext: "The first five minutes decide the next fifty." },
    { type: "challenge", text: "Set a timer for 25 minutes and close every tab but one.", subtext: "You are more capable than you think." },
    { type: "challenge", text: "Name the hardest topic you've been avoiding.", subtext: "Start there. Resistance is a compass." },
    { type: "challenge", text: "Drink a glass of water and sit back down.", subtext: "The ritual matters. Show up." },
    { type: "challenge", text: "Can you reach page 10 before you take your next break?", subtext: "Small commitments build momentum." },
  ],

  cosmicMessages: [
    "You just spent three minutes choosing your mind over the noise.\nThat is rare. That is enough.",
    "The stars don't hurry.\nNeither should you — but they do keep moving.",
    "Every concept you learn tonight\nwas once unknown to every human alive.",
    "Rest is not the opposite of work.\nIt is the reason work becomes great.",
    "You are somewhere between who you were\nand who you are becoming.",
    "The universe is 13.8 billion years old.\nYour exam is in a few weeks.\nBreathe.",
    "Small and consistent\nbeats brilliant and sporadic.\nEvery time.",
    "You orbited a star for three minutes.\nNow go orbit the page.",
    "The break is over.\nThe work is the meditation.",
    "Stillness is not emptiness.\nIt is preparation.",
  ],

  endTips: [
    "Try the 2-minute rule: if starting feels hard, commit to just 2 minutes.",
    "Put your phone in another room before your next session.",
    "A glass of water now will help you focus in 10 minutes.",
    "Review your hardest topic first — willpower is highest at the start.",
    "Write the one sentence that best captures what you'll study next.",
    "Pomodoro: 25 minutes on. 5 minutes off. One concept at a time.",
    "Before you begin, close every tab that isn't your work.",
    "The resistance you feel before starting is just resistance — it passes.",
    "Set a clear intention: what will you know by the end of this session?",
    "Five focused minutes is worth more than an hour of distracted reading.",
  ],

  fragmentInsights: [
    "Sleep consolidates memory.",
    "Testing beats rereading.",
    "Spacing improves retention.",
    "Curiosity triggers dopamine.",
    "Breath lowers cortisol.",
    "Small steps compound.",
    "Focus is choosing what to ignore.",
    "Motion activates the brain.",
    "Rest is part of the work.",
    "Repetition builds pathways.",
    "One task at a time.",
    "The brain learns in sleep.",
    "Write to understand.",
    "Confusion precedes clarity.",
    "Mistakes accelerate learning.",
    "Calm is a skill.",
    "Every expert was once lost.",
    "Start before you're ready.",
    "Deep work requires deep rest.",
    "Boredom is the door to flow.",
    "Your attention is finite. Spend it well.",
    "Hard things become easy through repetition.",
    "Progress is not always visible.",
    "The present moment is enough.",
    "Exhale slowly. Reset completely.",
  ],

  // ── Utility ─────────────────────────────────────────────────

  getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  getRandomFragment() {
    return this.getRandom(this.fragmentInsights);
  },

  getEndingCard() {
    const roll = Math.random();
    if (roll < 0.30) {
      // Quote
      const q = this.getRandom(this.quotes);
      return { type: 'quote', label: 'A Thought', text: `"${q.text}"`, author: `— ${q.author}` };
    } else if (roll < 0.50) {
      // Study tip
      const t = this.getRandom(this.studyTips);
      return { type: 'studytip', label: 'Study Insight', text: t, author: '' };
    } else if (roll < 0.65) {
      // Science fact
      const f = this.getRandom(this.scienceFacts);
      return { type: 'fact', label: 'Science', text: f, author: '' };
    } else if (roll < 0.78) {
      // Breathing insight
      const b = this.getRandom(this.breathingInsights);
      return { type: 'breath', label: 'Breathing Science', text: b, author: '' };
    } else if (roll < 0.90) {
      // Challenge
      const c = this.getRandom(this.challengeEndings);
      return { type: 'challenge', label: 'Your Challenge', text: c.text, author: c.subtext };
    } else {
      // Cosmic
      const m = this.getRandom(this.cosmicMessages);
      return { type: 'cosmic', label: 'From the Cosmos', text: m, author: '' };
    }
  },

  getEndTip() {
    return this.getRandom(this.endTips);
  }
};
