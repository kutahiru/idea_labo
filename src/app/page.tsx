"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen overflow-hidden">
      <motion.div className="pt-8 text-center" initial="hidden" animate="show" variants={container}>
        <motion.h1
          className="text-primary decoration-accent mb-4 flex items-center justify-center gap-4 text-5xl font-bold underline decoration-[12px] underline-offset-[-4px] md:gap-6 md:text-6xl md:decoration-[20px] md:underline-offset-[-6px] lg:text-7xl xl:text-8xl xl:decoration-[28px] xl:underline-offset-[-8px]"
          variants={item}
        >
          <Image
            src="/logo.png"
            alt="ロゴ"
            width={120}
            height={120}
            priority
            className="h-16 w-auto translate-x-4 translate-y-1 md:h-20 md:translate-x-5 md:translate-y-3 lg:h-24 xl:h-28"
          />
          アイデア研究所
        </motion.h1>
      </motion.div>

      <motion.div className="relative" initial="hidden" animate="show" variants={container}>
        <motion.div
          className="top-8 px-10 md:absolute md:left-80 md:px-0 lg:left-116 xl:left-150"
          variants={item}
        >
          <h2 className="text-primary rounded-lg px-2 py-1 text-2xl font-medium whitespace-nowrap md:[writing-mode:vertical-rl] lg:text-3xl xl:text-4xl">
            発想を抽出しアイデアを結晶化する
          </h2>
        </motion.div>

        {/* 左側の装飾枠 */}
        <motion.div
          className="top-24 -left-6 mx-4 my-4 h-90 overflow-hidden rounded-3xl md:absolute md:m-0 md:w-80 lg:w-116 xl:h-120 xl:w-144"
          variants={item}
        >
          <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
            <source src="/top-video.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* 右側のメニューエリア */}
        <div className="top-8 -right-6 mx-4 my-4 h-90 rounded-3xl md:absolute md:m-0 md:w-106 lg:w-134 xl:h-120 xl:w-164 2xl:w-228">
          <div className="flex h-full flex-col items-start justify-center gap-4 p-6 xl:gap-6 xl:p-12">
            {/* メニュー項目 - ブレインライティング */}
            <motion.div className="relative" variants={item}>
              <div className="border-dashed-wide flex items-center justify-start pl-2">
                <Link
                  href="/brainwritings"
                  className="menu-link text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-medium transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                >
                  ブレインライティング
                  <ChevronRight className="h-3 w-3 xl:h-6 xl:w-6" />
                </Link>
                <div className="font-lora text-primary/30 pointer-events-none absolute top-5 left-36 text-xl lg:top-6 lg:left-44 lg:text-2xl xl:text-3xl">
                  Brainwriting
                </div>
              </div>
            </motion.div>

            {/* メニュー項目 - マンダラート */}
            <motion.div className="relative" variants={item}>
              <div className="border-dashed-wide flex items-center justify-start pl-2">
                <Link
                  href="/mandala"
                  className="menu-link text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-medium transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                >
                  マンダラート
                  <ChevronRight className="h-3 w-3 xl:h-6 xl:w-6" />
                </Link>
              </div>
              <div className="font-lora text-primary/30 pointer-events-none absolute top-5 left-12 text-xl lg:top-6 lg:left-14 lg:text-2xl xl:text-3xl">
                MandalaArt
              </div>
            </motion.div>

            {/* メニュー項目 - オズボーンのチェックリスト */}
            <motion.div className="relative" variants={item}>
              <div className="border-dashed-wide flex items-center justify-start pl-2">
                <Link
                  href="/osborn"
                  className="menu-link text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-medium transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                >
                  オズボーンのチェックリスト
                  <ChevronRight className="h-3 w-3 xl:h-6 xl:w-6" />
                </Link>
              </div>
              <div className="font-lora text-primary/30 pointer-events-none absolute top-5 left-40 text-xl lg:top-6 lg:left-50 lg:text-2xl xl:text-3xl">
                OsbornChecklist
              </div>
            </motion.div>

            {/* メニュー項目 - アイデア一覧 */}
            <motion.div className="relative" variants={item}>
              <div className="border-dashed-wide flex items-center justify-start pl-2">
                <Link
                  href="/idea-categories"
                  className="menu-link text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-medium transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                >
                  アイデア一覧
                  <ChevronRight className="h-3 w-3 xl:h-6 xl:w-6" />
                </Link>
              </div>
              <div className="font-lora text-primary/30 pointer-events-none absolute top-5 left-24 text-xl lg:top-6 lg:left-26 lg:text-2xl xl:text-3xl">
                IdeaList
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
