import { db, usersTable, clubsTable, clubLeadersTable, eventsTable, enrollmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

async function seed() {
  console.log("Seeding ClubHub database...");

  const today = new Date();

  // ---------------------------------------------------------------------------
  // Users
  //   dev@clubhub.edu  → Multi-Club Leader (leads CS Club + Math Union)
  //   alice@clubhub.edu → Single Club Leader (leads Robotics Team only)
  //   bob@clubhub.edu   → Student (enrolled in clubs, no leadership role)
  // ---------------------------------------------------------------------------
  await db.insert(usersTable).values([
    { email: "dev@clubhub.edu",   full_name: "Dev User",       graduation_year: 2027 },
    { email: "alice@clubhub.edu", full_name: "Alice Johnson",  graduation_year: 2025 },
    { email: "bob@clubhub.edu",   full_name: "Bob Smith",      graduation_year: 2026 },
  ]).onConflictDoNothing();

  const allUsers = await db.select().from(usersTable);
  const devUser = allUsers.find(u => u.email === "dev@clubhub.edu")!;
  const alice   = allUsers.find(u => u.email === "alice@clubhub.edu")!;
  const bob     = allUsers.find(u => u.email === "bob@clubhub.edu")!;

  if (!devUser) { console.error("dev user missing — aborting"); return; }
  console.log(`Users ready: ${allUsers.length} total`);

  // ---------------------------------------------------------------------------
  // Clubs  (8 clubs across all 5 types)
  // ---------------------------------------------------------------------------
  const clubRows = [
    // Academic / STEM
    {
      name: "Computer Science Club",
      description: "Weekly coding challenges, hackathons, tech talks, and open-source contributions for every skill level.",
      type: "Club", initial: "C", default_day: "Wednesday",
      default_location: "Tech Building 101",
      chat_link: "https://discord.gg/csc", profile_photo: "",
      creator_user_id: devUser.id,
    },
    {
      name: "Math Union",
      description: "Competition prep, proof exploration, and olympiad problem-solving for students who love math beyond the syllabus.",
      type: "Union", initial: "M", default_day: "Friday",
      default_location: "Math Hall 204",
      chat_link: "https://discord.gg/mathunion", profile_photo: "",
      creator_user_id: devUser.id,
    },
    // Athletics
    {
      name: "Robotics Team",
      description: "We design, build, and program autonomous robots for regional and national FIRST Robotics competitions.",
      type: "Team", initial: "R", default_day: "Tuesday",
      default_location: "Engineering Lab B",
      chat_link: "", profile_photo: "",
      creator_user_id: alice?.id ?? devUser.id,
    },
    {
      name: "Basketball Team",
      description: "Intramural and inter-school basketball. Open try-outs each semester — all skill levels welcome.",
      type: "Team", initial: "B", default_day: "Thursday",
      default_location: "Main Gymnasium",
      chat_link: "", profile_photo: "",
      creator_user_id: alice?.id ?? devUser.id,
    },
    // Arts & Culture
    {
      name: "Photography Club",
      description: "From golden-hour walks to darkroom printing — portrait, landscape, and street photography for all.",
      type: "Club", initial: "P", default_day: "Thursday",
      default_location: "Arts Center Studio",
      chat_link: "", profile_photo: "",
      creator_user_id: alice?.id ?? devUser.id,
    },
    {
      name: "Drama & Theatre Society",
      description: "Two major productions per year plus improv nights, acting workshops, and backstage technical crew opportunities.",
      type: "Club", initial: "D", default_day: "Monday",
      default_location: "Black Box Theatre",
      chat_link: "https://discord.gg/drama", profile_photo: "",
      creator_user_id: bob?.id ?? devUser.id,
    },
    // Professional / Service
    {
      name: "Student Government",
      description: "The elected voice of the student body — representing interests, planning events, and shaping school policy.",
      type: "Committee", initial: "S", default_day: "Monday",
      default_location: "Main Office Conference Room",
      chat_link: "https://discord.gg/stugov", profile_photo: "",
      creator_user_id: bob?.id ?? devUser.id,
    },
    {
      name: "Environmental Action Club",
      description: "Campus clean-ups, tree-planting drives, recycling campaigns, and advocacy for sustainable school policy.",
      type: "Club", initial: "E", default_day: "Wednesday",
      default_location: "Science Building Courtyard",
      chat_link: "", profile_photo: "",
      creator_user_id: bob?.id ?? devUser.id,
    },
  ];

  await db.insert(clubsTable).values(clubRows).onConflictDoNothing();

  const allClubs = await db.select().from(clubsTable);
  const find = (name: string) => allClubs.find(c => c.name === name)!;

  const csClub   = find("Computer Science Club");
  const math     = find("Math Union");
  const robotics = find("Robotics Team");
  const bball    = find("Basketball Team");
  const photo    = find("Photography Club");
  const drama    = find("Drama & Theatre Society");
  const stuGov   = find("Student Government");
  const envClub  = find("Environmental Action Club");

  console.log(`Clubs ready: ${allClubs.length} total`);

  // ---------------------------------------------------------------------------
  // Leaders
  //   devUser  → CS Club (President) + Math Union (President)  = multi-leader
  //   alice    → Robotics Team (Captain) + Basketball (Captain) = multi-leader  
  //   bob      → Student Government (President) + Drama (Director) + Env (Chair)
  // ---------------------------------------------------------------------------
  const leaderRows = [
    // devUser leads two STEM clubs
    ...(csClub   ? [{ club_id: csClub.id,   user_id: devUser.id, name: "Dev User",      role: "President",  email: "dev@clubhub.edu"   }] : []),
    ...(math     ? [{ club_id: math.id,     user_id: devUser.id, name: "Dev User",      role: "President",  email: "dev@clubhub.edu"   }] : []),
    // alice leads two athletic/hobby clubs
    ...(robotics ? [{ club_id: robotics.id, user_id: alice?.id ?? devUser.id, name: "Alice Johnson", role: "Team Captain", email: "alice@clubhub.edu" }] : []),
    ...(bball    ? [{ club_id: bball.id,    user_id: alice?.id ?? devUser.id, name: "Alice Johnson", role: "Team Captain", email: "alice@clubhub.edu" }] : []),
    // bob leads three clubs (student government, drama, environment)
    ...(stuGov   ? [{ club_id: stuGov.id,   user_id: bob?.id ?? devUser.id,   name: "Bob Smith",     role: "President",   email: "bob@clubhub.edu"   }] : []),
    ...(drama    ? [{ club_id: drama.id,    user_id: bob?.id ?? devUser.id,   name: "Bob Smith",     role: "Director",    email: "bob@clubhub.edu"   }] : []),
    ...(envClub  ? [{ club_id: envClub.id,  user_id: bob?.id ?? devUser.id,   name: "Bob Smith",     role: "Club Chair",  email: "bob@clubhub.edu"   }] : []),
    // photo club: alice as president (co-lead with devUser as VP)
    ...(photo    ? [
      { club_id: photo.id, user_id: alice?.id ?? devUser.id, name: "Alice Johnson", role: "President",        email: "alice@clubhub.edu" },
      { club_id: photo.id, user_id: devUser.id,              name: "Dev User",      role: "Vice President",   email: "dev@clubhub.edu"   },
    ] : []),
  ];

  if (leaderRows.length > 0) {
    await db.insert(clubLeadersTable).values(leaderRows).onConflictDoNothing();
    console.log(`Leaders ready: ${leaderRows.length} rows`);
  }

  // ---------------------------------------------------------------------------
  // Enrollments
  //   devUser → CS Club, Math Union, Photography (member of clubs he also leads)
  //   alice   → Robotics Team, Basketball, Photography
  //   bob     → Student Government, Environmental Action (clubs he leads),
  //             + CS Club and Photography as a regular member
  // ---------------------------------------------------------------------------
  const enrollRows = [
    ...(csClub   ? [
      { user_id: devUser.id, club_id: csClub.id },
      { user_id: bob?.id   ?? devUser.id, club_id: csClub.id },
    ] : []),
    ...(math     ? [{ user_id: devUser.id, club_id: math.id }] : []),
    ...(robotics ? [
      { user_id: alice?.id ?? devUser.id, club_id: robotics.id },
    ] : []),
    ...(bball    ? [
      { user_id: alice?.id ?? devUser.id, club_id: bball.id },
    ] : []),
    ...(photo    ? [
      { user_id: devUser.id,              club_id: photo.id },
      { user_id: alice?.id ?? devUser.id, club_id: photo.id },
      { user_id: bob?.id   ?? devUser.id, club_id: photo.id },
    ] : []),
    ...(stuGov   ? [{ user_id: bob?.id ?? devUser.id, club_id: stuGov.id }] : []),
    ...(envClub  ? [{ user_id: bob?.id ?? devUser.id, club_id: envClub.id }] : []),
    ...(drama    ? [{ user_id: bob?.id ?? devUser.id, club_id: drama.id }] : []),
  ];

  if (enrollRows.length > 0) {
    await db.insert(enrollmentsTable).values(enrollRows).onConflictDoNothing();
    console.log(`Enrollments ready: ${enrollRows.length} rows`);
  }

  // ---------------------------------------------------------------------------
  // Events  — 14 events spread across the next 30 days
  // ---------------------------------------------------------------------------
  const eventRows = [
    // CS Club — Wed meetings + extra sessions
    ...(csClub ? [
      { club_id: csClub.id, title: "Weekly Coding Challenge",        event_date: addDays(today,  0), event_time: "15:00", location: "Tech Building 101",          description: "This week: dynamic programming patterns. Prizes for top 3 solvers." },
      { club_id: csClub.id, title: "Intro to Machine Learning",      event_date: addDays(today,  7), event_time: "15:00", location: "Tech Building 101",          description: "Guest lecture from a senior ML engineer at Google DeepMind." },
      { club_id: csClub.id, title: "Spring Hackathon Kickoff",       event_date: addDays(today, 14), event_time: "09:00", location: "Innovation Hub",             description: "48-hour hackathon — form your teams and register before noon!" },
    ] : []),

    // Math Union — Fri sessions + special lecture
    ...(math ? [
      { club_id: math.id, title: "AMC Problem Solving Session",      event_date: addDays(today,  3), event_time: "13:00", location: "Math Hall 204",              description: "Working through AMC 10/12 past papers — solutions discussed live." },
      { club_id: math.id, title: "Guest Lecture: Number Theory",     event_date: addDays(today, 17), event_time: "13:00", location: "Math Hall 204",              description: "Professor Chen on prime factorization and cryptographic applications." },
    ] : []),

    // Robotics Team — Tue build sessions + competition
    ...(robotics ? [
      { club_id: robotics.id, title: "Robot Build Session",          event_date: addDays(today,  2), event_time: "14:00", location: "Engineering Lab B",          description: "Assembly and testing of the autonomous navigation module." },
      { club_id: robotics.id, title: "Regional Competition Prep",    event_date: addDays(today,  9), event_time: "14:00", location: "Engineering Lab B",          description: "Final dry-run before the regional FIRST Robotics qualifiers." },
      { club_id: robotics.id, title: "Regional Qualifier — Day 1",   event_date: addDays(today, 23), event_time: "08:00", location: "District Sports Complex",    description: "Competition day! Spectators welcome — wear your school colours." },
    ] : []),

    // Basketball Team — Thu practices + scrimmage
    ...(bball ? [
      { club_id: bball.id, title: "Weekly Practice",                  event_date: addDays(today,  4), event_time: "16:00", location: "Main Gymnasium",            description: "Fundamentals drills and 3-on-3 scrimmage. Bring water." },
      { club_id: bball.id, title: "Inter-School Scrimmage",           event_date: addDays(today, 18), event_time: "15:00", location: "Main Gymnasium",            description: "Friendly scrimmage vs Westbrook High. Open to student spectators." },
    ] : []),

    // Photography Club — Thur workshops + walk
    ...(photo ? [
      { club_id: photo.id, title: "Golden Hour Campus Walk",          event_date: addDays(today,  1), event_time: "17:00", location: "Front Quad",                description: "Capture campus at golden hour. Any camera welcome — phone is fine!" },
      { club_id: photo.id, title: "Portrait Lighting Workshop",       event_date: addDays(today,  8), event_time: "16:00", location: "Arts Center Studio",        description: "Three-point lighting setups for dramatic portraits. Bring a model!" },
    ] : []),

    // Drama Society — Mon rehearsals
    ...(drama ? [
      { club_id: drama.id, title: "Spring Play Auditions",            event_date: addDays(today,  5), event_time: "15:30", location: "Black Box Theatre",         description: "Open auditions for our spring production. No experience needed." },
      { club_id: drama.id, title: "Improv Comedy Night",              event_date: addDays(today, 19), event_time: "18:00", location: "Black Box Theatre",         description: "Drop-in improv games — audience participation encouraged!" },
    ] : []),

    // Student Government — Mon general meeting
    ...(stuGov ? [
      { club_id: stuGov.id, title: "Monthly General Meeting",         event_date: addDays(today,  6), event_time: "12:00", location: "Main Office Conference Room", description: "Budget review, upcoming Spring Fair planning, and open Q&A." },
    ] : []),

    // Environmental Action — Wed clean-up
    ...(envClub ? [
      { club_id: envClub.id, title: "Campus Clean-Up Day",            event_date: addDays(today, 10), event_time: "09:00", location: "Main Campus",               description: "Gloves and bags provided. Refreshments served after." },
      { club_id: envClub.id, title: "Sustainability Panel Discussion", event_date: addDays(today, 25), event_time: "13:00", location: "Science Building Courtyard", description: "Local environmentalists discuss zero-waste campus initiatives." },
    ] : []),
  ];

  if (eventRows.length > 0) {
    await db.insert(eventsTable).values(eventRows).onConflictDoNothing();
    console.log(`Events ready: ${eventRows.length} rows`);
  }

  // ---------------------------------------------------------------------------
  // Summary — use Drizzle select so we get properly typed results
  // ---------------------------------------------------------------------------
  const users  = await db.select().from(usersTable);
  const clubs  = await db.select().from(clubsTable);
  const events = await db.select().from(eventsTable);

  console.log("\n✅ Seed complete!");
  console.log(`   Users: ${users.length}`);
  console.log(`   Clubs: ${clubs.length}`);
  console.log(`   Events: ${events.length}`);
  console.log("\nDev login → dev@clubhub.edu (multi-leader: CS Club + Math Union + Photography VP)");
  console.log("alice@clubhub.edu → single leader: Robotics Team + Basketball Team captain");
  console.log("bob@clubhub.edu   → student: enrolled in CS Club, Photography, Student Gov, Env Club, Drama");
}

seed().catch(err => { console.error(err); process.exit(1); }).finally(() => process.exit(0));
