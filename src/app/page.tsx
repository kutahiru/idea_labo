"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Users,
  Lightbulb,
  TrendingUp,
  ChevronDown,
  Grid3x3,
  Target,
  Maximize2,
  CheckSquare,
  Sparkles,
  RefreshCw,
  FlaskConical,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
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
      stiffness: 40,
      damping: 20,
      duration: 1.2,
    },
  },
};

const videoItem = {
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 50,
      damping: 18,
      duration: 1.0,
    },
  },
};

const catchphraseItem = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 50,
      damping: 18,
      duration: 1.0,
    },
  },
};

const menuItem = {
  hidden: { opacity: 0, x: 100 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 50,
      damping: 18,
      duration: 1.0,
    },
  },
};

const logoItem = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
      duration: 1.0,
      delay: 2.5,
    },
  },
};

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const topRef = useRef<HTMLDivElement | null>(null);
  const brainwritingRef = useRef<HTMLElement | null>(null);
  const mandalartRef = useRef<HTMLElement | null>(null);
  const osbornRef = useRef<HTMLElement | null>(null);
  const isTopNavActive = useInView(topRef, { once: false, amount: 0.3 });
  const isBrainwritingNavActive = useInView(brainwritingRef, { once: false, amount: 0.3 });
  const isMandalartNavActive = useInView(mandalartRef, { once: false, amount: 0.3 });
  const isOsbornNavActive = useInView(osbornRef, { once: false, amount: 0.3 });

  // スマホサイズ判定
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // sessionStorageで初回アクセスかチェック
    const hasVisited = sessionStorage.getItem("hasVisitedHome");

    if (hasVisited) {
      // 2回目以降はローディングをスキップ
      setIsLoading(false);
      setShowContent(true);
      sessionStorage.setItem("homeContentShown", "true");
    } else {
      // 初回アクセス時のみローディング表示
      setIsLoading(true);
      sessionStorage.setItem("hasVisitedHome", "true");

      const timer = setTimeout(() => {
        setIsLoading(false); // フラスコの円形縮小開始（1秒かかる）

        // フラスコが完全に消えてからコンテンツ表示開始
        setTimeout(() => {
          setShowContent(true);
          // ヘッダーも同時に表示
          sessionStorage.setItem("homeContentShown", "true");
        }, 1100);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLElement | HTMLDivElement | null>) => {
    if (ref.current) {
      const elementPosition = ref.current.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - 100; // 100px上にオフセット

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="overflow-x-hidden">
      <AnimatePresence mode="wait">
        {isLoading === true && (
          <motion.div
            key="loading"
            className="bg-background fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ clipPath: "circle(0% at 50% 50%)" }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
          >
            <div className="relative">
              {/* フラスコ */}
              <motion.div
                animate={{
                  rotate: [-2, 2, -2],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FlaskConical className="text-primary h-32 w-32" strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 右端の固定ナビゲーション */}
      {showContent && (
        <motion.nav
          className="fixed top-1/2 right-8 z-50 hidden -translate-y-1/2 lg:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 2.8 }}
        >
          <div className="flex flex-col gap-6">
            <button
              onClick={() => scrollToSection(topRef)}
              className={`h-3 w-3 rounded-full border-2 transition-all duration-300 ${isTopNavActive ? "border-primary bg-primary scale-125" : "border-primary/30 hover:border-primary hover:scale-110"}`}
              aria-label="トップへスクロール"
            />

            <button
              onClick={() => scrollToSection(brainwritingRef)}
              className={`h-3 w-3 rounded-full border-2 transition-all duration-300 ${isBrainwritingNavActive ? "border-primary bg-primary scale-125" : "border-primary/30 hover:border-primary hover:scale-110"}`}
              aria-label="ブレインライティングセクションへスクロール"
            />

            <button
              onClick={() => scrollToSection(mandalartRef)}
              className={`h-3 w-3 rounded-full border-2 transition-all duration-300 ${isMandalartNavActive ? "border-primary bg-primary scale-125" : "border-primary/30 hover:border-primary hover:scale-110"}`}
              aria-label="マンダラートセクションへスクロール"
            />

            <button
              onClick={() => scrollToSection(osbornRef)}
              className={`h-3 w-3 rounded-full border-2 transition-all duration-300 ${isOsbornNavActive ? "border-primary bg-primary scale-125" : "border-primary/30 hover:border-primary hover:scale-110"}`}
              aria-label="オズボーンのチェックリストセクションへスクロール"
            />
          </div>
        </motion.nav>
      )}

      {showContent && (
        <div className="relative container mx-auto px-4">
          <motion.div
            ref={topRef}
            className="mt-4 text-center sm:mt-8 md:mb-8"
            initial="hidden"
            animate="show"
            variants={container}
          >
            <motion.h1
              className="font-wdxl-lubrifont text-primary mb-4 flex flex-col items-center justify-center gap-2 text-5xl tracking-widest md:flex-row md:gap-6 md:text-6xl lg:text-7xl xl:text-8xl"
              variants={item}
            >
              <motion.div variants={logoItem} initial="hidden" animate="show">
                <Image
                  src="/logo.png"
                  alt="ロゴ"
                  width={120}
                  height={120}
                  priority
                  className="h-16 w-auto md:h-20 md:translate-x-5 lg:h-24 xl:h-32"
                />
              </motion.div>
              <span className="title-underline">
                <span>アイデア研究所</span>
              </span>
            </motion.h1>

            {/* スマホサイズのキャッチコピー */}
            <motion.div className="md:hidden" variants={catchphraseItem}>
              <h2 className="text-primary rounded-lg px-2 pb-6 text-2xl font-medium">
                発想を抽出しアイデアを結晶化する
              </h2>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 md:flex-row md:justify-center md:gap-6 lg:gap-8"
            initial="hidden"
            animate="show"
            variants={container}
          >
            {/* 左側の装飾枠 */}
            <motion.div
              className="h-90 overflow-hidden rounded-3xl md:w-80 lg:w-116 xl:h-120 xl:w-144"
              variants={videoItem}
            >
              <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
                <source src="/top-video.mp4" type="video/mp4" />
              </video>
            </motion.div>

            {/* 中央のキャッチコピー（タブレット以上） */}
            <motion.div className="hidden md:block md:px-0" variants={catchphraseItem}>
              <h2 className="text-primary rounded-lg px-2 py-1 text-2xl font-medium md:whitespace-nowrap md:[writing-mode:vertical-rl] lg:text-3xl xl:text-4xl">
                発想を抽出しアイデアを結晶化する
              </h2>
            </motion.div>

            {/* 右側のメニューエリア */}
            <motion.div
              className="flex-1 rounded-3xl md:max-w-134 lg:max-w-164 xl:max-w-160"
              variants={menuItem}
            >
              <div className="flex flex-col items-start gap-4 py-6 xl:gap-6">
                {/* メニュー項目 - ブレインライティング */}
                <div className="relative">
                  <div className="border-dashed-wide flex items-center justify-start pl-2">
                    <Link
                      href="/brainwritings"
                      className="menu-link menu-link-intro-1 text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-medium transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                    >
                      ブレインライティング
                      <ChevronRight className="h-3 w-3 xl:h-6 xl:w-6" />
                    </Link>
                    <div className="font-lora text-primary/30 pointer-events-none absolute top-5 left-36 text-xl lg:top-6 lg:left-44 lg:text-2xl xl:text-3xl">
                      Brainwriting
                    </div>
                  </div>
                </div>

                {/* メニュー項目 - マンダラート */}
                <div className="relative">
                  <div className="border-dashed-wide flex items-center justify-start pl-2">
                    <Link
                      href="/mandalarts"
                      className="menu-link menu-link-intro-2 text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-medium transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                    >
                      マンダラート
                      <ChevronRight className="h-3 w-3 xl:h-6 xl:w-6" />
                    </Link>
                  </div>
                  <div className="font-lora text-primary/30 pointer-events-none absolute top-5 left-12 text-xl lg:top-6 lg:left-14 lg:text-2xl xl:text-3xl">
                    Mandalart
                  </div>
                </div>

                {/* メニュー項目 - オズボーンのチェックリスト */}
                <div className="relative">
                  <div className="border-dashed-wide flex items-center justify-start pl-2">
                    <Link
                      href="/osborn-checklists"
                      className="menu-link menu-link-intro-3 text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-medium whitespace-nowrap transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                    >
                      オズボーンのチェックリスト
                      <ChevronRight className="h-3 w-3 xl:h-6 xl:w-6" />
                    </Link>
                  </div>
                  <div className="font-lora text-primary/30 pointer-events-none absolute top-5 left-40 text-xl lg:top-6 lg:left-50 lg:text-2xl xl:text-3xl">
                    Osborn&apos;sChecklist
                  </div>
                </div>

                {/* メニュー項目 - アイデア一覧 */}
                <div className="relative">
                  <div className="border-dashed-wide flex items-center justify-start pl-2">
                    <Link
                      href="/idea-categories"
                      className="menu-link menu-link-intro-4 text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-medium transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                    >
                      アイデア一覧
                      <ChevronRight className="h-3 w-3 xl:h-6 xl:w-6" />
                    </Link>
                  </div>
                  <div className="font-lora text-primary/30 pointer-events-none absolute top-5 left-24 text-xl lg:top-6 lg:left-26 lg:text-2xl xl:text-3xl">
                    IdeaList
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* スクロールインジケーター */}
          <motion.div
            className="mt-8 flex flex-col items-center gap-2 md:mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.5 }}
          >
            <span className="text-primary/60 text-sm font-medium tracking-wider">SCROLL</span>
            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronDown className="text-primary/60 h-6 w-6" />
            </motion.div>
          </motion.div>
        </div>
      )}

      {showContent && (
        <div className="relative container mx-auto px-4">
          {/* ブレインライティング説明セクション */}
          <motion.section
            ref={brainwritingRef}
            className="mt-16 mb-12 md:mt-24 md:mb-16 lg:mt-32 lg:mb-20"
            initial={isMobile ? false : { opacity: 0, y: 80 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={isMobile ? undefined : { once: true, amount: 0.2 }}
            transition={isMobile ? undefined : { duration: 0.8, ease: "easeOut" }}
          >
            {/* タイトル */}
            <div className="mb-8 text-center md:mb-12">
              <h2 className="text-primary decoration-accent mb-3 text-3xl font-bold underline decoration-8 underline-offset-[-4px] md:text-4xl lg:text-5xl">
                ブレインライティングとは？
              </h2>
              <div className="font-lora text-primary/50 text-lg md:text-xl">Brainwriting</div>
            </div>

            {/* 説明エリア */}
            <div>
              <p className="text-primary mx-auto mb-12 max-w-4xl text-center text-base leading-relaxed md:mb-16 md:text-lg">
                ブレインライティングは、複数人で紙を回しながらアイデアを書き込んでいく発想法です。
                <br />
                他の人のアイデアに触発されながら、次々と新しいアイデアが生まれていきます。
              </p>

              {/* 特徴リスト - ミニマルデザイン */}
              <div className="mx-auto max-w-3xl space-y-8 md:space-y-12">
                {/* アイテム1: チームで発想 */}
                <div className="group">
                  <div className="border-primary/20 hover:border-accent flex items-start gap-6 border-l-4 pl-6 transition-colors duration-300 md:gap-8 md:pl-8">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <Users className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-primary mb-2 text-2xl font-bold md:text-3xl">
                        チームで発想
                      </h3>
                      <p className="leading-relaxed text-muted md:text-lg">
                        最大6人まで参加可能。みんなのアイデアを見ながら、刺激を受けて新しい発想が生まれます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* アイテム2: アイデアの連鎖 */}
                <div className="group">
                  <div className="border-primary/20 hover:border-accent flex items-start gap-6 border-l-4 pl-6 transition-colors duration-300 md:gap-8 md:pl-8">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <Lightbulb className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-primary mb-2 text-2xl font-bold md:text-3xl">
                        アイデアの連鎖
                      </h3>
                      <p className="leading-relaxed text-muted md:text-lg">
                        他の人のアイデアから発想を広げ、連鎖的に新しいアイデアが生まれる仕組みです。
                      </p>
                    </div>
                  </div>
                </div>

                {/* アイテム3: 効率的な発想 */}
                <div className="group">
                  <div className="border-primary/20 hover:border-accent flex items-start gap-6 border-l-4 pl-6 transition-colors duration-300 md:gap-8 md:pl-8">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <TrendingUp className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-primary mb-2 text-2xl font-bold md:text-3xl">
                        効率的な発想
                      </h3>
                      <p className="leading-relaxed text-muted md:text-lg">
                        6行×3列の形式で、1つのシートから最大18個のアイデアを効率的に生み出せます。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTAボタン */}
              <div className="mt-8 text-center md:mt-10">
                <Link
                  href="/brainwritings"
                  className="menu-link bg-primary inline-flex items-center gap-3 rounded-md px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  ブレインライティングを始める
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.section>

          {/* マンダラート説明セクション */}
          <motion.section
            ref={mandalartRef}
            className="mt-16 mb-12 md:mt-24 md:mb-16 lg:mt-32 lg:mb-20"
            initial={isMobile ? false : { opacity: 0, y: 80 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={isMobile ? undefined : { once: true, amount: 0.2 }}
            transition={isMobile ? undefined : { duration: 0.8, ease: "easeOut" }}
          >
            {/* タイトル */}
            <div className="mb-8 text-center md:mb-12">
              <h2 className="text-primary decoration-accent mb-3 text-3xl font-bold underline decoration-8 underline-offset-[-4px] md:text-4xl lg:text-5xl">
                マンダラートとは？
              </h2>
              <div className="font-lora text-primary/50 text-lg md:text-xl">Mandalart</div>
            </div>

            {/* 説明エリア */}
            <div>
              <p className="text-primary mx-auto mb-12 max-w-4xl text-center text-base leading-relaxed md:mb-16 md:text-lg">
                マンダラートは、9×9のマス目を使ってアイデアを整理・拡張する思考法です。
                <br />
                中心にテーマを置き、周囲に関連するアイデアを配置することで、思考を体系的に深めていきます。
              </p>

              {/* 特徴リスト - ミニマルデザイン */}
              <div className="mx-auto max-w-3xl space-y-8 md:space-y-12">
                {/* アイテム1: 視覚的な整理 */}
                <div className="group">
                  <div className="border-primary/20 hover:border-accent flex items-start gap-6 border-l-4 pl-6 transition-colors duration-300 md:gap-8 md:pl-8">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <Grid3x3 className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-primary mb-2 text-2xl font-bold md:text-3xl">
                        視覚的な整理
                      </h3>
                      <p className="leading-relaxed text-muted md:text-lg">
                        9×9のマス目を使って、思考を視覚的に整理。全体像を見渡しながら、体系的にアイデアを配置できます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* アイテム2: アイデアの拡張 */}
                <div className="group">
                  <div className="border-primary/20 hover:border-accent flex items-start gap-6 border-l-4 pl-6 transition-colors duration-300 md:gap-8 md:pl-8">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <Maximize2 className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-primary mb-2 text-2xl font-bold md:text-3xl">
                        アイデアの拡張
                      </h3>
                      <p className="leading-relaxed text-muted md:text-lg">
                        中心から外側へと発想を広げることで、1つのテーマから最大81個のアイデアを生み出せます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* アイテム3: 目標達成 */}
                <div className="group">
                  <div className="border-primary/20 hover:border-accent flex items-start gap-6 border-l-4 pl-6 transition-colors duration-300 md:gap-8 md:pl-8">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <Target className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-primary mb-2 text-2xl font-bold md:text-3xl">目標達成</h3>
                      <p className="leading-relaxed text-muted md:text-lg">
                        大きな目標を細分化し、具体的な行動に落とし込むことで、達成への道筋が明確になります。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTAボタン */}
              <div className="mt-8 text-center md:mt-10">
                <Link
                  href="/mandalarts"
                  className="menu-link bg-primary inline-flex items-center gap-3 rounded-md px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  マンダラートを始める
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.section>

          {/* オズボーンのチェックリスト説明セクション */}
          <motion.section
            ref={osbornRef}
            className="mt-16 mb-12 md:mt-24 md:mb-16 lg:mt-32 lg:mb-20"
            initial={isMobile ? false : { opacity: 0, y: 80 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={isMobile ? undefined : { once: true, amount: 0.2 }}
            transition={isMobile ? undefined : { duration: 0.8, ease: "easeOut" }}
          >
            {/* タイトル */}
            <div className="mb-8 text-center md:mb-12">
              <h2 className="text-primary decoration-accent mb-3 text-3xl font-bold underline decoration-8 underline-offset-[-4px] md:text-4xl lg:text-5xl">
                オズボーンのチェックリストとは？
              </h2>
              <div className="font-lora text-primary/50 text-lg md:text-xl">
                Osborn&apos;s Checklist
              </div>
            </div>

            {/* 説明エリア */}
            <div>
              <p className="text-primary mx-auto mb-12 max-w-4xl text-center text-base leading-relaxed md:mb-16 md:text-lg">
                オズボーンのチェックリストは、9つの視点から既存のアイデアを発展させる発想法です。
                <br />
                転用・応用・変更・拡大・縮小・代用・置換・逆転・結合という切り口から、新しいアイデアを生み出します。
              </p>

              {/* 特徴リスト - ミニマルデザイン */}
              <div className="mx-auto max-w-3xl space-y-8 md:space-y-12">
                {/* アイテム1: 9つの視点 */}
                <div className="group">
                  <div className="border-primary/20 hover:border-accent flex items-start gap-6 border-l-4 pl-6 transition-colors duration-300 md:gap-8 md:pl-8">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <CheckSquare className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-primary mb-2 text-2xl font-bold md:text-3xl">
                        9つの視点
                      </h3>
                      <p className="leading-relaxed text-muted md:text-lg">
                        転用・応用・変更・拡大・縮小・代用・再配置・逆転・結合の9つの切り口で、体系的にアイデアを発想できます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* アイテム2: 多角的な発想 */}
                <div className="group">
                  <div className="border-primary/20 hover:border-accent flex items-start gap-6 border-l-4 pl-6 transition-colors duration-300 md:gap-8 md:pl-8">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <Sparkles className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-primary mb-2 text-2xl font-bold md:text-3xl">
                        多角的な発想
                      </h3>
                      <p className="leading-relaxed text-muted md:text-lg">
                        様々な角度からアイデアを見直すことで、思いもよらない新しい発想が生まれます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* アイテム3: 既存アイデアの改善 */}
                <div className="group">
                  <div className="border-primary/20 hover:border-accent flex items-start gap-6 border-l-4 pl-6 transition-colors duration-300 md:gap-8 md:pl-8">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <RefreshCw className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-primary mb-2 text-2xl font-bold md:text-3xl">
                        既存アイデアの改善
                      </h3>
                      <p className="leading-relaxed text-muted md:text-lg">
                        既存の商品やサービスに9つの視点を当てることで、改善・改良のヒントが見つかります。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTAボタン */}
              <div className="mt-8 text-center md:mt-10">
                <Link
                  href="/osborn-checklists"
                  className="menu-link bg-primary inline-flex items-center gap-3 rounded-md px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  オズボーンのチェックリストを始める
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </div>
  );
}
