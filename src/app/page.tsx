import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen bg-white overflow-hidden">
      {/* メインタイトル */}
      <div className="pt-12 pl-4 xl:pl-16">
        <h1 className="text-4xl md:text-6xl font-medium text-primary">
          発想を抽出し
        </h1>
        <h2 className="text-4xl md:text-6xl font-medium text-primary mt-4 md:mt-8 ml-4 md:ml-8">
          アイデアを結晶化する
        </h2>
      </div>

      {/* レイアウトコンテナ */}
      <div className="relative">
        {/* 左側の装飾枠 */}
        <div className="hidden md:block absolute md:-left-64 top-24 w-200 h-120 rounded-3xl border-4 border-primary" />

        {/* 右側のメニューエリア */}
        <div className="hidden md:block absolute md:-right-4 top-8 w-80 xl:w-160 xl:h-120 rounded-3xl border-4 border-primary">
        <div className="h-full flex flex-col justify-center items-start gap-4 xl:gap-6 p-6 xl:p-12">
          {/* メニュー項目 - ブレインライティング */}
          <div className="relative">
            <div className="w-64 xl:w-106 border-dashed-wide flex items-center justify-start pl-2">
              <Link href="/brainwriting" className="menu-link mb-6 text-sm xl:text-4xl font-normal text-primary hover:text-primary-hover hover:bg-accent px-2 py-1 rounded transition-all duration-300 ease-out flex items-center gap-2">
                ブレインライティング
                <svg className="w-3 h-3 xl:w-6 xl:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
              <div className="absolute top-8 left-64 text-xs xl:text-3xl text-primary/30 pointer-events-none">
                Brainwriting
              </div>
            </div>
          </div>

          {/* メニュー項目 - マンダラート */}
          <div className="relative">
            <div className="w-52 xl:w-68 border-dashed-wide flex items-center justify-start pl-2">
              <Link href="/mandala" className="menu-link mb-6 text-sm xl:text-4xl font-normal text-primary hover:text-primary-hover hover:bg-accent px-2 py-1 rounded transition-all duration-300 ease-out flex items-center gap-2">
                マンダラート
                <svg className="w-3 h-3 xl:w-6 xl:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="absolute top-8 left-40 text-xs xl:text-3xl text-primary/30 pointer-events-none">
              MandalaArt
            </div>
          </div>

          {/* メニュー項目 - オズボーンのチェックリスト */}
          <div className="relative">
            <div className="w-72 xl:w-132 border-dashed-wide flex items-center justify-start pl-2">
              <Link href="/osborn" className="menu-link mb-6 text-xs xl:text-4xl font-normal text-primary hover:text-primary-hover hover:bg-accent px-2 py-1 rounded transition-all duration-300 ease-out flex items-center gap-2">
                オズボーンのチェックリスト
                <svg className="w-3 h-3 xl:w-6 xl:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="absolute top-8 left-80 text-xs xl:text-3xl text-primary/30 pointer-events-none">
              OsbornChecklist
            </div>
          </div>

          {/* メニュー項目 - アイデア一覧 */}
          <div className="relative">
            <div className="w-52 xl:w-74 border-dashed-wide flex items-center justify-start pl-2">
              <Link href="/ideas" className="menu-link mb-6 text-sm xl:text-4xl font-normal text-primary hover:text-primary-hover hover:bg-accent px-2 py-1 rounded transition-all duration-300 ease-out flex items-center gap-2">
                アイデア一覧
                <svg className="w-3 h-3 xl:w-6 xl:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="absolute top-8 left-40 text-xs xl:text-3xl text-primary/30 pointer-events-none">
              IdeaList
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
