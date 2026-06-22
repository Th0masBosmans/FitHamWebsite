"use client";

import { Check, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { MembershipFee } from "@/types";

type PlanCardProps = {
  plan: MembershipFee;
  index: number;
  onRegister: (plan: MembershipFee) => void;
}

export function PlanCard({ plan, index, onRegister }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden relative group"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="label-xl font-black italic text-[var(--color-primary-brand)] uppercase">{plan.name}</h3>
            <p className="text-gray-500 label-regular mt-1">{plan.description}</p>
          </div>
          <div className="text-right">
            <div className="title-section font-black text-[var(--color-primary-brand)]">€{plan.price}</div>
            <div className="label-small text-gray-400">/ jaar</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {plan.benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 label-regular text-gray-600 font-medium">
              <Check className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0" strokeWidth={3} />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <button
          className="mt-8 w-full py-4 rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 bg-[var(--color-accent)] text-[var(--color-primary-brand)] shadow-md shadow-yellow-200/50 hover:bg-[var(--color-accent-border)] hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
          onClick={() => onRegister(plan)}
        >
          <ArrowRight className="w-5 h-5 flex-shrink-0" />
          <span>Inschrijven</span>
        </button>
      </div>
    </motion.div>
  );
}
