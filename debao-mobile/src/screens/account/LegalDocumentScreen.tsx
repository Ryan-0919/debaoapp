import {useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {RemoteState} from '@/components/ui';
import {environment} from '@/config/environment';
import {legalService} from '@/services';
import type {AppLegalDocument} from '@/services';
import {colors, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type ScreenRoute = RouteProp<RootStackParamList, 'LegalDocument'>;

const documents = {
  terms: {
    title: '用户协议',
    updatedAt: '2026年8月31日',
    sections: [
      ['一、服务说明', '得宝为法律职业资格考试学习应用，向注册用户提供题库、课程、学习记录及相关服务。用户应使用本人手机号注册并妥善保管登录设备。'],
      ['二、账号使用', '不得转让、出租或以其他方式向他人提供账号。发现账号异常时，应及时更换绑定手机号、移除异常设备或联系客服。'],
      ['三、内容与交易', '课程权益、订单状态和退款规则以购买页面及订单约定为准。用户上传的答题内容应当合法，不得侵害他人权益。'],
      ['四、责任与变更', '因维护、网络或第三方服务导致的短时不可用，将在合理范围内及时恢复。协议发生重要变更时，将通过应用内方式提示。'],
    ],
  },
  privacy: {
    title: '隐私政策',
    updatedAt: '2026年8月31日',
    sections: [
      ['一、信息收集', '为完成注册登录、学习同步和账号安全验证，我们会处理手机号、登录设备标识、学习记录、订单信息及用户主动提交的资料。'],
      ['二、权限使用', '相册、相机、通知等系统权限仅在对应功能被用户主动使用时申请。拒绝非必要权限不影响手机号登录和基础学习功能。'],
      ['三、共享与委托处理', '仅在实现短信、微信登录、号码认证、支付、推送等必要功能时，按最小范围向已披露的服务商提供信息。具体范围见第三方 SDK 清单。'],
      ['四、用户权利', '用户可在账号与安全页面更换手机号、管理第三方绑定和登录设备，并可申请注销账号或在冷静期内撤销。'],
      ['五、保存与保护', '个人信息在实现目的所需期限内保存，并采取访问控制、传输保护和会话吊销等措施。法律另有保存要求的，从其规定。'],
    ],
  },
  'sdk-list': {
    title: '第三方 SDK 清单',
    updatedAt: '2026年8月31日',
    sections: [
      ['当前接入状态', '开发版本仅提供微信登录和本机号码认证的原生适配器边界，尚未配置正式供应商 SDK、AppID、签名和生产密钥。未配置能力会明确停用，不会模拟生产授权成功。'],
      ['正式发布要求', '接入前需补充服务商名称、SDK 版本、处理目的、信息类型、使用场景、隐私政策链接及三端初始化时机，并经隐私合规审核和真机验证。'],
    ],
  },
  'account-deletion': {
    title: '账号注销说明',
    updatedAt: '2026年8月31日',
    sections: [
      ['申请条件', '登录后通过当前绑定手机号验证码确认本人操作。存在依法不能立即处理的争议、欠款或未完结交易时，相关记录按法律要求保留。'],
      ['冷静期', '注销申请提交后进入 7 天冷静期。冷静期内可以在账号与安全页面撤销，撤销后账号继续正常使用。'],
      ['执行结果', '冷静期结束后，系统会匿名化账号资料、解除第三方账号绑定、移除登录设备并吊销全部会话。依法必须保存的交易和审计记录仅在规定期限及目的内保留。'],
    ],
  },
} as const;

export default function LegalDocumentScreen() {
  const route = useRoute<ScreenRoute>();
  const key = route.params.document;
  const fixture = documents[key];
  const [remoteDocument, setRemoteDocument] = useState<AppLegalDocument>();
  const [loading, setLoading] = useState(!environment.useMocks);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (environment.useMocks) return;
    setLoading(true);
    setError('');
    try {
      if (!legalService.getDocument) throw new Error('法律文档服务暂不可用，请稍后重试。');
      setRemoteDocument(await legalService.getDocument(key));
    } catch (reason) {
      setRemoteDocument(undefined);
      setError(reason instanceof Error ? reason.message : '法律文档加载失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }, [key]);
  useEffect(() => { load().catch(() => undefined); }, [load]);

  const document = environment.useMocks ? fixture : remoteDocument;
  const updatedAt = document?.updatedAt ?? '';
  const formattedUpdatedAt = (() => {
    if (!updatedAt || environment.useMocks) return updatedAt;
    const date = new Date(updatedAt);
    return Number.isNaN(date.getTime()) ? updatedAt : `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  })();
  return (
    <AppScreen backgroundColor={colors.surface} testID={`legal-document-${key}`}>
      <PageHeader title={document?.title ?? fixture.title} />
      {loading || error || !document ? (
        <RemoteState
          testID={`legal-document-${key}-state`}
          loading={loading}
          error={error}
          empty={!loading && !error && !document}
          loadingLabel="正在加载法律文档..."
          emptyTitle="暂无法显示文档"
          emptyDescription="当前文档没有可用内容，请稍后重试。"
          onRetry={load}
        />
      ) : (
        <View style={styles.content}>
          <Text style={styles.updatedAt}>更新日期：{formattedUpdatedAt}</Text>
          {document.sections.map(section => {
            const objectSection = typeof section === 'object' && !Array.isArray(section) && 'title' in section;
            const title = objectSection ? section.title : section[0];
            const body = objectSection ? section.body : section[1];
            return <View key={title} style={styles.section}><Text style={styles.title}>{title}</Text><Text style={styles.body}>{body}</Text></View>;
          })}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.section},
  updatedAt: {fontSize: 12, color: colors.muted},
  section: {marginTop: spacing.xl},
  title: {fontSize: 16, fontWeight: '700', color: colors.ink},
  body: {marginTop: spacing.sm, fontSize: 14, lineHeight: 24, color: colors.body},
});
