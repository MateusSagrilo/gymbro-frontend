import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getHomeData, getUserTrainData } from "./_lib/api/fetch-generated";
import { forwardAuthHeadersInit } from "./_lib/forward-auth-headers";
import dayjs from "dayjs";
import { BottomNav } from "./_components/bottom-nav";
import { HomeContent, type HomeContentPayload } from "./_components/home-content";

export default async function Home() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");
  const apiInit = await forwardAuthHeadersInit();
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

    const userName = session.data.user.name?.split(" ")[0] ?? "";
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