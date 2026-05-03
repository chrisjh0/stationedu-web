import { db, usersTable, clubsTable, clubLeadersTable, eventsTable, enrollmentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding ClubHub database...");

  // Create demo users
  const userRecords = await db.insert(usersTable).values([
    { email: "dev@clubhub.edu", full_name: "Dev User", graduation_year: 2027 },
    { email: "alice@clubhub.edu", full_name: "Alice Johnson", graduation_year: 2025 },
    { email: "bob@clubhub.edu", full_name: "Bob Smith", graduation_year: 2026 },
  ]).onConflictDoNothing().returning();

  console.log(`Inserted ${userRecords.length} users`);

  // Get all users
  const allUsers = await db.select().from(usersTable);
  const devUser = allUsers.find((u) => u.email === "dev@clubhub.edu")!;
  const alice = allUsers.find((u) => u.email === "alice@clubhub.edu")!;
  const bob = allUsers.find((u) => u.email === "bob@clubhub.edu")!;

  if (!devUser) {
    console.log("Dev user not found, aborting seed");
    return;
  }

  // Create demo clubs
  const clubData = [
    {
      name: "Computer Science Club",
      description: "A club for students passionate about programming, software development, and computer science theory. We host weekly coding challenges, hackathons, and tech talks.",
      type: "Club",
      initial: "C",
      default_day: "Wednesday",
      default_location: "Tech Building 101",
      chat_link: "https://discord.gg/csc",
      profile_photo: "",
      creator_user_id: devUser.id,
    },
    {
      name: "Robotics Team",
      description: "Our robotics team competes in regional and national competitions. We build autonomous robots and learn about mechanical engineering, electronics, and programming.",
      type: "Team",
      initial: "R",
      default_day: "Tuesday",
      default_location: "Engineering Lab B",
      chat_link: "",
      profile_photo: "",
      creator_user_id: alice?.id ?? devUser.id,
    },
    {
      name: "Student Government",
      description: "The voice of the student body. We represent student interests, plan campus events, and work with administration on school policy.",
      type: "Committee",
      initial: "S",
      default_day: "Monday",
      default_location: "Main Office Conference Room",
      chat_link: "https://discord.gg/stugov",
      profile_photo: "",
      creator_user_id: bob?.id ?? devUser.id,
    },
    {
      name: "Photography Club",
      description: "Explore the art of photography — from portrait to landscape to street photography. We organize photo walks, critiques, and exhibitions.",
      type: "Club",
      initial: "P",
      default_day: "Thursday",
      default_location: "Arts Center Studio",
      chat_link: "",
      profile_photo: "",
      creator_user_id: alice?.id ?? devUser.id,
    },
    {
      name: "Math Union",
      description: "Dedicated to mathematical exploration beyond the curriculum. We solve competition problems, explore proofs, and prepare for math olympiads.",
      type: "Union",
      initial: "M",
      default_day: "Friday",
      default_location: "Math Hall 204",
      chat_link: "https://discord.gg/mathunion",
      profile_photo: "",
      creator_user_id: devUser.id,
    },
    {
      name: "Environmental Action Club",
      description: "Working to make our campus and community more sustainable. We organize clean-up drives, tree planting events, and advocate for green school policies.",
      type: "Club",
      initial: "E",
      default_day: "Wednesday",
      default_location: "Science Building Courtyard",
      chat_link: "",
      profile_photo: "",
      creator_user_id: bob?.id ?? devUser.id,
    },
  ];

  const clubRecords = await db.insert(clubsTable).values(clubData).onConflictDoNothing().returning();
  console.log(`Inserted ${clubRecords.length} clubs`);

  // Get all clubs
  const allClubs = await db.select().from(clubsTable);
  const csClub = allClubs.find((c) => c.name === "Computer Science Club")!;
  const robotics = allClubs.find((c) => c.name === "Robotics Team")!;
  const stuGov = allClubs.find((c) => c.name === "Student Government")!;
  const photoClub = allClubs.find((c) => c.name === "Photography Club")!;
  const mathUnion = allClubs.find((c) => c.name === "Math Union")!;
  const envClub = allClubs.find((c) => c.name === "Environmental Action Club")!;

  // Create leaders
  const leadersData = [];
  if (csClub) {
    leadersData.push(
      { club_id: csClub.id, user_id: devUser.id, name: "Dev User", role: "President", email: "dev@clubhub.edu" },
      { club_id: csClub.id, user_id: alice?.id ?? null, name: "Alice Johnson", role: "Vice President", email: "alice@clubhub.edu" },
    );
  }
  if (robotics) {
    leadersData.push(
      { club_id: robotics.id, user_id: alice?.id ?? null, name: "Alice Johnson", role: "Team Captain", email: "alice@clubhub.edu" },
    );
  }
  if (stuGov) {
    leadersData.push(
      { club_id: stuGov.id, user_id: bob?.id ?? null, name: "Bob Smith", role: "President", email: "bob@clubhub.edu" },
    );
  }
  if (photoClub) {
    leadersData.push(
      { club_id: photoClub.id, user_id: alice?.id ?? null, name: "Alice Johnson", role: "Club President", email: "alice@clubhub.edu" },
    );
  }
  if (mathUnion) {
    leadersData.push(
      { club_id: mathUnion.id, user_id: devUser.id, name: "Dev User", role: "President", email: "dev@clubhub.edu" },
    );
  }
  if (envClub) {
    leadersData.push(
      { club_id: envClub.id, user_id: bob?.id ?? null, name: "Bob Smith", role: "Club Chair", email: "bob@clubhub.edu" },
    );
  }

  if (leadersData.length > 0) {
    const leaderRecords = await db.insert(clubLeadersTable).values(leadersData).onConflictDoNothing().returning();
    console.log(`Inserted ${leaderRecords.length} leaders`);
  }

  // Enroll devUser in some clubs
  const enrollData = [];
  for (const club of [csClub, mathUnion, robotics].filter(Boolean)) {
    if (club) enrollData.push({ user_id: devUser.id, club_id: club.id });
  }
  if (alice && robotics) enrollData.push({ user_id: alice.id, club_id: robotics.id });
  if (alice && csClub) enrollData.push({ user_id: alice.id, club_id: csClub.id });
  if (bob && stuGov) enrollData.push({ user_id: bob.id, club_id: stuGov.id });

  if (enrollData.length > 0) {
    const enrollRecords = await db.insert(enrollmentsTable).values(enrollData).onConflictDoNothing().returning();
    console.log(`Inserted ${enrollRecords.length} enrollments`);
  }

  // Create events (spread across May 2026 and next couple months)
  const eventsData = [];
  const baseDate = new Date("2026-05-03");

  function addDays(d: Date, days: number): string {
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result.toISOString().split("T")[0];
  }

  if (csClub) {
    eventsData.push(
      { club_id: csClub.id, title: "Weekly Coding Challenge", event_date: addDays(baseDate, 0), event_time: "15:00", location: "Tech Building 101", description: "This week's challenge: dynamic programming problems." },
      { club_id: csClub.id, title: "Introduction to Machine Learning", event_date: addDays(baseDate, 7), event_time: "15:00", location: "Tech Building 101", description: "Guest lecture from a senior ML engineer." },
      { club_id: csClub.id, title: "Spring Hackathon Kickoff", event_date: addDays(baseDate, 14), event_time: "10:00", location: "Innovation Hub", description: "48-hour hackathon — form your teams now!" },
    );
  }
  if (robotics) {
    eventsData.push(
      { club_id: robotics.id, title: "Robot Build Session", event_date: addDays(baseDate, 2), event_time: "14:00", location: "Engineering Lab B", description: "Assembly and testing of the autonomous navigation module." },
      { club_id: robotics.id, title: "Regional Competition Prep", event_date: addDays(baseDate, 9), event_time: "14:00", location: "Engineering Lab B", description: "Final rehearsal before the regional qualifiers." },
    );
  }
  if (stuGov) {
    eventsData.push(
      { club_id: stuGov.id, title: "Monthly General Meeting", event_date: addDays(baseDate, 4), event_time: "12:00", location: "Main Office Conference Room", description: "Budget review and upcoming events planning." },
    );
  }
  if (photoClub) {
    eventsData.push(
      { club_id: photoClub.id, title: "Campus Photo Walk", event_date: addDays(baseDate, 1), event_time: "17:00", location: "Front Quad", description: "Capture golden hour on campus. Bring any camera!" },
      { club_id: photoClub.id, title: "Portrait Session Workshop", event_date: addDays(baseDate, 8), event_time: "16:00", location: "Arts Center Studio", description: "Learn lighting setups for portrait photography." },
    );
  }
  if (mathUnion) {
    eventsData.push(
      { club_id: mathUnion.id, title: "AMC Problem Solving Session", event_date: addDays(baseDate, 3), event_time: "13:00", location: "Math Hall 204", description: "Working through AMC 10 past paper problems." },
      { club_id: mathUnion.id, title: "Guest Lecture: Number Theory", event_date: addDays(baseDate, 17), event_time: "13:00", location: "Math Hall 204", description: "Professor Chen presents on prime factorization applications." },
    );
  }
  if (envClub) {
    eventsData.push(
      { club_id: envClub.id, title: "Campus Clean-Up Day", event_date: addDays(baseDate, 5), event_time: "09:00", location: "Main Campus", description: "Join us to clean and green our campus." },
    );
  }

  if (eventsData.length > 0) {
    const eventRecords = await db.insert(eventsTable).values(eventsData).onConflictDoNothing().returning();
    console.log(`Inserted ${eventRecords.length} events`);
  }

  console.log("Seed complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
