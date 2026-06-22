"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { BoardMemberRepository, type BoardMember } from "@/repository/boardMemberRepository";

const boardMemberRepository = new BoardMemberRepository();

export function BoardMembers() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);

  useEffect(() => {
    boardMemberRepository.fetchBoardMembers().then(setBoardMembers);
  }, []);

  if (boardMembers.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 w-8 bg-[var(--color-accent)] rounded-full"></div>
        <h2 className="text-white whitespace-nowrap title-section">Bestuur</h2>
        <div className="h-1 flex-1 bg-[var(--color-accent)] rounded-full"></div>
      </div>

      <div className="space-y-4">
        {boardMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white/90 rounded-2xl p-5 shadow-xl border-2 border-white/50 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-4">
              <img
                src={boardMemberRepository.getProfilePictureUrl(member.profile_picture)}
                alt={member.name}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-[var(--color-primary-brand)]/10"
              />
              <div className="flex-1">
                <p className="text-[var(--color-primary-brand)] label-large font-extrabold">
                  {member.name}
                </p>
                <p className="label-regular text-[var(--color-primary-brand)]/70 mb-1 font-semibold">
                  {member.function}
                </p>
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-[var(--color-primary-brand)] hover:text-[var(--color-primary-brand-dark)] transition-colors font-bold"
                >
                  <Mail className="w-4 h-4" />
                  {member.email}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
