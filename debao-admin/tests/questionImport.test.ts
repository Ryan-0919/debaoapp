import {describe, expect, it} from 'vitest';
import {autoMapQuestionImportFields, mapQuestionImportRows} from '../src/utils/questionImport';

describe('question import mapping', () => {
  it('automatically maps Chinese objective headers and converts multiple answers', () => {
    const headers = ['科目', '章节', '考点', '题干', '选项A', '选项B', '选项C', '选项E', '正确答案', '答案解析', '来源'];
    const mapping = autoMapQuestionImportFields(headers, 'objective');
    expect(mapping).toMatchObject({subject: '科目', chapter: '章节', point: '考点', stem: '题干', optionA: '选项A', optionB: '选项B', optionC: '选项C', optionE: '选项E', answer: '正确答案', analysis: '答案解析', source: '来源'});
    expect(mapQuestionImportRows([{
      科目: '民法',
      章节: '客观题基础理论',
      考点: '客观题核心考点',
      题干: '下列关于合同效力的说法，正确的有哪些？',
      选项A: '选项一',
      选项B: '选项二',
      选项C: '选项三',
      选项E: '选项五',
      正确答案: 'A,C',
      答案解析: '选项一和选项三正确。',
      来源: '模拟题',
    }], mapping, 'objective')).toEqual([{
      subject: '民法',
      chapter: '客观题基础理论',
      point: '客观题核心考点',
      stem: '下列关于合同效力的说法，正确的有哪些？',
      options: ['选项一', '选项二', '选项三', '选项五'],
      answer: 0,
      answerIndexes: [0, 2],
      questionType: 'multiple',
      analysis: '选项一和选项三正确。',
      source: '模拟题',
    }]);
  });

  it('maps subjective fields and defaults suggested time', () => {
    const headers = ['科目', '章节', '考点', '题目标题', '案情材料', '设问', '批改依据', '总分'];
    const mapping = autoMapQuestionImportFields(headers, 'subjective');
    expect(mapQuestionImportRows([{
      科目: '民法',
      章节: '主观题案例分析',
      考点: '主观题核心考点',
      题目标题: '民事案例分析',
      案情材料: '甲乙双方因合同履行发生争议。',
      设问: '请分析双方的法律责任。',
      批改依据: '识别请求权基础并完成事实涵摄。',
      总分: '30',
    }], mapping, 'subjective')).toEqual([{
      subject: '民法',
      chapter: '主观题案例分析',
      point: '主观题核心考点',
      title: '民事案例分析',
      caseMaterial: '甲乙双方因合同履行发生争议。',
      subQuestion: '请分析双方的法律责任。',
      gradingBasis: '识别请求权基础并完成事实涵摄。',
      totalScore: 30,
      suggestedMinutes: 60,
    }]);
  });

  it('preserves explicit judgment and indeterminate question types', () => {
    const headers = ['科目', '章节', '考点', '题型', '题干', '选项A', '选项B', '选项C', '正确答案', '答案解析'];
    const mapping = autoMapQuestionImportFields(headers, 'objective');
    const rows = mapQuestionImportRows([{
      科目: '民法',
      章节: '客观题基础理论',
      考点: '客观题核心考点',
      题型: '不定项选择题',
      题干: '本题可能有一个或者多个正确答案。',
      选项A: '选项一',
      选项B: '选项二',
      选项C: '选项三',
      正确答案: 'B',
      答案解析: '本题只有选项二正确。',
    }], mapping, 'objective');
    expect(rows[0]).toMatchObject({questionType: 'indeterminate', answer: 1, answerIndexes: [1]});
  });

  it('reports a missing required mapping before preflight', () => {
    expect(() => mapQuestionImportRows([{题干: '一道题目'}], {stem: '题干'}, 'objective')).toThrow('请先映射必填字段');
  });
});
