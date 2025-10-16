/**
 * ブレインライティングのリアルタイム監視フック
 * 参加者とシート情報をリアルタイムで更新
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { events } from "aws-amplify/data";
import { BRAINWRITING_EVENT_TYPES } from "@/lib/appsync-events/event-types";
import type { BrainwritingUserData, BrainwritingSheetData } from "@/types/brainwriting";

interface UseBrainwritingRealtimeProps {
  brainwritingId: number;
  initialUsers: BrainwritingUserData[];
  initialSheets: BrainwritingSheetData[];
}

export function useBrainwritingRealtime({
  brainwritingId,
  initialUsers,
  initialSheets,
}: UseBrainwritingRealtimeProps) {
  const [users, setUsers] = useState<BrainwritingUserData[]>(initialUsers);
  const [sheets, setSheets] = useState<BrainwritingSheetData[]>(initialSheets);
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

  // 最新のシート情報をAPIから取得
  const fetchLatestSheets = useCallback(async () => {
    try {
      const response = await fetch(`/api/brainwritings/${brainwritingId}/sheets`);
      if (response.ok) {
        const data = await response.json();
        setSheets(data.sheets);
      }
    } catch (error) {
      console.error("シート情報取得エラー:", error);
    }
  }, [brainwritingId]);

  useEffect(() => {
    let unsubscribe: { unsubscribe: () => void } | undefined;

    const connect = async () => {
      try {
        // AWS Amplify Eventsでチャンネルを購読
        const channel = await events.connect(`/brainwriting/${brainwritingId}`);
        setIsConnected(true);

        unsubscribe = channel.subscribe({
          next: (data: unknown) => {
            try {
              const message = typeof data === "string" ? JSON.parse(data) : data;

              // AppSync Eventsのメッセージ構造に対応
              if (message.event && message.event.data) {
                const eventDataStr = message.event.data;
                const eventData = typeof eventDataStr === "string" ? JSON.parse(eventDataStr) : eventDataStr;

                // イベントタイプに応じて処理
                switch (eventData.type) {
                  case BRAINWRITING_EVENT_TYPES.USER_JOINED:
                    // 参加者一覧を更新
                    fetchLatestUsers();
                    break;
                  case BRAINWRITING_EVENT_TYPES.BRAINWRITING_STARTED:
                  case BRAINWRITING_EVENT_TYPES.SHEET_ROTATED:
                    // シート情報を更新
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
  }, [brainwritingId, fetchLatestUsers, fetchLatestSheets]);

  return { users, sheets, isConnected };
}
