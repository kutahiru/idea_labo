import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">利用規約</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <p>
            本利用規約(以下「本規約」といいます)は、アイデア研究所(以下「当サービス」といいます)の利用条件を定めるものです。ユーザーの皆様には、本規約に従って当サービスをご利用いただきます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第1条(適用)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              本規約は、ユーザーと当サービスとの間の当サービスの利用に関わる一切の関係に適用されるものとします。
            </li>
            <li>
              ユーザーは、当サービスを利用することによって、本規約に同意したものとみなされます。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第2条(サービスの内容)</h2>
          <p className="mb-2">当サービスは、以下の機能を提供します。</p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              <strong>ブレインライティング機能</strong>
              <ul className="list-circle mt-1 pl-6">
                <li>X投稿版: 共有リンクを通じた不特定多数とのアイデア発想</li>
                <li>チーム版: 招待リンクを通じた特定メンバーとのアイデア発想</li>
              </ul>
            </li>
            <li>
              <strong>マンダラート機能</strong>
              <ul className="list-circle mt-1 pl-6">
                <li>9×9マスでのアイデア整理・発展</li>
              </ul>
            </li>
            <li>
              <strong>オズボーンのチェックリスト機能</strong>
              <ul className="list-circle mt-1 pl-6">
                <li>9つの視点からのアイデア発想支援</li>
              </ul>
            </li>
            <li>
              <strong>アイデア管理機能</strong>
              <ul className="list-circle mt-1 pl-6">
                <li>カテゴリ別のアイデア登録・管理</li>
                <li>優先度設定機能</li>
              </ul>
            </li>
            <li>
              <strong>X(Twitter)連携機能</strong>
              <ul className="list-circle mt-1 pl-6">
                <li>ブレインライティングの共有リンクのX投稿</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第3条(利用登録)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>当サービスの利用には、Googleアカウントによる認証が必要です。</li>
            <li>
              利用登録は、ユーザー自身が真実かつ正確な情報を提供することにより行うものとします。
            </li>
            <li>
              ユーザーが以下のいずれかに該当する場合、当サービスは利用登録を拒否することがあります。
              <ul className="list-circle mt-2 pl-6">
                <li>本規約に違反したことがある場合</li>
                <li>その他、当サービスが利用登録を適当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第4条(アカウントの管理)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              ユーザーは、自己の責任において、当サービスのアカウントを適切に管理するものとします。
            </li>
            <li>
              ユーザーは、いかなる場合にも、アカウントを第三者に譲渡または貸与することはできません。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第5条(禁止事項)</h2>
          <p className="mb-2">
            ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>当サービスの運営を妨害するおそれのある行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>当サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
            <li>
              当サービスの他のユーザーまたは第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為
            </li>
            <li>
              過度に暴力的な表現、露骨な性的表現、人種・国籍・信条・性別・社会的身分・門地等による差別につながる表現、自殺・自傷行為・薬物乱用を誘引または助長する表現、その他反社会的な内容を含み他人に不快感を与える表現を、投稿または送信する行為
            </li>
            <li>
              営業、宣伝、広告、勧誘、その他営利を目的とする行為(当サービスの認めたものを除きます)
            </li>
            <li>性行為やわいせつな行為を目的とする行為</li>
            <li>面識のない異性との出会いや交際を目的とする行為</li>
            <li>他のユーザーに対する嫌がらせや誹謗中傷を目的とする行為</li>
            <li>当サービスの他のユーザー、または第三者に不利益、損害または不快感を与える行為</li>
            <li>その他、当サービスが不適切と判断する行為</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第6条(投稿コンテンツの取扱い)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              ユーザーが当サービスに投稿したアイデアやコンテンツ(以下「投稿コンテンツ」といいます)の知的財産権は、ユーザーに帰属します。
            </li>
            <li>
              ユーザーは、投稿コンテンツについて、当サービスに対し、世界的、非独占的、無償、サブライセンス可能かつ譲渡可能な使用、複製、配布、派生著作物の作成、表示および実行に関するライセンスを付与します。
            </li>
            <li>
              ユーザーは、投稿コンテンツについて、当サービスおよび当サービスの他のユーザーに対し、著作者人格権を行使しないことに同意するものとします。
            </li>
            <li>
              当サービスは、投稿コンテンツが本規約に違反していると判断した場合、事前の通知なく当該投稿コンテンツを削除することができるものとします。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第7条(ブレインライティング機能の利用)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              X投稿版のブレインライティングでは、共有リンクがX上に公開され、不特定多数のユーザーがアクセス可能となります。ユーザーは、この点を理解の上で利用するものとします。
            </li>
            <li>
              チーム版のブレインライティングでは、招待リンクにアクセスしたメンバー間でアイデアシートが共有されます。
            </li>
            <li>
              ブレインライティング機能では、各シートの編集時にロック機能が働き、同時編集を防止します。ユーザーは、編集完了後は速やかに確定操作を行うものとします。
            </li>
            <li>管理者は、共有リンクの無効化により、第三者のアクセスを制限することができます。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第8条(当サービスの提供の停止等)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              当サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく当サービスの全部または一部の提供を停止または中断することができるものとします。
              <ul className="list-circle mt-2 pl-6">
                <li>当サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>
                  地震、落雷、火災、停電または天災などの不可抗力により、当サービスの提供が困難となった場合
                </li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当サービスが当サービスの提供が困難と判断した場合</li>
              </ul>
            </li>
            <li>
              当サービスは、当サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第9条(利用制限およびアカウント削除)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              当サービスは、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、当サービスの全部もしくは一部の利用を制限し、またはアカウントを削除することができるものとします。
              <ul className="list-circle mt-2 pl-6">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>その他、当サービスが当サービスの利用を適当でないと判断した場合</li>
              </ul>
            </li>
            <li>
              当サービスは、本条に基づき当サービスが行った行為によりユーザーに生じた損害について、一切の責任を負いません。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第10条(退会)</h2>
          <p>
            ユーザーは、当サービス所定の退会手続により、当サービスから退会できるものとします。退会後、ユーザーのアカウントおよび関連するデータは削除されます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第11条(保証の否認および免責事項)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              当サービスは、当サービスに事実上または法律上の瑕疵(安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます)がないことを明示的にも黙示的にも保証しておりません。
            </li>
            <li>
              当サービスは、当サービスに起因してユーザーに生じたあらゆる損害について、一切の責任を負いません。ただし、当サービスに関する当サービスとユーザーとの間の契約が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
            </li>
            <li>
              前項ただし書に定める場合であっても、当サービスは、当サービスの過失(重過失を除きます)による債務不履行または不法行為によりユーザーに生じた損害のうち特別な事情から生じた損害(当サービスまたはユーザーが損害発生につき予見し、または予見し得た場合を含みます)について一切の責任を負いません。
            </li>
            <li>
              当サービスは、当サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第12条(サービス内容の変更等)</h2>
          <p>
            当サービスは、ユーザーに通知することなく、当サービスの内容を変更しまたは当サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第13条(利用規約の変更)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              当サービスは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
            </li>
            <li>変更後の利用規約は、当サービス上に掲載された時点で効力を生じるものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第14条(個人情報の取扱い)</h2>
          <p>
            当サービスは、当サービスの利用によって取得する個人情報については、「
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              プライバシーポリシー
            </Link>
            」に従い適切に取り扱うものとします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第15条(通知または連絡)</h2>
          <p>
            ユーザーと当サービスとの間の通知または連絡は、当サービスの定める方法によって行うものとします。当サービスは、ユーザーから、当サービスが別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第16条(権利義務の譲渡の禁止)</h2>
          <p>
            ユーザーは、当サービスの書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">第17条(準拠法・裁判管轄)</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>
              当サービスに関して紛争が生じた場合には、当サービスの運営者の所在地を管轄する裁判所を専属的合意管轄とします。
            </li>
          </ol>
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
