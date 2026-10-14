import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StopOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Upload,
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  createLearningQuestion,
  copyLearningQuestion,
  deleteLearningQuestion,
  disableLearningQuestion,
  getLearningQuestionBank,
  getLearningQuestionTaxonomy,
  publishLearningQuestion,
  uploadLearningQuestionMedia,
  updateLearningQuestion,
  type AdminLearningQuestion,
  type AdminLearningQuestionCategory,
  type AdminLearningQuestionInput,
  type AdminLearningQuestionStats,
  type AdminLearningQuestionStatus,
  type AdminLearningTaxonomyNode,
  type AdminLearningQuestionType,
  type AdminLearningQuestionUsageScene,
} from "@/services/api";
import {
  learningQuestionTypeLabel,
  objectiveQuestionTypes,
  subjectiveQuestionTypes,
} from "@/utils/learningQuestionMeta";

type QuestionFormValues = Omit<
  AdminLearningQuestionInput,
  "options" | "correctAnswers" | "subQuestions"
> & {
  options: Array<{ label: string }>;
  correctAnswers?: string[];
  singleAnswer?: string;
  subQuestions: Array<{
    id?: string;
    prompt: string;
    referenceAnswer: string;
    analysis?: string;
    score: number;
  }>;
};

const statusLabels: Record<AdminLearningQuestionStatus, string> = {
  draft: "草稿",
  published: "已发布",
  disabled: "已停用",
};
const statusColors: Record<AdminLearningQuestionStatus, string> = {
  draft: "gold",
  published: "green",
  disabled: "default",
};
const usageSceneOptions: Array<{
  value: AdminLearningQuestionUsageScene;
  label: string;
}> = [
  { value: "diagnostic", label: "能力诊断" },
  { value: "daily_practice", label: "日常练习" },
  { value: "stage_test", label: "阶段测验" },
  { value: "wrong_review", label: "错题重练" },
];
const emptyStats: AdminLearningQuestionStats = {
  total: 0,
  objective: 0,
  subjective: 0,
  draft: 0,
  published: 0,
  disabled: 0,
};
const optionKey = (index: number) => String.fromCharCode(65 + index);

type LearningQuestionBankProps = {
  editorOnly?: boolean;
  onSaved?: () => void | Promise<void>;
  contextPath?: string;
};

export default function LearningQuestionBank({
  editorOnly = false,
  onSaved,
  contextPath,
}: LearningQuestionBankProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category: AdminLearningQuestionCategory = location.pathname.includes(
    "/subjective/",
  )
    ? "subjective"
    : "objective";
  const [items, setItems] = useState<AdminLearningQuestion[]>([]);
  const [stats, setStats] = useState(emptyStats);
  const [taxonomyNodes, setTaxonomyNodes] = useState<
    AdminLearningTaxonomyNode[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const [editing, setEditing] = useState<AdminLearningQuestion | null>(null);
  const [keyword, setKeyword] = useState("");
  const [questionType, setQuestionType] = useState<
    AdminLearningQuestionType | undefined
  >();
  const [subject, setSubject] = useState<string | undefined>();
  const [status, setStatus] = useState<
    AdminLearningQuestionStatus | undefined
  >();
  const [form] = Form.useForm<QuestionFormValues>();
  const handledEditorRequest = useRef<string>();
  const watchedType = Form.useWatch("questionType", form) as
    AdminLearningQuestionType | undefined;
  const watchedOptions = Form.useWatch("options", form) as
    Array<{ label: string }> | undefined;
  const watchedExplanationMediaType = Form.useWatch(
    "explanationMediaType",
    form,
  ) as "audio" | "video" | undefined;
  const watchedExplanationMediaReference = Form.useWatch(
    "explanationMediaReference",
    form,
  ) as string | undefined;
  const isObjective = category === "objective";
  const availableTypes = isObjective
    ? objectiveQuestionTypes
    : subjectiveQuestionTypes;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLearningQuestionBank({
        category,
        questionType,
        subject,
        status,
        keyword: keyword.trim() || undefined,
      });
      setItems(result.items);
      setStats(result.stats);
      setTaxonomyNodes(result.taxonomyNodes ?? []);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "题库加载失败");
    } finally {
      setLoading(false);
    }
  }, [category, keyword, questionType, status, subject]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const questionId = searchParams.get("questionId");
    const createRequested = searchParams.get("create") === "1";
    const requestKey = questionId
      ? `edit:${questionId}`
      : createRequested
        ? `create:${searchParams.toString()}`
        : undefined;
    if (!requestKey) {
      handledEditorRequest.current = undefined;
      return;
    }
    if (handledEditorRequest.current === requestKey) return;
    const item = questionId
      ? items.find((candidate) => candidate.id === questionId)
      : undefined;
    if (item) {
      handledEditorRequest.current = requestKey;
      openEdit(item);
    } else if (createRequested) {
      handledEditorRequest.current = requestKey;
      openCreate();
    }
  }, [items, searchParams]);

  useEffect(() => {
    void getLearningQuestionTaxonomy({ category })
      .then((result) => setTaxonomyNodes(result.items))
      .catch((error) =>
        message.error(
          error instanceof Error ? error.message : "知识目录加载失败",
        ),
      );
  }, [category]);
  const subjects = useMemo(
    () =>
      taxonomyNodes.filter(
        (node) => node.type === "subject" && node.status === "active",
      ),
    [taxonomyNodes],
  );
  const chapters = useMemo(
    () =>
      taxonomyNodes.filter(
        (node) => node.type === "chapter" && node.status === "active",
      ),
    [taxonomyNodes],
  );
  const points = useMemo(
    () =>
      taxonomyNodes.filter(
        (node) => node.type === "point" && node.status === "active",
      ),
    [taxonomyNodes],
  );
  const subpoints = useMemo(
    () =>
      taxonomyNodes.filter(
        (node) => node.type === "subpoint" && node.status === "active",
      ),
    [taxonomyNodes],
  );
  const selectedSubject = Form.useWatch("subjectId", form);
  const selectedChapter = Form.useWatch("chapterId", form);
  const selectedPoint = Form.useWatch("pointId", form);
  const pointHasSubpoints = subpoints.some(
    (node) => node.parentId === selectedPoint,
  );
  const answerOptions = useMemo(() => {
    if (watchedType === "true_false")
      return [
        { value: "A", label: "A. 正确" },
        { value: "B", label: "B. 错误" },
      ];
    return (watchedOptions ?? []).map((item, index) => ({
      value: optionKey(index),
      label: `${optionKey(index)}. ${item?.label || "未填写选项"}`,
    }));
  }, [watchedOptions, watchedType]);

  const openCreate = () => {
    setEditing(null);
    setMediaUploading(false);
    setMediaUploadProgress(0);
    form.resetFields();
    form.setFieldsValue({
      category,
      questionType: isObjective ? "single" : "short_answer",
      difficulty: 3,
      estimatedMinutes: isObjective ? 2 : 20,
      usageScenes: [isObjective ? "daily_practice" : "stage_test"],
      options: isObjective
        ? [{ label: "" }, { label: "" }, { label: "" }, { label: "" }]
        : [],
      subQuestions: isObjective
        ? []
        : [{ prompt: "", referenceAnswer: "", score: 10 }],
      analysis: "",
      stem: "",
      subject: "",
      columnName: "",
      knowledgePoint: "",
      subjectId: searchParams.get("subjectId") ?? undefined,
      chapterId: searchParams.get("chapterId") ?? undefined,
      pointId: searchParams.get("pointId") ?? undefined,
      subPointId: searchParams.get("subPointId") ?? undefined,
    });
    setDrawerOpen(true);
  };

  const openEdit = (item: AdminLearningQuestion) => {
    setEditing(item);
    setMediaUploading(false);
    setMediaUploadProgress(0);
    form.resetFields();
    form.setFieldsValue({
      ...item,
      options: item.options.map((option) => ({ label: option.label })),
      singleAnswer: ["true_false", "single"].includes(item.questionType)
        ? item.correctAnswers[0]
        : undefined,
      correctAnswers: ["multiple", "indeterminate"].includes(item.questionType)
        ? item.correctAnswers
        : undefined,
    });
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    form.resetFields();
    navigate({ pathname: location.pathname }, { replace: true });
  };

  const save = async (values: QuestionFormValues) => {
    const objective = values.category === "objective";
    const options = objective
      ? values.questionType === "true_false"
        ? [
            { key: "A", label: "正确" },
            { key: "B", label: "错误" },
          ]
        : values.options.map((option, index) => ({
            key: optionKey(index),
            label: option.label.trim(),
          }))
      : [];
    const correctAnswers = objective
      ? ["true_false", "single"].includes(values.questionType)
        ? values.singleAnswer
          ? [values.singleAnswer]
          : []
        : (values.correctAnswers ?? [])
      : [];
    const input: AdminLearningQuestionInput = {
      ...values,
      options,
      correctAnswers,
      subQuestions: objective ? [] : values.subQuestions,
      analysis: values.analysis ?? "",
    };
    delete (input as AdminLearningQuestionInput & { singleAnswer?: string })
      .singleAnswer;
    try {
      if (editing) await updateLearningQuestion(editing.id, input);
      else await createLearningQuestion(input);
      message.success(editing ? "题目已更新并转为草稿" : "题目已保存为草稿");
      closeDrawer();
      await load();
      await onSaved?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "题目保存失败");
    }
  };

  const publish = async (item: AdminLearningQuestion) => {
    try {
      await publishLearningQuestion(item.id);
      message.success("题目已发布，可供排题算法使用");
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "发布失败");
    }
  };
  const disable = (item: AdminLearningQuestion) =>
    Modal.confirm({
      title: "停用这道题？",
      content: "停用后，自动排题不会再选中这道题，已有作答记录仍会保留。",
      okText: "确认停用",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        try {
          await disableLearningQuestion(item.id, "学习中心管理员手动停用");
          message.success("题目已停用");
          await load();
        } catch (error) {
          message.error(error instanceof Error ? error.message : "停用失败");
          throw error;
        }
      },
    });
  const remove = async (item: AdminLearningQuestion) => {
    try {
      await deleteLearningQuestion(item.id);
      message.success("题目已删除");
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "删除失败");
    }
  };
  const copy = async (item: AdminLearningQuestion) => {
    try {
      await copyLearningQuestion(item.id);
      message.success("已复制为草稿");
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "复制失败");
    }
  };
  const uploadExplanationMedia = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const audio =
      file.type.startsWith("audio/") ||
      ["mp3", "m4a", "wav", "ogg"].includes(extension ?? "");
    const video =
      file.type.startsWith("video/") ||
      ["mp4", "webm", "mov"].includes(extension ?? "");
    if (!audio && !video) {
      message.error("仅支持 MP3、M4A、WAV、OGG、MP4、WebM 或 MOV 文件");
      return;
    }
    const maxBytes = audio ? 100 * 1024 * 1024 : 500 * 1024 * 1024;
    if (file.size > maxBytes) {
      message.error(
        `${audio ? "音频" : "视频"}文件不能超过 ${maxBytes / 1024 / 1024} MB`,
      );
      return;
    }
    setMediaUploading(true);
    setMediaUploadProgress(0);
    try {
      const result = await uploadLearningQuestionMedia(
        file,
        setMediaUploadProgress,
      );
      form.setFieldsValue({
        explanationMediaType: result.type,
        explanationMediaReference: result.reference,
      });
      await form.validateFields(["explanationMediaReference"]);
      message.success(`${result.filename} 上传完成`);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "讲解文件上传失败",
      );
    } finally {
      setMediaUploading(false);
    }
  };

  return (
    <>
      {!editorOnly && (
        <Space direction="vertical" size={20} style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {isObjective ? "客观题题库" : "主观题题库"}
              </Typography.Title>
              <Typography.Text type="secondary">
                当前题库拥有独立的科目、章节、考点和子考点目录。
              </Typography.Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={openCreate}
            >
              新建{isObjective ? "客观题" : "主观题"}
            </Button>
          </div>

          <Row gutter={12}>
            <Col xs={12} lg={4}>
              <Card size="small">
                <Statistic title="全部题目" value={stats.total} />
              </Card>
            </Col>
            <Col xs={12} lg={4}>
              <Card size="small">
                <Statistic title="客观题" value={stats.objective} />
              </Card>
            </Col>
            <Col xs={12} lg={4}>
              <Card size="small">
                <Statistic title="主观题" value={stats.subjective} />
              </Card>
            </Col>
            <Col xs={12} lg={4}>
              <Card size="small">
                <Statistic title="草稿" value={stats.draft} />
              </Card>
            </Col>
            <Col xs={12} lg={4}>
              <Card size="small">
                <Statistic title="已发布" value={stats.published} />
              </Card>
            </Col>
            <Col xs={12} lg={4}>
              <Card size="small">
                <Statistic title="已停用" value={stats.disabled} />
              </Card>
            </Col>
          </Row>

          <Card styles={{ body: { padding: 0 } }}>
            <div style={{ padding: "18px 20px 0" }}>
              <Typography.Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
              >
                当前题目归属于知识目录中的考点或子考点文件夹。
              </Typography.Text>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBlock: 16,
                }}
              >
                <Input.Search
                  allowClear
                  placeholder="搜索题干、考点或题号"
                  style={{ width: 300 }}
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onSearch={() => void load()}
                />
                <Select
                  allowClear
                  placeholder="全部题型"
                  style={{ width: 140 }}
                  value={questionType}
                  options={availableTypes}
                  onChange={setQuestionType}
                />
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  placeholder="全部科目"
                  style={{ width: 150 }}
                  value={subject}
                  options={subjects.map((item) => ({
                    value: item.name,
                    label: item.name,
                  }))}
                  onChange={setSubject}
                />
                <Select
                  allowClear
                  placeholder="全部状态"
                  style={{ width: 130 }}
                  value={status}
                  options={Object.entries(statusLabels).map(
                    ([value, label]) => ({ value, label }),
                  )}
                  onChange={setStatus}
                />
              </div>
            </div>
            <Table<AdminLearningQuestion>
              rowKey="id"
              loading={loading}
              dataSource={items}
              pagination={{
                pageSize: 15,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 道题`,
              }}
              scroll={{ x: 1080 }}
              columns={[
                {
                  title: "题目",
                  width: 360,
                  render: (_, item) => (
                    <Space direction="vertical" size={4}>
                      <Typography.Text
                        strong
                        ellipsis={{ tooltip: item.stem }}
                        style={{ maxWidth: 330 }}
                      >
                        {item.stem}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        copyable={{ text: item.id }}
                        style={{ fontSize: 12 }}
                      >
                        题号 {item.id}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "题型",
                  width: 130,
                  render: (_, item) => (
                    <Tag
                      color={item.category === "objective" ? "blue" : "purple"}
                    >
                      {learningQuestionTypeLabel(item.questionType)}
                    </Tag>
                  ),
                },
                {
                  title: "知识目录",
                  width: 260,
                  render: (_, item) => (
                    <Space direction="vertical" size={2}>
                      <Typography.Text>
                        {item.subject} / {item.columnName}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {item.knowledgePoint}
                        {item.subKnowledgePoint
                          ? ` / ${item.subKnowledgePoint}`
                          : ""}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "难度",
                  width: 100,
                  render: (_, item) => (
                    <Typography.Text
                      aria-label={`${item.difficulty} 星难度`}
                      style={{ color: "#d48806" }}
                    >
                      {"★".repeat(item.difficulty)}
                      <span style={{ color: "#d9d9d9" }}>
                        {"★".repeat(5 - item.difficulty)}
                      </span>
                    </Typography.Text>
                  ),
                },
                {
                  title: "预计用时",
                  width: 90,
                  render: (_, item) => `${item.estimatedMinutes} 分钟`,
                },
                {
                  title: "状态",
                  width: 90,
                  render: (_, item) => (
                    <Tag color={statusColors[item.status]}>
                      {statusLabels[item.status]}
                    </Tag>
                  ),
                },
                {
                  title: "操作",
                  fixed: "right",
                  width: 330,
                  render: (_, item) => (
                    <Space size={2}>
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(item)}
                      >
                        编辑
                      </Button>
                      <Button
                        type="link"
                        icon={<CopyOutlined />}
                        onClick={() => void copy(item)}
                      >
                        复制
                      </Button>
                      {item.status !== "published" && (
                        <Popconfirm
                          title="发布这道题？"
                          description="发布后会进入自动排题候选范围。"
                          onConfirm={() => void publish(item)}
                        >
                          <Button type="link" icon={<UploadOutlined />}>
                            发布
                          </Button>
                        </Popconfirm>
                      )}
                      {item.status === "published" && (
                        <Button
                          type="link"
                          danger
                          icon={<StopOutlined />}
                          onClick={() => disable(item)}
                        >
                          停用
                        </Button>
                      )}
                      {item.status !== "published" && (
                        <Popconfirm
                          title="永久删除这道题？"
                          onConfirm={() => void remove(item)}
                        >
                          <Button type="link" danger icon={<DeleteOutlined />}>
                            删除
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Space>
      )}

      <Drawer
        title={
          <Space direction="vertical" size={0}>
            <span>
              {editing
                ? `编辑${editing.category === "objective" ? "客观题" : "主观题"}`
                : `新建${isObjective ? "客观题" : "主观题"}`}
            </span>
            {contextPath && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                归属：{contextPath}
              </Typography.Text>
            )}
          </Space>
        }
        width="min(900px, calc(100vw - 24px))"
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={closeDrawer}>取消</Button>
            <Button
              type="primary"
              loading={mediaUploading}
              disabled={mediaUploading}
              onClick={() => form.submit()}
            >
              保存为草稿
            </Button>
          </Space>
        }
      >
        <Form<QuestionFormValues>
          form={form}
          layout="vertical"
          onFinish={save}
          requiredMark="optional"
        >
          <Form.Item name="category" hidden>
            <Input />
          </Form.Item>
          <Alert
            type="info"
            showIcon
            message={
              isObjective
                ? "客观题支持判断、单选、不定项和多选，选择题最多设置 A–G 七个选项。"
                : "主观题支持简答和案例分析，每道题可设置一个或多个设问。"
            }
            style={{ marginBottom: 20 }}
          />
          <Typography.Title level={5}>题目归类</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="questionType"
                label="题型"
                rules={[{ required: true }]}
              >
                <Select
                  options={availableTypes}
                  onChange={(value: AdminLearningQuestionType) => {
                    form.setFieldsValue({
                      correctAnswers: [],
                      singleAnswer: undefined,
                      ...(value === "true_false"
                        ? { options: [{ label: "正确" }, { label: "错误" }] }
                        : watchedType === "true_false"
                          ? {
                              options: [
                                { label: "" },
                                { label: "" },
                                { label: "" },
                                { label: "" },
                              ],
                            }
                          : {}),
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subjectId"
                label="科目"
                rules={[{ required: true, message: "请选择当前题库科目" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={subjects.map((item) => ({
                    value: item.id,
                    label: `${item.name}（${item.code}）`,
                  }))}
                  onChange={() =>
                    form.setFieldsValue({
                      chapterId: undefined,
                      pointId: undefined,
                      subPointId: undefined,
                    })
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chapterId"
                label="章节"
                rules={[{ required: true, message: "请选择章节" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedSubject}
                  options={chapters
                    .filter((item) => item.parentId === selectedSubject)
                    .map((item) => ({ value: item.id, label: item.name }))}
                  onChange={() =>
                    form.setFieldsValue({
                      pointId: undefined,
                      subPointId: undefined,
                    })
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pointId"
                label="考点"
                rules={[{ required: true, message: "请选择考点" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedChapter}
                  options={points
                    .filter((item) => item.parentId === selectedChapter)
                    .map((item) => ({ value: item.id, label: item.name }))}
                  onChange={() =>
                    form.setFieldsValue({ subPointId: undefined })
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subPointId"
                label={pointHasSubpoints ? "子考点（必选）" : "子考点"}
                rules={[
                  {
                    required: pointHasSubpoints,
                    message: "该考点存在子考点，请继续选择",
                  },
                ]}
                extra={
                  pointHasSubpoints
                    ? "该考点存在子考点，题目必须归入子考点"
                    : "当前考点没有子考点，可直接归入考点"
                }
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedPoint}
                  options={subpoints
                    .filter((item) => item.parentId === selectedPoint)
                    .map((item) => ({ value: item.id, label: item.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="difficulty"
                label="难度星级"
                rules={[{ required: true }]}
              >
                <Select
                  options={[1, 2, 3, 4, 5].map((value) => ({
                    value,
                    label: `${value} 星`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="estimatedMinutes"
                label="预计用时（分钟）"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={600} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={5}>题目内容</Typography.Title>
          {watchedType === "case_analysis" && (
            <Form.Item
              name="caseMaterial"
              label="案例材料"
              rules={[
                {
                  required: true,
                  min: 10,
                  message: "案例材料至少填写 10 个字",
                },
              ]}
            >
              <Input.TextArea
                rows={6}
                showCount
                maxLength={30000}
                placeholder="填写完整案情材料"
              />
            </Form.Item>
          )}
          <Form.Item
            name="stem"
            label={watchedType === "case_analysis" ? "作答要求" : "题干"}
            rules={[{ required: true, min: 2, message: "请填写题干" }]}
          >
            <Input.TextArea
              rows={4}
              showCount
              maxLength={20000}
              placeholder={
                isObjective
                  ? "填写清晰、完整的题干"
                  : "填写题目总要求；具体问题在下方设问中维护"
              }
            />
          </Form.Item>

          {isObjective ? (
            <>
              {watchedType !== "true_false" && (
                <Form.List
                  name="options"
                  rules={[
                    {
                      validator: async (_, value) => {
                        if (!value || value.length < 2 || value.length > 7)
                          throw new Error("请设置 2 到 7 个选项");
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }, { errors }) => (
                    <Space
                      direction="vertical"
                      size={10}
                      style={{ display: "flex" }}
                    >
                      {fields.map((field, index) => (
                        <Space
                          key={field.key}
                          align="start"
                          style={{ display: "flex" }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              display: "grid",
                              placeItems: "center",
                              background: "#f0f0ff",
                              color: "#4c4bea",
                              fontWeight: 600,
                            }}
                          >
                            {optionKey(index)}
                          </div>
                          <Form.Item
                            {...field}
                            name={[field.name, "label"]}
                            rules={[
                              {
                                required: true,
                                message: `请填写选项 ${optionKey(index)}`,
                              },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <Input.TextArea
                              autoSize={{ minRows: 1, maxRows: 4 }}
                              placeholder={`选项 ${optionKey(index)}`}
                            />
                          </Form.Item>
                          <Button
                            danger
                            type="text"
                            disabled={fields.length <= 2}
                            onClick={() => remove(field.name)}
                          >
                            删除
                          </Button>
                        </Space>
                      ))}
                      <Form.ErrorList errors={errors} />
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        disabled={fields.length >= 7}
                        onClick={() => add({ label: "" })}
                      >
                        添加选项（最多到 G）
                      </Button>
                    </Space>
                  )}
                </Form.List>
              )}
              <Form.Item
                name={
                  ["true_false", "single"].includes(watchedType ?? "")
                    ? "singleAnswer"
                    : "correctAnswers"
                }
                label="正确答案"
                rules={[{ required: true, message: "请选择正确答案" }]}
                style={{ marginTop: 20 }}
              >
                <Select
                  mode={
                    ["multiple", "indeterminate"].includes(watchedType ?? "")
                      ? "multiple"
                      : undefined
                  }
                  options={answerOptions}
                  placeholder="选择正确答案"
                />
              </Form.Item>
            </>
          ) : (
            <Form.List
              name="subQuestions"
              rules={[
                {
                  validator: async (_, value) => {
                    if (!value?.length) throw new Error("至少添加一个设问");
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <Space
                  direction="vertical"
                  size={14}
                  style={{ display: "flex" }}
                >
                  {fields.map((field, index) => (
                    <Card
                      key={field.key}
                      size="small"
                      title={`第 ${index + 1} 问`}
                      extra={
                        fields.length > 1 ? (
                          <Button
                            type="link"
                            danger
                            onClick={() => remove(field.name)}
                          >
                            删除此问
                          </Button>
                        ) : null
                      }
                    >
                      <Form.Item name={[field.name, "id"]} hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "prompt"]}
                        label="设问"
                        rules={[{ required: true, min: 2 }]}
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder="填写这一问的具体问题"
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "referenceAnswer"]}
                        label="参考答案"
                        rules={[{ required: true, min: 2 }]}
                      >
                        <Input.TextArea
                          rows={5}
                          placeholder="填写用于判分和讲解的参考答案"
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "analysis"]}
                        label="答题解析"
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder="说明答题思路、得分步骤或常见错误"
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "score"]}
                        label="分值"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={1} max={100} />
                      </Form.Item>
                    </Card>
                  ))}
                  <Form.ErrorList errors={errors} />
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    disabled={fields.length >= 20}
                    onClick={() =>
                      add({ prompt: "", referenceAnswer: "", score: 10 })
                    }
                  >
                    添加一问
                  </Button>
                </Space>
              )}
            </Form.List>
          )}

          <Form.Item
            name="analysis"
            label="做题解析（必填）"
            rules={[
              {
                required: true,
                min: 2,
                message: "请填写学生做完题后查看的解析",
              },
            ]}
            extra="学生提交答案后展示，建议写明结论、依据、解题步骤和常见错误。"
          >
            <Input.TextArea
              rows={5}
              showCount
              maxLength={30000}
              placeholder="填写学生做完题后看到的完整解析"
            />
          </Form.Item>
          <Typography.Title level={5}>讲解音视频（选填）</Typography.Title>
          <Alert
            type="info"
            showIcon
            message="上传一段音频或视频讲解；不上传不影响题目保存和发布。"
            description="音频支持 MP3、M4A、WAV、OGG，最大 100 MB；视频支持 MP4、WebM、MOV，最大 500 MB。"
            style={{ marginBottom: 16 }}
          />
          <Form.Item name="explanationMediaType" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="explanationMediaReference"
            hidden
            dependencies={["explanationMediaType"]}
            rules={[
              {
                validator: async (_, value) => {
                  if (
                    watchedExplanationMediaType &&
                    !String(value ?? "").trim()
                  )
                    throw new Error("讲解文件尚未上传完成");
                  if (
                    !watchedExplanationMediaType &&
                    String(value ?? "").trim()
                  )
                    throw new Error("讲解文件类型不正确，请重新上传");
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
          {!watchedExplanationMediaReference ? (
            <Upload.Dragger
              accept=".mp3,.m4a,.wav,.ogg,.mp4,.webm,.mov,audio/*,video/*"
              maxCount={1}
              multiple={false}
              showUploadList={false}
              disabled={mediaUploading}
              beforeUpload={(file) => {
                void uploadExplanationMedia(file);
                return Upload.LIST_IGNORE;
              }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽讲解文件到这里上传</p>
              <p className="ant-upload-hint">系统会自动识别音频或视频类型</p>
            </Upload.Dragger>
          ) : (
            <Card
              size="small"
              title={
                watchedExplanationMediaType === "audio"
                  ? "音频讲解已上传"
                  : "视频讲解已上传"
              }
              extra={
                <Button
                  type="link"
                  danger
                  disabled={mediaUploading}
                  onClick={() => {
                    form.setFieldsValue({
                      explanationMediaType: undefined,
                      explanationMediaReference: undefined,
                    });
                    setMediaUploadProgress(0);
                  }}
                >
                  移除并重新上传
                </Button>
              }
            >
              {watchedExplanationMediaType === "audio" ? (
                <audio
                  controls
                  preload="metadata"
                  src={watchedExplanationMediaReference}
                  style={{ width: "100%" }}
                >
                  当前浏览器不支持音频播放。
                </audio>
              ) : (
                <video
                  controls
                  preload="metadata"
                  src={watchedExplanationMediaReference}
                  style={{ width: "100%", maxHeight: 360, background: "#000" }}
                >
                  当前浏览器不支持视频播放。
                </video>
              )}
            </Card>
          )}
          {mediaUploading && (
            <Progress
              percent={mediaUploadProgress}
              status="active"
              style={{ marginTop: 12 }}
            />
          )}

          <Divider />
          <Typography.Title level={5}>排题与来源</Typography.Title>
          <Form.Item
            name="usageScenes"
            label="使用场景"
            rules={[{ required: true, message: "至少选择一个使用场景" }]}
          >
            <Select
              mode="multiple"
              options={usageSceneOptions}
              placeholder="选择这道题可以进入哪些排题场景"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="source" label="题目来源">
                <Input placeholder="例如：2025 年真题、自编题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sourceYear" label="来源年份">
                <InputNumber
                  min={1980}
                  max={2200}
                  style={{ width: "100%" }}
                  placeholder="例如：2025"
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={closeDrawer}>取消</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mediaUploading}
              disabled={mediaUploading}
            >
              保存为草稿
            </Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
