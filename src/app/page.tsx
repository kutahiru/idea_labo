import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen overflow-hidden 2xl:scale-125 2xl:origin-top-left">
      <div className="pt-8 pl-4 md:pl-8 lg:pl-12 xl:pl-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary mb-4">
          アイデア研究所
        </h1>
      </div>

      <div className="relative">
        <div className="px-10 md:px-0 md:absolute md:left-78 lg:left-114 xl:left-144 top-8">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-medium text-primary bg-accent md:[writing-mode:vertical-rl] whitespace-nowrap px-2 py-1 rounded-lg">
            発想を抽出しアイデアを結晶化する
          </h2>
        </div>

        {/* 左側の装飾枠 */}
        <div className="mx-4 my-4 md:m-0 md:absolute -left-6 top-24 md:w-80 lg:w-116 xl:w-144 h-90 xl:h-120 rounded-3xl border-4 border-primary" />

        {/* 右側のメニューエリア */}
        <div className="mx-4 my-4 md:m-0 md:absolute -right-6 top-8 md:w-106 lg:w-134 xl:w-164 2xl:w-228 h-90 xl:h-120 rounded-3xl border-4 border-primary">
        <div className="h-full flex flex-col justify-center items-start gap-4 xl:gap-6 p-6 xl:p-12">
          {/* メニュー項目 - ブレインライティング */}
          <div className="relative">
            <div className="border-dashed-wide flex items-center justify-start pl-2">
              <Link href="/brainwriting" className="menu-link mb-6 text-2xl lg:text-3xl xl:text-4xl font-normal text-primary hover:text-primary-hover hover:bg-accent px-2 py-1 rounded transition-all duration-300 ease-out flex items-center gap-2">
                ブレインライティング
                <svg className="w-3 h-3 xl:w-6 xl:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
              <div className="absolute top-5 lg:top-6 left-36 lg:left-44 text-xl lg:text-2xl xl:text-3xl text-primary/30 pointer-events-none">
                Brainwriting
              </div>
            </div>
          </div>

          {/* メニュー項目 - マンダラート */}
          <div className="relative">
            <div className="border-dashed-wide flex items-center justify-start pl-2">
              <Link href="/mandala" className="menu-link mb-6 text-2xl lg:text-3xl xl:text-4xl font-normal text-primary hover:text-primary-hover hover:bg-accent px-2 py-1 rounded transition-all duration-300 ease-out flex items-center gap-2">
                マンダラート
                <svg className="w-3 h-3 xl:w-6 xl:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="absolute top-5 lg:top-6 left-12 lg:left-14 text-xl lg:text-2xl xl:text-3xl text-primary/30 pointer-events-none">
              MandalaArt
            </div>
          </div>

          {/* メニュー項目 - オズボーンのチェックリスト */}
          <div className="relative">
            <div className="border-dashed-wide flex items-center justify-start pl-2">
              <Link href="/osborn" className="menu-link mb-6 text-2xl lg:text-3xl xl:text-4xl font-normal text-primary hover:text-primary-hover hover:bg-accent px-2 py-1 rounded transition-all duration-300 ease-out flex items-center gap-2">
                オズボーンのチェックリスト
                <svg className="w-3 h-3 xl:w-6 xl:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="absolute top-5 lg:top-6 left-40 lg:left-50 text-xl lg:text-2xl xl:text-3xl text-primary/30 pointer-events-none">
              OsbornChecklist
            </div>
          </div>

          {/* メニュー項目 - アイデア一覧 */}
          <div className="relative">
            <div className="border-dashed-wide flex items-center justify-start pl-2">
              <Link href="/ideas" className="menu-link mb-6 text-2xl lg:text-3xl xl:text-4xl font-normal text-primary hover:text-primary-hover hover:bg-accent px-2 py-1 rounded transition-all duration-300 ease-out flex items-center gap-2">
                アイデア一覧
                <svg className="w-3 h-3 xl:w-6 xl:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="absolute top-5 lg:top-6 left-24 lg:left-26 text-xl lg:text-2xl xl:text-3xl text-primary/30 pointer-events-none">
              IdeaList
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
