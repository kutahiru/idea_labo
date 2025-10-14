import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">プライバシーポリシー</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <p className="mb-4">
            アイデア研究所(以下「当サービス」といいます)は、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー(以下「本ポリシー」といいます)を定めます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">1. 収集する情報</h2>
          <p className="mb-2">当サービスは、ユーザーから以下の情報を収集します。</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Googleアカウント情報</strong>
              <ul className="list-circle mt-1 pl-6">
                <li>メールアドレス</li>
                <li>ユーザー名</li>
                <li>プロフィール画像</li>
              </ul>
            </li>
            <li>
              <strong>サービス利用情報</strong>
              <ul className="list-circle mt-1 pl-6">
                <li>
                  ブレインライティング、マンダラート、オズボーンのチェックリストで入力された内容
                </li>
                <li>アイデアカテゴリおよびアイデアの登録内容</li>
                <li>サービスの利用履歴</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">2. 情報の利用目的</h2>
          <p className="mb-2">収集した情報は、以下の目的で利用します。</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>当サービスの提供・運営のため</li>
            <li>ユーザー認証のため</li>
            <li>ユーザーサポート対応のため</li>
            <li>サービスの改善・機能追加のため</li>
            <li>利用規約に違反する行為への対応のため</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">3. 情報の共有</h2>
          <p className="mb-2">当サービスでは、以下の場合に情報が他のユーザーと共有されます。</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>ブレインライティング機能</strong>
              <ul className="list-circle mt-1 pl-6">
                <li>
                  X投稿版: 共有リンクにアクセスしたユーザーとアイデアシートの内容が共有されます
                </li>
                <li>
                  チーム版: 招待リンクで参加したメンバー間でアイデアシートの内容が共有されます
                </li>
                <li>参加者のユーザー名が他の参加者に表示されます</li>
              </ul>
            </li>
            <li>
              <strong>X(Twitter)への投稿</strong>
              <ul className="list-circle mt-1 pl-6">
                <li>ユーザーが明示的に共有を選択した場合、共有リンクがX上に投稿されます</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">4. 情報の第三者提供</h2>
          <p className="mb-2">
            当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>
              人の生命、身体または財産の保護のために必要がある場合であって、ユーザーの同意を得ることが困難である場合
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">5. 情報の管理</h2>
          <p>
            当サービスは、ユーザーの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破壊・改ざん・漏洩などを防止するため、適切なセキュリティ対策を実施します。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">6. 外部サービスの利用</h2>
          <p className="mb-2">当サービスは、以下の外部サービスを利用しています。</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Google OAuth 2.0</strong>: ユーザー認証のため
            </li>
            <li>
              <strong>PostgreSQL</strong>:
              データベースとしてユーザー情報およびコンテンツの保存のため
            </li>
          </ul>
          <p className="mt-3">
            これらの外部サービスのプライバシーポリシーについては、各サービスの規約をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">7. データの保持期間</h2>
          <p>
            ユーザーがアカウントを削除した場合、または当サービスが利用規約に基づきアカウントを削除した場合、データベース上のユーザー情報および関連するコンテンツは削除されます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">8. 本ポリシーの変更</h2>
          <p>
            当サービスは、必要に応じて本ポリシーを変更することがあります。変更後のプライバシーポリシーは、当サービス上に掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">9. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、
            <Link href="/" className="text-blue-600 hover:underline">
              トップページ
            </Link>
            からご連絡ください。
          </p>
        </section>

        <section className="pt-4">
          <p className="text-sm text-gray-600">制定日: 2025年10月15日</p>
        </section>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">
          ← トップページに戻る
        </Link>
      </div>
    </div>
  );
}
