"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { BoardMemberRepository, isIntegrityOfficer, type BoardMember } from "@/repository/boardMemberRepository";

const boardMemberRepository = new BoardMemberRepository();

/**
 * Het kaartje van onze eigen API op /onze-club/api: hetzelfde kaartje als op de
 * contactpagina (BoardMembers). Het toont het bestuurslid met "api" of
 * "aanspreekpunt" in de functie, dezelfde persoon naar wie het formulier mailt.
 * Is er zo niemand, dan verschijnt er niets.
 */
export function ClubIntegrityOfficer() {
  const [officer, setOfficer] = useState<BoardMember | null>(null);

  useEffect(() => {
    boardMemberRepository
      .fetchBoardMembers()
      .then((members) => setOfficer(members.find((member) => isIntegrityOfficer(member.function)) ?? null));
  }, []);

  if (!officer) return null;

  return (
    <a
      href={`mailto:${officer.email}`}
      className="mt-4 block bg-white/90 rounded-2xl p-5 shadow-xl border-2 border-white/50 hover:scale-[1.02] transition-transform"
    >
      <div className="flex items-center gap-4">
        <img
          src={boardMemberRepository.getProfilePictureUrl(officer.profile_picture)}
          alt={officer.name}
          className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-(--color-primary-brand)/10"
        />
        <div className="flex-1">
          <p className="text-(--color-primary-brand) label-large font-extrabold">{officer.name}</p>
          <p className="label-regular text-(--color-primary-brand)/70 mb-1 font-semibold">{officer.function}</p>
          <span className="inline-flex items-center gap-2 text-(--color-primary-brand) font-bold">
            <Mail className="w-4 h-4" />
            {officer.email}
          </span>
        </div>
      </div>
    </a>
  );
}
