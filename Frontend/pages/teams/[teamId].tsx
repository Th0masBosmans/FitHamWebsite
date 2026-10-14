import { useRouter } from "next/router";
import { TeamDetailContent } from "@/components/pages/public/TeamDetailContent";

export default function TeamDetailPage() {
  const router = useRouter();
  const { teamId } = router.query;
  const id = Array.isArray(teamId) ? teamId[0] : teamId;

  if (!id) return null;

  return <TeamDetailContent teamId={Number(id)} />;
}
