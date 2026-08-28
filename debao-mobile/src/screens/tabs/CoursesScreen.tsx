import {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  Radio,
  RotateCcw,
  X,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type CourseView = 'calendar' | 'all';
type QuickFilter = 'today' | 'tomorrow' | 'missed' | null;
type SessionStatus = 'done' | 'in-progress' | 'not-started' | 'missed' | 'live-soon';
type SessionType = 'main' | 'supplement' | 'live' | 'practice' | 'review';

interface Session {
  id: string;
  startTime: string;
  endTime: string;
  type: SessionType;
  label: string;
  title: string;
  lesson?: string;
  teacher?: string;
  duration: number;
  status: SessionStatus;
  progress?: number;
  completedAt?: string;
  tip?: string;
}

const TODAY = '2026-08-27';
const TOMORROW = '2026-08-28';
const DAY_DOTS: Record<string, string> = {
  '2026-08-25': colors.success,
  '2026-08-26': colors.error,
  [TODAY]: colors.brand,
  [TOMORROW]: colors.brand,
  '2026-08-29': colors.brand,
  '2026-08-31': '#A87000',
};
const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTH_LABELS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

function parseDate(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(key: string, amount: number) {
  const date = parseDate(key);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

function weekFor(key: string) {
  const selected = parseDate(key);
  const mondayOffset = selected.getDay() === 0 ? -6 : 1 - selected.getDay();
  selected.setDate(selected.getDate() + mondayOffset);
  return Array.from({length: 7}, (_, index) => {
    const date = new Date(selected);
    date.setDate(date.getDate() + index);
    const keyValue = dateKey(date);
    return {key: keyValue, week: WEEK_LABELS[index], day: date.getDate(), dot: DAY_DOTS[keyValue]};
  });
}

const SCHEDULE: Record<string, Session[]> = {
  '2026-08-25': [
    {id: 's1', startTime: '09:00', endTime: '10:20', type: 'main', label: '录播', title: '民法精讲', lesson: '第16讲：物权的效力', teacher: '张明远', duration: 80, status: 'done', progress: 100, completedAt: '10:18'},
    {id: 's2', startTime: '20:00', endTime: '20:30', type: 'practice', label: '练习', title: '物权法配套题组', duration: 30, status: 'done', completedAt: '20:25'},
  ],
  '2026-08-26': [
    {id: 's3', startTime: '09:00', endTime: '10:30', type: 'main', label: '录播', title: '民法精讲', lesson: '第17讲：物权变动总论', teacher: '张明远', duration: 90, status: 'done', progress: 100, completedAt: '10:27'},
    {id: 's4', startTime: '21:00', endTime: '21:30', type: 'review', label: '复习', title: '物权变动错题整理', duration: 30, status: 'missed', tip: '与本周课程配套'},
  ],
  [TODAY]: [
    {id: 's5', startTime: '09:00', endTime: '10:20', type: 'main', label: '录播', title: '民法精讲', lesson: '第18讲：物权变动的公示与公信原则', teacher: '张明远', duration: 80, status: 'in-progress', progress: 62},
    {id: 's6', startTime: '14:00', endTime: '15:00', type: 'supplement', label: '专项', title: '请求权基础答题训练', duration: 60, status: 'not-started', tip: '建议第18讲后完成'},
    {id: 's7', startTime: '19:30', endTime: '21:00', type: 'live', label: '直播', title: '刑法重点罪名串讲', teacher: '李东明', duration: 90, status: 'live-soon'},
    {id: 's8', startTime: '21:10', endTime: '21:40', type: 'practice', label: '练习', title: '民法配套题组 · 第18讲', duration: 30, status: 'not-started'},
  ],
  [TOMORROW]: [
    {id: 's9', startTime: '09:00', endTime: '10:30', type: 'main', label: '录播', title: '民法精讲', lesson: '第19讲：不动产登记', teacher: '张明远', duration: 90, status: 'not-started'},
    {id: 's10', startTime: '15:00', endTime: '16:00', type: 'supplement', label: '专项', title: '善意取得专题精讲', duration: 60, status: 'not-started', tip: '与本周民法课程配套'},
  ],
  '2026-08-29': [
    {id: 's11', startTime: '09:30', endTime: '10:50', type: 'main', label: '录播', title: '民法精讲', lesson: '第20讲：动产交付', teacher: '张明远', duration: 80, status: 'not-started'},
  ],
  '2026-08-30': [],
};

const TYPE_COLOR: Record<SessionType, {main: string; pale: string}> = {
  main: {main: colors.brand, pale: colors.brandLight},
  supplement: {main: '#A87000', pale: colors.gold},
  live: {main: '#C0385A', pale: colors.rose},
  practice: {main: '#1A8B8B', pale: colors.celadon},
  review: {main: colors.muted, pale: colors.page},
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  done: '已完成',
  'in-progress': '学习中',
  'not-started': '未开始',
  missed: '待补课',
  'live-soon': '即将开始',
};

const STATUS_COLOR: Record<SessionStatus, string> = {
  done: colors.success,
  'in-progress': colors.brand,
  'not-started': colors.muted,
  missed: colors.error,
  'live-soon': '#C0385A',
};

function MiniProgress({value, color = colors.brand}: {value: number; color?: string}) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, {width: `${value}%`, backgroundColor: color}]} />
    </View>
  );
}

function Segment({view, onChange}: {view: CourseView; onChange: (value: CourseView) => void}) {
  return (
    <View style={styles.segmentWrap}>
      <View style={styles.segment}>
        {(['calendar', 'all'] as const).map(item => {
          const selected = item === view;
          return (
            <Pressable
              key={item}
              testID={`courses-view-${item}`}
              onPress={() => onChange(item)}
              style={[styles.segmentButton, selected && styles.segmentButtonSelected]}>
              <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                {item === 'calendar' ? '学习日历' : '全部课程'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ActionButton({session, navigation}: {session: Session; navigation: Navigation}) {
  const openCourse = () => navigation.navigate('CourseDetail', {courseId: 'c1'});
  if (session.status === 'in-progress') {
    return <SmallButton label="继续学习" icon onPress={openCourse} tone="action" />;
  }
  if (session.status === 'done') {
    return <SmallButton label="再次学习" rotate onPress={openCourse} tone="outline" />;
  }
  if (session.status === 'missed') {
    return <SmallButton label="立即补课" onPress={openCourse} tone="danger" />;
  }
  if (session.status === 'live-soon') {
    return <SmallButton label="进入直播" onPress={() => navigation.navigate('LiveCourse', {courseId: 'c3'})} tone="live" />;
  }
  return <SmallButton label={session.type === 'practice' || session.type === 'review' ? '去完成' : '开始学习'} onPress={openCourse} tone="brand" />;
}

function SmallButton({label, onPress, tone, icon, rotate, testID}: {label: string; onPress: () => void; tone: 'action' | 'outline' | 'danger' | 'live' | 'brand'; icon?: boolean; rotate?: boolean; testID?: string}) {
  const palette = {
    action: {bg: colors.action, fg: colors.ink, border: colors.action},
    outline: {bg: colors.surface, fg: colors.muted, border: colors.line},
    danger: {bg: '#FFF4F1', fg: colors.error, border: '#FFD8CF'},
    live: {bg: colors.rose, fg: '#C0385A', border: colors.rose},
    brand: {bg: colors.brandLight, fg: colors.brand, border: colors.brandLight},
  }[tone];
  return (
    <Pressable testID={testID} onPress={onPress} style={({pressed}) => [styles.smallButton, {backgroundColor: palette.bg, borderColor: palette.border}, pressed && styles.pressed]}>
      {icon ? <Play size={10} color={palette.fg} fill={palette.fg} /> : null}
      {rotate ? <RotateCcw size={11} color={palette.fg} /> : null}
      <Text style={[styles.smallButtonText, {color: palette.fg}]}>{label}</Text>
    </Pressable>
  );
}

function SessionCard({session, navigation}: {session: Session; navigation: Navigation}) {
  const palette = TYPE_COLOR[session.type];
  return (
    <View style={styles.timelineRow} testID={`course-session-${session.id}`}>
      <Text style={styles.timelineTime}>{session.startTime}</Text>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, {backgroundColor: session.status === 'not-started' ? colors.surface : STATUS_COLOR[session.status], borderColor: STATUS_COLOR[session.status]}]} />
      </View>
      <View style={[styles.sessionCard, {borderLeftColor: palette.main}]}>
        <View style={styles.sessionTop}>
          <View style={styles.inline}>
            <View style={[styles.sessionTag, {backgroundColor: palette.pale}]}>
              <Text style={[styles.sessionTagText, {color: palette.main}]}>{session.label}</Text>
            </View>
            <Text style={[styles.sessionStatus, {color: STATUS_COLOR[session.status]}]}>{STATUS_LABEL[session.status]}</Text>
          </View>
          <Text style={styles.sessionRange}>{session.startTime}–{session.endTime}</Text>
        </View>
        <Text style={styles.sessionTitle}>{session.title}</Text>
        {session.lesson ? <Text style={styles.sessionLesson}>{session.lesson}</Text> : null}
        <Text style={styles.sessionMeta}>
          {session.teacher ? `${session.teacher}  ·  ` : ''}{session.duration} 分钟{session.tip ? `  ·  ${session.tip}` : ''}
        </Text>
        {session.status === 'in-progress' && session.progress !== undefined ? (
          <View style={styles.progressRow}>
            <MiniProgress value={session.progress} />
            <Text style={styles.progressValue}>{session.progress}%</Text>
          </View>
        ) : null}
        {session.status === 'done' && session.completedAt ? <Text style={styles.completed}>完成于 {session.completedAt}</Text> : null}
        <View style={styles.sessionAction}><ActionButton session={session} navigation={navigation} /></View>
      </View>
    </View>
  );
}

function Sheet({visible, title, onClose, children}: {visible: boolean; title: string; onClose: () => void; children: React.ReactNode}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="关闭弹层" style={styles.dismiss} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable hitSlop={10} onPress={onClose}><X size={21} color={colors.ink} /></Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function MonthSheet({visible, selected, onClose, onSelect}: {visible: boolean; selected: string; onClose: () => void; onSelect: (key: string) => void}) {
  const [month, setMonth] = useState(8);
  const blanks = month === 8 ? 5 : 1;
  const days = month === 8 ? 31 : 30;
  return (
    <Sheet visible={visible} title="选择日期" onClose={onClose}>
      <View style={styles.monthHeader}>
        <Pressable hitSlop={8} onPress={() => setMonth(value => value === 8 ? 7 : 8)}><ChevronLeft size={18} color={colors.body} /></Pressable>
        <Text style={styles.monthTitle}>2026年 {month === 8 ? '八月' : '七月'}</Text>
        <Pressable hitSlop={8} onPress={() => setMonth(value => value === 8 ? 9 : 8)}><ChevronRight size={18} color={colors.body} /></Pressable>
      </View>
      <View style={styles.monthGrid}>
        {['一', '二', '三', '四', '五', '六', '日'].map(day => <Text key={day} style={styles.monthWeek}>{day}</Text>)}
        {Array.from({length: blanks}).map((_, index) => <View key={`blank-${index}`} style={styles.monthCell} />)}
        {Array.from({length: days}).map((_, index) => {
          const day = index + 1;
          const key = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const active = selected === key;
          return (
            <Pressable key={key} testID={`courses-month-day-${day}`} onPress={() => {onSelect(key); onClose();}} style={styles.monthCell}>
              <View style={[styles.monthDayCircle, active && styles.monthDayActive]}><Text style={[styles.monthDay, active && styles.monthDayActiveText]}>{day}</Text></View>
              {SCHEDULE[key]?.length ? <View style={[styles.calendarDot, {backgroundColor: key === '2026-08-26' ? colors.error : colors.brand}]} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

function RescheduleSheet({session, onClose}: {session: Session | null; onClose: () => void}) {
  const [selected, setSelected] = useState(1);
  const options = [
    ['今天  8月27日', '今日安排已满'],
    ['明天  8月28日', ''],
    ['后天  8月29日', ''],
    ['本周末  8月30日', '暂无安排'],
    ['下周一  9月1日', ''],
  ];
  return (
    <Sheet visible={!!session} title="调整补课日期" onClose={onClose}>
      <Text style={styles.sheetDescription}>调整「{session?.title}」的学习日期</Text>
      {options.map((option, index) => (
        <Pressable key={option[0]} onPress={() => setSelected(index)} style={[styles.optionRow, selected === index && styles.optionRowSelected]}>
          <Text style={styles.optionText}>{option[0]}</Text>
          <Text style={styles.optionHint}>{option[1]}</Text>
          {selected === index ? <Check size={15} color={colors.brand} /> : null}
        </Pressable>
      ))}
      <SheetActions onClose={onClose} onConfirm={onClose} confirm="确认调整" />
    </Sheet>
  );
}

function AddCalendarSheet({course, onClose, onDone}: {course: string | null; onClose: () => void; onDone: () => void}) {
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('14:00');
  const days = ['今天 8/27', '明天 8/28', '8月29日', '8月30日 周日', '9月1日'];
  const times = ['09:00', '14:00', '19:00', '21:00'];
  return (
    <Sheet visible={!!course} title="加入学习安排" onClose={onClose}>
      <Text style={styles.sheetDescription}>将「{course}」加入学习日历</Text>
      <Text style={styles.sheetLabel}>选择日期</Text>
      <View style={styles.choiceWrap}>{days.map((item, index) => <Choice key={item} label={item} selected={day === index} onPress={() => setDay(index)} />)}</View>
      <Text style={styles.sheetLabel}>开始时间</Text>
      <View style={styles.choiceWrap}>{times.map(item => <Choice key={item} label={item} selected={time === item} onPress={() => setTime(item)} />)}</View>
      <SheetActions onClose={onClose} onConfirm={onDone} confirm="加入日历" />
    </Sheet>
  );
}

function Choice({label, selected, onPress}: {label: string; selected: boolean; onPress: () => void}) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>;
}

function SheetActions({onClose, onConfirm, confirm}: {onClose: () => void; onConfirm: () => void; confirm: string}) {
  return (
    <View style={styles.sheetActions}>
      <Pressable onPress={onClose} style={[styles.sheetAction, styles.cancelAction]}><Text style={styles.cancelText}>取消</Text></Pressable>
      <Pressable testID="courses-sheet-confirm" onPress={onConfirm} style={[styles.sheetAction, styles.confirmAction]}><Text style={styles.confirmText}>{confirm}</Text></Pressable>
    </View>
  );
}

function CalendarView({navigation, onOpenMonth, selectedKey, onSelectDate, onReschedule}: {navigation: Navigation; onOpenMonth: () => void; selectedKey: string; onSelectDate: (key: string) => void; onReschedule: (session: Session) => void}) {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  useEffect(() => setQuickFilter(null), [selectedKey]);
  const weekDays = useMemo(() => weekFor(selectedKey), [selectedKey]);
  const missed = Object.values(SCHEDULE).flat().filter(item => item.status === 'missed');
  const effectiveKey = quickFilter === 'today' ? TODAY : quickFilter === 'tomorrow' ? TOMORROW : selectedKey;
  const sessions = quickFilter === 'missed' ? missed : (SCHEDULE[effectiveKey] ?? []);
  const minutes = sessions.reduce((sum, item) => sum + item.duration, 0);
  const time = `${Math.floor(minutes / 60)} 小时${minutes % 60 ? ` ${minutes % 60} 分钟` : ''}`;
  const isToday = effectiveKey === TODAY;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.calendarContent}>
      <View style={styles.overview}>
        <View style={styles.overviewTop}>
          <View style={styles.overviewCopy}>
            <Text style={styles.eyebrow}>当前课程</Text>
            <Text style={styles.currentCourse}>2026 法考主客一体系统班</Text>
            <Text style={styles.stage}>第二阶段  ·  系统精讲  ·  民法第 18 讲 / 共 32 讲</Text>
          </View>
          <View style={styles.overviewPercent}><Text style={styles.percent}>42%</Text><Text style={styles.percentLabel}>整体进度</Text></View>
        </View>
        <MiniProgress value={42} />
        <View style={styles.overviewStats}>
          <Text style={styles.overviewStat}>本周 <Text style={styles.strong}>7</Text> / 12 节</Text>
          <Text style={styles.statDivider}>·</Text><Text style={styles.missedText}>待补课 1 节</Text>
          <Text style={styles.statDivider}>·</Text><Text style={styles.overviewStat}>直播 <Text style={styles.strong}>今晚 19:30</Text></Text>
        </View>
      </View>

      <View style={styles.weekPanel}>
        <View style={styles.weekHeader}>
          <Pressable testID="courses-open-month" hitSlop={8} onPress={onOpenMonth} style={styles.inline}><Text style={styles.weekMonth}>{MONTH_LABELS[parseDate(selectedKey).getMonth()]}</Text><ChevronRight size={14} color={colors.muted} /></Pressable>
          <View style={styles.inline}>
            <Pressable testID="courses-week-previous" hitSlop={8} onPress={() => onSelectDate(addDays(selectedKey, -7))} style={styles.weekArrow}><ChevronLeft size={16} color={colors.muted} /></Pressable>
            <Pressable testID="courses-week-next" hitSlop={8} onPress={() => onSelectDate(addDays(selectedKey, 7))} style={styles.weekArrow}><ChevronRight size={16} color={colors.muted} /></Pressable>
          </View>
        </View>
        <View style={styles.daysRow}>{weekDays.map(day => {
          const active = day.key === effectiveKey && quickFilter !== 'missed';
          return (
            <Pressable key={day.key} testID={`courses-day-${day.day}`} onPress={() => {onSelectDate(day.key); setQuickFilter(null);}} style={styles.dayCell}>
              <Text style={styles.dayWeek}>{day.week}</Text>
              <View style={[styles.dayCircle, active && styles.dayCircleActive]}><Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{day.day}</Text></View>
              <View style={[styles.calendarDot, day.dot ? {backgroundColor: day.dot} : styles.invisible]} />
              <Text style={[styles.todayLabel, day.key !== TODAY && styles.invisible]}>今天</Text>
            </Pressable>
          );
        })}</View>
      </View>

      <View style={styles.scheduleArea}>
        <View style={styles.quickFilters}>
          {([{id: 'today', label: '今天'}, {id: 'tomorrow', label: '明天'}, {id: 'missed', label: '待补课 1'}] as {id: Exclude<QuickFilter, null>; label: string}[]).map(filter => (
            <Pressable key={filter.id} testID={`courses-filter-${filter.id}`} onPress={() => setQuickFilter(value => value === filter.id ? null : filter.id)} style={[styles.filterPill, quickFilter === filter.id && (filter.id === 'missed' ? styles.filterMissedActive : styles.filterActive)]}>
              <Text style={[styles.filterText, quickFilter === filter.id && styles.filterTextActive]}>{filter.label}</Text>
            </Pressable>
          ))}
        </View>

        {isToday && !quickFilter ? (
          <View style={styles.resumeBanner}>
            <View style={styles.resumeCopy}><Text style={styles.resumeEyebrow}>正在学习</Text><Text numberOfLines={1} style={styles.resumeTitle}>第18讲：物权变动的公示与公信原则</Text></View>
            <SmallButton label="现在继续" icon tone="action" onPress={() => navigation.navigate('CourseDetail', {courseId: 'c1'})} />
          </View>
        ) : null}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{quickFilter === 'missed' ? '待补课程' : isToday ? '今日学习' : effectiveKey === TOMORROW ? '明日课程' : `${Number(effectiveKey.slice(5, 7))}月${Number(effectiveKey.slice(8))}日`}</Text>
          {sessions.length ? <Text style={styles.listMeta}>{sessions.length} 项  ·  预计 {time}</Text> : null}
        </View>

        {!sessions.length ? (
          <View style={styles.emptyState} testID="courses-empty-state">
            <CalendarDays size={32} color="#C0C5D0" />
            <Text style={styles.emptyTitle}>今日无课程安排</Text>
            <Text style={styles.emptyDescription}>可以轻松休息，或查看明日课表</Text>
            <Pressable onPress={() => setQuickFilter('tomorrow')}><Text style={styles.emptyLink}>查看明日课表 →</Text></Pressable>
          </View>
        ) : quickFilter === 'missed' ? missed.map(session => (
          <View key={session.id} style={styles.missedCard}>
            <View style={styles.inline}><View style={styles.missedBadge}><Text style={styles.missedBadgeText}>待补课</Text></View><Text style={styles.originalDate}>原计划 8月26日</Text></View>
            <Text style={styles.missedTitle}>{session.title}</Text>
            <View style={styles.missedFooter}><Text style={styles.sessionMeta}>{session.duration} 分钟</Text><View style={styles.grow} /><SmallButton testID="courses-reschedule" label="调整日期" tone="outline" onPress={() => onReschedule(session)} /><SmallButton label="立即补课" tone="danger" onPress={() => navigation.navigate('CourseDetail', {courseId: 'c1'})} /></View>
          </View>
        )) : sessions.map(session => <SessionCard key={session.id} session={session} navigation={navigation} />)}
      </View>
    </ScrollView>
  );
}

function SectionLabel({children}: {children: React.ReactNode}) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function AllCoursesView({navigation, onAdd, added}: {navigation: Navigation; onAdd: (name: string) => void; added: boolean}) {
  const recorded = [
    {id: 'c1', name: '民法精讲（2024版）', teacher: '张明远', progress: 42, completed: 28, total: 68, last: '昨天 21:30'},
    {id: 'c2', name: '刑法体系课（2024版）', teacher: '李东明', progress: 18, completed: 13, total: 72, last: '3天前'},
  ];
  return (
    <ScrollView testID="courses-all-scroll" showsVerticalScrollIndicator={false} contentContainerStyle={styles.allContent}>
      <SectionLabel>录播课</SectionLabel>
      <View style={styles.courseGroup}>{recorded.map((course, index) => (
        <View key={course.id} style={[styles.recordedCourse, index > 0 && styles.groupDivider]} testID={`courses-recorded-${course.id}`}>
          <Pressable onPress={() => navigation.navigate('CourseDetail', {courseId: course.id})} style={styles.recordedTop}>
            <View style={styles.courseThumb} />
            <View style={styles.recordedCopy}>
              <Text style={styles.recordedTitle}>{course.name}</Text>
              <Text style={styles.recordedMeta}>{course.teacher}主讲  ·  有效期至 2025年1月</Text>
              <View style={styles.progressRow}><MiniProgress value={course.progress} /><Text style={styles.progressValue}>{course.progress}%</Text></View>
              <Text style={styles.recordedMeta}>{course.completed}/{course.total} 课节  ·  上次学习 {course.last}</Text>
            </View>
          </Pressable>
          <View style={styles.dualButtons}>
            <WideButton label="查看本周安排" tone="brand" onPress={() => navigation.navigate('CourseDetail', {courseId: course.id})} />
            <WideButton label="继续学习" tone="action" icon onPress={() => navigation.navigate('CourseDetail', {courseId: course.id})} />
          </View>
        </View>
      ))}</View>

      <SectionLabel>专项训练</SectionLabel>
      <View style={styles.courseGroup}>
        <TrainingCourse name="请求权基础答题训练" detail="配合「民法精讲课」· 建议第18讲后开始" added={added} onAdd={() => onAdd('请求权基础答题训练')} navigation={navigation} />
        <View style={styles.groupDivider}><TrainingCourse name="刑法重点罪名冲刺" detail="配合「刑法体系课」· 建议刑法分论阶段" progress={35} added navigation={navigation} /></View>
      </View>

      <SectionLabel>音频课程</SectionLabel>
      <View style={styles.courseGroup}>
        <MediaCourse icon="audio" name="民法音频精讲（通勤随听版）" detail="张明远主讲 · 共68讲 · 约52小时" progress={18} button="继续收听" onPress={() => navigation.navigate('AudioPlayer', {courseId: 'c2'})} />
        <View style={styles.groupDivider}><MediaCourse icon="audio" name="法考全科音频串讲班" detail="多位名师主讲 · 共220讲 · 约160小时" button="开始收听" onPress={() => navigation.navigate('AudioPlayer', {courseId: 'c2'})} /></View>
      </View>

      <SectionLabel>直播课程</SectionLabel>
      <View style={styles.courseGroup}>
        <MediaCourse icon="live" name="民法精讲第18讲：物权变动" detail="张明远主讲 · 今日 19:00" button="进入直播间" onPress={() => navigation.navigate('LiveCourse', {courseId: 'c3'})} />
        <View style={styles.groupDivider}><MediaCourse icon="live" name="法考直播冲刺班（考前30天）" detail="多位名师主讲 · 09月01日 开课" button="预约提醒" onPress={() => navigation.navigate('LiveCourse', {courseId: 'c3'})} /></View>
      </View>

      <SectionLabel>已完成</SectionLabel>
      <View style={styles.completedEmpty}><Text style={styles.completedEmptyText}>暂无已完成课程</Text></View>
    </ScrollView>
  );
}

function WideButton({label, tone, onPress, icon, testID}: {label: string; tone: 'brand' | 'action' | 'outline' | 'success'; onPress: () => void; icon?: boolean; testID?: string}) {
  const palette = {
    brand: {bg: colors.brandLight, fg: colors.brand, border: colors.brandLight},
    action: {bg: colors.action, fg: colors.ink, border: colors.action},
    outline: {bg: colors.surface, fg: colors.body, border: colors.line},
    success: {bg: colors.mint, fg: colors.success, border: colors.mint},
  }[tone];
  return <Pressable testID={testID} onPress={onPress} style={({pressed}) => [styles.wideButton, {backgroundColor: palette.bg, borderColor: palette.border}, pressed && styles.pressed]}>{icon ? <Play size={10} fill={palette.fg} color={palette.fg} /> : null}<Text style={[styles.wideButtonText, {color: palette.fg}]}>{label}</Text></Pressable>;
}

function TrainingCourse({name, detail, progress, added, onAdd, navigation}: {name: string; detail: string; progress?: number; added: boolean; onAdd?: () => void; navigation: Navigation}) {
  return (
    <View style={styles.trainingCourse}>
      <Text style={styles.recordedTitle}>{name}</Text><Text style={styles.recordedMeta}>{detail}</Text>
      {progress ? <View style={styles.progressRow}><MiniProgress value={progress} color="#A87000" /><Text style={styles.trainingProgress}>{progress}%</Text></View> : null}
      <View style={styles.dualButtons}><WideButton testID={`courses-training-open-${name}`} label="查看课程" tone="outline" onPress={() => navigation.navigate('CourseDetail', {courseId: 'c1'})} /><WideButton testID={`courses-training-add-${name}`} label={added ? '✓ 已加入日历' : '+ 加入学习安排'} tone={added ? 'success' : 'brand'} onPress={onAdd ?? (() => {})} /></View>
    </View>
  );
}

function MediaCourse({icon, name, detail, progress, button, onPress}: {icon: 'audio' | 'live'; name: string; detail: string; progress?: number; button: string; onPress: () => void}) {
  const Icon = icon === 'audio' ? BookOpen : Radio;
  const color = icon === 'audio' ? colors.brand : '#C0385A';
  return (
    <View style={styles.mediaCourse}>
      <View style={styles.recordedTop}><View style={[styles.mediaIcon, {backgroundColor: color}]}><Icon size={22} color="#FFFFFF" /></View><View style={styles.recordedCopy}><Text style={styles.recordedTitle}>{name}</Text><Text style={styles.recordedMeta}>{detail}</Text>{progress ? <View style={styles.progressRow}><MiniProgress value={progress} /><Text style={styles.progressValue}>{progress}%</Text></View> : null}</View></View>
      <View style={styles.mediaButton}><WideButton testID={`courses-media-${icon}-${button}`} label={button} tone="action" icon onPress={onPress} /></View>
    </View>
  );
}

export default function CoursesScreen() {
  const navigation = useNavigation<Navigation>();
  const [view, setView] = useState<CourseView>('calendar');
  const [selectedKey, setSelectedKey] = useState(TODAY);
  const [monthVisible, setMonthVisible] = useState(false);
  const [reschedule, setReschedule] = useState<Session | null>(null);
  const [addCourse, setAddCourse] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const selected = useMemo(() => selectedKey, [selectedKey]);

  return (
    <AppScreen scroll={false} testID="courses-screen">
      <Segment view={view} onChange={setView} />
      {view === 'calendar' ? <CalendarView navigation={navigation} onOpenMonth={() => setMonthVisible(true)} selectedKey={selected} onSelectDate={setSelectedKey} onReschedule={setReschedule} /> : <AllCoursesView navigation={navigation} onAdd={setAddCourse} added={added} />}
      <MonthSheet visible={monthVisible} selected={selectedKey} onClose={() => setMonthVisible(false)} onSelect={setSelectedKey} />
      <RescheduleSheet session={reschedule} onClose={() => setReschedule(null)} />
      <AddCalendarSheet course={addCourse} onClose={() => setAddCourse(null)} onDone={() => {setAdded(true); setAddCourse(null);}} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  segmentWrap: {height: 54, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  segment: {height: 32, padding: 2, flexDirection: 'row', backgroundColor: colors.page, borderRadius: radius.md},
  segmentButton: {height: 28, minWidth: 78, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 6},
  segmentButtonSelected: {backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E7E8ED', elevation: 1},
  segmentText: {fontSize: 13, color: colors.muted, fontWeight: '600'},
  segmentTextSelected: {color: colors.brand},
  calendarContent: {paddingBottom: 24},
  overview: {backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  overviewTop: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 9}, overviewCopy: {flex: 1, marginRight: 12}, eyebrow: {fontSize: 11, color: colors.muted}, currentCourse: {fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 2}, stage: {fontSize: 11, color: colors.brand, marginTop: 3}, overviewPercent: {alignItems: 'flex-end'}, percent: {fontSize: 20, lineHeight: 23, fontWeight: '800', color: colors.brand}, percentLabel: {fontSize: 9, color: colors.muted, marginTop: 1},
  progressTrack: {height: 5, flex: 1, backgroundColor: colors.line, borderRadius: 99, overflow: 'hidden'}, progressFill: {height: '100%', borderRadius: 99}, progressRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8}, progressValue: {fontSize: 10, color: colors.brand, fontWeight: '600'},
  overviewStats: {flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10}, overviewStat: {fontSize: 11, color: colors.body}, strong: {fontWeight: '700', color: colors.ink}, statDivider: {fontSize: 11, color: colors.line}, missedText: {fontSize: 11, color: colors.error, fontWeight: '600'},
  weekPanel: {backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 13, paddingBottom: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, weekHeader: {height: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5}, inline: {flexDirection: 'row', alignItems: 'center'}, weekMonth: {fontSize: 14, fontWeight: '700', color: colors.ink}, weekArrow: {width: 32, height: 28, alignItems: 'center', justifyContent: 'center'},
  daysRow: {flexDirection: 'row'}, dayCell: {flex: 1, height: 75, alignItems: 'center'}, dayWeek: {fontSize: 10, color: colors.muted, marginBottom: 5}, dayCircle: {width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center'}, dayCircleActive: {backgroundColor: colors.brand}, dayNumber: {fontSize: 13, fontWeight: '600', color: colors.ink}, dayNumberActive: {color: colors.surface}, calendarDot: {width: 6, height: 6, borderRadius: 3, marginTop: 4}, todayLabel: {fontSize: 9, color: colors.brand, fontWeight: '600', marginTop: 2}, invisible: {opacity: 0},
  scheduleArea: {paddingHorizontal: 16, paddingTop: 13}, quickFilters: {height: 30, flexDirection: 'row', gap: 8, marginBottom: 9}, filterPill: {height: 28, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface}, filterActive: {backgroundColor: colors.brand, borderColor: colors.brand}, filterMissedActive: {backgroundColor: colors.error, borderColor: colors.error}, filterText: {fontSize: 12, color: colors.body, fontWeight: '500'}, filterTextActive: {color: colors.surface},
  resumeBanner: {minHeight: 57, borderRadius: radius.md, borderWidth: 1, borderColor: '#DAD9FF', backgroundColor: colors.brandLight, paddingHorizontal: 15, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10}, resumeCopy: {flex: 1}, resumeEyebrow: {fontSize: 10, fontWeight: '600', color: colors.brand}, resumeTitle: {fontSize: 12, fontWeight: '700', color: colors.ink, marginTop: 3},
  listHeader: {height: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, listTitle: {fontSize: 15, fontWeight: '800', color: colors.ink}, listMeta: {fontSize: 11, color: colors.muted},
  timelineRow: {flexDirection: 'row', alignItems: 'stretch', marginBottom: 12}, timelineTime: {width: 45, paddingTop: 13, paddingRight: 5, fontSize: 10, color: colors.muted, textAlign: 'right'}, timelineRail: {width: 20, alignItems: 'center', borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.line, marginLeft: 5}, timelineDot: {width: 10, height: 10, borderRadius: 5, borderWidth: 2, marginLeft: -1, marginTop: 12}, sessionCard: {flex: 1, minHeight: 146, backgroundColor: colors.surface, borderRadius: radius.md, borderLeftWidth: 3, padding: 12}, sessionTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, sessionTag: {paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4}, sessionTagText: {fontSize: 10, fontWeight: '700'}, sessionStatus: {fontSize: 10, fontWeight: '500', marginLeft: 7}, sessionRange: {fontSize: 9, color: '#C0C5D0'}, sessionTitle: {fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 7}, sessionLesson: {fontSize: 11, color: colors.body, marginTop: 3}, sessionMeta: {fontSize: 10, color: colors.muted, marginTop: 5}, completed: {fontSize: 10, color: colors.success, marginTop: 7}, sessionAction: {alignItems: 'flex-end', marginTop: 9},
  smallButton: {height: 31, paddingHorizontal: 12, borderRadius: 7, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4}, smallButtonText: {fontSize: 11, fontWeight: '700'}, pressed: {opacity: 0.65},
  emptyState: {height: 190, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center'}, emptyTitle: {fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 10}, emptyDescription: {fontSize: 11, color: colors.muted, marginTop: 5}, emptyLink: {fontSize: 12, fontWeight: '600', color: colors.brand, marginTop: 12},
  missedCard: {backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: colors.error, borderRadius: radius.md, padding: 13, marginBottom: 10}, missedBadge: {backgroundColor: '#FFF4F1', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4}, missedBadgeText: {fontSize: 10, color: colors.error, fontWeight: '600'}, originalDate: {fontSize: 10, color: colors.muted, marginLeft: 8}, missedTitle: {fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 7}, missedFooter: {flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8}, grow: {flex: 1},
  allContent: {paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28}, sectionLabel: {fontSize: 11, color: colors.muted, marginBottom: 7, marginTop: 3}, courseGroup: {backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', marginBottom: 16}, recordedCourse: {padding: 15}, groupDivider: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line}, recordedTop: {flexDirection: 'row'}, courseThumb: {width: 64, height: 44, borderRadius: 4, backgroundColor: '#E8E9EE', marginRight: 12}, recordedCopy: {flex: 1}, recordedTitle: {fontSize: 14, lineHeight: 19, fontWeight: '700', color: colors.ink}, recordedMeta: {fontSize: 10, lineHeight: 15, color: colors.muted, marginTop: 2}, dualButtons: {flexDirection: 'row', gap: 8, marginTop: 11}, wideButton: {height: 32, flex: 1, borderWidth: 1, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5}, wideButtonText: {fontSize: 11, fontWeight: '600'}, trainingCourse: {padding: 15}, trainingProgress: {fontSize: 10, fontWeight: '600', color: '#A87000'}, mediaCourse: {padding: 15}, mediaIcon: {width: 48, height: 48, borderRadius: 10, marginRight: 12, alignItems: 'center', justifyContent: 'center'}, mediaButton: {marginTop: 11, flexDirection: 'row'}, completedEmpty: {height: 54, paddingHorizontal: 15, backgroundColor: colors.surface, borderRadius: radius.md, justifyContent: 'center'}, completedEmptyText: {fontSize: 13, color: colors.muted},
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay}, dismiss: {flex: 1}, sheet: {backgroundColor: colors.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 20, paddingTop: 17, paddingBottom: 30}, sheetHeader: {height: 28, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10}, sheetTitle: {fontSize: 18, fontWeight: '700', color: colors.ink}, sheetDescription: {fontSize: 13, lineHeight: 20, color: colors.body, marginBottom: 14}, sheetLabel: {fontSize: 12, fontWeight: '700', color: colors.ink, marginBottom: 9, marginTop: 2}, optionRow: {height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent', backgroundColor: colors.page, marginBottom: 7, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center'}, optionRowSelected: {backgroundColor: colors.brandLight, borderColor: colors.brand}, optionText: {fontSize: 12, fontWeight: '600', color: colors.ink, flex: 1}, optionHint: {fontSize: 10, color: colors.muted, marginRight: 8}, choiceWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14}, choice: {height: 32, paddingHorizontal: 12, borderRadius: 7, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'}, choiceSelected: {backgroundColor: colors.brand, borderColor: colors.brand}, choiceText: {fontSize: 11, color: colors.body, fontWeight: '500'}, choiceTextSelected: {color: colors.surface}, sheetActions: {flexDirection: 'row', gap: 9, marginTop: 15}, sheetAction: {height: 44, flex: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1}, cancelAction: {borderColor: colors.line, backgroundColor: colors.surface}, confirmAction: {borderColor: colors.brand, backgroundColor: colors.brand}, cancelText: {fontSize: 14, color: colors.body}, confirmText: {fontSize: 14, fontWeight: '700', color: colors.surface},
  monthHeader: {height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, monthTitle: {fontSize: 14, fontWeight: '700', color: colors.ink}, monthGrid: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 5}, monthWeek: {width: '14.285%', textAlign: 'center', fontSize: 11, color: colors.muted, paddingVertical: 7}, monthCell: {width: '14.285%', height: 42, alignItems: 'center'}, monthDayCircle: {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center'}, monthDayActive: {backgroundColor: colors.brand}, monthDay: {fontSize: 12, color: colors.ink}, monthDayActiveText: {color: colors.surface, fontWeight: '700'},
});
