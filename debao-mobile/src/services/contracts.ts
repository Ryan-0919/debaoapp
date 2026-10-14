import type {
  AppNotification,
  Course,
  Order,
  OrderEvent,
  Product,
  ProductSku,
  Subject,
  UserProfile,
} from '@/types/domain';

export type {OrderEvent, ProductSku};

export interface AuthService {
  providers(): Promise<AuthProviderAvailability>;
  sendCode(phone: string, purpose?: 'login' | 'bind_phone' | 'change_phone_old' | 'change_phone_new' | 'delete_account' | 'unlink_identity', deviceId?: string): Promise<{accepted: boolean; expiresIn: number; developmentCode?: string}>;
  login(phone: string, code: string, deviceId?: string): Promise<AuthSession>;
  oneClickLogin(providerToken: string, deviceId?: string, bindingToken?: string): Promise<AuthSession>;
  wechatLogin(code: string, deviceId?: string): Promise<WechatLoginResult>;
  bindWechatPhone(bindingToken: string, phone: string, code: string, deviceId?: string): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: UserProfile): Promise<UserProfile>;
  identities(): Promise<Array<{provider: 'wechat'; nickname?: string; boundAt: string}>>;
  sendIdentityLinkCode(): Promise<{accepted: boolean; expiresIn: number; developmentCode?: string}>;
  bindWechatToCurrent(code: string, smsCode: string): Promise<{provider: 'wechat'; nickname?: string; boundAt: string}>;
  sendIdentityUnlinkCode(): Promise<{accepted: boolean; expiresIn: number; developmentCode?: string}>;
  unbindWechat(code: string): Promise<{removed: boolean}>;
  sendPhoneChangeCode(stage: 'current' | 'new', phone?: string): Promise<{accepted: boolean; expiresIn: number; developmentCode?: string}>;
  phoneChange(newPhone: string, oldCode: string, newCode: string): Promise<UserProfile>;
  deletionStatus(): Promise<{status: 'none' | 'scheduled'; requestedAt?: string; executeAfter?: string; coolingOffDays?: number}>;
  sendDeletionCode(): Promise<{accepted: boolean; expiresIn: number; developmentCode?: string}>;
  requestDeletion(code: string): Promise<{status: 'scheduled'; requestedAt: string; executeAfter: string; coolingOffDays: number}>;
  cancelDeletion(): Promise<{status: 'cancelled'; cancelledAt: string}>;
  logout(): Promise<void>;
}

export interface AuthProviderAvailability {
  sms: {available: boolean};
  wechat: {available: boolean};
  oneClick: {available: boolean};
}

export type WechatLoginResult =
  | {status: 'authenticated'; session: AuthSession}
  | {status: 'binding_required'; bindingToken: string; expiresIn: number; wechatProfile?: {nickname?: string}};

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  profile?: UserProfile;
}

export interface QuestionSubmission {
  questionId: string;
  answers: string[];
}

export type ObjectiveSessionMode = 'chapter' | 'year' | 'random' | 'exam';
export interface ObjectiveSessionQuestion {
  id: string;
  subjectId?: string;
  stem: string;
  options: string[];
  questionType?: 'true_false' | 'single' | 'multiple' | 'indeterminate';
  version: number;
  source?: string;
  answer?: number;
  answerIndexes?: number[];
  analysis?: string;
  explanationMediaType?: 'audio' | 'video';
  explanationMediaReference?: string;
}
export interface ObjectiveSessionAnswer {questionId: string; answers: string[]; updatedAt: string;}
export interface ObjectiveSession {
  id: string;
  mode: ObjectiveSessionMode;
  title: string;
  subjectId?: string;
  paperId?: string;
  questionIds: string[];
  questions: ObjectiveSessionQuestion[];
  answers: ObjectiveSessionAnswer[];
  durationSeconds: number;
  startedAt: string;
  expiresAt: string;
  status: 'in_progress' | 'submitted' | 'expired';
  submittedAt?: string;
  reportId?: string;
}
export interface ObjectiveReportResult {
  questionId: string;
  subjectId?: string;
  stem: string;
  options: string[];
  questionType?: 'true_false' | 'single' | 'multiple' | 'indeterminate';
  version: number;
  answers: string[];
  correctAnswers: string[];
  correct: boolean;
  analysis: string;
  explanationMediaType?: 'audio' | 'video';
  explanationMediaReference?: string;
}
export interface ObjectiveReport {
  id: string;
  sessionId: string;
  mode: ObjectiveSessionMode;
  title: string;
  total: number;
  answered: number;
  correct: number;
  score: number;
  maxScore: number;
  results: ObjectiveReportResult[];
  subjectStats: Array<{subjectId: string; total: number; correct: number; correctRate: number}>;
  submittedAt: string;
}

export interface ApiQuestion {
  id: string;
  subjectId?: string;
  stem: string;
  options: string[];
  questionType?: 'true_false' | 'single' | 'multiple' | 'indeterminate';
  answer: number;
  analysis: string;
  status?: 'draft' | 'review' | 'published' | 'disabled' | 'archived';
  version?: number;
  source?: string;
  updatedAt?: string;
}

export interface QuestionRecord {
  id: string;
  questionId: string;
  answers: string[];
  correct: boolean;
  createdAt: string;
  /** Optional server-enriched fields returned by the history endpoint. */
  subjectId?: string;
  mode?: 'objective' | 'subjective';
  title?: string;
  total?: number;
  correctCount?: number;
}

/** Immutable answer/report snapshot for a legacy single-question submission. */
export interface QuestionSubmissionReport {
  id: string;
  questionId: string;
  answers: string[];
  correct: boolean;
  createdAt: string;
  subjectId?: string;
  stem: string;
  options: string[];
  questionType?: 'true_false' | 'single' | 'multiple' | 'indeterminate';
  version: number;
  correctAnswers: string[];
  analysis: string;
}

export interface QuestionMistake {
  id: string;
  questionId: string;
  wrongCount: number;
  lastAnswer: string;
  resolved: boolean;
  question?: ApiQuestion;
}

export interface QuestionFavorite {
  id: string;
  questionId: string;
  createdAt: string;
  question?: ApiQuestion;
}

export interface QuestionService {
  listSubjects(): Promise<Subject[]>;
  listQuestions(subjectId?: string): Promise<{items: ApiQuestion[]; page: number; pageSize: number; total: number}>;
  getQuestion(id: string): Promise<ApiQuestion>;
  createSession?(input: {mode: ObjectiveSessionMode; title?: string; subjectId?: string; paperId?: string; questionIds?: string[]; limit?: number; durationSeconds?: number; idempotencyKey?: string}): Promise<ObjectiveSession>;
  getSession?(id: string): Promise<ObjectiveSession>;
  listSessions?(status?: ObjectiveSession['status']): Promise<{items: ObjectiveSession[]; total: number}>;
  saveSessionAnswer?(sessionId: string, questionId: string, answers: string[]): Promise<{questionId: string; answers: string[]; updatedAt: string}>;
  submitSession?(sessionId: string, idempotencyKey: string): Promise<ObjectiveReport>;
  getSessionReport?(sessionId: string): Promise<ObjectiveReport>;
  saveDraft(submission: QuestionSubmission): Promise<void>;
  submit(submission: QuestionSubmission): Promise<{submissionId: string}>;
  listRecords(): Promise<QuestionRecord[]>;
  /** Load the immutable question/answer snapshot behind a history item. */
  getSubmissionReport?(id: string): Promise<QuestionSubmissionReport>;
  /** Backwards-compatible name used by older history screens. */
  getRecordReport?(id: string): Promise<QuestionSubmissionReport>;
  listMistakes(): Promise<QuestionMistake[]>;
  resolveMistake(id: string): Promise<void>;
  listFavorites(): Promise<QuestionFavorite[]>;
  addFavorite(questionId: string): Promise<QuestionFavorite>;
  removeFavorite(id: string): Promise<void>;
}

export interface CourseService {
  list(): Promise<Course[]>;
  get(id: string): Promise<Course | null>;
  entitlement(id: string): Promise<{hasAccess: boolean; sourceOrderId?: string; expiresAt?: string}>;
  updateProgress(id: string, progress: number): Promise<{courseId: string; progress: number; updatedAt: string}>;
}

export interface ProductService {
  list(): Promise<Product[]>;
  get(id: string): Promise<Product | null>;
}

export interface HomeService {
  get(): Promise<{banners: Array<{id: string; title: string; imageUrl: string; target: string}>; announcements: Array<AppNotification & {isPinned?: boolean; deepLink?: string; startsAt?: string; endsAt?: string; closed?: boolean}>; hotCourses: Course[]; hotPosts?: Array<{id: string; title: string; body?: string; author?: string; createdAt?: string; likeCount: number}>; featuredProduct?: {id: string; name: string; price: number; originalPrice: number} | null; exam: {year: string; daysRemaining: number}}>;
}

export interface LearningPlan { id: string; title: string; dailyMinutes: number; startDate: string; endDate: string; status: 'active' | 'completed' | 'archived'; classTypeId?: string; stageId?: string; autoGenerated?: boolean; version?: number; changeReason?: string; generatedThrough?: string; contentCursor?: number; contentOffsetMinutes?: number; updatedAt?: string; pausedAt?: string; pausedUntil?: string; pauseReason?: string; }
export interface LearningTask { id: string; planId: string; title: string; description?: string; dueDate: string; minutes: number; status: 'todo' | 'done' | 'overdue'; completedAt?: string; subjectId?: string; contentType?: 'course' | 'question' | 'subjective' | 'assessment' | 'card' | 'task'; contentId?: string; locked?: boolean; }
export interface LearningCardAsset {id: string; type: 'image' | 'html'; filename: string; reference: string; sizeBytes: number; sortOrder: number;}
export interface LearningCard {id: string; title: string; description?: string; contentType: 'image_gallery' | 'html'; assets: LearningCardAsset[]; status: 'published'; version: number; updatedAt: string;}
export interface LearningSubjectiveQuestion {id: string; title: string; subjectId: string; caseMaterial?: string; stem: string; subQuestions: Array<{id: string; prompt: string; score: number}>; estimatedMinutes: number; difficulty: number;}
export type LearningActivityKind = 'question' | 'course' | 'task' | 'reading';
export interface LearningActivity {
  id: string;
  kind: LearningActivityKind;
  subjectId?: string;
  questionId?: string;
  courseId?: string;
  taskId?: string;
  durationSeconds: number;
  quantity: number;
  idempotencyKey?: string;
  occurredAt: string;
}
export interface LearningActivityPage {
  items: LearningActivity[];
  total: number;
  durationSeconds: number;
  quantity: number;
  nextCursor?: string;
}
export interface CreateLearningActivityInput {
  kind: LearningActivityKind;
  subjectId?: string;
  questionId?: string;
  courseId?: string;
  taskId?: string;
  durationSeconds?: number;
  quantity?: number;
  occurredAt?: string;
  idempotencyKey?: string;
}
export interface LearningReport {
  period: 'day' | 'week' | 'month';
  minutes: number;
  taskMinutes?: number;
  durationSeconds?: number;
  activities?: number;
  activityQuantity?: number;
  answered: number;
  correctRate: number;
  subjects: Array<{subjectId: string; subjectName?: string; minutes: number; answered?: number; correctRate: number}>;
  weakSubjects?: Array<{subjectId: string; subjectName?: string; minutes: number; answered: number; correctRate: number}>;
  dailyTrend?: Array<{date: string; minutes: number; answered: number; correct: number; correctRate: number}>;
  assessments?: Array<{id: string; sessionId: string; title: string; submittedAt: string; score: number; maxScore: number; correct: number; total: number; correctRate: number; subjectStats: Array<{subjectId: string; total: number; correct: number; correctRate: number}>}>;
  weakKnowledgePoints?: Array<{label: string; subjectId?: string; wrongCount: number; attempts: number; correct: number; correctRate: number}>;
}
export type LearningDiagnosticDimension = string;
export interface LearningDiagnosticForm {id: string; title: string; subtitle?: string; description?: string; estimatedMinutes: number; submitLabel: string; successTitle: string; successDescription: string; version: number;}
export interface LearningDiagnosticAssignment {
  id: string;
  status: 'assigned' | 'pending';
  classType?: {id: string; code: string; name: string};
  stage?: {id: string; code: string; name: string};
  teacher?: {id: string; name: string; subject: string; specialty: string};
  assignedAt: string;
}
export interface LearningDiagnosticResult {
  attemptId: string;
  scores: Record<LearningDiagnosticDimension, number>;
  submittedAt: string;
  assignment?: LearningDiagnosticAssignment;
}
export interface LearningDiagnosticQuestion {
  id: string;
  formId?: string;
  stem: string;
  description?: string;
  section?: string;
  placeholder?: string;
  validation?: {min?: number; max?: number; minLength?: number; maxLength?: number};
  type: 'single' | 'multiple' | 'scale' | 'text' | 'number';
  required: boolean;
  sortOrder: number;
  version: number;
  options: Array<{id: string; label: string; sortOrder: number}>;
}
export interface LearningDiagnosticState {
  access: 'locked' | 'granted';
  productId: string;
  completed: boolean;
  form?: LearningDiagnosticForm;
  dimensions?: Array<{code: string; label: string}>;
  classType?: {id: string; code: string; name: string};
  questions: LearningDiagnosticQuestion[];
  result?: LearningDiagnosticResult;
}
export interface LearningService {
  plans(): Promise<LearningPlan[]>;
  createPlan(input: Pick<LearningPlan, 'title' | 'dailyMinutes' | 'startDate' | 'endDate'>): Promise<LearningPlan>;
  tasks(): Promise<LearningTask[]>;
  completeTask(id: string): Promise<LearningTask>;
  card?(id: string): Promise<LearningCard | null>;
  subjectiveQuestion?(id: string): Promise<LearningSubjectiveQuestion | null>;
  submitSubjectiveTask?(id: string, answers: Array<{subQuestionId: string; text: string}>): Promise<LearningTask>;
  pausePlan(id: string, days: number, reason: string): Promise<LearningPlan>;
  resumePlan(id: string, reason: string): Promise<LearningPlan>;
  report(period?: 'day' | 'week' | 'month'): Promise<LearningReport>;
  recordActivity(input: CreateLearningActivityInput): Promise<LearningActivity>;
  activities(input?: {period?: 'day' | 'week' | 'month'; kind?: LearningActivityKind; cursor?: string; limit?: number}): Promise<LearningActivityPage>;
  diagnostic(): Promise<LearningDiagnosticState>;
  submitDiagnostic(input: {startedAt: string; answers: Array<{questionId: string; optionIds: string[]; value?: string | number}>}): Promise<LearningDiagnosticResult>;
}

export type GradingSubmissionStatus = 'submitted' | 'ai_queued' | 'ai_processing' | 'ai_completed' | 'ai_failed' | 'manual_queued' | 'manual_claimed' | 'manual_submitted' | 'supervisor_review' | 'manual_returned' | 'manual_expired' | 'published' | 'appealed' | 'cancelled' | 'queued' | 'processing' | 'completed' | 'rejected';
export interface GradingQuestion {id: string; rubricId: string; version: number; title: string; subjectId: string; caseMaterial: string; subQuestions: Array<{id: string; prompt: string; maxScore: number}>; totalScore: number; suggestedMinutes: number; allowedAnswerTypes: Array<'text' | 'image' | 'pdf'>;}
export interface GradingPaper {id: string; title: string; subjectId: string; year?: string; totalScore: number; questionIds: string[]; questionCount: number; questions?: GradingQuestion[];}
export interface GradingSubmission { id: string; paperId?: string; paperTitle?: string; questionId?: string; questionTitle?: string; rubricId?: string; questionVersion?: number; fileUrl?: string; status: GradingSubmissionStatus; score?: number; maxScore?: number; feedback?: string; createdAt: string; updatedAt?: string; latestReportId?: string; aiFailureReason?: string; }
export type GradingPointStatus = 'hit' | 'partial' | 'missed';
export type GradingAnnotationType = 'correct' | 'score' | 'error' | 'highlight' | 'comment';
export interface GradingAnswerAnnotation {id: string; subQuestionId: string; start: number; end: number; quote: string; type: GradingAnnotationType; comment?: string; scoreDelta?: number;}
export interface GradingReport {id: string; submissionId: string; version: number; totalScore: number; maxScore: number; answers: Array<{subQuestionId: string; text: string; attachments: string[]}>; pointResults: Array<{pointId: string; title: string; score: number; maxScore: number; status: GradingPointStatus; comment?: string; evidence?: string}>; answerAnnotations: GradingAnswerAnnotation[]; missedPointIds: string[]; feedback: string; improvementAdvice: string; publishedAt: string;}
export interface GradingService { list(): Promise<GradingSubmission[]>; questions?(): Promise<GradingQuestion[]>; papers?(): Promise<GradingPaper[]>; paper?(id: string): Promise<GradingPaper | null>; submit(input: {paperId?: string; questionId?: string; fileUrl?: string; answers?: Array<{subQuestionId: string; text: string; attachments?: string[]}>; idempotencyKey?: string}): Promise<GradingSubmission>; get(id: string): Promise<GradingSubmission | null>; report?(id: string): Promise<GradingReport | null>; retry(id: string): Promise<GradingSubmission>; }

export interface DeviceService { list(): Promise<Array<{id: string; platform: 'android' | 'ios' | 'harmony'; name: string; pushToken?: string; lastSeenAt: string; current?: boolean}>>; register(input: {deviceId: string; platform: 'android' | 'ios' | 'harmony'; name: string; pushToken?: string}): Promise<unknown>; remove(id: string): Promise<void>; }

export interface LegalDocument { id: string; title: string; article: string; content: string; effectiveFrom: string; effectiveTo?: string; }
export interface LegalFavorite {
  id: string;
  legalDocumentId: string;
  documentVersion: number;
  article: string;
  title: string;
  content: string;
  subjectId?: string;
  effectiveFrom?: string;
  createdAt: string;
}
export interface Announcement {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'scheduled' | 'published' | 'withdrawn' | 'expired';
  startsAt?: string;
  endsAt?: string;
  isPinned?: boolean;
  audienceType?: 'all' | 'exam_year';
  deepLink?: string;
  publishedAt?: string;
  createdAt: string;
}
export interface AppLegalDocument {
  key: 'terms' | 'privacy' | 'sdk-list' | 'account-deletion';
  title: string;
  version: number;
  updatedAt: string;
  status: 'published';
  sections: Array<{title: string; body: string}>;
}
export interface LegalService {
  search(query: string): Promise<{items: LegalDocument[]; total: number; query: string}>;
  listFavorites?(): Promise<LegalFavorite[]>;
  addFavorite?(documentId: string): Promise<LegalFavorite>;
  removeFavorite?(id: string): Promise<void>;
  getDocument?(key: AppLegalDocument['key']): Promise<AppLegalDocument>;
  listAnnouncements?(): Promise<Announcement[]>;
}

export type ForumCategory = '经验分享' | '答疑求助' | '知识整理' | '技巧方法';
export type ForumScope = 'all' | 'mine' | 'favorites';
export interface ForumPost {
  id: string;
  authorId: string;
  userName: string;
  category: ForumCategory;
  title: string;
  body: string;
  likes: number;
  comments: number;
  liked: boolean;
  favorited: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface ForumComment { id: string; postId: string; authorId: string; userName: string; body: string; canDelete: boolean; createdAt: string; }
export type ForumReportStatus = 'pending' | 'processing' | 'resolved' | 'rejected';
export interface ForumReport {
  id: string;
  postId: string;
  reason: string;
  status: ForumReportStatus;
  createdAt: string;
}
export interface ForumPage<T> { items: T[]; nextCursor?: string; }
export interface ForumService {
  list(input?: {category?: ForumCategory; scope?: ForumScope; cursor?: string; limit?: number}): Promise<ForumPage<ForumPost>>;
  get(id: string): Promise<ForumPost>;
  create(input: {category: ForumCategory; title: string; body: string}): Promise<ForumPost>;
  remove(id: string): Promise<void>;
  toggleLike(id: string): Promise<ForumPost>;
  toggleFavorite(id: string): Promise<ForumPost>;
  listComments(postId: string, input?: {cursor?: string; limit?: number}): Promise<ForumPage<ForumComment>>;
  createComment(postId: string, body: string): Promise<ForumComment>;
  removeComment(id: string): Promise<void>;
  report(postId: string, reason: string): Promise<ForumReport>;
}

export interface OrderService {
  list(): Promise<Order[]>;
  get(id: string): Promise<Order | null>;
  create(product: Product, options?: {skuId?: string; couponCode?: string; clientRequestId?: string}): Promise<Order>;
  cancel(id: string): Promise<Order>;
  requestRefund(id: string, reason: string): Promise<RefundRequest>;
  listRefunds(): Promise<{items: RefundRequest[]; total: number}>;
  events(id: string): Promise<{items: OrderEvent[]; total: number}>;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  userId?: string;
  reason: string;
  amount: number;
  status: 'requested' | 'reviewing' | 'completed' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export interface PaymentService {
  pay(order: Order): Promise<{status: 'mock-paid' | 'paid' | 'pending'; transactionId: string}>;
}

export interface AIService {
  streamReply(prompt: string, onChunk: (chunk: string) => void): Promise<void>;
  listConversations(input?: {cursor?: string; limit?: number}): Promise<{items: AIConversation[]; total: number; nextCursor?: string}>;
  createConversation(title?: string, clientRequestId?: string): Promise<AIConversation>;
  getConversation(id: string): Promise<AIConversationDetail>;
  renameConversation(id: string, title: string): Promise<AIConversation>;
  deleteConversation(id: string): Promise<{deleted: boolean; id: string}>;
  listMessages(id: string): Promise<{items: AIMessage[]; total: number}>;
  sendMessage(id: string, content: string, clientRequestId?: string): Promise<{session: AIConversation; userMessage: AIMessage; assistantMessage: AIMessage}>;
}

export interface AIMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  clientRequestId?: string;
  createdAt: string;
}
export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: {role: AIMessage['role']; content: string; createdAt: string};
}
export interface AIConversationDetail extends AIConversation {messages: AIMessage[];}

export interface AttachmentUpload {
  id: string;
  filename: string;
  contentType: 'image/jpeg' | 'image/png' | 'application/pdf';
  sizeBytes: number;
  sha256?: string;
  status: 'pending' | 'completed' | 'rejected' | 'expired';
  uploadToken?: string;
  uploadUrl?: string;
  method?: 'PUT';
  headers?: Record<string, string>;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
}
export interface AttachmentService {
  preflight(input: {filename: string; contentType: AttachmentUpload['contentType']; sizeBytes: number; sha256?: string}): Promise<AttachmentUpload>;
  get(id: string): Promise<AttachmentUpload>;
  complete(id: string, uploadToken: string, sha256?: string): Promise<AttachmentUpload>;
  remove(id: string): Promise<{deleted: boolean; id: string}>;
}

export interface MediaService {
  prepare(courseId: string, kind: 'video' | 'audio' | 'live'): Promise<{
    available: false;
    reason: string;
  }>;
}

export interface NotificationService {
  list(): Promise<AppNotification[]>;
  listPage?(input?: {cursor?: string; page?: number; pageSize?: number; unreadOnly?: boolean}): Promise<{items: AppNotification[]; total: number; unreadCount: number; nextCursor?: string}>;
  markRead?(id: string): Promise<void>;
  readAll?(): Promise<{read: number; readAt: string}>;
  getAnnouncement?(id: string): Promise<Announcement & {deepLink: string; read: boolean; closed: boolean}>;
  markAnnouncementRead?(id: string): Promise<{id: string; read: true}>;
  closeAnnouncement?(id: string): Promise<{id: string; read: true; closed: true}>;
  requestPermission(): Promise<{granted: false; reason: string}>;
}
