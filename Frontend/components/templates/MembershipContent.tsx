"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MembershipRepository } from "@/repository/membershipRepository";
import { MembershipFee } from "@/types";
import { PlanCard } from "@/components/organisms/membership/PlanCard";
import { MembershipInfo } from "@/components/organisms/membership/MembershipInfo";
import { RegistrationModal } from "@/components/organisms/membership/RegistrationModal";

const membershipRepository = new MembershipRepository();

export function MembershipContent() {
  const [plans, setPlans] = useState<MembershipFee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipFee | null>(null);

  useEffect(() => {
    membershipRepository.fetchFees().then(setPlans);
  }, []);

  const handleRegisterClick = (plan: MembershipFee) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-[var(--color-primary-brand)] text-white py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="title-page font-black italic uppercase tracking-tighter">Word nu Lid!</h1>
          <p className="label-large text-white/90 mt-4 max-w-md lg:max-w-2xl mx-auto font-medium">
            Word onderdeel van de FIT HAM familie en ontdek de passie voor volleybal
          </p>
        </motion.div>
      </div>

      {/* Plans */}
      <div className="px-4 -mt-8 grid grid-cols-1 gap-6 max-w-md lg:max-w-xl mx-auto relative z-10">
        {plans.map((plan, index) => (
          <PlanCard key={plan.id} plan={plan} index={index} onRegister={handleRegisterClick} />
        ))}
      </div>

      {/* Info Section */}
      <MembershipInfo />

      {/* Registration Modal */}
      {isModalOpen && selectedPlan && (
        <RegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          teamName={selectedPlan.name}
          isYouth={false}
        />
      )}
    </div>
  );
}
