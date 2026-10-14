import type {AppLegalDocument} from './types.js';

// These are the versioned legal texts shipped by the RC.  The API exposes the
// same records so clients do not keep a second, silently diverging copy.
export const appLegalDocuments: AppLegalDocument[] = [
  {
    key: 'terms',
    title: '用户协议',
    version: 1,
    updatedAt: '2026-08-31T00:00:00.000Z',
    status: 'published',
    sections: [
      {title: '一、服务说明', body: '得宝为法律职业资格考试学习应用，向注册用户提供题库、课程、学习记录及相关服务。用户应使用本人手机号注册并妥善保管登录设备。'},
      {title: '二、账号使用', body: '不得转让、出租或以其他方式向他人提供账号。发现账号异常时，应及时更换绑定手机号、移除异常设备或联系客服。'},
      {title: '三、内容与交易', body: '课程权益、订单状态和退款规则以购买页面及订单约定为准。用户上传的答题内容应当合法，不得侵害他人权益。'},
      {title: '四、责任与变更', body: '因维护、网络或第三方服务导致的短时不可用，将在合理范围内及时恢复。协议发生重要变更时，将通过应用内方式提示。'},
    ],
  },
  {
    key: 'privacy',
    title: '隐私政策',
    version: 1,
    updatedAt: '2026-08-31T00:00:00.000Z',
    status: 'published',
    sections: [
      {title: '一、信息收集', body: '为完成注册登录、学习同步和账号安全验证，我们会处理手机号、登录设备标识、学习记录、订单信息及用户主动提交的资料。'},
      {title: '二、权限使用', body: '相册、相机、通知等系统权限仅在对应功能被用户主动使用时申请。拒绝非必要权限不影响手机号登录和基础学习功能。'},
      {title: '三、共享与委托处理', body: '仅在实现短信、微信登录、号码认证、支付、推送等必要功能时，按最小范围向已披露的服务商提供信息。具体范围见第三方 SDK 清单。'},
      {title: '四、用户权利', body: '用户可在账号与安全页面更换手机号、管理第三方绑定和登录设备，并可申请注销账号或在冷静期内撤销。'},
      {title: '五、保存与保护', body: '个人信息在实现目的所需期限内保存，并采取访问控制、传输保护和会话吊销等措施。法律另有保存要求的，从其规定。'},
    ],
  },
  {
    key: 'sdk-list',
    title: '第三方 SDK 清单',
    version: 1,
    updatedAt: '2026-08-31T00:00:00.000Z',
    status: 'published',
    sections: [
      {title: '当前接入状态', body: '开发版本仅提供微信登录和本机号码认证的原生适配器边界，尚未配置正式供应商 SDK、AppID、签名和生产密钥。未配置能力会明确停用，不会模拟生产授权成功。'},
      {title: '正式发布要求', body: '接入前需补充服务商名称、SDK 版本、处理目的、信息类型、使用场景、隐私政策链接及三端初始化时机，并经隐私合规审核和真机验证。'},
    ],
  },
  {
    key: 'account-deletion',
    title: '账号注销说明',
    version: 1,
    updatedAt: '2026-08-31T00:00:00.000Z',
    status: 'published',
    sections: [
      {title: '申请条件', body: '登录后通过当前绑定手机号验证码确认本人操作。存在依法不能立即处理的争议、欠款或未完结交易时，相关记录按法律要求保留。'},
      {title: '冷静期', body: '注销申请提交后进入 7 天冷静期。冷静期内可以在账号与安全页面撤销，撤销后账号继续正常使用。'},
      {title: '执行结果', body: '冷静期结束后，系统会匿名化账号资料、解除第三方账号绑定、移除登录设备并吊销全部会话。依法必须保存的交易和审计记录仅在规定期限及目的内保留。'},
    ],
  },
];

