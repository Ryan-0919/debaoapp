import type {
  AdminLearningQuestionCategory,
  AdminLearningQuestionInput,
  AdminLearningQuestionType,
  AdminLearningQuestionUsageScene,
} from "@/services/api";

export type LearningQuestionImportContext = Pick<
  AdminLearningQuestionInput,
  | "category"
  | "subject"
  | "subjectId"
  | "columnName"
  | "chapterId"
  | "knowledgePoint"
  | "pointId"
  | "subKnowledgePoint"
  | "subPointId"
>;

const objectiveHeaders = [
  "题型",
  "题干",
  "选项A",
  "选项B",
  "选项C",
  "选项D",
  "选项E",
  "选项F",
  "选项G",
  "正确答案",
  "答案解析",
  "难度",
  "预计用时",
  "题目来源",
  "来源年份",
  "使用场景",
];
const subjectiveHeaders = [
  "题型",
  "题干",
  "案例材料",
  "设问1",
  "参考答案1",
  "解析1",
  "分值1",
  "设问2",
  "参考答案2",
  "解析2",
  "分值2",
  "设问3",
  "参考答案3",
  "解析3",
  "分值3",
  "设问4",
  "参考答案4",
  "解析4",
  "分值4",
  "设问5",
  "参考答案5",
  "解析5",
  "分值5",
  "整题解析",
  "难度",
  "预计用时",
  "题目来源",
  "来源年份",
  "使用场景",
];

const typeAliases: Record<string, AdminLearningQuestionType> = {
  判断题: "true_false",
  判断: "true_false",
  true_false: "true_false",
  单选题: "single",
  单选: "single",
  single: "single",
  多选题: "multiple",
  多选: "multiple",
  multiple: "multiple",
  不定项选择题: "indeterminate",
  不定项: "indeterminate",
  indeterminate: "indeterminate",
  简答题: "short_answer",
  简答: "short_answer",
  short_answer: "short_answer",
  案例分析题: "case_analysis",
  案例题: "case_analysis",
  case_analysis: "case_analysis",
};

const sceneAliases: Record<string, AdminLearningQuestionUsageScene> = {
  能力诊断: "diagnostic",
  diagnostic: "diagnostic",
  日常练习: "daily_practice",
  daily_practice: "daily_practice",
  阶段测验: "stage_test",
  stage_test: "stage_test",
  错题重练: "wrong_review",
  wrong_review: "wrong_review",
};

function text(value: unknown) {
  if (value === undefined || value === null) return "";
  if (typeof value === "object" && "text" in value)
    return String((value as { text?: unknown }).text ?? "").trim();
  return String(value).trim();
}

function split(value: unknown) {
  return text(value)
    .split(/[,，、;；/|\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function positiveInteger(
  value: unknown,
  fallback: number,
  field: string,
  min: number,
  max: number,
) {
  if (!text(value)) return fallback;
  const result = Number(text(value));
  if (!Number.isInteger(result) || result < min || result > max)
    throw new Error(`${field}必须是 ${min} 到 ${max} 的整数`);
  return result;
}

function parseScenes(value: unknown, category: AdminLearningQuestionCategory) {
  const raw = split(value);
  if (!raw.length)
    return [
      category === "objective" ? "daily_practice" : "stage_test",
    ] as AdminLearningQuestionUsageScene[];
  const scenes = [...new Set(raw.map((item) => sceneAliases[item]))];
  if (scenes.some((item) => !item))
    throw new Error("使用场景只能填写能力诊断、日常练习、阶段测验或错题重练");
  return scenes as AdminLearningQuestionUsageScene[];
}

function triggerDownload(content: BlobPart, filename: string) {
  const url = URL.createObjectURL(
    new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function downloadLearningQuestionExcelTemplate(
  category: AdminLearningQuestionCategory,
) {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  workbook.creator = "得恩私教管理端";
  const sheet = workbook.addWorksheet("题目导入", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const headers =
    category === "objective" ? objectiveHeaders : subjectiveHeaders;
  sheet.columns = headers.map((header) => ({
    header,
    key: header,
    width:
      header.includes("题干") ||
      header.includes("答案") ||
      header.includes("材料")
        ? 28
        : 14,
  }));
  const sample =
    category === "objective"
      ? {
          题型: "单选题",
          题干: "示例题干，请替换后再导入",
          选项A: "选项内容 A",
          选项B: "选项内容 B",
          选项C: "选项内容 C",
          选项D: "选项内容 D",
          正确答案: "A",
          答案解析: "填写答案依据与解析",
          难度: 3,
          预计用时: 2,
          题目来源: "自编题",
          来源年份: new Date().getFullYear(),
          使用场景: "日常练习",
        }
      : {
          题型: "简答题",
          题干: "请回答下列问题",
          设问1: "示例设问，请替换后再导入",
          参考答案1: "填写参考答案",
          解析1: "填写答题思路",
          分值1: 10,
          整题解析: "填写学生提交后查看的完整解析",
          难度: 3,
          预计用时: 20,
          题目来源: "自编题",
          来源年份: new Date().getFullYear(),
          使用场景: "阶段测验",
        };
  sheet.addRow(sample);
  const headerRow = sheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4C4BEA" },
    };
    cell.alignment = { vertical: "middle" };
  });
  sheet.autoFilter = { from: "A1", to: { row: 1, column: headers.length } };
  const guide = workbook.addWorksheet("填写说明");
  guide.columns = [
    { header: "项目", key: "item", width: 22 },
    { header: "说明", key: "description", width: 90 },
  ];
  guide.addRows([
    {
      item: "归属目录",
      description:
        "不用在表格里填写科目、章节和考点，导入后统一归入后台当前选中的考点或子考点。",
    },
    {
      item: "题型",
      description:
        category === "objective"
          ? "判断题、单选题、多选题、不定项选择题。"
          : "简答题、案例分析题。",
    },
    {
      item: "正确答案",
      description: "填写选项字母。多选或不定项用英文逗号分隔，例如 A,C。",
    },
    {
      item: "使用场景",
      description:
        "可填写能力诊断、日常练习、阶段测验、错题重练；多个值用逗号分隔。",
    },
    {
      item: "做题解析",
      description: "客观题填写“答案解析”，主观题填写“整题解析”，两者均为必填。",
    },
    {
      item: "讲解音视频",
      description:
        "Excel 不携带音视频文件。导入为草稿后，请在题目编辑页上传可选的讲解音频或视频。",
    },
    {
      item: "导入状态",
      description: "所有导入题目均保存为草稿，需要审核后再发布。",
    },
  ]);
  guide.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF303247" },
    };
  });
  triggerDownload(
    (await workbook.xlsx.writeBuffer()) as BlobPart,
    `${category === "objective" ? "客观题" : "主观题"}Excel导入模板.xlsx`,
  );
}

export async function parseLearningQuestionExcel(
  file: File,
  context: LearningQuestionImportContext,
): Promise<AdminLearningQuestionInput[]> {
  if (!file.name.toLowerCase().endsWith(".xlsx"))
    throw new Error("请上传 .xlsx 格式的 Excel 文件");
  if (file.size > 10 * 1024 * 1024) throw new Error("Excel 文件不能超过 10 MB");
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("Excel 中没有工作表");
  const headerMap = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, column) => {
    const header = text(cell.value);
    if (header) headerMap.set(header, column);
  });
  const required =
    context.category === "objective"
      ? ["题型", "题干", "选项A", "选项B", "正确答案", "答案解析"]
      : ["题型", "题干", "设问1", "参考答案1", "分值1", "整题解析"];
  const missing = required.filter((header) => !headerMap.has(header));
  if (missing.length) throw new Error(`缺少必填列：${missing.join("、")}`);
  const rows: AdminLearningQuestionInput[] = [];
  const read = (row: import("exceljs").Row, header: string) =>
    text(row.getCell(headerMap.get(header) ?? 0).value);
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const stem = read(row, "题干");
    if (!stem && !row.hasValues) return;
    try {
      const questionType = typeAliases[read(row, "题型").replace(/\s+/g, "")];
      if (!questionType) throw new Error("题型名称不正确");
      const objective = context.category === "objective";
      if (
        (objective &&
          !["true_false", "single", "multiple", "indeterminate"].includes(
            questionType,
          )) ||
        (!objective &&
          !["short_answer", "case_analysis"].includes(questionType))
      )
        throw new Error("题型与当前主客观题库不匹配");
      const difficulty = positiveInteger(read(row, "难度"), 3, "难度", 1, 5);
      const estimatedMinutes = positiveInteger(
        read(row, "预计用时"),
        objective ? 2 : 20,
        "预计用时",
        1,
        600,
      );
      const yearText = read(row, "来源年份");
      const sourceYear = yearText
        ? positiveInteger(yearText, 0, "来源年份", 1980, 2200)
        : undefined;
      const common = {
        ...context,
        questionType,
        difficulty,
        stem,
        estimatedMinutes,
        ...(read(row, "题目来源") ? { source: read(row, "题目来源") } : {}),
        ...(sourceYear ? { sourceYear } : {}),
        usageScenes: parseScenes(read(row, "使用场景"), context.category),
      };
      if (objective) {
        const options =
          questionType === "true_false"
            ? [
                { key: "A", label: "正确" },
                { key: "B", label: "错误" },
              ]
            : ["A", "B", "C", "D", "E", "F", "G"]
                .map((key) => ({ key, label: read(row, `选项${key}`) }))
                .filter((option) => option.label);
        const correctAnswers = [
          ...new Set(
            split(read(row, "正确答案")).map((answer) => answer.toUpperCase()),
          ),
        ];
        if (
          options.length < 2 ||
          correctAnswers.some(
            (answer) => !options.some((option) => option.key === answer),
          )
        )
          throw new Error("选项或正确答案格式不正确");
        if (
          ["true_false", "single"].includes(questionType) &&
          correctAnswers.length !== 1
        )
          throw new Error("判断题或单选题只能有一个正确答案");
        if (questionType === "multiple" && correctAnswers.length < 2)
          throw new Error("多选题至少需要两个正确答案");
        const analysis = read(row, "答案解析");
        if (analysis.length < 2) throw new Error("答案解析不能为空");
        rows.push({
          ...common,
          options,
          correctAnswers,
          analysis,
          subQuestions: [],
        });
      } else {
        const subQuestions = Array.from({ length: 5 }, (_, index) => index + 1)
          .map((index) => ({
            prompt: read(row, `设问${index}`),
            referenceAnswer: read(row, `参考答案${index}`),
            analysis: read(row, `解析${index}`) || undefined,
            score: Number(read(row, `分值${index}`) || 0),
          }))
          .filter((item) => item.prompt || item.referenceAnswer || item.score);
        if (
          !subQuestions.length ||
          subQuestions.some(
            (item) =>
              item.prompt.length < 2 ||
              item.referenceAnswer.length < 2 ||
              !Number.isFinite(item.score) ||
              item.score <= 0 ||
              item.score > 100,
          )
        )
          throw new Error("每个设问都必须填写问题、参考答案和 1–100 分的分值");
        const caseMaterial = read(row, "案例材料");
        if (questionType === "case_analysis" && caseMaterial.length < 10)
          throw new Error("案例分析题的案例材料至少 10 个字");
        const analysis = read(row, "整题解析");
        if (analysis.length < 2) throw new Error("整题解析不能为空");
        rows.push({
          ...common,
          options: [],
          correctAnswers: [],
          analysis,
          ...(caseMaterial ? { caseMaterial } : {}),
          subQuestions,
        });
      }
    } catch (error) {
      throw new Error(
        `第 ${rowNumber} 行：${error instanceof Error ? error.message : "数据格式不正确"}`,
      );
    }
  });
  if (!rows.length) throw new Error("Excel 中没有可导入的题目");
  if (rows.length > 500) throw new Error("单次最多导入 500 道题");
  return rows;
}
