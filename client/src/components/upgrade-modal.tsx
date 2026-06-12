import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  X,
  Crown,
  Star,
  Zap,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan?: string;
}

interface StripePlan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  period: string;
  features: string[];
  stripePriceId?: string | null;
}

const PLAN_META: Record<
  string,
  {
    badge: string | null;
    badgeBg?: string;
    accentBorder: string;
    checkColor: string;
    checkBg: string;
    buttonClass?: string;
  }
> = {
  Free: {
    badge: null,
    accentBorder: "border-zinc-700",
    checkColor: "text-zinc-400",
    checkBg: "bg-zinc-800",
  },
  Gold: {
    badge: "Most Popular",
    badgeBg: "bg-yellow-400 text-black",
    accentBorder: "border-yellow-400",
    checkColor: "text-yellow-400",
    checkBg: "bg-yellow-400/15",
    buttonClass: "bg-yellow-400 hover:bg-yellow-300 text-black font-bold",
  },
  Platinum: {
    badge: "Best Value",
    badgeBg: "bg-[#c084fc] text-white",
    accentBorder: "border-[#c084fc]",
    checkColor: "text-[#c084fc]",
    checkBg: "bg-[#c084fc]/15",
    buttonClass: "bg-[#c084fc] hover:bg-[#a855f7] text-white font-bold",
  },
};

export default function UpgradeModal({
  open,
  onClose,
  currentPlan = "Free",
}: UpgradeModalProps) {
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const { data: plans = [] } = useQuery<StripePlan[]>({
    queryKey: ["/api/stripe/plans"],
    enabled: open,
  });

  if (!open) return null;

  const handleUpgrade = async (planName: string) => {
    setLoadingPlan(planName);
    try {
      const userId = localStorage.getItem("currentUserId");
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "x-user-id": userId } : {}),
        },
        body: JSON.stringify({ plan: planName, billingCycle }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Stripe not available",
          description:
            data.message ?? "Could not start checkout. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        onClose();
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Could not connect to the payment service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const displayPlans: StripePlan[] =
    plans.length > 0
      ? plans
      : [
          {
            name: "Free",
            monthlyPrice: 0,
            annualPrice: 0,
            period: "forever",
            features: [
              "Profile listing in directory",
              "Browse opportunities & events",
              "Up to 10 connections",
            ],
          },
          {
            name: "Gold",
            monthlyPrice: 9,
            annualPrice: 7,
            period: "month",
            features: [
              "Everything in Free",
              "Unlimited connections",
              "Community (Core) posting",
              "Standard directory placement",
              "Advanced profile customization",
            ],
          },
          {
            name: "Platinum",
            monthlyPrice: 19,
            annualPrice: 15,
            period: "month",
            features: [
              "Everything in Gold",
              "Priority directory placement",
              "Verified badge eligibility",
              "Exclusive platinum opportunities",
              "Featured profile highlight",
              "Early access to new features",
              "Dedicated support",
            ],
          },
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
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
          <p className="text-zinc-400 text-base max-w-xl mx-auto mb-6">
            Unlock more features and grow your music career. Cancel anytime.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center bg-zinc-900 border border-zinc-700 rounded-full p-1 gap-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
              data-testid="toggle-billing-monthly"
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
              data-testid="toggle-billing-annual"
            >
              Annual
              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                Save ~20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="px-6 pb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {displayPlans.map((plan) => {
            const meta = PLAN_META[plan.name] ?? PLAN_META.Free;
            const isCurrent = currentPlan === plan.name;
            const isPlatinum = plan.name === "Platinum";
            const isLoading = loadingPlan === plan.name;
            const displayPrice =
              plan.name === "Free"
                ? "$0"
                : billingCycle === "annual"
                ? `$${plan.annualPrice}`
                : `$${plan.monthlyPrice}`;
            const periodLabel =
              plan.name === "Free"
                ? "forever"
                : billingCycle === "annual"
                ? "/ mo, billed annually"
                : "/ month";

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border-2 ${meta.accentBorder} p-6 transition-all duration-200 ${
                  isPlatinum
                    ? "bg-gradient-to-b from-[#c084fc]/10 to-zinc-900 shadow-xl shadow-[#c084fc]/15"
                    : "bg-zinc-900"
                } ${isCurrent ? "ring-2 ring-white/20" : ""}`}
                data-testid={`card-upgrade-${plan.name.toLowerCase()}`}
              >
                {/* Badge */}
                {meta.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${meta.badgeBg}`}
                    >
                      <Zap className="w-3 h-3" />
                      {meta.badge}
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
                  <span className="text-4xl font-extrabold text-white">{displayPrice}</span>
                  <span className="text-zinc-500 text-sm ml-1">{periodLabel}</span>
                </div>

                {/* CTA */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-zinc-800 text-zinc-500 cursor-not-allowed mb-5 mt-4"
                  >
                    Current Plan
                  </button>
                ) : plan.name === "Free" ? (
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold border border-zinc-600 text-zinc-400 hover:border-zinc-400 hover:text-white transition-colors mb-5 mt-4"
                  >
                    Stay on Free
                  </button>
                ) : (
                  <Button
                    className={`w-full py-2.5 rounded-xl text-sm ${meta.buttonClass} mb-5 mt-4`}
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={isLoading || loadingPlan !== null}
                    data-testid={`button-upgrade-${plan.name.toLowerCase()}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Redirecting…
                      </>
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </>
                    )}
                  </Button>
                )}

                {/* Divider */}
                <div className="border-t border-zinc-800 mb-4" />

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${meta.checkBg}`}
                      >
                        <Check className={`w-2.5 h-2.5 ${meta.checkColor}`} />
                      </div>
                      <span className="text-xs leading-relaxed text-zinc-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-center text-zinc-600 text-xs pb-6">
          All paid plans include a 7-day free trial · No contracts · Cancel anytime
        </p>
      </div>
    </div>
  );
}
