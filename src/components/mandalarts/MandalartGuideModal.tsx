"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MandalartGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MandalartGuideModal({ isOpen, onClose }: MandalartGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* オーバーレイ */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* モーダル本体 */}
          <motion.div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="閉じる"
            >
              <X className="h-6 w-6" />
            </button>

            {/* タイトル */}
            <h2 className="text-primary mb-6 text-2xl font-bold">マンダラートの使い方</h2>

            {/* 説明コンテンツ */}
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">マンダラートとは？</h3>
                <p className="leading-relaxed text-gray-700">
                  マンダラートは、9×9（81マス）のグリッドを使ってアイデアを広げていく発想法です。
                  中心にテーマを置き、その周りに関連するアイデアを配置し、さらにそれぞれのアイデアを8つに展開していくことで、
                  体系的かつ網羅的にアイデアを整理できます。
                </p>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">基本的な流れ</h3>
                <ol className="list-decimal space-y-2 pl-6 text-gray-700">
                  <li>
                    <strong>中央にテーマを入力</strong>
                    <br />
                    全体の中心（真ん中のセクションの中央）にメインテーマを入力します
                  </li>
                  <li>
                    <strong>周囲8マスにサブテーマを入力</strong>
                    <br />
                    メインテーマの周りの8マスに、関連するサブテーマやキーワードを入力します
                  </li>
                  <li>
                    <strong>サブテーマを外側のセクションに展開</strong>
                    <br />
                    各サブテーマが外側の8つのセクションの中心に自動的にコピーされます
                  </li>
                  <li>
                    <strong>各サブテーマを8つに展開</strong>
                    <br />
                    外側の各セクションで、中心のサブテーマから派生するアイデアを8つ入力します
                  </li>
                  <li>
                    <strong>アイデアの整理と評価</strong>
                    <br />
                    完成した81マスを見渡して、アイデアを整理・評価します
                  </li>
                </ol>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">具体例</h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 font-semibold text-gray-800">テーマ：「英語学習」</p>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>周囲8マス（サブテーマ）：</strong>
                      語彙力、リスニング、スピーキング、リーディング、ライティング、
                      文法、発音、モチベーション
                    </p>
                    <p className="mt-3">
                      <strong>「語彙力」の展開例：</strong>
                      単語帳、語源学習、英英辞典、多読、映画・ドラマ、ニュース、
                      アプリ活用、語彙テスト
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">効果的な使い方のコツ</h3>
                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                  <li>最初は質より量を重視し、思いついたことをどんどん入力しましょう</li>
                  <li>サブテーマは多様な視点から設定すると、アイデアの幅が広がります</li>
                  <li>すべてのマスを埋める必要はありません。重要なエリアに集中しても良いです</li>
                  <li>色分けやマーキング機能を使って、優先度や関連性を整理しましょう</li>
                  <li>定期的に全体を見渡して、新しい気づきや組み合わせを見つけましょう</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">活用シーン</h3>
                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                  <li>目標達成の行動計画を立てるとき</li>
                  <li>プロジェクトのアイデアを体系的に整理したいとき</li>
                  <li>問題解決のための多角的な視点が必要なとき</li>
                  <li>学習計画や自己啓発の計画を立てるとき</li>
                  <li>新しい事業やサービスのアイデア出しをするとき</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">よくある質問</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Q. すべてのマスを埋める必要がありますか？
                    </p>
                    <p className="text-gray-700">
                      A. いいえ、必ずしもすべてを埋める必要はありません。重要な部分から埋めていき、
                      アイデアが出にくい箇所は空欄のままでも構いません。
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Q. 入力内容は保存されますか？</p>
                    <p className="text-gray-700">
                      A. はい、フォーカスを外すと自動的に保存されます。
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Q. どの順番で埋めるのが良いですか？
                    </p>
                    <p className="text-gray-700">
                      A. まず中央のテーマを決め、次にその周囲8マスにサブテーマを入力します。
                      その後、各サブテーマが外側のセクション中央に表示されるので、
                      それぞれについて8つのアイデアを展開していきます。
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* 閉じるボタン（下部） */}
            <div className="mt-8 text-center">
              <button
                onClick={onClose}
                className="bg-primary hover:bg-primary-hover rounded-md px-6 py-2 font-medium text-white transition-colors"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
