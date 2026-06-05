import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData("onkrad");

  return (
    <DashboardShell>
      <DashboardContent data={data} />
    </DashboardShell>
  );
}
