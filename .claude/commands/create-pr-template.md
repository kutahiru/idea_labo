---
description: Git差分を元にプルリクエストのテンプレートを生成
argument-hint: [ブランチ名(オプション)]
allowed-tools: Bash(*), Read(*), Write(*)
---

# PRテンプレート生成

現在のgit差分を分析してプルリクエストのテンプレートを生成します。

## 実行する処理:

1. 現在のブランチと変更ファイルを確認
2. コミット履歴を取得
3. 差分統計を分析
4. プロジェクトに適したPRテンプレートを生成

ブランチ名が指定された場合は、そのブランチとの差分を分析します。

!git status
!git diff --name-only HEAD~1
!git log --oneline -5
!git diff --stat

PRテンプレートを以下の形式で生成してください：
概要のみの記述でお願いします。

## 概要

[変更内容の要約]

## 対応Issue

- close

## 関連Issue

- なし

## 特記事項

- なし

🤖 Generated with [Claude Code](https://claude.ai/code)
