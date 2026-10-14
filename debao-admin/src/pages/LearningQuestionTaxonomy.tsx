import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  PlusOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tree,
  Typography,
  Upload,
} from "antd";
import type { DataNode } from "antd/es/tree";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  bulkLearningQuestions,
  copyLearningQuestion,
  createLearningQuestionTaxonomy,
  deleteLearningQuestionTaxonomy,
  getLearningQuestionBank,
  getLearningQuestionTaxonomy,
  getLearningQuestionVersions,
  importLearningQuestions,
  updateLearningQuestionTaxonomy,
  type AdminLearningQuestion,
  type AdminLearningQuestionCategory,
  type AdminLearningQuestionInput,
  type AdminLearningQuestionVersion,
  type AdminLearningTaxonomyNode,
  type AdminLearningTaxonomyNodeType,
} from "@/services/api";
import {
  downloadLearningQuestionExcelTemplate,
  parseLearningQuestionExcel,
  type LearningQuestionImportContext,
} from "@/utils/learningQuestionExcel";
import { learningQuestionTypeLabel } from "@/utils/learningQuestionMeta";
import LearningQuestionBank from "./LearningQuestionBank";
import "./LearningQuestionTaxonomy.css";

const labels: Record<AdminLearningTaxonomyNodeType, string> = {
  subject: "科目",
  chapter: "章节",
  point: "考点",
  subpoint: "子考点",
};
const childType: Record<
  AdminLearningTaxonomyNodeType,
  AdminLearningTaxonomyNodeType | undefined
> = {
  subject: "chapter",
  chapter: "point",
  point: "subpoint",
  subpoint: undefined,
};
const statusLabel = {
  draft: "草稿",
  published: "已发布",
  disabled: "已停用",
} as const;
const sceneLabel = {
  diagnostic: "能力诊断",
  daily_practice: "日常练习",
  stage_test: "阶段测验",
  wrong_review: "错题重练",
} as const;

export default function LearningQuestionTaxonomy() {
  const location = useLocation();
  const navigate = useNavigate();
  const category: AdminLearningQuestionCategory = location.pathname.includes(
    "/subjective/",
  )
    ? "subjective"
    : "objective";
  const [nodes, setNodes] = useState<AdminLearningTaxonomyNode[]>([]);
  const [questions, setQuestions] = useState<AdminLearningQuestion[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AdminLearningTaxonomyNode | null>(
    null,
  );
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [directoryKeyword, setDirectoryKeyword] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [showDisabled, setShowDisabled] = useState(false);
  const [questionKeyword, setQuestionKeyword] = useState("");
  const [questionStatus, setQuestionStatus] = useState<string>();
  const [questionType, setQuestionType] = useState<string>();
  const [difficulty, setDifficulty] = useState<number>();
  const [sourceYear, setSourceYear] = useState<number>();
  const [usageScene, setUsageScene] = useState<string>();
  const [preview, setPreview] = useState<AdminLearningQuestion>();
  const [versions, setVersions] = useState<AdminLearningQuestionVersion[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<AdminLearningQuestionInput[]>(
    [],
  );
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [movePointId, setMovePointId] = useState<string>();
  const [moveSubPointId, setMoveSubPointId] = useState<string>();
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [taxonomy, bank] = await Promise.all([
        getLearningQuestionTaxonomy({ category }),
        getLearningQuestionBank({ category }),
      ]);
      setNodes(taxonomy.items);
      setQuestions(bank.items);
      setSelectedRows([]);
      if (selectedId && !taxonomy.items.some((item) => item.id === selectedId))
        setSelectedId(undefined);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "题库目录加载失败",
      );
    } finally {
      setLoading(false);
    }
  }, [category, selectedId]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    setSelectedId(undefined);
    setSelectedRows([]);
  }, [category]);
  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );
  const children = useMemo(() => {
    const map = new Map<string | undefined, AdminLearningTaxonomyNode[]>();
    nodes.forEach((node) => {
      const list = map.get(node.parentId) ?? [];
      list.push(node);
      map.set(node.parentId, list);
    });
    return map;
  }, [nodes]);
  const pathNodes = useCallback(
    (node?: AdminLearningTaxonomyNode) => {
      const result: AdminLearningTaxonomyNode[] = [];
      let current = node;
      while (current) {
        result.unshift(current);
        current = current.parentId ? nodeMap.get(current.parentId) : undefined;
      }
      return result;
    },
    [nodeMap],
  );
  const pathText = useCallback(
    (node?: AdminLearningTaxonomyNode) =>
      pathNodes(node)
        .map((item) => item.name)
        .join(" / "),
    [pathNodes],
  );
  const questionPath = useCallback(
    (question: AdminLearningQuestion) =>
      [
        question.subject,
        question.columnName,
        question.knowledgePoint,
        question.subKnowledgePoint,
      ]
        .filter(Boolean)
        .join(" / "),
    [],
  );
  const questionCountByNode = useMemo(() => {
    const counts = new Map<string, number>();
    questions.forEach((question) =>
      [
        question.subjectId,
        question.chapterId,
        question.pointId,
        question.subPointId,
      ]
        .filter(Boolean)
        .forEach((id) => counts.set(id!, (counts.get(id!) ?? 0) + 1)),
    );
    return counts;
  }, [questions]);
  const visibleIds = useMemo(() => {
    const keyword = directoryKeyword.trim().toLocaleLowerCase();
    if (!keyword) return undefined;
    const keep = new Set<string>();
    nodes.forEach((node) => {
      if (!`${node.name} ${node.code}`.toLocaleLowerCase().includes(keyword))
        return;
      let current: AdminLearningTaxonomyNode | undefined = node;
      while (current) {
        keep.add(current.id);
        current = current.parentId ? nodeMap.get(current.parentId) : undefined;
      }
    });
    return keep;
  }, [directoryKeyword, nodeMap, nodes]);
  useEffect(() => {
    if (directoryKeyword.trim())
      setExpandedKeys(
        Array.from(visibleIds ?? []).filter(
          (id) => (children.get(id)?.length ?? 0) > 0,
        ),
      );
  }, [children, directoryKeyword, visibleIds]);
  const treeData = useMemo<DataNode[]>(() => {
    const build = (parentId?: string): DataNode[] =>
      (children.get(parentId) ?? [])
        .filter(
          (node) =>
            (showDisabled || node.status === "active") &&
            (!visibleIds || visibleIds.has(node.id)),
        )
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "zh-CN"),
        )
        .map((node) => ({
          key: node.id,
          title: (
            <Space size={6}>
              <FolderOpenOutlined
                style={{
                  color: node.status === "active" ? "#4c4bea" : "#bfbfbf",
                }}
              />
              <Typography.Text disabled={node.status !== "active"}>
                {node.name}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                className="learning-directory-type"
              >
                {labels[node.type]}
              </Typography.Text>
              {node.status !== "active" && <Tag>已停用</Tag>}
              <Tag bordered={false} color="blue">
                {questionCountByNode.get(node.id) ?? 0}题
              </Tag>
            </Space>
          ),
          children: build(node.id),
        }));
    return build();
  }, [children, questionCountByNode, showDisabled, visibleIds]);
  const selected = selectedId ? nodeMap.get(selectedId) : undefined;
  const selectedQuestionItems = useMemo(() => {
    if (!selected) return [];
    const descendant = new Set<string>([selected.id]);
    let changed = true;
    while (changed) {
      changed = false;
      nodes.forEach((node) => {
        if (
          node.parentId &&
          descendant.has(node.parentId) &&
          !descendant.has(node.id)
        ) {
          descendant.add(node.id);
          changed = true;
        }
      });
    }
    return questions.filter((question) =>
      [
        question.subjectId,
        question.chapterId,
        question.pointId,
        question.subPointId,
      ].some((id) => id && descendant.has(id)),
    );
  }, [nodes, questions, selected]);
  const filteredQuestions = useMemo(
    () =>
      selectedQuestionItems.filter((item) => {
        const keyword = questionKeyword.trim().toLocaleLowerCase();
        return (
          (!keyword ||
            `${item.stem} ${item.source ?? ""}`
              .toLocaleLowerCase()
              .includes(keyword)) &&
          (!questionStatus || item.status === questionStatus) &&
          (!questionType || item.questionType === questionType) &&
          (!difficulty || item.difficulty === difficulty) &&
          (!sourceYear || item.sourceYear === sourceYear) &&
          (!usageScene ||
            item.usageScenes.includes(usageScene as keyof typeof sceneLabel))
        );
      }),
    [
      difficulty,
      questionKeyword,
      questionStatus,
      questionType,
      selectedQuestionItems,
      sourceYear,
      usageScene,
    ],
  );
  const stats = useMemo(
    () => ({
      total: selectedQuestionItems.length,
      draft: selectedQuestionItems.filter((item) => item.status === "draft")
        .length,
      published: selectedQuestionItems.filter(
        (item) => item.status === "published",
      ).length,
      disabled: selectedQuestionItems.filter(
        (item) => item.status === "disabled",
      ).length,
    }),
    [selectedQuestionItems],
  );

  const openCreate = (forcedType?: AdminLearningTaxonomyNodeType) => {
    const type =
      forcedType ?? (selected ? childType[selected.type] : "subject");
    if (!type) return;
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ type, parentId: selected?.id, sortOrder: 10 });
    setDirectoryOpen(true);
  };
  const openEdit = (node: AdminLearningTaxonomyNode) => {
    setEditing(node);
    form.setFieldsValue(node);
    setDirectoryOpen(true);
  };
  const createQuestionUrl = (node: AdminLearningTaxonomyNode) => {
    const query = new URLSearchParams({ create: "1" });
    pathNodes(node).forEach((item) =>
      query.set(
        `${item.type === "subpoint" ? "subPoint" : item.type}Id`,
        item.id,
      ),
    );
    return `${location.pathname}?${query.toString()}`;
  };
  const saveDirectory = async (values: {
    name: string;
    code: string;
    sortOrder: number;
    type?: AdminLearningTaxonomyNodeType;
    parentId?: string;
  }) => {
    try {
      if (editing) await updateLearningQuestionTaxonomy(editing.id, values);
      else
        await createLearningQuestionTaxonomy({
          category,
          type: values.type!,
          ...(values.parentId ? { parentId: values.parentId } : {}),
          name: values.name,
          code: values.code,
          sortOrder: values.sortOrder,
        });
      message.success(editing ? "文件夹已更新" : "文件夹已创建");
      setDirectoryOpen(false);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "文件夹保存失败");
    }
  };
  const removeDirectory = async (node: AdminLearningTaxonomyNode) => {
    try {
      await deleteLearningQuestionTaxonomy(node.id);
      message.success("文件夹已删除");
      setSelectedId(undefined);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "删除失败");
    }
  };
  const runBulk = async (
    action: "publish" | "disable" | "delete",
    ids = selectedRows.map(String),
  ) => {
    if (!ids.length) return;
    try {
      await bulkLearningQuestions({
        action,
        ids,
        ...(action === "disable" ? { reason: "学习中心管理员批量停用" } : {}),
      });
      message.success(
        `${action === "publish" ? "发布" : action === "disable" ? "停用" : "删除"}成功，共处理 ${ids.length} 道题`,
      );
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "批量操作失败");
    }
  };
  const copyQuestion = async (item: AdminLearningQuestion) => {
    try {
      await copyLearningQuestion(item.id);
      message.success("已复制为一条草稿题目");
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "复制失败");
    }
  };
  const openVersions = async (item: AdminLearningQuestion) => {
    setVersionsOpen(true);
    setVersionsLoading(true);
    setVersions([]);
    try {
      const result = await getLearningQuestionVersions(item.id);
      setVersions(result.items);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "版本记录加载失败",
      );
    } finally {
      setVersionsLoading(false);
    }
  };
  const importContext = useMemo<
    LearningQuestionImportContext | undefined
  >(() => {
    if (!selected || !["point", "subpoint"].includes(selected.type))
      return undefined;
    const chain = pathNodes(selected);
    const subject = chain.find((item) => item.type === "subject");
    const chapter = chain.find((item) => item.type === "chapter");
    const point = chain.find((item) => item.type === "point");
    const subpoint = chain.find((item) => item.type === "subpoint");
    if (!subject || !chapter || !point) return undefined;
    return {
      category,
      subject: subject.name,
      subjectId: subject.id,
      columnName: chapter.name,
      chapterId: chapter.id,
      knowledgePoint: point.name,
      pointId: point.id,
      ...(subpoint
        ? { subKnowledgePoint: subpoint.name, subPointId: subpoint.id }
        : {}),
    };
  }, [category, pathNodes, selected]);
  const readImport = async (file: File) => {
    if (!importContext) return false;
    try {
      const rows = await parseLearningQuestionExcel(file, importContext);
      setImportRows(rows);
      setImportFileName(file.name);
      message.success(`Excel 校验通过，共 ${rows.length} 道题`);
    } catch (error) {
      setImportRows([]);
      message.error(error instanceof Error ? error.message : "Excel 解析失败");
    }
    return false;
  };
  const submitImport = async () => {
    if (!importRows.length) return;
    setImporting(true);
    try {
      const result = await importLearningQuestions(importRows);
      message.success(`成功导入 ${result.imported} 道草稿题目`);
      setImportOpen(false);
      setImportRows([]);
      setImportFileName("");
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "导入失败");
    } finally {
      setImporting(false);
    }
  };
  const moveQuestions = async () => {
    const point = movePointId ? nodeMap.get(movePointId) : undefined;
    if (!point) {
      message.warning("请选择目标考点");
      return;
    }
    const chain = pathNodes(point);
    const subject = chain.find((item) => item.type === "subject");
    const chapter = chain.find((item) => item.type === "chapter");
    if (!subject || !chapter) return;
    try {
      await bulkLearningQuestions({
        action: "move",
        ids: selectedRows.map(String),
        target: {
          subjectId: subject.id,
          chapterId: chapter.id,
          pointId: point.id,
          subPointId: moveSubPointId ?? "",
        },
      });
      message.success("题目已移动并转为草稿");
      setMoveOpen(false);
      setMovePointId(undefined);
      setMoveSubPointId(undefined);
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "移动失败");
    }
  };
  const reorderTree = async (info: {
    dragNode: DataNode;
    node: DataNode;
    dropToGap: boolean;
    dropPosition: number;
  }) => {
    const dragged = nodeMap.get(String(info.dragNode.key));
    const target = nodeMap.get(String(info.node.key));
    if (
      !dragged ||
      !target ||
      dragged.parentId !== target.parentId ||
      !info.dropToGap
    ) {
      message.warning("只能在同一级文件夹内拖拽排序");
      return;
    }
    const siblings = [...(children.get(dragged.parentId) ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((item) => item.id !== dragged.id);
    const targetIndex = siblings.findIndex((item) => item.id === target.id);
    siblings.splice(
      Math.max(0, targetIndex + (info.dropPosition > 0 ? 1 : 0)),
      0,
      dragged,
    );
    try {
      await Promise.all(
        siblings.map((item, index) =>
          updateLearningQuestionTaxonomy(item.id, {
            sortOrder: (index + 1) * 10,
          }),
        ),
      );
      message.success("文件夹顺序已更新");
      await load();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "排序失败");
    }
  };

  const columns = [
    {
      title: "题目",
      dataIndex: "stem",
      ellipsis: true,
      render: (value: string, item: AdminLearningQuestion) => (
        <div>
          <Typography.Text>{value}</Typography.Text>
          <div>
            <Typography.Text
              type="secondary"
              className="learning-question-path"
            >
              {questionPath(item)}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "题型",
      dataIndex: "questionType",
      width: 120,
      render: (value: AdminLearningQuestion["questionType"]) => (
        <Tag>{learningQuestionTypeLabel(value)}</Tag>
      ),
    },
    {
      title: "难度",
      dataIndex: "difficulty",
      width: 90,
      render: (value: number) => `${"★".repeat(value)}${"☆".repeat(5 - value)}`,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (value: AdminLearningQuestion["status"]) => (
        <Tag
          color={
            value === "published"
              ? "green"
              : value === "disabled"
                ? "default"
                : "gold"
          }
        >
          {statusLabel[value]}
        </Tag>
      ),
    },
    {
      title: "操作",
      width: 110,
      fixed: "right" as const,
      render: (_: unknown, item: AdminLearningQuestion) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                icon: <EditOutlined />,
                label: "编辑题目",
                onClick: () =>
                  navigate(
                    `${location.pathname}?questionId=${encodeURIComponent(item.id)}`,
                  ),
              },
              {
                key: "preview",
                icon: <EyeOutlined />,
                label: "学生端预览",
                onClick: () => setPreview(item),
              },
              {
                key: "copy",
                icon: <CopyOutlined />,
                label: "复制为草稿",
                onClick: () => void copyQuestion(item),
              },
              {
                key: "versions",
                icon: <HistoryOutlined />,
                label: "版本记录",
                onClick: () => void openVersions(item),
              },
              { type: "divider" },
              ...(item.status !== "published"
                ? [
                    {
                      key: "publish",
                      icon: <CheckCircleOutlined />,
                      label: "发布",
                      onClick: () => void runBulk("publish", [item.id]),
                    },
                  ]
                : []),
              ...(item.status !== "disabled"
                ? [
                    {
                      key: "disable",
                      icon: <StopOutlined />,
                      label: "停用",
                      onClick: () => void runBulk("disable", [item.id]),
                    },
                  ]
                : []),
              ...(item.status !== "published"
                ? [
                    {
                      key: "delete",
                      danger: true,
                      icon: <DeleteOutlined />,
                      label: "删除",
                      onClick: () =>
                        Modal.confirm({
                          title: "删除这道题？",
                          content: "删除后无法恢复。",
                          okButtonProps: { danger: true },
                          onOk: () => runBulk("delete", [item.id]),
                        }),
                    },
                  ]
                : []),
            ],
          }}
        >
          <Button type="text" icon={<EllipsisOutlined />}>
            更多
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={20} style={{ display: "flex" }}>
      <div className="learning-question-page-header">
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {category === "objective" ? "客观题" : "主观题"} · 知识目录
          </Typography.Title>
          <Typography.Text type="secondary">
            按科目、章节、考点逐级整理；题目从考点或子考点文件夹内创建和维护。
          </Typography.Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openCreate("subject")}
        >
          新建科目文件夹
        </Button>
      </div>
      <div className="learning-question-grid">
        <Card
          size="small"
          className="learning-question-tree-card"
          title="知识目录文件夹"
          extra={
            selected &&
            selected.status === "active" &&
            childType[selected.type] ? (
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => openCreate()}
              >{`新建${labels[childType[selected.type]!]}`}</Button>
            ) : null
          }
        >
          <Space direction="vertical" size={10} style={{ display: "flex" }}>
            <Input
              allowClear
              value={directoryKeyword}
              onChange={(event) => setDirectoryKeyword(event.target.value)}
              placeholder="搜索科目、章节、考点"
            />
            <Space wrap>
              <Button
                size="small"
                onClick={() =>
                  setExpandedKeys(
                    nodes
                      .filter(
                        (node) =>
                          (showDisabled || node.status === "active") &&
                          (children.get(node.id)?.length ?? 0) > 0,
                      )
                      .map((node) => node.id),
                  )
                }
              >
                展开全部
              </Button>
              <Button size="small" onClick={() => setExpandedKeys([])}>
                收起全部
              </Button>
              <Checkbox
                checked={showDisabled}
                onChange={(event) => setShowDisabled(event.target.checked)}
              >
                显示已停用
              </Checkbox>
            </Space>
            <Tree
              blockNode
              showLine
              draggable
              treeData={treeData}
              expandedKeys={expandedKeys}
              selectedKeys={selectedId ? [selectedId] : []}
              onExpand={(keys) => setExpandedKeys(keys.map(String))}
              onSelect={(keys) => setSelectedId(String(keys[0] ?? ""))}
              onDrop={(info) =>
                void reorderTree(
                  info as unknown as Parameters<typeof reorderTree>[0],
                )
              }
            />
          </Space>
        </Card>
        <Card
          size="small"
          className="learning-question-content-card"
          title={selected ? `${selected.name} · 题目` : "请选择目录"}
          extra={
            selected ? (
              <Space wrap>
                {selected.status === "active" &&
                  (selected.type === "point" ||
                    selected.type === "subpoint") && (
                    <>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(createQuestionUrl(selected))}
                      >
                        新建题目
                      </Button>
                      <Button
                        size="small"
                        icon={<FileExcelOutlined />}
                        onClick={() => {
                          setImportOpen(true);
                          setImportRows([]);
                          setImportFileName("");
                        }}
                      >
                        Excel 导入
                      </Button>
                    </>
                  )}
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => openEdit(selected)}
                >
                  编辑文件夹
                </Button>
                {selected.status === "active" ? (
                  <Popconfirm
                    title="停用这个文件夹？"
                    description={`该目录及下级共有 ${selectedQuestionItems.length} 道题。停用后目录默认隐藏，历史题目仍保留。`}
                    onConfirm={() =>
                      void updateLearningQuestionTaxonomy(selected.id, {
                        status: "disabled",
                      })
                        .then(async () => {
                          setShowDisabled(true);
                          await load();
                        })
                        .catch((error) =>
                          message.error(
                            error instanceof Error ? error.message : "操作失败",
                          ),
                        )
                    }
                  >
                    <Button type="link" icon={<StopOutlined />}>
                      停用
                    </Button>
                  </Popconfirm>
                ) : (
                  <Button
                    type="link"
                    icon={<CheckCircleOutlined />}
                    onClick={() =>
                      void updateLearningQuestionTaxonomy(selected.id, {
                        status: "active",
                      })
                        .then(load)
                        .catch((error) =>
                          message.error(
                            error instanceof Error ? error.message : "操作失败",
                          ),
                        )
                    }
                  >
                    启用
                  </Button>
                )}
                <Popconfirm
                  title="删除这个文件夹？"
                  description="只能删除没有下级目录且没有题目引用的文件夹。"
                  onConfirm={() => void removeDirectory(selected)}
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ) : null
          }
        >
          {!selected ? (
            <Empty description="请从左侧选择科目、章节、考点或子考点" />
          ) : (
            <Space direction="vertical" size={14} style={{ display: "flex" }}>
              <Breadcrumb
                items={pathNodes(selected).map((item) => ({
                  title: item.name,
                }))}
              />
              <Space wrap>
                <Tag color="blue">全部 {stats.total}</Tag>
                <Tag color="gold">草稿 {stats.draft}</Tag>
                <Tag color="green">已发布 {stats.published}</Tag>
                <Tag>已停用 {stats.disabled}</Tag>
              </Space>
              <Space wrap className="learning-question-filters">
                <Input.Search
                  allowClear
                  placeholder="搜索题干或来源"
                  value={questionKeyword}
                  onChange={(event) => setQuestionKeyword(event.target.value)}
                  style={{ width: 220 }}
                />
                <Select
                  allowClear
                  placeholder="全部题型"
                  value={questionType}
                  onChange={setQuestionType}
                  style={{ width: 130 }}
                  options={(category === "objective"
                    ? ["true_false", "single", "multiple", "indeterminate"]
                    : ["short_answer", "case_analysis"]
                  ).map((value) => ({
                    value,
                    label: learningQuestionTypeLabel(
                      value as AdminLearningQuestion["questionType"],
                    ),
                  }))}
                />
                <Select
                  allowClear
                  placeholder="全部状态"
                  value={questionStatus}
                  onChange={setQuestionStatus}
                  style={{ width: 120 }}
                  options={Object.entries(statusLabel).map(
                    ([value, label]) => ({ value, label }),
                  )}
                />
                <Select
                  allowClear
                  placeholder="全部难度"
                  value={difficulty}
                  onChange={setDifficulty}
                  style={{ width: 120 }}
                  options={[1, 2, 3, 4, 5].map((value) => ({
                    value,
                    label: `${value} 星`,
                  }))}
                />
                <Select
                  allowClear
                  placeholder="来源年份"
                  value={sourceYear}
                  onChange={setSourceYear}
                  style={{ width: 120 }}
                  options={[
                    ...new Set(
                      selectedQuestionItems
                        .map((item) => item.sourceYear)
                        .filter((value): value is number => Boolean(value)),
                    ),
                  ]
                    .sort((a, b) => b - a)
                    .map((value) => ({ value, label: `${value} 年` }))}
                />
                <Select
                  allowClear
                  placeholder="使用场景"
                  value={usageScene}
                  onChange={setUsageScene}
                  style={{ width: 130 }}
                  options={Object.entries(sceneLabel).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </Space>
              {selectedRows.length > 0 && (
                <Alert
                  type="info"
                  showIcon
                  message={
                    <Space wrap>
                      已选 {selectedRows.length} 道题
                      <Button
                        size="small"
                        onClick={() => void runBulk("publish")}
                      >
                        批量发布
                      </Button>
                      <Button
                        size="small"
                        onClick={() => void runBulk("disable")}
                      >
                        批量停用
                      </Button>
                      <Button size="small" onClick={() => setMoveOpen(true)}>
                        移动目录
                      </Button>
                      <Popconfirm
                        title="删除选中的草稿或停用题？"
                        onConfirm={() => void runBulk("delete")}
                      >
                        <Button danger size="small">
                          批量删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  }
                />
              )}
              <Table<AdminLearningQuestion>
                rowKey="id"
                loading={loading}
                dataSource={filteredQuestions}
                rowSelection={{
                  selectedRowKeys: selectedRows,
                  onChange: setSelectedRows,
                }}
                locale={{ emptyText: "当前目录或筛选条件下没有题目" }}
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `共 ${total} 道题`,
                }}
                scroll={{ x: 900 }}
                columns={columns}
              />
            </Space>
          )}
        </Card>
      </div>
      <Modal
        title={`${editing ? "编辑" : "新建"}文件夹`}
        open={directoryOpen}
        onCancel={() => setDirectoryOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={saveDirectory}>
          {editing && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={`重命名会同步更新目录展示；该目录及下级当前共有 ${selectedQuestionItems.length} 道题，题目关联不会丢失。`}
            />
          )}
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="parentId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="文件夹名称"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input maxLength={160} />
          </Form.Item>
          <Form.Item
            name="code"
            label="编码"
            rules={[
              {
                required: true,
                pattern: /^[a-z][a-z0-9_-]{1,99}$/,
                message: "使用小写字母开头的英文编码",
              },
            ]}
          >
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item
            name="sortOrder"
            label="排序值"
            extra="也可以在目录树中拖动同级文件夹调整顺序"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={99999} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Excel 批量导入题目"
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onOk={() => void submitImport()}
        okText={`导入 ${importRows.length || ""} 道题`}
        okButtonProps={{ disabled: !importRows.length }}
        confirmLoading={importing}
        destroyOnClose
      >
        <Space direction="vertical" size={16} style={{ display: "flex" }}>
          <Alert
            type="info"
            showIcon
            message={`导入目录：${pathText(selected)}`}
            description="下载模板后填写。导入前会逐行校验，成功后题目统一保存为草稿。单次最多 500 道。"
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={() => void downloadLearningQuestionExcelTemplate(category)}
          >
            下载 Excel 模板
          </Button>
          <Upload.Dragger
            accept=".xlsx"
            maxCount={1}
            beforeUpload={(file) => {
              void readImport(file);
              return false;
            }}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined />
            </p>
            <p>点击或拖入填写好的 .xlsx 文件</p>
            <Typography.Text type="secondary">最大 10 MB</Typography.Text>
          </Upload.Dragger>
          {importRows.length > 0 && (
            <Alert
              type="success"
              showIcon
              message={`${importFileName} 校验通过`}
              description={`共 ${importRows.length} 道题：${importRows
                .slice(0, 5)
                .map((item) => learningQuestionTypeLabel(item.questionType))
                .join("、")}${importRows.length > 5 ? "……" : ""}`}
            />
          )}
        </Space>
      </Modal>
      <Modal
        title="移动题目到其他考点"
        open={moveOpen}
        onCancel={() => setMoveOpen(false)}
        onOk={() => void moveQuestions()}
        okText="确认移动"
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`将移动 ${selectedRows.length} 道题`}
          description="移动后的题目会转为草稿，需重新检查后发布。"
        />
        <Space direction="vertical" style={{ display: "flex" }}>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="选择目标考点"
            value={movePointId}
            onChange={(value) => {
              setMovePointId(value);
              setMoveSubPointId(undefined);
            }}
            options={nodes
              .filter(
                (item) => item.type === "point" && item.status === "active",
              )
              .map((item) => ({ value: item.id, label: pathText(item) }))}
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="选择子考点（没有可不选）"
            value={moveSubPointId}
            onChange={setMoveSubPointId}
            disabled={!movePointId}
            options={nodes
              .filter(
                (item) =>
                  item.type === "subpoint" &&
                  item.parentId === movePointId &&
                  item.status === "active",
              )
              .map((item) => ({ value: item.id, label: item.name }))}
          />
        </Space>
      </Modal>
      <Modal
        title={`${preview ? learningQuestionTypeLabel(preview.questionType) : "题目"} · 学生端预览`}
        open={Boolean(preview)}
        onCancel={() => setPreview(undefined)}
        footer={null}
        width={720}
      >
        {preview && (
          <Space direction="vertical" size={16} style={{ display: "flex" }}>
            <Descriptions
              size="small"
              column={2}
              items={[
                {
                  key: "path",
                  label: "知识目录",
                  children: questionPath(preview),
                  span: 2,
                },
                {
                  key: "difficulty",
                  label: "难度",
                  children: `${preview.difficulty} 星`,
                },
                {
                  key: "time",
                  label: "预计用时",
                  children: `${preview.estimatedMinutes} 分钟`,
                },
                {
                  key: "scene",
                  label: "使用场景",
                  children: preview.usageScenes
                    .map((item) => sceneLabel[item])
                    .join("、"),
                  span: 2,
                },
              ]}
            />
            <Typography.Title level={5}>{preview.stem}</Typography.Title>
            {preview.caseMaterial && (
              <Card size="small" title="案例材料">
                {preview.caseMaterial}
              </Card>
            )}
            {preview.options.length > 0 && (
              <Space direction="vertical">
                {preview.options.map((option) => (
                  <Typography.Text key={option.key}>
                    {option.key}. {option.label}
                  </Typography.Text>
                ))}
              </Space>
            )}
            {preview.subQuestions.map((item, index) => (
              <Card
                size="small"
                key={item.id ?? index}
                title={`第 ${index + 1} 问 · ${item.score} 分`}
              >
                <p>{item.prompt}</p>
                <Typography.Text type="secondary">
                  参考答案：{item.referenceAnswer}
                </Typography.Text>
              </Card>
            ))}
            <Alert
              type="success"
              showIcon
              message={`参考答案：${preview.correctAnswers.join("、") || "见各小问参考答案"}`}
              description={preview.analysis || "暂无整题解析"}
            />
            {preview.explanationMediaReference && (
              <Card
                size="small"
                title={
                  preview.explanationMediaType === "audio"
                    ? "音频讲解"
                    : "视频讲解"
                }
              >
                {preview.explanationMediaType === "audio" ? (
                  <audio
                    controls
                    preload="metadata"
                    src={preview.explanationMediaReference}
                    style={{ width: "100%" }}
                  />
                ) : (
                  <video
                    controls
                    preload="metadata"
                    src={preview.explanationMediaReference}
                    style={{ width: "100%", maxHeight: 420 }}
                  />
                )}
                <Typography.Paragraph
                  type="secondary"
                  copyable={{ text: preview.explanationMediaReference }}
                  ellipsis
                  style={{ marginTop: 8, marginBottom: 0 }}
                >
                  {preview.explanationMediaReference}
                </Typography.Paragraph>
              </Card>
            )}
          </Space>
        )}
      </Modal>
      <Modal
        title="题目版本记录"
        open={versionsOpen}
        onCancel={() => setVersionsOpen(false)}
        footer={null}
        width={760}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="每次编辑都会先保存编辑前的完整内容；当前版本始终排在最前。"
        />
        <Table<AdminLearningQuestionVersion>
          rowKey="id"
          loading={versionsLoading}
          dataSource={versions}
          pagination={false}
          columns={[
            {
              title: "版本",
              dataIndex: "version",
              width: 100,
              render: (value, item) => (
                <Space>
                  <Typography.Text strong>v{value}</Typography.Text>
                  {item.current && <Tag color="blue">当前</Tag>}
                </Space>
              ),
            },
            {
              title: "题干",
              dataIndex: ["snapshot", "stem"],
              ellipsis: true,
            },
            {
              title: "状态",
              width: 90,
              render: (_, item) => (
                <Tag>{statusLabel[item.snapshot.status]}</Tag>
              ),
            },
            {
              title: "保存时间",
              dataIndex: "createdAt",
              width: 180,
              render: (value: string) => new Date(value).toLocaleString("zh-CN"),
            },
            {
              title: "查看",
              width: 80,
              render: (_, item) => (
                <Button type="link" onClick={() => setPreview(item.snapshot)}>
                  预览
                </Button>
              ),
            },
          ]}
        />
      </Modal>
      <LearningQuestionBank
        editorOnly
        onSaved={load}
        contextPath={pathText(selected)}
      />
    </Space>
  );
}
