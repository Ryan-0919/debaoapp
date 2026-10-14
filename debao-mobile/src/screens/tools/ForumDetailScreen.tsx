import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {Bookmark, Flag, MessageSquare, RefreshCw, Send, ThumbsUp, Trash2} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {ConfirmSheet} from '@/components/ConfirmSheet';
import {PageHeader} from '@/components/PageHeader';
import {EmptyState} from '@/components/ui';
import {forumService} from '@/services';
import type {ForumComment, ForumPost} from '@/services';
import {environment} from '@/config/environment';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'ForumDetail'>;

function displayTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
}

export default function ForumDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const [post, setPost] = useState<ForumPost>();
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState<'like' | 'favorite' | 'comment' | 'delete' | 'report'>();
  const [comment, setComment] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportValidation, setReportValidation] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [postResult, commentsResult] = await Promise.all([forumService.get(route.params.postId), forumService.listComments(route.params.postId, {limit: 20})]);
      setPost(postResult); setComments(commentsResult.items); setNextCursor(commentsResult.nextCursor);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '内容加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [route.params.postId]);

  useEffect(() => { load().catch(() => undefined); }, [load]);

  const toggle = async (kind: 'like' | 'favorite') => {
    if (!post || action) return;
    setAction(kind); setError('');
    try { setPost(kind === 'like' ? await forumService.toggleLike(post.id) : await forumService.toggleFavorite(post.id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '操作失败，请稍后重试'); }
    finally { setAction(undefined); }
  };

  const submitComment = async () => {
    const value = comment.trim();
    if (!post || !value || action) return;
    setAction('comment'); setError('');
    try {
      const created = await forumService.createComment(post.id, value);
      setComments(items => [...items, created]); setPost(current => current ? {...current, comments: current.comments + 1} : current); setComment('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : '评论失败，请稍后重试'); }
    finally { setAction(undefined); }
  };

  const loadMore = async () => {
    if (!post || !nextCursor || loadingMore) return;
    setLoadingMore(true); setError('');
    try { const result = await forumService.listComments(post.id, {cursor: nextCursor, limit: 20}); setComments(items => [...items, ...result.items]); setNextCursor(result.nextCursor); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '更多评论加载失败'); }
    finally { setLoadingMore(false); }
  };

  const removeComment = async (item: ForumComment) => {
    if (action) return;
    try { await forumService.removeComment(item.id); setComments(items => items.filter(entry => entry.id !== item.id)); setPost(current => current ? {...current, comments: Math.max(0, current.comments - 1)} : current); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '删除评论失败'); }
  };

  const removePost = async () => {
    if (!post || action) return;
    setAction('delete'); setError('');
    try { await forumService.remove(post.id); setConfirmDelete(false); navigation.goBack(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '删除帖子失败'); setConfirmDelete(false); }
    finally { setAction(undefined); }
  };

  const openReport = () => {
    if (!post || action) return;
    setReportReason('');
    setReportValidation('');
    setReportError('');
    setReportSuccess('');
    setReportVisible(true);
  };

  const submitReport = async () => {
    const value = reportReason.trim();
    if (value.length < 2) {
      setReportValidation('举报理由至少需要 2 个字');
      return;
    }
    if (!post || action) return;
    setAction('report');
    setError('');
    setReportError('');
    try {
      await forumService.report(post.id, value);
      setReportVisible(false);
      setReportReason('');
      setReportValidation('');
      setReportSuccess('举报已提交，我们会尽快处理');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : '举报失败，请稍后重试';
      setReportError(message);
      setError(message);
    } finally {
      setAction(undefined);
    }
  };

  // Keep the report affordance out of the default Mock/prototype frame.  The
  // real-mode screen mirrors Flutter and submits to the authenticated API.
  const reportButton = !environment.useMocks && post ? <Pressable accessibilityLabel="举报帖子" testID="forum-report-post" disabled={!!action} onPress={openReport} style={styles.headerButton}><Flag size={19} color={colors.muted} /></Pressable> : null;
  const deleteButton = post?.canDelete ? <Pressable accessibilityLabel="删除帖子" testID="forum-delete-post" disabled={!!action} onPress={() => setConfirmDelete(true)} style={styles.headerButton}><Trash2 size={19} color={colors.error} /></Pressable> : null;
  const hasHeaderActions = Boolean(reportButton || deleteButton);
  const headerActions = hasHeaderActions ? <View style={styles.headerActions}>{reportButton}{deleteButton}</View> : null;

  return (
    <AppScreen scroll={false} keyboardAware testID="forum-detail-screen">
      <PageHeader title="帖子详情" right={headerActions} rightWidth={hasHeaderActions ? 88 : undefined} />
      {reportSuccess ? <View accessibilityLiveRegion="polite" style={styles.successBox} testID="forum-report-success"><Text style={styles.successText}>{reportSuccess}</Text></View> : null}
      {loading ? <View style={styles.center}><ActivityIndicator color={colors.brand} /><Text style={styles.stateText}>正在加载帖子...</Text></View> : error && !post ? <View style={styles.center}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Pressable testID="forum-detail-retry" onPress={load} style={styles.retry}><RefreshCw size={15} color={colors.brand} /><Text style={styles.retryText}>重新加载</Text></Pressable></View> : post ? <>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.postSection}>
            <View style={styles.authorRow}><View style={styles.avatar}><Text style={styles.avatarText}>{post.userName.slice(0, 1) || '得'}</Text></View><View style={styles.authorText}><Text style={styles.author}>{post.userName}</Text><Text style={styles.time}>{displayTime(post.createdAt)}</Text></View><View style={styles.category}><Text style={styles.categoryText}>{post.category}</Text></View></View>
            <Text style={styles.title}>{post.title}</Text><Text style={styles.body}>{post.body}</Text>
            <View style={styles.actions}>
              <Pressable accessibilityState={{selected: post.liked}} testID="forum-toggle-like" disabled={!!action} onPress={() => toggle('like')} style={[styles.actionButton, post.liked && styles.actionSelected]}><ThumbsUp size={16} color={post.liked ? colors.brand : colors.muted} fill={post.liked ? colors.brand : 'none'} /><Text style={[styles.actionText, post.liked && styles.actionTextSelected]}>{post.likes}</Text></Pressable>
              <View style={styles.metric}><MessageSquare size={16} color={colors.muted} /><Text style={styles.actionText}>{post.comments}</Text></View>
              <Pressable accessibilityState={{selected: post.favorited}} testID="forum-toggle-favorite" disabled={!!action} onPress={() => toggle('favorite')} style={[styles.actionButton, styles.favoriteAction, post.favorited && styles.actionSelected]}><Bookmark size={16} color={post.favorited ? colors.brand : colors.muted} fill={post.favorited ? colors.brand : 'none'} /><Text style={[styles.actionText, post.favorited && styles.actionTextSelected]}>{post.favorited ? '已收藏' : '收藏'}</Text></Pressable>
            </View>
          </View>
          <View style={styles.commentsHeader}><Text style={styles.commentsTitle}>全部评论</Text><Text style={styles.commentsCount}>{post.comments} 条</Text></View>
          {comments.length ? comments.map(item => <View key={item.id} testID={`forum-comment-${item.id}`} style={styles.commentCard}><View style={styles.commentTop}><View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{item.userName.slice(0, 1) || '得'}</Text></View><Text style={styles.commentAuthor}>{item.userName}</Text><Text style={styles.commentTime}>{displayTime(item.createdAt)}</Text>{item.canDelete ? <Pressable accessibilityLabel="删除评论" testID={`forum-delete-comment-${item.id}`} onPress={() => removeComment(item)} style={styles.commentDelete}><Trash2 size={14} color={colors.muted} /></Pressable> : null}</View><Text style={styles.commentBody}>{item.body}</Text></View>) : <EmptyState title="还没有评论" description="说说你的看法，成为第一个参与讨论的人。" />}
          {nextCursor ? <Pressable testID="forum-comments-more" disabled={loadingMore} onPress={loadMore} style={styles.more}><Text style={styles.moreText}>{loadingMore ? '加载中...' : '加载更多评论'}</Text></Pressable> : null}
          {error ? <Text accessibilityRole="alert" style={styles.inlineError}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.composer}><TextInput testID="forum-comment-input" value={comment} onChangeText={setComment} maxLength={1000} multiline placeholder="友善交流，说说你的看法" placeholderTextColor="#A4A9B4" style={styles.commentInput} /><Pressable accessibilityLabel="发表评论" testID="forum-comment-submit" disabled={!comment.trim() || !!action} onPress={submitComment} style={[styles.sendButton, (!comment.trim() || !!action) && styles.disabled]}>{action === 'comment' ? <ActivityIndicator size="small" color={colors.surface} /> : <Send size={17} color={colors.surface} />}</Pressable></View>
      </> : null}
      <ConfirmSheet visible={confirmDelete} title="删除帖子" description="删除后帖子和全部评论将不再展示，此操作无法撤销。" confirmLabel="确认删除" loading={action === 'delete'} onClose={() => setConfirmDelete(false)} onConfirm={removePost} />
      <ConfirmSheet visible={reportVisible} title="举报帖子" confirmLabel="提交举报" confirmTestID="forum-report-submit" loading={action === 'report'} onClose={() => setReportVisible(false)} onConfirm={submitReport}>
        <View style={styles.reportForm}>
          <Text style={styles.reportLabel}>举报理由</Text>
          <TextInput
            autoFocus
            maxLength={200}
            multiline
            numberOfLines={4}
            placeholder="请填写举报理由"
            placeholderTextColor="#A4A9B4"
            style={styles.reportInput}
            testID="forum-report-reason"
            value={reportReason}
            onChangeText={value => { setReportReason(value); if (reportValidation) setReportValidation(''); if (reportError) setReportError(''); }}
          />
          {reportValidation ? <Text accessibilityRole="alert" style={styles.reportValidation}>{reportValidation}</Text> : null}
          {reportError ? <Text accessibilityRole="alert" style={styles.reportError}>{reportError}</Text> : null}
        </View>
      </ConfirmSheet>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.md},
  stateText: {fontSize: 13, color: colors.muted}, error: {fontSize: 13, lineHeight: 20, color: colors.error, textAlign: 'center'},
  retry: {height: 40, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface}, retryText: {fontSize: 13, fontWeight: '600', color: colors.brand},
  headerActions: {flexDirection: 'row', alignItems: 'center', width: 84},
  headerButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  successBox: {marginHorizontal: spacing.lg, marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.mint},
  successText: {fontSize: 12, lineHeight: 18, color: '#3A7A46'},
  content: {paddingBottom: spacing.lg}, postSection: {padding: spacing.lg, backgroundColor: colors.surface},
  authorRow: {flexDirection: 'row', alignItems: 'center'}, avatar: {width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, avatarText: {fontSize: 14, fontWeight: '700', color: colors.surface}, authorText: {marginLeft: spacing.sm}, author: {fontSize: 13, fontWeight: '600', color: colors.ink}, time: {fontSize: 10, color: colors.muted, marginTop: 3}, category: {marginLeft: 'auto', height: 24, paddingHorizontal: 9, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandLight}, categoryText: {fontSize: 10, fontWeight: '600', color: colors.brand},
  title: {fontSize: 19, lineHeight: 28, fontWeight: '700', color: colors.ink, marginTop: spacing.lg}, body: {fontSize: 14, lineHeight: 25, color: colors.body, marginTop: spacing.md},
  actions: {height: 48, marginTop: spacing.xl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: spacing.lg}, actionButton: {minWidth: 54, height: 32, paddingHorizontal: spacing.sm, borderRadius: radius.md, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center'}, actionSelected: {backgroundColor: colors.brandLight}, actionText: {fontSize: 12, color: colors.muted}, actionTextSelected: {fontWeight: '600', color: colors.brand}, metric: {height: 32, flexDirection: 'row', gap: 6, alignItems: 'center'}, favoriteAction: {marginLeft: 'auto'},
  commentsHeader: {height: 52, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center'}, commentsTitle: {fontSize: 14, fontWeight: '700', color: colors.ink}, commentsCount: {fontSize: 11, color: colors.muted, marginLeft: spacing.sm},
  commentCard: {marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface}, commentTop: {height: 28, flexDirection: 'row', alignItems: 'center'}, commentAvatar: {width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandLight}, commentAvatarText: {fontSize: 10, fontWeight: '700', color: colors.brand}, commentAuthor: {fontSize: 12, fontWeight: '600', color: colors.body, marginLeft: spacing.sm}, commentTime: {fontSize: 10, color: colors.muted, marginLeft: 'auto'}, commentDelete: {width: 32, height: 32, alignItems: 'flex-end', justifyContent: 'center'}, commentBody: {fontSize: 13, lineHeight: 21, color: colors.ink, marginTop: spacing.sm, marginLeft: 34},
  more: {height: 44, alignItems: 'center', justifyContent: 'center'}, moreText: {fontSize: 12, fontWeight: '600', color: colors.brand}, inlineError: {fontSize: 12, lineHeight: 18, color: colors.error, textAlign: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm},
  reportForm: {marginBottom: spacing.lg}, reportLabel: {fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: spacing.sm}, reportInput: {minHeight: 96, maxHeight: 140, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 13, lineHeight: 20, color: colors.ink, textAlignVertical: 'top', backgroundColor: colors.page}, reportValidation: {fontSize: 12, lineHeight: 18, color: colors.error, marginTop: spacing.xs}, reportError: {fontSize: 12, lineHeight: 18, color: colors.error, marginTop: spacing.xs},
  composer: {minHeight: 68, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end', backgroundColor: colors.surface}, commentInput: {flex: 1, minHeight: 44, maxHeight: 96, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: 13, lineHeight: 19, color: colors.ink, backgroundColor: colors.page}, sendButton: {width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, disabled: {opacity: 0.4},
});
