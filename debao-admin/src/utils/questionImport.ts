import Papa from 'papaparse';

export type QuestionImportKind = 'objective' | 'subjective';
export type QuestionImportFormat = 'xlsx' | 'csv' | 'json';
export type QuestionImportRow = Record<string, unknown>;
export type QuestionImportMapping = Record<string, string | undefined>;

export interface ParsedQuestionFile {
  filename: string;
  format: QuestionImportFormat;
  headers: string[];
  rows: QuestionImportRow[];
}

export interface QuestionImportField {
  key: string;
  label: string;
  required: boolean;
  aliases: string[];
  example: string | number;
  description: string;
}

const objectiveFields: QuestionImportField[] = [
  {key: 'subject', label: '科目', required: true, aliases: ['科目', '科目名称', 'subject', 'subjectName', 'subject_name', 'subjectId'], example: '民法', description: '填写科目名称或科目 ID，必须存在于后台题库'},
  {key: 'chapter', label: '章节', required: true, aliases: ['章节', '章节名称', 'chapter', 'chapterName', 'chapter_name'], example: '客观题基础理论', description: '填写章节名称或章节 ID，必须与后台科目下的章节一致'},
  {key: 'point', label: '考点', required: true, aliases: ['考点', '考点名称', '知识点', 'point', 'pointName', 'point_name'], example: '客观题核心考点', description: '填写考点名称或考点 ID，必须属于填写的章节'},
  {key: 'questionType', label: '题型', required: false, aliases: ['题型', 'questionType', 'question_type', 'type'], example: '单选题', description: '填写判断题、单选题、多选题或不定项选择题；留空时按答案数量判断'},
  {key: 'stem', label: '题干', required: true, aliases: ['题干', '题目', 'stem', 'question'], example: '甲与乙订立合同，下列说法正确的是？', description: '题干正文，至少 5 个字符'},
  {key: 'optionA', label: '选项 A', required: true, aliases: ['选项A', 'A', 'optionA', 'option_a'], example: '合同当然无效', description: '至少填写 A、B 两个选项'},
  {key: 'optionB', label: '选项 B', required: true, aliases: ['选项B', 'B', 'optionB', 'option_b'], example: '合同效力待定', description: '至少填写 A、B 两个选项'},
  {key: 'optionC', label: '选项 C', required: false, aliases: ['选项C', 'C', 'optionC', 'option_c'], example: '合同可以撤销', description: '可选'},
  {key: 'optionD', label: '选项 D', required: false, aliases: ['选项D', 'D', 'optionD', 'option_d'], example: '合同有效', description: '可选'},
  {key: 'optionE', label: '选项 E', required: false, aliases: ['选项E', 'E', 'optionE', 'option_e'], example: '合同可撤销', description: '可选'},
  {key: 'optionF', label: '选项 F', required: false, aliases: ['选项F', 'F', 'optionF', 'option_f'], example: '合同效力待定', description: '可选'},
  {key: 'optionG', label: '选项 G', required: false, aliases: ['选项G', 'G', 'optionG', 'option_g'], example: '以上都不正确', description: '可选'},
  {key: 'answer', label: '正确答案', required: true, aliases: ['正确答案', '答案', 'answer'], example: 'D', description: '判断题、单选题填一个字母；多选或不定项用英文逗号分隔，如 A,C'},
  {key: 'analysis', label: '答案解析', required: true, aliases: ['答案解析', '解析', 'analysis'], example: '依据民法典相关规定，该合同有效。', description: '答案的法律依据与分析'},
  {key: 'source', label: '题目来源', required: false, aliases: ['题目来源', '来源', '题源', 'source'], example: '2025 年模拟题', description: '可选'},
];

const subjectiveFields: QuestionImportField[] = [
  {key: 'subject', label: '科目', required: true, aliases: ['科目', '科目名称', 'subject', 'subjectName', 'subject_name', 'subjectId'], example: '民法', description: '填写科目名称或科目 ID，必须存在于后台题库'},
  {key: 'chapter', label: '章节', required: true, aliases: ['章节', '章节名称', 'chapter', 'chapterName', 'chapter_name'], example: '主观题案例分析', description: '填写章节名称或章节 ID，必须与后台科目下的章节一致'},
  {key: 'point', label: '考点', required: true, aliases: ['考点', '考点名称', '知识点', 'point', 'pointName', 'point_name'], example: '主观题核心考点', description: '填写考点名称或考点 ID，必须属于填写的章节'},
  {key: 'title', label: '题目标题', required: true, aliases: ['题目标题', '标题', 'title'], example: '民事合同案例分析', description: '题目名称'},
  {key: 'caseMaterial', label: '案情材料', required: true, aliases: ['案情材料', '案例材料', '材料', 'caseMaterial', 'case_material'], example: '甲公司与乙公司签订买卖合同，后发生履行争议。', description: '供考生阅读的完整材料'},
  {key: 'subQuestion', label: '设问', required: true, aliases: ['设问', '问题', 'subQuestion', 'sub_question'], example: '请分析合同效力及双方责任。', description: '本批量导入每题创建一个设问'},
  {key: 'gradingBasis', label: '批改依据', required: true, aliases: ['批改依据', '评分标准', '参考答案', 'gradingBasis', 'grading_basis'], example: '识别请求权基础，说明构成要件并完成事实涵摄。', description: '人工批改和评分使用的依据'},
  {key: 'totalScore', label: '总分', required: true, aliases: ['总分', '分值', 'totalScore', 'total_score'], example: 30, description: '大于 0，最高 1000'},
  {key: 'suggestedMinutes', label: '建议用时', required: false, aliases: ['建议用时', '用时', '建议分钟数', 'suggestedMinutes', 'suggested_minutes'], example: 45, description: '分钟数，留空默认 60'},
];

export function getQuestionImportFields(kind: QuestionImportKind): QuestionImportField[] {
  return kind === 'objective' ? objectiveFields : subjectiveFields;
}

function normalizedHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_\-—:：()（）]/g, '');
}

export function autoMapQuestionImportFields(headers: string[], kind: QuestionImportKind): QuestionImportMapping {
  const normalized = headers.map(header => ({header, normalized: normalizedHeader(header)}));
  return Object.fromEntries(getQuestionImportFields(kind).map(field => {
    const candidates = [field.key, field.label, ...field.aliases].map(normalizedHeader);
    const match = normalized.find(item => candidates.includes(item.normalized));
    return [field.key, match?.header];
  }));
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && 'text' in value && typeof (value as {text?: unknown}).text === 'string') return (value as {text: string}).text.trim();
  return String(value).trim();
}

function normalizeStructuredOptions(row: QuestionImportRow): QuestionImportRow {
  if (!Array.isArray(row.options)) return row;
  const options = row.options;
  return {
    ...row,
    optionA: row.optionA ?? options[0],
    optionB: row.optionB ?? options[1],
    optionC: row.optionC ?? options[2],
    optionD: row.optionD ?? options[3],
    optionE: row.optionE ?? options[4],
    optionF: row.optionF ?? options[5],
    optionG: row.optionG ?? options[6],
  };
}

function collectHeaders(rows: QuestionImportRow[]): string[] {
  const headers: string[] = [];
  rows.forEach(row => Object.keys(row).forEach(key => {
    if (!headers.includes(key)) headers.push(key);
  }));
  return headers;
}

function validateRows(rows: QuestionImportRow[]): QuestionImportRow[] {
  const nonEmpty = rows.map(normalizeStructuredOptions).filter(row => Object.values(row).some(value => cellText(value) !== ''));
  if (!nonEmpty.length) throw new Error('文件中没有可导入的数据行');
  if (nonEmpty.length > 5000) throw new Error('单次最多导入 5000 条题目');
  return nonEmpty;
}

async function parseXlsx(file: File): Promise<QuestionImportRow[]> {
  const {Workbook} = await import('exceljs');
  const workbook = new Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('Excel 文件中没有工作表');
  const headerRow = worksheet.getRow(1);
  const headers = Array.from({length: headerRow.cellCount}, (_, index) => headerRow.getCell(index + 1).text.trim());
  if (!headers.some(Boolean)) throw new Error('Excel 第一行必须是字段名称');
  const rows: QuestionImportRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: QuestionImportRow = {};
    headers.forEach((header, index) => {
      if (header) record[header] = row.getCell(index + 1).text.trim();
    });
    rows.push(record);
  });
  return rows;
}

async function parseCsv(file: File): Promise<QuestionImportRow[]> {
  const result = Papa.parse<QuestionImportRow>(await file.text(), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: header => header.replace(/^\uFEFF/, '').trim(),
  });
  if (result.errors.length) {
    const first = result.errors[0];
    throw new Error(`CSV 第 ${(first.row ?? 0) + 2} 行解析失败：${first.message}`);
  }
  return result.data;
}

async function parseJson(file: File): Promise<QuestionImportRow[]> {
  let value: unknown;
  try {
    value = JSON.parse((await file.text()).replace(/^\uFEFF/, ''));
  } catch {
    throw new Error('JSON 文件格式不正确，请检查括号、引号和逗号');
  }
  if (!Array.isArray(value) || value.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error('JSON 顶层必须是题目对象数组');
  }
  return value as QuestionImportRow[];
}

export async function parseQuestionImportFile(file: File): Promise<ParsedQuestionFile> {
  if (file.size > 10 * 1024 * 1024) throw new Error('文件不能超过 10 MB');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !['xlsx', 'csv', 'json'].includes(extension)) throw new Error('仅支持 .xlsx、.csv 或 .json 文件');
  const format = extension as QuestionImportFormat;
  const rows = validateRows(format === 'xlsx' ? await parseXlsx(file) : format === 'csv' ? await parseCsv(file) : await parseJson(file));
  const headers = collectHeaders(rows);
  if (!headers.length) throw new Error('文件中没有可映射的字段');
  return {filename: file.name, format, headers, rows};
}

function parseAnswer(value: unknown, options: Array<{originalIndex: number; value: string}>): number[] {
  const raw = Array.isArray(value) ? value.map(String) : cellText(value).split(/[,，、;；/|\s]+/).filter(Boolean);
  const indexes = raw.map(token => {
    const normalized = token.trim().toUpperCase();
    if (/^[A-G]$/.test(normalized)) {
      const originalIndex = normalized.charCodeAt(0) - 65;
      return options.findIndex(option => option.originalIndex === originalIndex);
    }
    if (/^\d+$/.test(normalized)) {
      const numeric = Number(normalized);
      return numeric >= 0 && numeric < options.length ? numeric : numeric >= 1 && numeric <= options.length ? numeric - 1 : -1;
    }
    return -1;
  });
  const unique = [...new Set(indexes)];
  if (!unique.length || unique.some(index => index < 0 || index >= options.length)) throw new Error('正确答案必须对应已填写的选项，例如 A 或 A,C');
  return unique.sort((a, b) => a - b);
}

function mappedValue(row: QuestionImportRow, mapping: QuestionImportMapping, field: string): unknown {
  const header = mapping[field];
  return header ? row[header] : undefined;
}

function normalizeQuestionType(value: unknown, answerCount: number) {
  const raw = cellText(value).toLowerCase().replace(/\s+/g, '');
  const aliases: Record<string, string> = {
    '判断题': 'true_false',
    '判断': 'true_false',
    'truefalse': 'true_false',
    'true_false': 'true_false',
    '单选题': 'single',
    '单选': 'single',
    'single': 'single',
    '多选题': 'multiple',
    '多选': 'multiple',
    'multiple': 'multiple',
    '不定项选择题': 'indeterminate',
    '不定项': 'indeterminate',
    'indeterminate': 'indeterminate',
  };
  if (!raw) return answerCount > 1 ? 'multiple' : 'single';
  const questionType = aliases[raw];
  if (!questionType) throw new Error('题型必须是判断题、单选题、多选题或不定项选择题');
  return questionType;
}

export function mapQuestionImportRows(rows: QuestionImportRow[], mapping: QuestionImportMapping, kind: QuestionImportKind): QuestionImportRow[] {
  const missing = getQuestionImportFields(kind).filter(field => field.required && !mapping[field.key]);
  if (missing.length) throw new Error(`请先映射必填字段：${missing.map(field => field.label).join('、')}`);
  return rows.map((row, index) => {
    if (kind === 'objective') {
      const optionValues = ['optionA', 'optionB', 'optionC', 'optionD', 'optionE', 'optionF', 'optionG'].map((key, originalIndex) => ({originalIndex, value: cellText(mappedValue(row, mapping, key))}));
      const options = optionValues.filter(option => option.value);
      try {
        const answerIndexes = parseAnswer(mappedValue(row, mapping, 'answer'), options);
        const questionType = normalizeQuestionType(mappedValue(row, mapping, 'questionType'), answerIndexes.length);
        if (questionType === 'true_false' && (options.length !== 2 || answerIndexes.length !== 1)) throw new Error('判断题必须有两个选项且只能填写一个答案');
        if (questionType === 'single' && answerIndexes.length !== 1) throw new Error('单选题只能填写一个答案');
        if (questionType === 'multiple' && answerIndexes.length < 2) throw new Error('多选题至少填写两个答案');
        return {
          subject: cellText(mappedValue(row, mapping, 'subject')),
          chapter: cellText(mappedValue(row, mapping, 'chapter')),
          point: cellText(mappedValue(row, mapping, 'point')),
          stem: cellText(mappedValue(row, mapping, 'stem')),
          options: options.map(option => option.value),
          answer: answerIndexes[0],
          answerIndexes,
          questionType,
          analysis: cellText(mappedValue(row, mapping, 'analysis')),
          source: cellText(mappedValue(row, mapping, 'source')) || undefined,
        };
      } catch (error) {
        throw new Error(`第 ${index + 2} 行：${error instanceof Error ? error.message : '答案格式错误'}`);
      }
    }
    const totalScore = Number(cellText(mappedValue(row, mapping, 'totalScore')));
    const suggestedMinutesText = cellText(mappedValue(row, mapping, 'suggestedMinutes'));
    return {
      subject: cellText(mappedValue(row, mapping, 'subject')),
      chapter: cellText(mappedValue(row, mapping, 'chapter')),
      point: cellText(mappedValue(row, mapping, 'point')),
      title: cellText(mappedValue(row, mapping, 'title')),
      caseMaterial: cellText(mappedValue(row, mapping, 'caseMaterial')),
      subQuestion: cellText(mappedValue(row, mapping, 'subQuestion')),
      gradingBasis: cellText(mappedValue(row, mapping, 'gradingBasis')),
      totalScore,
      suggestedMinutes: suggestedMinutesText ? Number(suggestedMinutesText) : 60,
    };
  });
}

function triggerDownload(content: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function downloadQuestionImportTemplate(kind: QuestionImportKind, format: QuestionImportFormat) {
  const fields = getQuestionImportFields(kind);
  const sample = Object.fromEntries(fields.map(field => [field.label, field.example]));
  const baseName = kind === 'objective' ? '客观题导入模板' : '主观题导入模板';
  if (format === 'json') {
    triggerDownload(JSON.stringify([sample], null, 2), 'application/json;charset=utf-8', `${baseName}.json`);
    return;
  }
  if (format === 'csv') {
    triggerDownload(`\uFEFF${Papa.unparse([sample])}`, 'text/csv;charset=utf-8', `${baseName}.csv`);
    return;
  }
  const {Workbook} = await import('exceljs');
  const workbook = new Workbook();
  workbook.creator = '得宝运营后台';
  workbook.created = new Date();
  const dataSheet = workbook.addWorksheet('题目导入', {views: [{state: 'frozen', ySplit: 1}]});
  dataSheet.columns = fields.map(field => ({header: field.label, key: field.key, width: Math.max(14, Math.min(42, field.description.length + 8))}));
  dataSheet.addRow(Object.fromEntries(fields.map(field => [field.key, field.example])));
  const header = dataSheet.getRow(1);
  header.height = 24;
  header.eachCell(cell => {
    cell.font = {bold: true, color: {argb: 'FFFFFFFF'}};
    cell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF4C4BEA'}};
    cell.alignment = {vertical: 'middle'};
  });
  dataSheet.autoFilter = {from: 'A1', to: `${String.fromCharCode(64 + fields.length)}1`};
  const instructionSheet = workbook.addWorksheet('填写说明');
  instructionSheet.columns = [{header: '字段', key: 'label', width: 20}, {header: '是否必填', key: 'required', width: 12}, {header: '填写要求', key: 'description', width: 58}];
  instructionSheet.addRows(fields.map(field => ({label: field.label, required: field.required ? '必填' : '选填', description: field.description})));
  instructionSheet.getRow(1).eachCell(cell => {
    cell.font = {bold: true, color: {argb: 'FFFFFFFF'}};
    cell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF303247'}};
  });
  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer as BlobPart, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', `${baseName}.xlsx`);
}
