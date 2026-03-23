import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getHomeData, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { forwardAuthHeadersInit } from "@/app/_lib/forward-auth-headers";
import dayjs from "dayjs";
import { Chat } from "@/app/_components/chat";

export default async function OnboardingPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const apiInit = await forwardAuthHeadersInit();
  const [homeData, trainData] = await Promise.all([
    getHomeData(dayjs().format("YYYY-MM-DD"), apiInit),
    getUserTrainData(apiInit),
  ]);

  if (
    homeData.status === 200 &&
    trainData.status === 200 &&
    homeData.data.activeWorkoutPlanId &&
    trainData.data
  ) {
    redirect("/");
  }

  return <Chat embedded initialMessage="Quero começar a melhorar minha saúde!" />;
}