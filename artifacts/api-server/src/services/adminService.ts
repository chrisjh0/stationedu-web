import { supabase } from "../lib/supabase.js";

type MinLogger = { error: (obj: unknown, msg?: string) => void };

export interface EngagementTrendItem {
  month: string;
  year: number;
  count: number;
}

export interface EnrollmentRate {
  enrolled_students: number;
  total_users: number;
  percentage: number;
}

export interface CategoryItem {
  category: string;
  count: number;
  percentage: number;
}

export interface GradeItem {
  grade: string;
  count: number;
}

export interface MostActiveClub {
  name: string;
  event_count: number;
  member_count: number;
}

export interface LeadershipRatio {
  total_leaders: number;
  total_users: number;
  percentage: number;
  leadership_ratio_note: string;
}

export interface AdminStats {
  total_clubs: number;
  students_participating: number;
  past_events: number;
  meeting_hours: number;
  meeting_hours_is_estimate: true;
  engagement_trend: EngagementTrendItem[];
  enrollment_rate: EnrollmentRate;
  category_distribution: CategoryItem[];
  participation_by_grade: GradeItem[];
  grade_data_available: false;
  avg_students_per_club: number;
  most_active_club: MostActiveClub;
  leadership_ratio: LeadershipRatio;
  school_name: string;
  school_year: string;
}

function todayUtc(): string {
  return new Date().toISOString().split("T")[0];
}

function buildTrendMonths(): Array<{ month: string; year: number; key: string }> {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({
      month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      year: d.getUTCFullYear(),
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
    });
  }
  return months;
}

export async function getAdminStats(log: MinLogger): Promise<AdminStats> {
  const today = todayUtc();
  const trendMonths = buildTrendMonths();
  const oldestMonthStart = trendMonths[0].key + "-01";

  // Run all queries in parallel; failures fall back to safe defaults.
  const [
    clubsResult,
    enrollmentsResult,
    pastEventsResult,
    trendEventsResult,
    totalUsersResult,
    allEventsResult,
    leaderUsersResult,
  ] = await Promise.allSettled([
    supabase.from("clubs").select("id, name, category"),
    supabase.from("enrollments").select("user_id, club_id"),
    supabase.from("events").select("*", { count: "exact", head: true }).lt("event_date", today),
    supabase.from("events").select("event_date").gte("event_date", oldestMonthStart),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("events").select("club_id"),
    supabase.from("club_leaders").select("user_id").not("user_id", "is", null),
  ]);

  // --- Clubs ---
  let clubs: Array<{ id: number; name: string; category: string }> = [];
  if (clubsResult.status === "fulfilled" && !clubsResult.value.error) {
    clubs = (clubsResult.value.data ?? []) as typeof clubs;
  } else {
    log.error(
      clubsResult.status === "rejected" ? clubsResult.reason : clubsResult.value.error,
      "adminService: clubs query failed"
    );
  }
  const totalClubs = clubs.length;

  // --- Enrollments ---
  let enrollments: Array<{ user_id: number; club_id: number }> = [];
  if (enrollmentsResult.status === "fulfilled" && !enrollmentsResult.value.error) {
    enrollments = (enrollmentsResult.value.data ?? []) as typeof enrollments;
  } else {
    log.error(
      enrollmentsResult.status === "rejected" ? enrollmentsResult.reason : enrollmentsResult.value.error,
      "adminService: enrollments query failed"
    );
  }
  const studentsParticipating = new Set(enrollments.map((e) => e.user_id)).size;
  const totalEnrollmentCount = enrollments.length;

  // --- Past events ---
  let pastEvents = 0;
  if (pastEventsResult.status === "fulfilled" && !pastEventsResult.value.error) {
    pastEvents = pastEventsResult.value.count ?? 0;
  } else {
    log.error(
      pastEventsResult.status === "rejected" ? pastEventsResult.reason : pastEventsResult.value.error,
      "adminService: past events query failed"
    );
  }
  const meetingHours = Math.round(pastEvents * 1.5);

  // --- Engagement trend ---
  let trendEventDates: string[] = [];
  if (trendEventsResult.status === "fulfilled" && !trendEventsResult.value.error) {
    trendEventDates = ((trendEventsResult.value.data ?? []) as Array<{ event_date: string }>)
      .map((e) => e.event_date)
      .filter((d) => typeof d === "string" && /^\d{4}-\d{2}/.test(d));
  } else {
    log.error(
      trendEventsResult.status === "rejected" ? trendEventsResult.reason : trendEventsResult.value.error,
      "adminService: trend events query failed"
    );
  }
  const eventsByMonth = new Map<string, number>();
  for (const dateStr of trendEventDates) {
    const key = dateStr.substring(0, 7);
    eventsByMonth.set(key, (eventsByMonth.get(key) ?? 0) + 1);
  }
  const engagementTrend: EngagementTrendItem[] = trendMonths.map((m) => ({
    month: m.month,
    year: m.year,
    count: eventsByMonth.get(m.key) ?? 0,
  }));

  // --- Total users ---
  let totalUsers = 0;
  if (totalUsersResult.status === "fulfilled" && !totalUsersResult.value.error) {
    totalUsers = totalUsersResult.value.count ?? 0;
  } else {
    log.error(
      totalUsersResult.status === "rejected" ? totalUsersResult.reason : totalUsersResult.value.error,
      "adminService: total users query failed"
    );
  }

  // --- Enrollment rate ---
  const enrolledStudents = studentsParticipating;
  const enrollmentRatePercentage =
    totalUsers > 0 ? Math.round((enrolledStudents / totalUsers) * 1000) / 10 : 0;
  const enrollmentRate: EnrollmentRate = {
    enrolled_students: enrolledStudents,
    total_users: totalUsers,
    percentage: enrollmentRatePercentage,
  };

  // --- Category distribution ---
  const CATEGORIES = ["Club", "Committee", "Union", "Team"] as const;
  const catCount: Record<string, number> = { Club: 0, Committee: 0, Union: 0, Team: 0 };
  for (const club of clubs) {
    const cat = club.category ?? "Club";
    if (cat in catCount) catCount[cat]++;
  }
  const categoryDistribution: CategoryItem[] = CATEGORIES.map((cat) => ({
    category: cat,
    count: catCount[cat],
    percentage: totalClubs > 0 ? Math.round((catCount[cat] / totalClubs) * 1000) / 10 : 0,
  })).sort((a, b) => b.count - a.count);

  // --- Participation by grade (placeholder) ---
  const participationByGrade: GradeItem[] = [
    { grade: "9th", count: 0 },
    { grade: "10th", count: 0 },
    { grade: "11th", count: 0 },
    { grade: "12th", count: 0 },
  ];

  // --- Avg students per club ---
  const avgStudentsPerClub = totalClubs > 0 ? Math.round(totalEnrollmentCount / totalClubs) : 0;

  // --- Most active club ---
  let mostActiveClub: MostActiveClub = { name: "No events yet", event_count: 0, member_count: 0 };
  if (allEventsResult.status === "fulfilled" && !allEventsResult.value.error) {
    const allEventRows = (allEventsResult.value.data ?? []) as Array<{ club_id: number }>;
    const eventCountByClub = new Map<number, number>();
    for (const row of allEventRows) {
      eventCountByClub.set(row.club_id, (eventCountByClub.get(row.club_id) ?? 0) + 1);
    }
    if (eventCountByClub.size > 0) {
      let topClubId = -1;
      let topCount = 0;
      for (const [clubId, count] of eventCountByClub) {
        if (count > topCount) { topCount = count; topClubId = clubId; }
      }
      const topClub = clubs.find((c) => c.id === topClubId);
      if (topClub) {
        const memberCount = enrollments.filter((e) => e.club_id === topClubId).length;
        mostActiveClub = { name: topClub.name, event_count: topCount, member_count: memberCount };
      }
    }
  } else {
    log.error(
      allEventsResult.status === "rejected" ? allEventsResult.reason : allEventsResult.value.error,
      "adminService: all events query failed"
    );
  }

  // --- Leadership ratio ---
  let totalLeaders = 0;
  if (leaderUsersResult.status === "fulfilled" && !leaderUsersResult.value.error) {
    const leaderRows = (leaderUsersResult.value.data ?? []) as Array<{ user_id: number | null }>;
    totalLeaders = new Set(leaderRows.map((l) => l.user_id).filter((id) => id !== null)).size;
  } else {
    log.error(
      leaderUsersResult.status === "rejected" ? leaderUsersResult.reason : leaderUsersResult.value.error,
      "adminService: leaders query failed"
    );
  }
  const leadershipPercentage =
    totalUsers > 0 ? Math.round((totalLeaders / totalUsers) * 1000) / 10 : 0;
  const leadershipRatio: LeadershipRatio = {
    total_leaders: totalLeaders,
    total_users: totalUsers,
    percentage: leadershipPercentage,
    leadership_ratio_note: "Students holding at least one leadership role",
  };

  return {
    total_clubs: totalClubs,
    students_participating: studentsParticipating,
    past_events: pastEvents,
    meeting_hours: meetingHours,
    meeting_hours_is_estimate: true,
    engagement_trend: engagementTrend,
    enrollment_rate: enrollmentRate,
    category_distribution: categoryDistribution,
    participation_by_grade: participationByGrade,
    grade_data_available: false,
    avg_students_per_club: avgStudentsPerClub,
    most_active_club: mostActiveClub,
    leadership_ratio: leadershipRatio,
    school_name: "Athenian School",
    school_year: "2026-27",
  };
}
