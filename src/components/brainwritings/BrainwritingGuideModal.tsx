"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BrainwritingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ブレインライティングの使い方を説明するモーダルコンポーネント
 * @param isOpen - モーダルの表示状態
 * @param onClose - モーダルを閉じる際のコールバック
 */
export default function BrainwritingGuideModal({ isOpen, onClose }: BrainwritingGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"xpost" | "team">("xpost");

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
            <h2 className="text-primary mb-6 text-2xl font-bold">ブレインライティングの使い方</h2>

            {/* タブ切り替え */}
            <div className="mb-6 flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("xpost")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "xpost"
                    ? "border-primary text-primary border-b-2"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                X投稿版
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "team"
                    ? "border-primary text-primary border-b-2"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                チーム利用版
              </button>
            </div>

            {/* X投稿版の説明 */}
            {activeTab === "xpost" && (
              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">X投稿版とは？</h3>
                  <p className="leading-relaxed text-gray-700">
                    X投稿版は、自分が最初のアイデアを考え、それをXで共有して他の人にアイデアを追加してもらう機能です。
                    1つのシートを使い、順番に6行のアイデアを完成させていきます。
                  </p>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">基本的な流れ</h3>
                  <ol className="list-decimal space-y-2 pl-6 text-gray-700">
                    <li>
                      <strong>テーマ設定</strong>
                      <br />
                      ブレインライティングのテーマを決めます
                    </li>
                    <li>
                      <strong>1行目にアイデアを記載</strong>
                      <br />
                      最初の行に3つのアイデアを入力します
                    </li>
                    <li>
                      <strong>Xに共有</strong>
                      <br />
                      共有リンクをXに投稿します
                    </li>
                    <li>
                      <strong>他の人がアイデアを追加</strong>
                      <br />
                      共有リンクから他の人が2行目以降にアイデアを追加していきます
                    </li>
                    <li>
                      <strong>6行目まで完成</strong>
                      <br />
                      複数の人の協力で全6行（合計18個）のアイデアが完成します
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">効果的な使い方のコツ</h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>最初のアイデアは具体的で分かりやすいものにしましょう</li>
                    <li>テーマや目的を明確に分かりやすい説明文を添えましょう</li>
                    <li>参加者が前の行のアイデアから発想しやすいよう、多様な視点を入れましょう</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">よくある質問</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Q. 誰でもアイデアを追加できますか？
                      </p>
                      <p className="text-gray-700">
                        A. はい、共有リンクにアクセスすれば誰でも次の行にアイデアを追加できます。
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Q. 途中で保存できますか？</p>
                      <p className="text-gray-700">A. 入力内容は自動保存されます。</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* チーム利用版の説明 */}
            {activeTab === "team" && (
              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">チーム利用版とは？</h3>
                  <p className="leading-relaxed text-gray-700">
                    チーム利用版は、複数人でアイデアを出し合う発想法です。
                    各参加者が自分のシートにアイデアを書き込み、次のラウンドで別の人のシートを見ながら新しいアイデアを発展させていきます。
                    Web会議での使用を想定しています。
                  </p>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">基本的な流れ</h3>
                  <ol className="list-decimal space-y-2 pl-6 text-gray-700">
                    <li>
                      <strong>テーマ設定</strong>
                      <br />
                      ブレインライティングのテーマを決めます
                    </li>
                    <li>
                      <strong>参加者招待</strong>
                      <br />
                      招待URLを使って他のメンバーを招待します（3〜6人推奨）
                    </li>
                    <li>
                      <strong>第1ラウンド：自分のシートに入力</strong>
                      <br />
                      各参加者が自分のシートの1行目に3つのアイデアを入力します
                    </li>
                    <li>
                      <strong>第2ラウンド以降：他のシートに入力</strong>
                      <br />
                      次のラウンドで別の人のシートを開き、前の行のアイデアを参考に新しいアイデアを追加します
                    </li>
                    <li>
                      <strong>全シート完成</strong>
                      <br />
                      全員が全てのシートに記入し、各シート6行（18個のアイデア）を完成させます
                    </li>
                    <li>
                      <strong>アイデアの共有</strong>
                      <br />
                      完成したシートを全員で確認し、良いアイデアを選びます
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">効果的な使い方のコツ</h3>
                  <ul className="list-disc space-y-2 pl-6 text-gray-700">
                    <li>他の人のアイデアを批判せず、発展させる視点で考えましょう</li>
                    <li>思いついたアイデアはとりあえず書き出してみましょう</li>
                    <li>時間制限を設けることで、考えすぎずにアイデアを出しやすくなります</li>
                    <li>最後に全員でアイデアを振り返り、良いものを選びましょう</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">よくある質問</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Q. 何人で実施するのが良いですか？
                      </p>
                      <p className="text-gray-700">
                        A.
                        3〜6人程度が最適です。それ以上になると時間がかかりすぎる可能性があります。
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Q. どのシートに入力すれば良いですか？
                      </p>
                      <p className="text-gray-700">
                        A. シート一覧で自分の名前が表示されているシートを選んでください。
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Q. アイデアが思いつかない時は？</p>
                      <p className="text-gray-700">
                        A. 他の人のアイデアを組み合わせたり、逆の視点から考えてみましょう。
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

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
