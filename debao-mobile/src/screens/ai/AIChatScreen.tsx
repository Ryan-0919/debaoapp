import {useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {Bot, Send, Sparkles} from 'lucide-react-native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {MockNotice} from '@/components/ui';
import {aiService} from '@/services';
import {colors, radius, spacing} from '@/theme';
import type {ChatMessage} from '@/types/domain';

const suggestions = ['解释买卖不破租赁', '主观题如何组织答案', '制定 7 天民法复习计划'];

export default function AIChatScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {id: 'welcome', role: 'assistant', content: '你好，我是得宝 AI 学习助手。当前运行本地 Mock 模式，可以演示流式对话和消息状态。'},
  ]);

  const send = async (prompt = input) => {
    const content = prompt.trim();
    if (!content || sending) return;
    const assistantId = `assistant-${Date.now()}`;
    setInput('');
    setSending(true);
    setMessages(items => [...items, {id: `user-${Date.now()}`, role: 'user', content}, {id: assistantId, role: 'assistant', content: '', streaming: true}]);
    await aiService.streamReply(content, chunk => {
      setMessages(items => items.map(item => item.id === assistantId ? {...item, content: item.content + chunk} : item));
    });
    setMessages(items => items.map(item => item.id === assistantId ? {...item, streaming: false} : item));
    setSending(false);
  };

  return (
    <AppScreen scroll={false} keyboardAware>
      <PageHeader title="AI 学习助手" subtitle="Mock 模式" />
      <MockNotice text="回答由本地固定逻辑生成，不构成法律意见；正式版本需通过服务端鉴权调用 AI。" />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.messages} onContentSizeChange={() => scrollRef.current?.scrollToEnd({animated: true})}>
        {messages.map(message => (
          <View key={message.id} style={[styles.messageRow, message.role === 'user' && styles.userRow]}>
            {message.role === 'assistant' ? <View style={styles.bot}><Bot size={17} color="#FFFFFF" /></View> : null}
            <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.messageText, message.role === 'user' && styles.userText]}>{message.content || '正在思考…'}</Text>
              {message.streaming ? <Text style={styles.streaming}>正在生成</Text> : null}
            </View>
          </View>
        ))}
        {messages.length === 1 ? (
          <View style={styles.suggestions}>
            {suggestions.map(item => <Pressable key={item} style={styles.suggestion} onPress={() => send(item)}><Sparkles size={14} color={colors.brand} /><Text style={styles.suggestionText}>{item}</Text></Pressable>)}
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput value={input} onChangeText={setInput} multiline placeholder="输入你的问题" placeholderTextColor={colors.muted} style={styles.input} />
        <Pressable accessibilityLabel="发送消息" disabled={!input.trim() || sending} onPress={() => send()} style={[styles.send, (!input.trim() || sending) && styles.disabled]}><Send size={19} color="#FFFFFF" /></Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  messages: {padding: spacing.lg, paddingBottom: spacing.xl},
  messageRow: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg},
  userRow: {justifyContent: 'flex-end'},
  bot: {width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm},
  bubble: {maxWidth: '82%', borderRadius: radius.md, padding: spacing.md},
  aiBubble: {backgroundColor: colors.surface},
  userBubble: {backgroundColor: colors.brand},
  messageText: {fontSize: 14, lineHeight: 22, color: colors.ink},
  userText: {color: '#FFFFFF'},
  streaming: {fontSize: 10, color: colors.brand, marginTop: spacing.sm},
  suggestions: {gap: spacing.sm, marginLeft: 40},
  suggestion: {minHeight: 42, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', backgroundColor: colors.brandLight, borderRadius: radius.md, paddingHorizontal: spacing.md},
  suggestionText: {fontSize: 12, color: colors.brand, fontWeight: '600'},
  composer: {flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, paddingBottom: spacing.lg, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line},
  input: {flex: 1, maxHeight: 110, minHeight: 44, backgroundColor: colors.page, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.ink},
  send: {width: 44, height: 44, borderRadius: radius.md, marginLeft: spacing.sm, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
  disabled: {opacity: 0.4},
});
