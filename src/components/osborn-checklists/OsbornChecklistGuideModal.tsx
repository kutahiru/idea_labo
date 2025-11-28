"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OsbornChecklistGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * オズボーンのチェックリストの使い方ガイドを表示するモーダル
 * @param props.isOpen - モーダルの表示状態
 * @param props.onClose - モーダルを閉じる関数
 */
export default function OsbornChecklistGuideModal({
  isOpen,
  onClose,
}: OsbornChecklistGuideModalProps) {
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
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-surface p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-muted"
              aria-label="閉じる"
            >
              <X className="h-6 w-6" />
            </button>

            {/* タイトル */}
            <h2 className="text-primary mb-6 text-2xl font-bold">
              オズボーンのチェックリストの使い方
            </h2>

            {/* 説明コンテンツ */}
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  オズボーンのチェックリストとは？
                </h3>
                <p className="leading-relaxed text-muted">
                  オズボーンのチェックリストは、既存のアイデアや製品を9つの視点から見直すことで、新しいアイデアを発想する手法です。
                  「転用」「応用」「変更」「拡大」「縮小」「代用」「再配置」「逆転」「結合」の9つの視点から、アイデアを広げていきます。
                </p>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-foreground">基本的な流れ</h3>
                <ol className="list-decimal space-y-2 pl-6 text-muted">
                  <li>
                    <strong>テーマ設定</strong>
                    <br />
                    改善したい製品やサービス、解決したい課題をテーマとして設定します
                  </li>
                  <li>
                    <strong>9つの視点で発想</strong>
                    <br />
                    各視点（転用、応用、変更など）について、テーマに当てはめて考えます
                  </li>
                  <li>
                    <strong>アイデアを記録</strong>
                    <br />
                    思いついたアイデアをそれぞれの項目に入力していきます
                  </li>
                  <li>
                    <strong>アイデアの評価</strong>
                    <br />
                    出てきたアイデアの中から、実現可能性や効果の高いものを選びます
                  </li>
                </ol>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-foreground">9つの視点の活用例</h3>
                <ul className="list-disc space-y-2 pl-6 text-muted">
                  <li>
                    <strong>転用：</strong>コーヒーカップを鉛筆立てに、古着をクッションカバーに
                  </li>
                  <li>
                    <strong>応用：</strong>自然界の仕組みを製品に、他業界の成功事例を自社に
                  </li>
                  <li>
                    <strong>変更：</strong>形を変える、色を変える、匂いを加える
                  </li>
                  <li>
                    <strong>拡大：</strong>機能を増やす、サイズを大きくする、回数を増やす
                  </li>
                  <li>
                    <strong>縮小：</strong>コンパクト化、簡略化、短縮化
                  </li>
                  <li>
                    <strong>代用：</strong>材料を変える、別の手段を使う、場所を変える
                  </li>
                  <li>
                    <strong>再配置：</strong>手順を逆にする、配置を変更する
                  </li>
                  <li>
                    <strong>逆転：</strong>上下反転、プラスをマイナスに
                  </li>
                  <li>
                    <strong>結合：</strong>機能を統合、異分野を掛け合わせる
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-foreground">効果的な使い方のコツ</h3>
                <ul className="list-disc space-y-2 pl-6 text-muted">
                  <li>各視点の?アイコンをホバーすると、具体的な例が表示されます</li>
                  <li>すべての項目を埋める必要はありません。思いつくものから記入しましょう</li>
                  <li>突飛なアイデアでも構いません。とにかく書き出してみましょう</li>
                  <li>複数の視点を組み合わせると、さらに独創的なアイデアが生まれます</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-foreground">よくある質問</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      Q. すべての項目を埋める必要がありますか？
                    </p>
                    <p className="text-muted">
                      A.
                      いいえ、必ずしもすべてを埋める必要はありません。思いつく項目から記入していきましょう。
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Q. アイデアが思いつかない時は？</p>
                    <p className="text-muted">
                      A.
                      ?アイコンの例を参考にしたり、他の視点で考えたアイデアを組み合わせてみましょう。
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Q. 入力内容は保存されますか？</p>
                    <p className="text-muted">
                      A. はい、フォーカスを外すと自動的に保存されます。
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* 閉じるボタン（下部） */}
            <div className="mt-8 text-center">
              <button
                onClick={onClose}
                className="bg-primary hover:bg-primary-hover cursor-pointer rounded-md px-6 py-2 font-medium text-white transition-colors"
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
