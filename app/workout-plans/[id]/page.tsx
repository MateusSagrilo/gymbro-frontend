import { redirect } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import {
  getWorkoutPlan,
  getHomeData,
  getUserTrainData,
} from "@/app/_lib/api/fetch-generated";
import { forwardAuthHeadersInit } from "@/app/_lib/forward-auth-headers";
import dayjs from "dayjs";
import { BottomNav } from "@/app/_components/bottom-nav";
import { WorkoutDayCard } from "@/app/_components/workout-day-card";
import { RestDayCard } from "./_components/rest-day-card";
import { BackButton } from "./days/[dayid]/_components/back-button";
import type { GetWorkoutPlan200WorkoutDaysItemWeekDay } from "@/app/_lib/api/fetch-generated";

const WEEK_ORDER: Record<GetWorkoutPlan200WorkoutDaysItemWeekDay, number> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
};

export default async function WorkoutPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });
  if (!session.data?.user) redirect("/auth");

  const { id: workoutPlanId } = await params;
  const apiInit = await forwardAuthHeadersInit();
  const [planRes, homeData, trainData] = await Promise.all([
    getWorkoutPlan(workoutPlanId, apiInit),
    getHomeData(dayjs().format("YYYY-MM-DD"), apiInit),
    getUserTrainData(apiInit),
  ]);

  const needsOnboarding =
    (homeData.status === 200 && !homeData.data.activeWorkoutPlanId) ||
    (trainData.status === 200 && !trainData.data);
  if (needsOnboarding) redirect("/onboarding");

  if (planRes.status !== 200) redirect("/");

  const { name, workoutDays } = planRes.data;
  const sortedDays = [...workoutDays].sort(
    (a, b) => WEEK_ORDER[a.weekDay] - WEEK_ORDER[b.weekDay],
  );

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="flex items-center gap-3 px-5 py-4">
        <BackButton />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Meus treinos
          </h1>
          <p className="truncate font-heading text-xs text-muted-foreground">
            {name}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-6">
        {sortedDays.map((day) =>
          day.isRest ? (
            <RestDayCard key={day.id} weekDay={day.weekDay} />
          ) : (
            <Link
              key={day.id}
              href={`/workout-plans/${workoutPlanId}/days/${day.id}`}
            >
              <WorkoutDayCard
                name={day.name}
                weekDay={day.weekDay}
                estimatedDurationInSeconds={day.estimatedDurationInSeconds}
                exercisesCount={day.exercisesCount}
                coverImageUrl={day.coverImageUrl}
              />
            </Link>
          ),
        )}
      </div>

      <BottomNav activePage="calendar" />
    </div>
  );
}
