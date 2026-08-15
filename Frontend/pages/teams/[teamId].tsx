import { useRouter } from "next/router";
import { TeamDetailContent } from "@/components/pages/public/TeamDetailContent";

export default function TeamDetailPage() {
  const router = useRouter();
  const { teamId } = router.query;
  const id = Array.isArray(teamId) ? teamId[0] : teamId;

  // Bij de allereerste weergave kent Next.js het teamnummer uit de URL nog niet;
  // even niets tonen tot het er is.
  if (!id) return null;

  return <TeamDetailContent teamId={Number(id)} />;
}
