"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BrainwritingGuideModal from "@/components/brainwritings/BrainwritingGuideModal";
import MandalartGuideModal from "@/components/mandalarts/MandalartGuideModal";
import OsbornChecklistGuideModal from "@/components/osborn-checklists/OsbornChecklistGuideModal";

export default function GuidePage() {
  const [isBrainwritingModalOpen, setIsBrainwritingModalOpen] = useState(false);
  const [isMandalartModalOpen, setIsMandalartModalOpen] = useState(false);
  const [isOsbornModalOpen, setIsOsbornModalOpen] = useState(false);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-primary mb-8 text-3xl font-bold">ご利用ガイド</h1>

      <div className="space-y-8 text-muted">
        <section>
          <h2 className="text-primary mb-4 text-2xl font-semibold">アイデア研究所とは</h2>
          <p className="leading-relaxed">
            当アプリはアイデアの発想と管理を可能とするアプリとなります。
            <br />
            3つのアイデア発想のためのフレームワークが利用可能です。
          </p>
        </section>

        <section>
          <h2 className="text-primary mb-4 text-2xl font-semibold">利用可能なフレームワーク</h2>

          {/* ブレインライティング */}
          <div className="mb-6 rounded-lg border border-border p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-primary text-xl font-semibold">ブレインライティング</h3>
              <button
                onClick={() => setIsBrainwritingModalOpen(true)}
                className="text-primary hover:text-primary-hover cursor-pointer text-sm font-medium underline"
              >
                詳細を見る
              </button>
            </div>
            <p className="text-primary decoration-accent mb-4 text-lg font-semibold underline decoration-4 underline-offset-[-2px]">
              複数人でアイデアを発想する
            </p>
            <p className="mb-3 leading-relaxed">
              回覧板のようにシートを回していき、前の人のアイデアを参考にアイデアを発展させていきます。
              <br />
              利用するシチュエーションによって2つの利用方法を用意しています。
              <br />
              発言が苦手なメンバーでも参加しやすいという利点があります。
            </p>
            <div className="mb-4 flex justify-center">
              <Image
                src="/brainwriting_guide.png"
                alt="ブレインライティングのガイド"
                width={600}
                height={400}
                className="rounded-lg border border-border"
              />
            </div>
            <div className="ml-4 space-y-2">
              <div>
                <h4 className="font-semibold text-foreground">X投稿版</h4>
                <p className="text-sm leading-relaxed">
                  X投稿版は、自分が最初のアイデアを考え、それをXで共有して他の人にアイデアを追加してもらう機能です。
                  <br />
                  1つのシートを使い、順番に6行のアイデアを完成させていきます。
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">チーム利用版</h4>
                <p className="text-sm leading-relaxed">
                  チーム利用版は、複数人でアイデアを出し合う発想法です。
                  <br />
                  各参加者が自分のシートにアイデアを書き込み、次のラウンドで別の人のシートを見ながら新しいアイデアを発展させていきます。
                  <br />
                  Web会議での使用を想定しています。
                </p>
              </div>
            </div>
          </div>

          {/* マンダラート */}
          <div className="mb-6 rounded-lg border border-border p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-primary text-xl font-semibold">マンダラート</h3>
              <button
                onClick={() => setIsMandalartModalOpen(true)}
                className="text-primary hover:text-primary-hover cursor-pointer text-sm font-medium underline"
              >
                詳細を見る
              </button>
            </div>
            <p className="text-primary decoration-accent mb-4 text-lg font-semibold underline decoration-4 underline-offset-[-2px]">
              個人で網羅的にアイデアを発想する
            </p>
            <p className="mb-3 leading-relaxed">
              9×9の81マスのマス目にアイデアや目標を書き込んで思考を整理し、アイデアを発展させるフレームワークです。
              <br />
              キーワードを網羅的に可視化することで、新たなアイデアへとつなげることができます。
            </p>
            <div className="flex justify-center">
              <Image
                src="/mandalart_guide.png"
                alt="マンダラートのガイド"
                width={600}
                height={400}
                className="rounded-lg border border-border"
              />
            </div>
          </div>

          {/* オズボーンのチェックリスト */}
          <div className="mb-6 rounded-lg border border-border p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-primary text-xl font-semibold">オズボーンのチェックリスト</h3>
              <button
                onClick={() => setIsOsbornModalOpen(true)}
                className="text-primary hover:text-primary-hover cursor-pointer text-sm font-medium underline"
              >
                詳細を見る
              </button>
            </div>
            <p className="text-primary decoration-accent mb-4 text-lg font-semibold underline decoration-4 underline-offset-[-2px]">
              個人で既存のアイデアから別視点のアイデアを発想する
            </p>
            <p className="mb-3 leading-relaxed">
              既存の物事や課題に対して、「転用」「応用」「変更」「拡大」「縮小」「代用」「再配置」「逆転」「結合」の9つの視点から強制的に問いを立て、新しいアイデアを発想するためのフレームワークです。
              <br />
              様々な視点で考えることを可能とするため、斬新なアイデアを生み出すことができます。
            </p>
            <div className="flex justify-center">
              <Image
                src="/osborn_checklist_guide.png"
                alt="オズボーンのチェックリストのガイド"
                width={600}
                height={400}
                className="rounded-lg border border-border"
              />
            </div>
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="bg-primary hover:bg-primary-hover cursor-pointer rounded-md px-6 py-2 font-medium text-white transition-colors"
          >
            トップページに戻る
          </Link>
        </div>
      </div>

      {/* モーダル */}
      <BrainwritingGuideModal
        isOpen={isBrainwritingModalOpen}
        onClose={() => setIsBrainwritingModalOpen(false)}
      />
      <MandalartGuideModal
        isOpen={isMandalartModalOpen}
        onClose={() => setIsMandalartModalOpen(false)}
      />
      <OsbornChecklistGuideModal
        isOpen={isOsbornModalOpen}
        onClose={() => setIsOsbornModalOpen(false)}
      />
    </div>
  );
}
