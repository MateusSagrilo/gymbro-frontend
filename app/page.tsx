import { redirect } from "next/navigation";
import { getHomeData, getUserTrainData } from "./_lib/api/fetch-generated";
import { forwardAuthHeadersInit } from "./_lib/forward-auth-headers";
import dayjs from "dayjs";
import { BottomNav } from "./_components/bottom-nav";
import { HomeContent, type HomeContentPayload } from "./_components/home-content";

export default async function Home() {
  const apiInit = await forwardAuthHeadersInit();

  const sessionRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
    { ...apiInit, cache: "no-store" }
  );
  const session = await sessionRes.json();

  if (!session?.user) redirect("/auth");

  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");
  const [homeData, trainData] = await Promise.all([
    getHomeData(todayStr, apiInit),
    getUserTrainData(apiInit),
  ]);

  let payload: HomeContentPayload;
  if (homeData.status !== 200) {
    payload = {
      kind: "error",
      status: homeData.status,
      errorMessage:
        homeData.data &&
        typeof homeData.data === "object" &&
        "error" in homeData.data
          ? String((homeData.data as { error?: string }).error)
          : undefined,
    };
  } else {
    const needsOnboarding =
      !homeData.data.activeWorkoutPlanId ||
      (trainData.status === 200 && !trainData.data);
    if (needsOnboarding) redirect("/onboarding");

    const userName = session.user.name?.split(" ")[0] ?? "";
    payload = {
      kind: "ok",
      userName,
      todayStr,
      activeWorkoutPlanId: homeData.data.activeWorkoutPlanId,
      todayWorkoutDay: homeData.data.todayWorkoutDay,
      workoutStreak: homeData.data.workoutStreak,
      consistencyByDay: homeData.data.consistencyByDay,
    };
  }

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <HomeContent payload={payload} />
      <BottomNav />
    </div>
  );
}