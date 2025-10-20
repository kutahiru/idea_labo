"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import IdeaFrameworkInfo from "@/components/shared/IdeaFrameworkInfo";
import BrainwritingSheet from "@/components/brainwritings/BrainwritingSheet";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { BrainwritingDetail, BrainwritingInputData } from "@/types/brainwriting";
import { convertToRowData, handleBrainwritingDataChange, USAGE_SCOPE } from "@/utils/brainwriting";

interface BrainwritingInputClientProps {
  brainwritingDetail: BrainwritingDetail;
  currentUserId: string;
  initialSecondsLeft: number | null;
}

export default function BrainwritingInputClient({
  brainwritingDetail,
  currentUserId,
  initialSecondsLeft,
}: BrainwritingInputClientProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
  const { sheets, inputs, users, ...brainwriting } = brainwritingDetail;
  const [currentInputs, setCurrentInputs] = useState(inputs);
  const sheet = sheets[0];

  // ロック期限の監視（サーバー計算の残り時間を使用）
  useEffect(() => {
    console.log("useEffect実行", {
      initialSecondsLeft,
      current_user_id: sheet.current_user_id,
      currentUserId,
    });

    if (initialSecondsLeft === null || sheet.current_user_id !== currentUserId) {
      console.log("条件不一致で終了");
      return;
    }

    // 残り1分（60秒）になるまでの時間を計算
    const timeUntilOneMinute = (initialSecondsLeft - 60) * 1000; // ミリ秒
    const timeUntilTimeout = initialSecondsLeft * 1000; // 時間切れまでの時間

    const timeouts: NodeJS.Timeout[] = [];

    if (timeUntilOneMinute > 0) {
      // 残り1分になったらアラート表示
      const alertTimeout = setTimeout(() => {
        console.log("残り1分アラート表示");
        toast.error("回答時間が残り1分です", {
          duration: 10000, // 10秒表示
          style: {
            fontSize: "18px",
            padding: "20px",
            minWidth: "300px",
          },
        });
      }, timeUntilOneMinute);
      timeouts.push(alertTimeout);
    } else if (initialSecondsLeft <= 60 && initialSecondsLeft > 0) {
      // すでに残り1分以下の場合、即座に表示
      console.log("すでに残り1分以下のためアラート表示");
      toast.error("回答時間が残り1分です！", {
        duration: 10000, // 10秒表示
        style: {
          fontSize: "18px",
          padding: "20px",
          minWidth: "300px",
        },
      });
    }

    // 時間切れになったらモーダル表示
    if (timeUntilTimeout > 0) {
      const timeoutTimeout = setTimeout(() => {
        console.log("時間切れモーダル表示");
        setIsTimeoutModalOpen(true);
      }, timeUntilTimeout);
      timeouts.push(timeoutTimeout);
    } else if (initialSecondsLeft <= 0) {
      // すでに時間切れの場合、即座に表示
      console.log("すでに時間切れのためモーダル表示");
      setIsTimeoutModalOpen(true);
    }

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [initialSecondsLeft, sheet.current_user_id, currentUserId]);

  // inputsを行データ形式に変換する
  const brainwritingRows = convertToRowData(currentInputs, users);

  // 現在のユーザーの行インデックスを計算（参加順）
  const activeRowIndex = users.findIndex(u => u.user_id === currentUserId);

  // current_user_idが自身と一致しない場合は読み取り専用
  const isAllReadOnly = sheet.current_user_id !== currentUserId;

  // アイデアコンポーネントに渡す関数を定義
  const handleDataChange = async (
    rowIndex: number,
    ideaIndex: number,
    value: string,
    sheetId: number
  ) => {
    await handleBrainwritingDataChange(brainwritingDetail.id, rowIndex, ideaIndex, value, sheetId);

    // stateを更新
    setCurrentInputs(prevInputs => {
      return prevInputs.map(input => {
        if (
          input.brainwriting_sheet_id === sheetId &&
          input.row_index === rowIndex &&
          input.column_index === ideaIndex
        ) {
          return { ...input, content: value || null };
        }
        return input;
      });
    });
  };

  // 回答完了ボタンクリック時の関数を定義
  const handleCompleteClick = async () => {
    // アクティブな要素からフォーカスを外す
    // BrainwritingCellのonBlurが発火し、未保存の入力データを確実に保存する
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // onBlur → handleDataChange（非同期API呼び出し）の完了を待つ
    await new Promise(resolve => setTimeout(resolve, 200));

    // APIから最新のinputsを取得して検証
    const response = await fetch(`/api/brainwritings/sheet/${sheet.id}/inputs`);
    if (!response.ok) {
      toast.error("データの取得に失敗しました");
      return;
    }
    const latestInputs: BrainwritingInputData[] = await response.json();

    // 現在のユーザーの入力データのみチェック
    const myInputs = latestInputs.filter(input => input.row_index === activeRowIndex);

    // アイデアが未入力かチェック（contentがnullまたは空文字列）
    const hasEmptyInput = myInputs.some(
      input => input.content === null || input.content.trim() === ""
    );

    if (hasEmptyInput) {
      toast.error("すべてのアイデアを入力してください");
      return;
    }

    // 確認モーダルを表示
    setIsConfirmModalOpen(true);
  };

  // 回答完了処理の関数を定義
  const handleComplete = async () => {
    setIsConfirmModalOpen(false);
    setIsCompleting(true);

    try {
      const response = await fetch(`/api/brainwritings/sheet/${sheet.id}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "完了処理に失敗しました");
      }

      // シートのcurrent_user_idをnullに更新してから遷移
      // これをしないとブラウザバックで戻った際に編集可能なままになってしまう
      sheet.current_user_id = null;

      // チーム利用版の場合はチームページへ、X投稿版の場合は完了画面へ遷移
      if (brainwriting.usageScope === USAGE_SCOPE.TEAM) {
        toast.success("次の人に交代しました");
        router.push(`/brainwritings/${brainwriting.id}/team`);
      } else {
        router.push(`/brainwritings/sheet/${sheet.id}/complete`);
      }
    } catch (error) {
      console.error("完了エラー:", error);
      toast.error("完了処理に失敗しました。再度お試しください。");
      setIsCompleting(false);
    }
  };

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={brainwriting} />

      <BrainwritingSheet
        brainwritingRows={brainwritingRows}
        activeRowIndex={!isAllReadOnly && activeRowIndex >= 0 ? activeRowIndex : undefined}
        isAllReadOnly={isAllReadOnly}
        onDataChange={(rowIndex, ideaIndex, value) =>
          handleDataChange(rowIndex, ideaIndex, value, sheet.id)
        }
      />

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="rounded-md bg-gray-500 px-6 py-2 text-white transition-transform hover:scale-105"
        >
          戻る
        </button>
        <button
          onClick={handleCompleteClick}
          disabled={isCompleting || isAllReadOnly}
          className="bg-primary rounded-md px-6 py-2 text-white transition-transform hover:scale-105 disabled:bg-gray-400 disabled:hover:scale-100"
        >
          {isAllReadOnly ? "回答済" : isCompleting ? "完了処理中..." : "回答を完了する"}
        </button>
      </div>

      {/* 確認モーダル */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="回答を完了しますか？"
        message="回答を完了してよろしいですか？&#10;完了後は編集できなくなります。"
        confirmText="完了する"
        cancelText="キャンセル"
        onConfirm={handleComplete}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      {/* 時間切れモーダル */}
      <ConfirmModal
        isOpen={isTimeoutModalOpen}
        title="時間切れ"
        message="回答時間が終了しました。&#10;トップページに戻ります。"
        confirmText="トップページへ"
        cancelText=""
        onConfirm={() => router.push("/")}
        onCancel={() => {}}
      />
    </div>
  );
}
