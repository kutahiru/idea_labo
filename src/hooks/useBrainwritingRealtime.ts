"use client";

import { useEffect, useState, useCallback } from "react";
import { events } from "aws-amplify/data";
import { BRAINWRITING_EVENT_TYPES } from "@/lib/appsync-events/event-types";
import { useAmplifyConfig } from "@/components/providers/AmplifyProvider";
import type {
  BrainwritingUserData,
  BrainwritingSheetData,
  BrainwritingInputData,
} from "@/types/brainwriting";

interface UseBrainwritingRealtimeProps {
  brainwritingId: number;
  initialUsers: BrainwritingUserData[];
  initialSheets: BrainwritingSheetData[];
  initialInputs: BrainwritingInputData[];
}

/**
 * ブレインライティングのリアルタイム更新を管理するカスタムフック
 *
 * AWS Amplify Events（IAM認証）を使用して、ブレインライティングの状態変更を
 * リアルタイムで監視し、参加者・シート・入力データを自動更新します。
 *
 * 監視するイベント：
 * - USER_JOINED: 参加者が追加された時 → 参加者一覧を再取得
 * - BRAINWRITING_STARTED: ブレインライティングが開始された時 → シート情報を再取得
 * - SHEET_ROTATED: シートがローテーションされた時 → シート情報を再取得
 *
 * 全員完了時は自動で入力データも取得します。
 *
 * @param brainwritingId - ブレインライティングのID
 * @param initialUsers - 参加者一覧の初期データ
 * @param initialSheets - シート情報の初期データ
 * @param initialInputs - 入力データの初期データ
 * @returns users - 最新の参加者一覧, sheets - 最新のシート情報, inputs - 最新の入力データ, isConnected - 接続状態
 */
export function useBrainwritingRealtime({
  brainwritingId,
  initialUsers,
  initialSheets,
  initialInputs,
}: UseBrainwritingRealtimeProps) {
  const { isConfigured } = useAmplifyConfig();
  const [users, setUsers] = useState<BrainwritingUserData[]>(initialUsers);
  const [sheets, setSheets] = useState<BrainwritingSheetData[]>(initialSheets);
  const [inputs, setInputs] = useState<BrainwritingInputData[]>(initialInputs);
  const [isConnected, setIsConnected] = useState(false);

  // 最新の参加者一覧をAPIから取得
  const fetchLatestUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/brainwritings/${brainwritingId}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("参加者一覧取得エラー:", error);
    }
  }, [brainwritingId]);

  // 最新の入力データをAPIから取得
  const fetchLatestInputs = useCallback(async () => {
    try {
      const response = await fetch(`/api/brainwritings/${brainwritingId}/inputs`);
      if (response.ok) {
        const data = await response.json();
        setInputs(data.inputs);
      }
    } catch (error) {
      console.error("入力データ取得エラー:", error);
    }
  }, [brainwritingId]);

  // 最新のシート情報をAPIから取得（全員完了時は入力データも取得）
  const fetchLatestSheets = useCallback(async () => {
    try {
      const response = await fetch(`/api/brainwritings/${brainwritingId}/sheets`);
      if (response.ok) {
        const data = await response.json();
        const fetchedSheets = data.sheets;
        setSheets(fetchedSheets);

        // 全員完了しているかチェック
        const allCompleted =
          fetchedSheets.length > 0 &&
          fetchedSheets.every((sheet: BrainwritingSheetData) => sheet.current_user_id === null);

        // 全員完了している場合のみ入力データを取得
        if (allCompleted) {
          await fetchLatestInputs();
        }
      }
    } catch (error) {
      console.error("シート情報取得エラー:", error);
    }
  }, [brainwritingId, fetchLatestInputs]);

  useEffect(() => {
    // Amplify設定が完了するまで待機
    if (!isConfigured) {
      return;
    }

    let unsubscribe: { unsubscribe: () => void } | undefined;

    const connect = async () => {
      try {
        // AWS Amplify Events でチャンネルを購読（IAM認証、名前空間指定）
        const channel = await events.connect(`brainwriting/brainwriting/${brainwritingId}`);
        setIsConnected(true);

        unsubscribe = channel.subscribe({
          next: (data: unknown) => {
            try {
              const message = typeof data === "string" ? JSON.parse(data) : data;

              // AppSync Eventsのメッセージ構造に対応
              if (message.event && message.event.type) {
                // イベントタイプに応じて処理
                switch (message.event.type) {
                  case BRAINWRITING_EVENT_TYPES.USER_JOINED:
                    fetchLatestUsers();
                    break;
                  case BRAINWRITING_EVENT_TYPES.BRAINWRITING_STARTED:
                  case BRAINWRITING_EVENT_TYPES.SHEET_ROTATED:
                    // シート情報を更新（全員完了時は自動で入力データも取得）
                    fetchLatestSheets();
                    break;
                }
              }
            } catch (error) {
              console.error("イベントデータのパースエラー:", error);
            }
          },
          error: (error: unknown) => {
            console.error("AppSync Eventsエラー:", error);
            setIsConnected(false);
          },
        });
      } catch (error) {
        console.error("AppSync Events接続エラー:", error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (unsubscribe) {
        unsubscribe.unsubscribe();
      }
    };
  }, [isConfigured, brainwritingId, fetchLatestUsers, fetchLatestSheets]);

  return { users, sheets, inputs, isConnected };
}
