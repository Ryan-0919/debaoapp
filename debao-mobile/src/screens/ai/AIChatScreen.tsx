import {useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {BookOpen, ChevronLeft, RotateCcw, Scale, Send, Sparkles} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, shadows} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Message = {id: string; role: 'assistant' | 'user'; text: string; time: string};

const QUICK_QUESTIONS = [
  {kind: 'book', label: '善意取得的三个要件是什么？'},
  {kind: 'scale', label: '诉讼时效与除斥期间有何区别？'},
  {kind: 'book', label: '合同无效与合同被撤销的区别？'},
  {kind: 'scale', label: '共同犯罪中从犯如何认定？'},
] as const;

const AI_REPLIES: Array<[string, string]> = [
  ['善意取得', '**善意取得的三个构成要件（《民法典》第311条）：**\n\n1. **受让人善意**：受让时不知道且不应当知道转让人无处分权。举证责任由主张恶意的一方承担。\n\n2. **以合理价格转让**：排除赠与、明显低价等情形，通常以不低于市价70%为参考。\n\n3. **已完成公示**：不动产须已登记，动产须已交付（含简易交付、指示交付）。\n\n**口诀**：善意 + 合价 + 公示 → 善意取得成立。'],
  ['诉讼时效', '**诉讼时效 vs 除斥期间对比：**\n\n**诉讼时效**（一般3年）\n- 消灭胜诉权，实体权利仍存在\n- 可以中断、中止、延长\n- 自知道或应知损害及义务人起算\n\n**除斥期间**（法定，不可变更）\n- 直接消灭实体权利\n- 不可中断、中止\n- 自权利成立之日起算\n\n**高频考点**：撤销权的行使期限——知道之日起1年（除斥期间），行为发生之日起5年（最长期限），两者均不适用中断中止。'],
  ['合同无效', '**合同无效 vs 合同被撤销：**\n\n**无效合同**：自始当然绝对无效，任何人可主张，法院可主动适用。典型情形：违反强制性规定、违背公序良俗、恶意串通损害第三人。\n\n**可撤销合同**：撤销前有效，撤销后溯及既往无效。只有特定当事人（撤销权人）可主张，1年除斥期间内行使。典型情形：欺诈、胁迫、重大误解、显失公平。\n\n**共同后果**：返还财产→折价补偿→损害赔偿，各自按过错承担责任。'],
  ['共同犯罪', '**从犯的认定（《刑法》第27条）：**\n\n在共同犯罪中起**次要或辅助**作用的为从犯。\n\n**两种类型：**\n- **次要实行犯**：参与实行但作用较小（如望风、部分实行）\n- **帮助犯**：未参与实行，仅提供帮助（提供工具、出谋划策）\n\n**处罚**：应当从轻、减轻或免除处罚（三档裁量）\n\n**易混点**：主犯 ≠ 首要分子。首要分子是犯罪集团/聚众犯罪中的组织策划者，不要求亲自实行。'],
];

const tick = () => {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const getReply = (text: string) => {
  for (const [key, reply] of AI_REPLIES) {
    if (text.includes(key)) return reply;
  }
  return `关于「${text}」的分析思路：\n\n**第一步：定性**\n明确涉及的法律关系类型和适用的法律领域（民事/刑事/行政）。\n\n**第二步：找构成要件**\n逐一对照相关法条的构成要件，逐项分析是否满足。\n\n**第三步：结合案情得结论**\n注意区分必要条件与充分条件，留意法律例外规定和司法解释。\n\n如果是具体案例，欢迎描述详情，我可以给出更针对性的分析。`;
};

function RichMessage({text}: {text: string}) {
  return (
    <View style={styles.richMessage}>
      {text.split('\n').map((line, lineIndex) => {
        if (!line) return <View key={`gap-${lineIndex}`} style={styles.paragraphGap} />;
        return (
          <Text key={`${line}-${lineIndex}`} style={styles.assistantText}>
            {line.split(/\*\*(.*?)\*\*/g).map((part, partIndex) => (
              <Text key={`${part}-${partIndex}`} style={partIndex % 2 ? styles.boldText : undefined}>{part}</Text>
            ))}
          </Text>
        );
      })}
    </View>
  );
}

function AssistantAvatar() {
  return <View style={styles.avatar}><Sparkles size={14} color="#FFFFFF" /></View>;
}

export default function AIChatScreen() {
  const navigation = useNavigation<Navigation>();
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialMessage = useRef<Message>({
    id: 'welcome',
    role: 'assistant',
    text: '你好！我是得宝法考AI助手，可以帮你解答法考相关问题。\n\n你可以问我：法律概念辨析、案例分析思路、法条解读、易混考点对比等。',
    time: tick(),
  });
  const [messages, setMessages] = useState<Message[]>([initialMessage.current]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const send = (value = input) => {
    const text = value.trim();
    if (!text || loading) return;
    setMessages(items => [...items, {id: `user-${Date.now()}`, role: 'user', text, time: tick()}]);
    setInput('');
    setLoading(true);
    timerRef.current = setTimeout(() => {
      setMessages(items => [...items, {id: `assistant-${Date.now()}`, role: 'assistant', text: getReply(text), time: tick()}]);
      setLoading(false);
      timerRef.current = null;
    }, 800 + Math.random() * 500);
  };

  const reset = () => setMessages([initialMessage.current]);
  const isFirst = messages.length === 1;

  return (
    <AppScreen scroll={false} keyboardAware backgroundColor={colors.page} testID="ai-chat-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" onPress={() => navigation.goBack()} style={({pressed}) => [styles.headerButton, styles.headerLeft, pressed && styles.pressed]}>
          <ChevronLeft size={22} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>AI 答疑</Text>
        <Pressable accessibilityLabel="重置对话" testID="ai-chat-reset" onPress={reset} style={({pressed}) => [styles.headerButton, styles.headerRight, pressed && styles.pressed]}>
          <RotateCcw size={16} color={colors.body} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({animated: true})}>
        {messages.map(message => (
          <View key={message.id} testID={`ai-message-${message.id}`} style={[styles.messageRow, message.role === 'user' && styles.userRow]}>
            {message.role === 'assistant' ? <AssistantAvatar /> : null}
            <View style={[styles.messageColumn, message.role === 'user' && styles.userColumn]}>
              <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                {message.role === 'assistant' ? <RichMessage text={message.text} /> : <Text style={styles.userText}>{message.text}</Text>}
              </View>
              <Text style={styles.time}>{message.time}</Text>
            </View>
          </View>
        ))}

        {loading ? (
          <View testID="ai-thinking" style={styles.messageRow}>
            <AssistantAvatar />
            <View style={[styles.thinkingBubble, shadows.card]}>
              <View style={styles.thinkingDot} /><View style={styles.thinkingDot} /><View style={styles.thinkingDot} />
            </View>
          </View>
        ) : null}

        {isFirst && !loading ? (
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>常见问题快速提问</Text>
            <View style={styles.quickGrid}>
              {QUICK_QUESTIONS.map(question => {
                const Icon = question.kind === 'book' ? BookOpen : Scale;
                return (
                  <Pressable
                    key={question.label}
                    accessibilityLabel={question.label}
                    testID={`ai-quick-${question.label}`}
                    onPress={() => send(question.label)}
                    style={({pressed}) => [styles.quickButton, shadows.card, pressed && styles.quickPressed]}>
                    <Icon size={13} color={colors.brand} />
                    <Text style={styles.quickText}>{question.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send()}
          multiline
          returnKeyType="send"
          submitBehavior="submit"
          placeholder="输入问题，如：善意取得的构成要件是什么？"
          placeholderTextColor="#C0C5D0"
          style={styles.input}
          testID="ai-chat-input"
        />
        <Pressable
          accessibilityLabel="发送消息"
          disabled={!input.trim() || loading}
          testID="ai-chat-send"
          onPress={() => send()}
          style={({pressed}) => [styles.sendButton, (!input.trim() || loading) && styles.sendDisabled, pressed && styles.pressed]}>
          <Send size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  headerButton: {width: 40, height: 40, justifyContent: 'center'},
  headerLeft: {alignItems: 'flex-start'},
  headerRight: {alignItems: 'flex-end'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.ink},
  pressed: {opacity: 0.65},
  scroll: {flex: 1},
  messages: {paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 24},
  messageRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16},
  userRow: {flexDirection: 'row-reverse'},
  avatar: {width: 32, height: 32, borderRadius: 16, backgroundColor: '#5D52EE', alignItems: 'center', justifyContent: 'center', marginTop: 2, ...shadows.card},
  messageColumn: {maxWidth: 270, alignItems: 'flex-start', gap: 4},
  userColumn: {alignItems: 'flex-end'},
  bubble: {paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16},
  assistantBubble: {backgroundColor: colors.surface, borderBottomLeftRadius: 4, ...shadows.card},
  userBubble: {backgroundColor: colors.brand, borderBottomRightRadius: 4},
  richMessage: {gap: 2},
  assistantText: {fontSize: 13, lineHeight: 20, color: colors.body},
  boldText: {fontWeight: '600', color: colors.ink},
  paragraphGap: {height: 8},
  userText: {fontSize: 13, lineHeight: 20, color: '#FFFFFF'},
  time: {fontSize: 10, lineHeight: 14, color: '#C0C5D0', paddingHorizontal: 4},
  thinkingBubble: {height: 42, paddingHorizontal: 16, borderRadius: 16, borderBottomLeftRadius: 4, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6},
  thinkingDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#C0C5D0'},
  quickSection: {paddingTop: 8},
  quickTitle: {fontSize: 11, lineHeight: 16, textAlign: 'center', color: '#C0C5D0', marginBottom: 12},
  quickGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  quickButton: {width: '48.75%', minHeight: 54, padding: 12, borderRadius: 12, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  quickPressed: {backgroundColor: colors.page},
  quickText: {flex: 1, fontSize: 12, lineHeight: 17, color: colors.body},
  composer: {flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line},
  input: {flex: 1, minHeight: 40, maxHeight: 80, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: colors.page, fontSize: 13, lineHeight: 19, color: colors.ink},
  sendButton: {width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand},
  sendDisabled: {opacity: 0.4},
});
