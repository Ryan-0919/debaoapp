import {
  CheckOutlined,
  DeleteOutlined,
  HighlightOutlined,
  LogoutOutlined,
  MessageOutlined,
  PlusOutlined,
  ReloadOutlined,
  RollbackOutlined,
  UnderlineOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Popover,
  Segmented,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  claimGraderTask,
  getCurrentGrader,
  getGraderStats,
  getGraderTask,
  getGraderTasks,
  logoutGrader,
  returnGraderTask,
  submitGraderReview,
  type GraderAssignment,
  type GraderProfile,
  type GraderStats,
  type GraderTaskDetail,
  type GradingAnswerAnnotation,
  type GradingAnnotationType,
  type GradingPointStatus,
} from "@/services/api";
import "./GraderWorkbench.css";

type ReviewValues = {
  totalScore: number;
  feedback: string;
  improvementAdvice: string;
  aiOverrideReason?: string;
  points?: Record<string, { score: number; comment?: string }>;
};
const subjectLabels: Record<string, string> = {
  civil: "民法",
  criminal: "刑法",
};
const statusMeta: Record<string, { label: string; color: string }> = {
  available: { label: "待领取", color: "gold" },
  claimed: { label: "批改中", color: "processing" },
  submitted: { label: "待主管发布", color: "success" },
  returned: { label: "已退回", color: "warning" },
};
const pointStatusMeta: Record<
  GradingPointStatus,
  { label: string; color: string }
> = {
  hit: { label: "命中", color: "success" },
  partial: { label: "部分命中", color: "warning" },
  missed: { label: "遗漏", color: "error" },
};
function formatTime(value?: string) {
  return value
    ? new Date(value).toLocaleString("zh-CN", { hour12: false })
    : "-";
}

function answerOffset(root: HTMLElement, node: Node, offset: number) {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(node, offset);
  return range.toString().length;
}

export default function GraderWorkbench() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GraderProfile>();
  const [stats, setStats] = useState<GraderStats>();
  const [available, setAvailable] = useState<GraderAssignment[]>([]);
  const [mine, setMine] = useState<GraderAssignment[]>([]);
  const [tab, setTab] = useState("available");
  const [active, setActive] = useState<GraderTaskDetail>();
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [annotations, setAnnotations] = useState<GradingAnswerAnnotation[]>([]);
  const [selection, setSelection] = useState<{
    subQuestionId: string;
    start: number;
    end: number;
    quote: string;
  } | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [annotationPoints, setAnnotationPoints] = useState(1);
  const showPointEditor = false;
  const [pointStatuses, setPointStatuses] = useState<
    Record<string, GradingPointStatus>
  >({});
  const [form] = Form.useForm<ReviewValues>();
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [me, queue, myTasks, summary] = await Promise.all([
        getCurrentGrader(),
        getGraderTasks(),
        getGraderTasks(true),
        getGraderStats(),
      ]);
      setProfile(me);
      setAvailable(queue.items);
      setMine(myTasks.items);
      setStats(summary);
    } catch {
      navigate("/grader/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  useEffect(() => {
    void load();
  }, [load]);
  const groups = useMemo(
    () => ({
      available,
      claimed: mine.filter((item) => item.status === "claimed"),
      submitted: mine.filter((item) => item.status === "submitted"),
      returned: mine.filter((item) => item.status === "returned"),
    }),
    [available, mine],
  );
  const data = groups[tab as keyof typeof groups] ?? [];
  const workflowStep =
    tab === "available"
      ? 1
      : tab === "claimed"
        ? 2
        : tab === "submitted"
          ? 3
          : 2;
  const openTask = async (assignment: GraderAssignment) => {
    try {
      const detail = await getGraderTask(assignment.id);
      setActive(detail);
      setAnnotations(detail.review?.answerAnnotations ?? []);
      form.setFieldsValue({
        totalScore:
          detail.review?.totalScore ?? detail.ai?.suggestedScore ?? undefined,
        feedback: detail.review?.feedback ?? "",
        improvementAdvice: detail.review?.improvementAdvice ?? "",
        aiOverrideReason: detail.review?.aiOverrideReason ?? "",
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "加载任务失败");
    }
  };
  const claim = async (assignment: GraderAssignment) => {
    setActing(true);
    try {
      await claimGraderTask(assignment.id);
      message.success("任务领取成功，请在 24 小时内完成");
      await load();
      await openTask({ ...assignment, status: "claimed" });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "领取失败");
    } finally {
      setActing(false);
    }
  };
  const captureSelection = (
    event: React.MouseEvent<HTMLDivElement>,
    subQuestionId: string,
  ) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!event.currentTarget.contains(range.commonAncestorContainer)) return;
    const start = answerOffset(
      event.currentTarget,
      range.startContainer,
      range.startOffset,
    );
    const end = answerOffset(
      event.currentTarget,
      range.endContainer,
      range.endOffset,
    );
    if (end > start)
      setSelection({ subQuestionId, start, end, quote: sel.toString() });
  };
  const addAnnotation = (type: GradingAnnotationType, showCorrectMarker = false) => {
    if (!selection) return;
    if ((type === "comment" || type === "error") && commentDraft.trim().length < 2) {
      message.warning(type === "error" ? "错误标记必须填写点评" : "点评至少填写 2 个字");
      return;
    }
    const overlap = annotations.some(
      (item) =>
        item.subQuestionId === selection.subQuestionId &&
        selection.start < item.end &&
        selection.end > item.start,
    );
    if (overlap) {
      message.warning("选区与已有批注重叠，请先删除原批注");
      return;
    }
    setAnnotations((current) => [
      ...current,
      {
        ...selection,
        id: `annotation-${Date.now()}`,
        type,
        scoreDelta:
          type === "error"
            ? -Math.max(1, Math.round(annotationPoints))
            : type === "score"
              ? Math.max(1, Math.round(annotationPoints))
              : type === "correct" && showCorrectMarker
                ? 0
              : undefined,
        comment:
          type === "comment"
            ? commentDraft.trim()
            : commentDraft.trim() || undefined,
      },
    ]);
    setSelection(null);
    setCommentDraft("");
    window.getSelection()?.removeAllRanges();
  };
  const submit = async (values: ReviewValues) => {
    if (!active?.rubric) return;
    const pointResults = active.rubric.points.map((point) => {
      const aiPoint = active.ai?.result?.pointResults.find(
        (item) => item.pointId === point.id,
      );
      const status =
        aiPoint?.status === "miss"
          ? "missed"
          : aiPoint?.status === "partial"
            ? "partial"
            : "hit";
      return {
        pointId: point.id,
        score: Math.min(
          point.maxScore,
          Math.max(0, Number(aiPoint?.suggestedScore ?? 0)),
        ),
        status: status as "hit" | "partial" | "missed",
      };
    });
    const totalScore = Number(values.totalScore);
    if (pointResults.some((point) => !point.status)) {
      message.warning("请完成所有采分点状态");
      return;
    }
    setActing(true);
    try {
      await submitGraderReview(active.assignment.id, {
        totalScore,
        pointResults,
        answerAnnotations: annotations,
        missedPointIds: pointResults
          .filter((point) => point.status === "missed")
          .map((point) => point.pointId),
        feedback: values.feedback,
        improvementAdvice: values.improvementAdvice,
        aiOverrideReason: values.aiOverrideReason,
      });
      message.success("人工批改已提交，等待主管复核并发布给用户");
      setActive(undefined);
      setTab("submitted");
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "提交失败");
    } finally {
      setActing(false);
    }
  };
  const confirmReturn = async () => {
    if (returnReason.trim().length < 2 || !active) {
      message.warning("请填写退回原因");
      return;
    }
    setActing(true);
    try {
      await returnGraderTask(active.assignment.id, returnReason.trim());
      message.success("任务已退回主管处理");
      setReturnOpen(false);
      setReturnReason("");
      setActive(undefined);
      setTab("returned");
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "退回失败");
    } finally {
      setActing(false);
    }
  };
  const renderAnswer = (answer: {
    subQuestionId: string;
    text: string;
    attachments: string[];
  }) => {
    const text = answer.text || "仅提交附件";
    const items = annotations
      .filter((item) => item.subQuestionId === answer.subQuestionId)
      .sort((a, b) => a.start - b.start);
    const segments: React.ReactNode[] = [];
    let cursor = 0;
    items.forEach((item) => {
      if (item.start < cursor) return;
      if (item.start > cursor)
        segments.push(
          <span key={`plain-${cursor}`}>{text.slice(cursor, item.start)}</span>,
        );
      const style =
        item.type === "error"
          ? { color: "#cf1322", textDecoration: "underline wavy #cf1322" }
          : item.type === "highlight"
            ? { background: "#fff1b8", borderBottom: "2px solid #d48806" }
            : item.type === "comment"
              ? { color: "#cf1322", textDecoration: "underline wavy #cf1322" }
              : { color: "#1677ff", textDecoration: "underline 2px #1677ff" };
      const marker =
        item.type === "correct" && item.scoreDelta === 0 ? (
          <CheckOutlined className="annotation-symbol correct-symbol" />
        ) : item.type === "score" ? (
          <span className="annotation-symbol score-symbol">
            +{Math.abs(item.scoreDelta ?? 0)}
          </span>
        ) : item.type === "error" ? (
          <span className="annotation-symbol error-symbol">
            -{Math.abs(item.scoreDelta ?? 0)}
          </span>
        ) : null;
      segments.push(
        <Popover
          key={item.id}
          title={
            item.type === "error"
              ? "错误标记"
              : item.type === "comment"
                ? "老师点评"
                : "答案批注"
          }
          content={
            <Space direction="vertical">
              {item.type === "error" && item.scoreDelta ? (
                <Typography.Text type="danger">
                  扣分：{Math.abs(item.scoreDelta)} 分
                </Typography.Text>
              ) : item.type === "score" && item.scoreDelta ? (
                <Typography.Text type="success">
                  加分：{Math.abs(item.scoreDelta)} 分
                </Typography.Text>
              ) : null}
              <Typography.Text>{item.comment ?? item.quote}</Typography.Text>
              {active?.assignment.status === "claimed" && (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    setAnnotations((current) =>
                      current.filter((entry) => entry.id !== item.id),
                    )
                  }
                >
                  删除批注
                </Button>
              )}
            </Space>
          }
        >
          <span className="annotation-mark" style={{ ...style, cursor: "pointer" }}>
            {marker}
            {text.slice(item.start, item.end)}
          </span>
        </Popover>,
      );
      cursor = item.end;
    });
    if (cursor < text.length)
      segments.push(<span key={`plain-${cursor}`}>{text.slice(cursor)}</span>);
    return (
      <div
        className="answer-text"
        onMouseUp={(event) => captureSelection(event, answer.subQuestionId)}
      >
        {segments}
      </div>
    );
  };
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <Layout.Header
        style={{
          height: 58,
          paddingInline: "clamp(16px, 4vw, 40px)",
          background: "#fff",
          borderBottom: "1px solid #e8e9ef",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Typography.Text strong style={{ fontSize: 16 }}>
            得宝批改老师工作台
          </Typography.Text>
          <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
            {profile?.displayName}
          </Typography.Text>
        </div>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={async () => {
            await logoutGrader();
            navigate("/grader/login", { replace: true });
          }}
        >
          退出
        </Button>
      </Layout.Header>
      <Layout.Content
        style={{
          width: "min(1440px, 100%)",
          margin: "0 auto",
          padding: "24px clamp(12px, 3vw, 32px)",
        }}
      >
        <Space direction="vertical" size={20} style={{ display: "flex" }}>
          <Flex justify="space-between" align="flex-end" wrap gap={12}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                我的批改任务
              </Typography.Title>
              <Typography.Text type="secondary">
                授权科目：
                {profile?.subjectIds
                  .map((id) => subjectLabels[id] ?? id)
                  .join("、") || "全部科目"}
              </Typography.Text>
            </div>
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={() => void load()}
            >
              刷新
            </Button>
          </Flex>
          <div className="workflow-strip">
            <Steps
              size="small"
              current={workflowStep}
              items={[
                { title: "AI 初评", description: "依据采分点给出建议" },
                { title: "进入人工队列", description: "按授权科目分发" },
                { title: "老师复核", description: "逐项评分并提交" },
                { title: "主管发布", description: "用户查看批改报告" },
              ]}
            />
          </div>
          <Flex gap={12} wrap>
            {[
              { label: "今日完成", value: stats?.todayCompleted ?? 0 },
              { label: "批改中", value: stats?.inProgress ?? 0 },
              { label: "累计完成", value: stats?.totalCompleted ?? 0 },
              { label: "已退回", value: stats?.returned ?? 0 },
            ].map((item) => (
              <div key={item.label} className="stat-tile">
                <Statistic
                  title={item.label}
                  value={item.value}
                  valueStyle={{ fontSize: 24 }}
                />
              </div>
            ))}
          </Flex>
          <Segmented
            value={tab}
            onChange={(value) => setTab(String(value))}
            options={[
              {
                label: `待领取 ${groups.available.length}`,
                value: "available",
              },
              { label: `批改中 ${groups.claimed.length}`, value: "claimed" },
              {
                label: `已提交 ${groups.submitted.length}`,
                value: "submitted",
              },
              { label: `已退回 ${groups.returned.length}`, value: "returned" },
            ]}
          />
          <Table
            rowKey="id"
            loading={loading}
            dataSource={data}
            scroll={{ x: 1050 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="当前没有批改任务"
                />
              ),
            }}
            columns={[
              {
                title: "任务编号",
                dataIndex: "id",
                width: 190,
                ellipsis: true,
              },
              {
                title: "科目",
                width: 80,
                render: (_, record) =>
                  subjectLabels[record.rubric?.subjectId ?? ""] ??
                  record.rubric?.subjectId ??
                  "-",
              },
              {
                title: "套卷 / 题目",
                width: 320,
                render: (_, record) => (
                  <div>
                    <Typography.Text strong>
                      {record.paper?.title ?? "独立主观题"}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary">
                      {record.rubric?.title ??
                        record.submission?.questionId ??
                        record.submissionId}
                    </Typography.Text>
                  </div>
                ),
              },
              {
                title: "AI 建议",
                width: 95,
                render: (_, record) =>
                  record.ai?.suggestedScore !== undefined
                    ? `${record.ai.suggestedScore}/${record.rubric?.totalScore ?? "-"}`
                    : "-",
              },
              {
                title: "状态",
                dataIndex: "status",
                width: 110,
                render: (value) => (
                  <Tag color={statusMeta[String(value)]?.color}>
                    {statusMeta[String(value)]?.label ?? value}
                  </Tag>
                ),
              },
              {
                title: tab === "available" ? "进入队列" : "领取时间",
                width: 170,
                render: (_, record) =>
                  formatTime(
                    tab === "available" ? record.createdAt : record.claimedAt,
                  ),
              },
              {
                title: "截止时间",
                dataIndex: "dueAt",
                width: 170,
                render: formatTime,
              },
              {
                title: "操作",
                fixed: "right",
                width: 110,
                render: (_, record) =>
                  record.status === "available" ? (
                    <Button
                      type="link"
                      icon={<CheckOutlined />}
                      loading={acting}
                      onClick={() => void claim(record)}
                    >
                      领取
                    </Button>
                  ) : (
                    <Button type="link" onClick={() => void openTask(record)}>
                      {record.status === "claimed" ? "开始批改" : "查看详情"}
                    </Button>
                  ),
              },
            ]}
          />
        </Space>
        <Drawer
          title={
            active?.assignment.status === "submitted"
              ? "已提交批改详情"
              : "人工批改工作台"
          }
          open={Boolean(active)}
          onClose={() => setActive(undefined)}
          width={1180}
          destroyOnClose
          extra={
            active?.assignment.status === "claimed" && (
              <Button
                danger
                icon={<RollbackOutlined />}
                loading={acting}
                onClick={() => setReturnOpen(true)}
              >
                退回任务
              </Button>
            )
          }
        >
          {active && (
            <div className="grading-drawer-grid">
              <section>
                <Descriptions
                  bordered
                  size="small"
                  column={1}
                  items={[
                    {
                      key: "title",
                      label: "题目",
                      children:
                        active.rubric?.title ?? active.submission.questionId,
                    },
                    {
                      key: "material",
                      label: "案情",
                      children: (
                        <Typography.Paragraph
                          style={{ whiteSpace: "pre-wrap", margin: 0 }}
                        >
                          {active.rubric?.caseMaterial}
                        </Typography.Paragraph>
                      ),
                    },
                    {
                      key: "basis",
                      label: "批改依据",
                      children: active.rubric?.gradingBasis,
                    },
                  ]}
                />
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ marginTop: 20 }}
                >
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    用户答案与行内批注
                  </Typography.Title>
                  {annotations.length > 0 && (
                    <Button
                      size="small"
                      icon={<UndoOutlined />}
                      onClick={() =>
                        setAnnotations((current) => current.slice(0, -1))
                      }
                    >
                      撤销最近批注
                    </Button>
                  )}
                </Flex>
                {active.assignment.status === "claimed" && (
                  <div className="annotation-toolbar">
                    <Typography.Text>
                      {selection
                        ? `已选：“${selection.quote}”`
                        : "请先选中答案原文，再选择批注操作"}
                    </Typography.Text>
                    <Button
                      size="small"
                      icon={<UnderlineOutlined />}
                      disabled={!selection}
                      onClick={() => addAnnotation("correct")}
                    >
                      划线
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      icon={<CheckOutlined />}
                      disabled={!selection}
                      onClick={() => addAnnotation("correct", true)}
                    >
                      正确
                    </Button>
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      disabled={!selection}
                      onClick={() => addAnnotation("score")}
                    >
                      加分
                    </Button>
                    <Button
                      size="small"
                      danger
                      disabled={!selection}
                      onClick={() => addAnnotation("error")}
                    >
                      错误
                    </Button>
                    <InputNumber
                      size="small"
                      min={1}
                      max={20}
                      precision={0}
                      value={annotationPoints}
                      onChange={(value) =>
                        setAnnotationPoints(Math.max(1, Number(value ?? 1)))
                      }
                      aria-label="批注分值"
                      style={{ width: 76 }}
                    />
                    <Typography.Text>分</Typography.Text>
                    <Button
                      size="small"
                      icon={<HighlightOutlined />}
                      disabled={!selection}
                      onClick={() => addAnnotation("highlight")}
                    >
                      重点
                    </Button>
                    <Input
                      size="small"
                      value={commentDraft}
                      disabled={!selection}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      placeholder="点评内容（错误 / 点评必填）"
                      style={{ width: 190 }}
                    />
                    <Button
                      size="small"
                      icon={<MessageOutlined />}
                      disabled={!selection}
                      onClick={() => addAnnotation("comment")}
                    >
                      点评
                    </Button>
                  </div>
                )}
                {active.submission.answers.map((answer, index) => (
                  <div key={answer.subQuestionId} className="answer-block">
                    <Typography.Text strong>第 {index + 1} 问</Typography.Text>
                    {active.rubric?.subQuestions.find(
                      (item) => item.id === answer.subQuestionId,
                    )?.prompt && (
                      <Typography.Text
                        type="secondary"
                        className="question-prompt"
                      >
                        {
                          active.rubric.subQuestions.find(
                            (item) => item.id === answer.subQuestionId,
                          )?.prompt
                        }
                      </Typography.Text>
                    )}
                    {renderAnswer(answer)}
                  </div>
                ))}
                {annotations.length > 0 && (
                  <Alert
                    type="info"
                    showIcon
                    message={`已添加 ${annotations.length} 条答案批注`}
                    description="点击答案中的彩色标记可查看点评或删除。"
                    style={{ marginTop: 12 }}
                  />
                )}
              </section>
              <section>
                <Alert
                  type={active.ai?.status === "completed" ? "info" : "warning"}
                  showIcon
                  message={
                    active.ai?.status === "completed"
                      ? `AI 首轮建议：${active.ai.suggestedScore ?? "-"} 分`
                      : "AI 首轮结果不可用"
                  }
                  description={`${active.ai?.result?.feedback ?? "请直接在用户答案原文上完成批注。"} AI 仅提供参考，最终结果以原文批注和人工总分为准。`}
                />
                {active.assignment.status === "submitted" && active.review ? (
                  <div className="submitted-review">
                    <Descriptions
                      bordered
                      size="small"
                      column={1}
                      title="已提交的人工结论"
                      items={[
                        {
                          key: "score",
                          label: "人工总分",
                          children: `${active.review.totalScore}/${active.rubric?.totalScore ?? "-"}`,
                        },
                        {
                          key: "feedback",
                          label: "老师总评",
                          children: active.review.feedback,
                        },
                        {
                          key: "advice",
                          label: "改进建议",
                          children: active.review.improvementAdvice,
                        },
                        {
                          key: "status",
                          label: "后续状态",
                          children:
                            active.review.status === "approved" ||
                            active.submission.status === "published" ? (
                              <Tag color="success">报告已发布，用户可查看</Tag>
                            ) : (
                              <Tag color="processing">等待主管复核发布</Tag>
                            ),
                        },
                      ]}
                    />
                    {active.rubric?.points.map((point) => {
                      const result = active.review?.pointResults.find(
                        (item) => item.pointId === point.id,
                      );
                      const meta = result
                        ? pointStatusMeta[result.status]
                        : pointStatusMeta.missed;
                      return (
                        <div
                          key={point.id}
                          className={`review-point ${result?.status === "missed" ? "missed-point" : ""}`}
                        >
                          <Flex justify="space-between">
                            <Typography.Text strong>
                              {point.title}
                            </Typography.Text>
                            <Tag color={meta.color}>{meta.label}</Tag>
                            <Typography.Text strong>
                              {result?.score ?? 0}/{point.maxScore}
                            </Typography.Text>
                          </Flex>
                          <Typography.Text type="secondary">
                            {result?.comment ?? "无补充说明"}
                          </Typography.Text>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  active.assignment.status === "claimed" &&
                  active.rubric && (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={submit}
                      requiredMark={false}
                    >
                      <Form.Item
                        name="totalScore"
                        label="本题总分"
                        rules={[{ required: true, message: "请填写本题总分" }]}
                      >
                        <InputNumber
                          min={0}
                          max={active.rubric?.totalScore ?? 0}
                          precision={1}
                          addonAfter="分"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                      {showPointEditor && (
                        <>
                          <Typography.Title level={5}>
                            采分点状态与评分
                          </Typography.Title>
                          {active?.rubric?.points?.map((point) => {
                            const aiPoint =
                              active?.ai?.result?.pointResults.find(
                                (item) => item.pointId === point.id,
                              );
                            const status = pointStatuses[point.id] ?? "partial";
                            return (
                              <div
                                key={point.id}
                                className={`point-editor ${status === "missed" ? "missed-point" : ""}`}
                              >
                                <div className="point-copy">
                                  <Flex justify="space-between" align="center">
                                    <Typography.Text strong>
                                      {point.title}（{point.maxScore} 分）
                                    </Typography.Text>
                                    <Tag color={pointStatusMeta[status].color}>
                                      {pointStatusMeta[status].label}
                                    </Tag>
                                  </Flex>
                                  <Typography.Paragraph
                                    type="secondary"
                                    style={{ margin: "4px 0" }}
                                  >
                                    {point.description}
                                  </Typography.Paragraph>
                                  {aiPoint && (
                                    <Typography.Text type="secondary">
                                      AI 建议 {aiPoint.suggestedScore} 分 ·{" "}
                                      {aiPoint.evidence}
                                    </Typography.Text>
                                  )}
                                  <Segmented
                                    size="small"
                                    value={status}
                                    options={Object.entries(
                                      pointStatusMeta,
                                    ).map(([value, meta]) => ({
                                      label: meta.label,
                                      value,
                                    }))}
                                    onChange={(value) => {
                                      const next = value as GradingPointStatus;
                                      setPointStatuses((current) => ({
                                        ...current,
                                        [point.id]: next,
                                      }));
                                      if (next === "missed")
                                        form.setFieldValue(
                                          ["points", point.id, "score"],
                                          0,
                                        );
                                      else if (next === "hit")
                                        form.setFieldValue(
                                          ["points", point.id, "score"],
                                          point.maxScore,
                                        );
                                    }}
                                  />
                                </div>
                                <Form.Item
                                  name={["points", point.id, "score"]}
                                  rules={[
                                    { required: true, message: "请评分" },
                                  ]}
                                  style={{ width: 108, marginBottom: 0 }}
                                >
                                  <InputNumber
                                    min={0}
                                    max={point.maxScore}
                                    precision={1}
                                    addonAfter="分"
                                    disabled={status === "missed"}
                                    style={{ width: "100%" }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  name={["points", point.id, "comment"]}
                                  style={{ flex: "1 1 180px", marginBottom: 0 }}
                                >
                                  <Input placeholder="采分点说明（选填）" />
                                </Form.Item>
                              </div>
                            );
                          })}
                          {Object.values(pointStatuses).filter(
                            (status) => status === "missed",
                          ).length > 0 && (
                            <Alert
                              type="error"
                              showIcon
                              message={`遗漏 ${Object.values(pointStatuses).filter((status) => status === "missed").length} 个采分点`}
                              description="请在总评中说明遗漏项的改进方向。"
                            />
                          )}
                        </>
                      )}
                      {
                        <Form.Item
                          name="feedback"
                          label="老师总评"
                          rules={[
                            {
                              required: true,
                              min: 2,
                              message: "请填写老师总评",
                            },
                          ]}
                          style={{ marginTop: 20 }}
                        >
                          <Input.TextArea rows={4} />
                        </Form.Item>
                      }
                      <Form.Item
                        name="improvementAdvice"
                        label="改进建议"
                        rules={[
                          { required: true, min: 2, message: "请填写改进建议" },
                        ]}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                      <Form.Item
                        name="aiOverrideReason"
                        label="与 AI 建议差异原因"
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="若人工判断与 AI 建议不同，请说明原因"
                        />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={acting}
                      >
                        提交人工批改结果
                      </Button>
                    </Form>
                  )
                )}
              </section>
            </div>
          )}
        </Drawer>
        <Modal
          title="退回批改任务"
          open={returnOpen}
          okText="确认退回"
          cancelText="取消"
          confirmLoading={acting}
          okButtonProps={{ danger: true }}
          onOk={() => void confirmReturn()}
          onCancel={() => setReturnOpen(false)}
        >
          <Input.TextArea
            rows={4}
            value={returnReason}
            onChange={(event) => setReturnReason(event.target.value)}
            placeholder="请说明材料不清、答案缺失或题目配置错误等具体原因"
          />
        </Modal>
      </Layout.Content>
    </Layout>
  );
}
