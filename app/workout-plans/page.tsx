import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getHomeData, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { forwardAuthHeadersInit } from "@/app/_lib/forward-auth-headers";
import dayjs from "dayjs";

export default async function WorkoutPlansIndexPage() {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });
  if (!session.data?.user) redirect("/auth");

  const apiInit = await forwardAuthHeadersInit();
  const [homeData, trainData] = await Promise.all([
    getHomeData(dayjs().format("YYYY-MM-DD"), apiInit),
    getUserTrainData(apiInit),
  ]);

  if (homeData.status !== 200) redirect("/");

  const needsOnboarding =
    !homeData.data.activeWorkoutPlanId ||
    (trainData.status === 200 && !trainData.data);
  if (needsOnboarding) redirect("/onboarding");

  const planId = homeData.data.activeWorkoutPlanId;
  if (planId) redirect(`/workout-plans/${planId}`);

  redirect("/");
}
