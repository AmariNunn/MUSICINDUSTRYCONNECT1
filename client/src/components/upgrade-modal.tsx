import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Check,
  X,
  Crown,
  Star,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan?: string;
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    badge: null,
    description: "Everything you need to get started.",
    features: [
      { text: "Profile listing in directory", included: true },
      { text: "Browse opportunities & events", included: true },
      { text: "Up to 10 connections", included: true },
      { text: "Community (Core) posting", included: false },
      { text: "Unlimited connections", included: false },
      { text: "Priority directory placement", included: false },
      { text: "Exclusive opportunities", included: false },
    ],
    ctaText: "Current Plan",
    ctaDisabledFor: "Free",
    accentBorder: "border-zinc-700",
    checkColor: "text-zinc-400",
    checkBg: "bg-zinc-800",
  },
  {
    name: "Gold",
    price: "$9",
    period: "/ month",
    badge: "Most Popular",
    badgeBg: "bg-yellow-400 text-black",
    description: "Full community access and unlimited networking.",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Unlimited connections", included: true },
      { text: "Community (Core) posting", included: true },
      { text: "Standard directory placement", included: true },
      { text: "Advanced profile customization", included: true },
      { text: "Priority directory placement", included: false },
      { text: "Exclusive platinum opportunities", included: false },
    ],
    ctaText: "Upgrade to Gold",
    accentBorder: "border-yellow-400",
    checkColor: "text-yellow-400",
    checkBg: "bg-yellow-400/15",
    buttonClass: "bg-yellow-400 hover:bg-yellow-300 text-black font-bold",
  },
  {
    name: "Platinum",
    price: "$19",
    period: "/ month",
    badge: "Best Value",
    badgeBg: "bg-[#c084fc] text-white",
    description: "The ultimate membership for industry pros.",
    features: [
      { text: "Everything in Gold", included: true },
      { text: "Priority directory placement", included: true },
      { text: "Verified badge eligibility", included: true },
      { text: "Exclusive platinum opportunities", included: true },
      { text: "Featured profile highlight", included: true },
      { text: "Early access to new features", included: true },
      { text: "Dedicated support", included: true },
    ],
    ctaText: "Upgrade to Platinum",
    accentBorder: "border-[#c084fc]",
    checkColor: "text-[#c084fc]",
    checkBg: "bg-[#c084fc]/15",
    buttonClass: "bg-[#c084fc] hover:bg-[#a855f7] text-white font-bold",
  },
];

export default function UpgradeModal({ open, onClose, currentPlan = "Free" }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          data-testid="button-close-upgrade-modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#c084fc]/10 border border-[#c084fc]/30 rounded-full px-4 py-1.5 text-[#c084fc] text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Upgrade Your Membership
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Choose Your Plan
          </h2>
          <p className="text-zinc-400 text-base max-w-xl mx-auto">
            Unlock more features and grow your music career. Cancel anytime.
          </p>
        </div>

        {/* Plan cards */}
        <div className="px-6 pb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.name;
            const isPlatinum = plan.name === "Platinum";

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border-2 ${plan.accentBorder} p-6 transition-all duration-200 ${
                  isPlatinum
                    ? "bg-gradient-to-b from-[#c084fc]/10 to-zinc-900 shadow-xl shadow-[#c084fc]/15"
                    : "bg-zinc-900"
                } ${isCurrent ? "ring-2 ring-white/20" : ""}`}
                data-testid={`card-upgrade-${plan.name.toLowerCase()}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${plan.badgeBg}`}>
                      <Zap className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Current tag */}
                {isCurrent && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full font-medium">
                      Current
                    </span>
                  </div>
                )}

                {/* Name */}
                <div className="flex items-center gap-2 mb-1">
                  {isPlatinum && <Crown className="w-4 h-4 text-[#c084fc]" />}
                  {plan.name === "Gold" && <Star className="w-4 h-4 text-yellow-400" />}
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-sm ml-1">{plan.period}</span>
                </div>
                <p className="text-zinc-500 text-xs mb-5">{plan.description}</p>

                {/* CTA */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-zinc-800 text-zinc-500 cursor-not-allowed mb-5"
                  >
                    Current Plan
                  </button>
                ) : plan.name === "Free" ? (
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold border border-zinc-600 text-zinc-400 hover:border-zinc-400 hover:text-white transition-colors mb-5"
                  >
                    Stay on Free
                  </button>
                ) : (
                  <Link href="/account-settings" onClick={onClose}>
                    <Button
                      className={`w-full py-2.5 rounded-xl text-sm ${plan.buttonClass} mb-5`}
                      data-testid={`button-upgrade-${plan.name.toLowerCase()}`}
                    >
                      {plan.ctaText}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                )}

                {/* Divider */}
                <div className="border-t border-zinc-800 mb-4" />

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.checkBg}`}>
                          <Check className={`w-2.5 h-2.5 ${plan.checkColor}`} />
                        </div>
                      ) : (
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                          <X className="w-2.5 h-2.5 text-zinc-600" />
                        </div>
                      )}
                      <span className={`text-xs leading-relaxed ${feature.included ? "text-zinc-300" : "text-zinc-600"}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-center text-zinc-600 text-xs pb-6">
          7-day free trial on paid plans · No contracts · Cancel anytime
        </p>
      </div>
    </div>
  );
}
