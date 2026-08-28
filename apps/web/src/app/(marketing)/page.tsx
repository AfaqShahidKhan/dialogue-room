"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { LANGUAGES } from "@dialogue-room/shared";
import { Button } from "@/components/ui/Button";
import { useMe } from "@/hooks/useMe";
import { Panel } from "@/components/marketing/Panel";
import { Cloud } from "@/components/marketing/Cloud";
import { CornerCloud } from "@/components/marketing/CornerCloud";
import { Reveal, RevealItem } from "@/components/marketing/Reveal";
import { FaqAccordion, type FaqItem } from "@/components/marketing/FaqAccordion";

const languagePairs = (() => {
  const pool = [...LANGUAGES];
  const pairs: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = pool[i * 2 % pool.length];
    const b = pool[(i * 2 + 5) % pool.length];
    if (a !== b) pairs.push(`${a} ⇆ ${b}`);
  }
  return pairs;
})();

const features = [
  {
    image: "/images/boyChatting.jpg",
    icon: Users,
    title: "Meet learners",
    description:
      "Filter by country, language and age to discover people who want to learn what you speak — and teach what you're learning.",
  },
  {
    image: "/images/onlineDiscussion.jpg",
    icon: MessageCircle,
    title: "Real-time chat",
    description:
      "Message your language buddies instantly with typing indicators, read receipts and online presence.",
  },
  {
    image: "/images/virtualConversation.jpg",
    icon: ShieldCheck,
    title: "Global community",
    description:
      "Connect with learners and native speakers from every corner of the world, all in one place.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description: "Tell us what you speak, what you're learning, and a little about yourself.",
  },
  {
    number: "02",
    title: "Meet learners",
    description: "Search and filter by language, country and age to find your next language buddy.",
  },
  {
    number: "03",
    title: "Chat in real time",
    description: "Send messages instantly, see who's online, and keep the conversation going.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "Is Dialogue Room free?",
    answer:
      "Yes. Dialogue Room is free forever — no ads, no hidden fees, no premium tier required to chat with learners.",
  },
  {
    question: "How do I find people learning my language?",
    answer:
      "Use the search page to filter by the language someone is learning, the language they speak, their country, and age range.",
  },
  {
    question: "Is my chat private?",
    answer:
      "Your conversations are only visible to you and the person you're messaging. We never sell your data or share your messages with third parties.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "Dozens of languages, from Arabic to Vietnamese. Set the languages you speak and the ones you're learning on your profile, and we'll help you find a match.",
  },
  {
    question: "Do I need to be fluent to join?",
    answer:
      "Not at all. Dialogue Room is built for learners at every level — from complete beginners to people polishing an already-strong second language.",
  },
];

const heroLine: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export default function LandingPage() {
  const { data: user } = useMe();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-6 pb-6 sm:space-y-8 sm:pb-8">
      {/* Hero */}
      <Panel tone="base" className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <Cloud className="absolute left-[16%] top-4 w-20 opacity-95 sm:w-24" duration={9} />
          <Cloud className="absolute right-[10%] top-40 w-16 opacity-80 sm:w-20" duration={11} delay={1.5} driftX={14} />
          <Cloud className="absolute left-[35%] top-8 w-14 opacity-70 sm:w-16" duration={7.5} delay={0.6} driftX={8} driftY={10} />
        </div>

        <motion.div
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "show"}
          variants={heroContainer}
          className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-10 lg:py-32"
        >
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <motion.span
              variants={heroLine}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
            >
              <Sparkles className="size-3.5 text-amber-400" aria-hidden="true" />
              Free forever, no ads
            </motion.span>

            <motion.h1
              variants={heroLine}
              className="text-[clamp(3rem,7vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-balance text-white"
            >
              Practice languages with{" "}
              <span className="text-sky-300">real people</span>
            </motion.h1>

            <motion.p variants={heroLine} className="max-w-xl text-lg leading-relaxed text-slate-300">
              Dialogue Room connects language learners for authentic conversation practice. Meet a
              language buddy, become friends, and chat in real time — free forever.
            </motion.p>

            <motion.div variants={heroLine} className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {user ? (
                <Link href="/home">
                  <Button variant="amber" size="lg" className="gap-2 shadow-lg focus-visible:ring-offset-charcoal-900">
                    Open app
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button variant="amber" size="lg" className="gap-2 shadow-lg focus-visible:ring-offset-charcoal-900">
                      Get started free
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="onDark" size="lg" className="focus-visible:ring-offset-charcoal-900">
                      Log in
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            <motion.div
              variants={heroLine}
              className="mt-2 flex max-w-xl flex-wrap items-center justify-center gap-2 lg:justify-start"
            >
              {languagePairs.map((pair) => (
                <span
                  key={pair}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
                >
                  {pair}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div variants={heroLine} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-3xl bg-sky-300/95 p-6 shadow-xl shadow-black/20 ring-1 ring-white/10">
              <CornerCloud corner="tr" />
              <Image
                src="/images/MessagingAmico.svg"
                alt="Illustration of two people messaging each other on their phones"
                width={500}
                height={500}
                priority
                className="h-auto w-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </Panel>

      {/* Features */}
      <Panel tone="raised" id="features" className="px-6 py-20 sm:px-8 sm:py-24">
        <Reveal className="mx-auto max-w-6xl">
          <RevealItem className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-white">
              Clear words, <span className="text-sky-300">real connections</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Everything you need to find a language buddy and keep the conversation going.
            </p>
          </RevealItem>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature, index) => (
              <RevealItem
                key={feature.title}
                className="group overflow-hidden rounded-2xl bg-charcoal-800 ring-1 ring-white/5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <CornerCloud corner={index % 2 === 0 ? "tr" : "bl"} />
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="mb-3 flex size-9 items-center justify-center rounded-lg bg-amber-400/15 text-amber-400">
                    <feature.icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="mb-2 font-semibold tracking-tight text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
                </div>
              </RevealItem>
            ))}
          </div>
        </Reveal>
      </Panel>

      {/* How it works */}
      <Panel tone="base" id="how-it-works" className="px-6 py-20 sm:px-8 sm:py-24">
        <Reveal className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div>
            <RevealItem>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-white">
                How it works
              </h2>
            </RevealItem>
            <div className="mt-10 space-y-8">
              {steps.map((step) => (
                <RevealItem key={step.number} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-charcoal-950">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{step.description}</p>
                  </div>
                </RevealItem>
              ))}
            </div>
          </div>

          <RevealItem className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-3xl bg-sky-300/95 p-6 shadow-xl shadow-black/20 ring-1 ring-white/10">
              <CornerCloud corner="bl" />
              <Image
                src="/images/OnlineWorldCuate.svg"
                alt="Illustration of people around the world connecting online"
                width={500}
                height={500}
                className="h-auto w-full"
              />
            </div>
          </RevealItem>
        </Reveal>
      </Panel>

      {/* FAQ */}
      <Panel tone="raised" id="faq" className="px-6 py-20 sm:px-8 sm:py-24">
        <Reveal className="mx-auto max-w-3xl">
          <RevealItem className="mb-10 text-center">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-white">
              Frequently asked questions
            </h2>
          </RevealItem>
          <RevealItem>
            <FaqAccordion items={faqs} />
          </RevealItem>
        </Reveal>
      </Panel>
    </div>
  );
}
