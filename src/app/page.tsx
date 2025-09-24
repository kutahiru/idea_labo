import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen overflow-hidden 2xl:origin-top-left 2xl:scale-125">
      <div className="pt-8 text-center">
        <h1 className="text-primary mb-4 text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl">
          アイデア研究所
        </h1>
      </div>

      <div className="relative">
        <div className="top-8 px-10 md:absolute md:left-80 md:px-0 lg:left-116 xl:left-150">
          <h2 className="text-primary rounded-lg px-2 py-1 text-2xl font-medium whitespace-nowrap md:[writing-mode:vertical-rl] lg:text-3xl xl:text-4xl">
            発想を抽出しアイデアを結晶化する
          </h2>
        </div>

        {/* 左側の装飾枠 */}
        <div className="top-24 -left-6 mx-4 my-4 h-90 overflow-hidden rounded-3xl md:absolute md:m-0 md:w-80 lg:w-116 xl:h-120 xl:w-144">
          <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
            <source src="/top-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* 右側のメニューエリア */}
        <div className="top-8 -right-6 mx-4 my-4 h-90 rounded-3xl md:absolute md:m-0 md:w-106 lg:w-134 xl:h-120 xl:w-164 2xl:w-228">
          <div className="flex h-full flex-col items-start justify-center gap-4 p-6 xl:gap-6 xl:p-12">
            {/* メニュー項目 - ブレインライティング */}
            <div className="relative">
              <div className="border-dashed-wide flex items-center justify-start pl-2">
                <Link
                  href="/brainwriting"
                  className="menu-link text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-normal transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                >
                  ブレインライティング
                  <svg className="h-3 w-3 xl:h-6 xl:w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <div className="text-primary/30 pointer-events-none absolute top-5 left-36 text-xl lg:top-6 lg:left-44 lg:text-2xl xl:text-3xl">
                  Brainwriting
                </div>
              </div>
            </div>

            {/* メニュー項目 - マンダラート */}
            <div className="relative">
              <div className="border-dashed-wide flex items-center justify-start pl-2">
                <Link
                  href="/mandala"
                  className="menu-link text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-normal transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                >
                  マンダラート
                  <svg className="h-3 w-3 xl:h-6 xl:w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className="text-primary/30 pointer-events-none absolute top-5 left-12 text-xl lg:top-6 lg:left-14 lg:text-2xl xl:text-3xl">
                MandalaArt
              </div>
            </div>

            {/* メニュー項目 - オズボーンのチェックリスト */}
            <div className="relative">
              <div className="border-dashed-wide flex items-center justify-start pl-2">
                <Link
                  href="/osborn"
                  className="menu-link text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-normal transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                >
                  オズボーンのチェックリスト
                  <svg className="h-3 w-3 xl:h-6 xl:w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className="text-primary/30 pointer-events-none absolute top-5 left-40 text-xl lg:top-6 lg:left-50 lg:text-2xl xl:text-3xl">
                OsbornChecklist
              </div>
            </div>

            {/* メニュー項目 - アイデア一覧 */}
            <div className="relative">
              <div className="border-dashed-wide flex items-center justify-start pl-2">
                <Link
                  href="/ideas"
                  className="menu-link text-primary hover:text-primary-hover hover:bg-accent mb-6 flex items-center gap-2 rounded px-2 py-1 text-2xl font-normal transition-all duration-300 ease-out lg:text-3xl xl:text-4xl"
                >
                  アイデア一覧
                  <svg className="h-3 w-3 xl:h-6 xl:w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className="text-primary/30 pointer-events-none absolute top-5 left-24 text-xl lg:top-6 lg:left-26 lg:text-2xl xl:text-3xl">
                IdeaList
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
