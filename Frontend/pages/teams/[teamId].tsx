import { useRouter } from "next/router";
import { TeamDetailContent } from "@/components/templates/TeamDetailContent";

export default function TeamDetailPage() {
  const router = useRouter();
  const { teamId } = router.query;
  const id = Array.isArray(teamId) ? teamId[0] : teamId;

  // router.query is empty on the very first client render; wait for it.
  if (!id) return null;

  return <TeamDetailContent teamId={Number(id)} />;
}
