import {expect, test, type Page} from '@playwright/test';
import path from 'node:path';

async function login(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('请输入账号').fill('admin');
  await page.getByPlaceholder('请输入密码').fill('change-me-local');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test('administrator can sign in and inspect core modules', async ({page}, testInfo) => {
  await login(page);
  await expect(page.getByText('工作台', {exact: true}).last()).toBeVisible();
  await page.screenshot({path: testInfo.outputPath('dashboard.png'), fullPage: true});

  const modules = [
    ['/users', '用户与权益'],
    ['/content/questions', '题库管理'],
    ['/content/subjects', '科目、章节与考点'],
    ['/content/papers', '试卷管理'],
    ['/content/imports', '题库批量导入'],
    ['/content/laws', '法条管理'],
    ['/courses', '课程管理'],
    ['/courses/live-sessions', '直播排期'],
    ['/learning/records', '学习记录'],
    ['/learning/plans', '学习计划'],
    ['/grading', '批改队列'],
    ['/commerce/products', '商品管理'],
    ['/commerce/orders', '订单管理'],
    ['/commerce/refunds', '退款售后'],
    ['/commerce/entitlements', '权益记录'],
    ['/community/posts', '帖子管理'],
    ['/community/comments', '评论管理'],
    ['/community/reports', '举报审核'],
    ['/community/rules', '社区规则'],
    ['/operations/banners', 'Banner 管理'],
    ['/operations/announcements', '公告管理'],
    ['/operations/templates', '消息模板'],
    ['/operations/push-jobs', '推送任务'],
    ['/ai/quotas', 'AI 配额管理'],
    ['/ai/flags', 'AI 风险记录'],
    ['/ai/usage', 'AI 用量统计'],
    ['/analytics', '数据分析概览'],
    ['/system/admins', '系统管理'],
    ['/system/audit-logs', '审计日志'],
    ['/system/settings', '系统配置'],
    ['/system/health', '服务状态'],
  ] as const;
  for (const [path, title] of modules) {
    await page.evaluate(route => { window.history.pushState({}, '', route); window.dispatchEvent(new PopStateEvent('popstate')); }, path);
    await expect(page.getByText(title, {exact: true}).first()).toBeVisible();
  }
  await page.screenshot({path: testInfo.outputPath('system-admins.png'), fullPage: true});
});

test('administrator can upload, map and preflight an objective CSV file', async ({page}) => {
  await login(page);
  await page.goto('/content/imports');
  await page.getByRole('button', {name: /新建批量导入/}).click();
  const dialog = page.getByRole('dialog', {name: '新建题库批量导入'});
  const comboboxes = dialog.getByRole('combobox');
  await comboboxes.nth(0).click();
  await page.getByText('民法', {exact: true}).last().click();
  await comboboxes.nth(1).click();
  await page.getByText('客观题基础理论', {exact: true}).last().click();
  await comboboxes.nth(2).click();
  await page.getByText('客观题核心考点', {exact: true}).last().click();

  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', {name: /下载客观题模板/}).click();
  await page.getByText('下载 Excel 模板', {exact: true}).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('客观题导入模板.xlsx');

  await page.locator('input[type="file"]').setInputFiles(path.resolve('e2e/fixtures/objective-import.csv'));
  await expect(dialog.getByText(/objective-import\.csv · 1 条数据/)).toBeVisible();
  await expect(dialog.getByText('批量导入浏览器验收题干', {exact: true})).toBeVisible();
  await expect(dialog.getByText('A', {exact: true}).last()).toBeVisible();
  const preflightResponse = page.waitForResponse(response => response.url().endsWith('/v1/admin/content/imports') && response.request().method() === 'POST');
  await dialog.getByRole('button', {name: '执行导入预检'}).click();
  expect((await preflightResponse).status()).toBe(201);
  await expect(dialog.getByText(/预检完成：可导入 1 题，重复跳过 0 题，错误 0 题/)).toBeVisible();
  await expect(dialog.getByRole('button', {name: /确认导入 1 题/})).toBeEnabled();
});

test('question management filters by taxonomy and supports four objective types', async ({page}) => {
  await login(page);
  await page.goto('/content/questions');

  await expect(page.getByText('按科目、章节、考点管理题目，客观题支持四种题型')).toBeVisible();
  await expect(page.getByText('全部章节')).toBeVisible();
  await expect(page.getByText('全部考点')).toBeVisible();
  await page.getByRole('combobox').nth(4).click();
  for (const label of ['判断题', '单选题', '多选题', '不定项选择题']) {
    await expect(page.getByText(label, {exact: true}).last()).toBeVisible();
  }
  await page.keyboard.press('Escape');

  await page.getByRole('button', {name: /新建客观题/}).click();
  const drawer = page.getByRole('dialog', {name: '新建客观题'});
  await drawer.locator('.ant-select').first().click();
  await page.getByText('判断题', {exact: true}).last().click();
  await expect(drawer.getByLabel('选项（每行一项）')).toHaveValue('正确\n错误');
  await expect(drawer.getByText('判断题固定为“正确、错误”两个选项')).toBeVisible();
});

test('paper management keeps objective and subjective workflows separate', async ({page}) => {
  await login(page);
  await page.goto('/content/papers');

  await expect(page.getByRole('tab', {name: /客观题试卷/})).toBeVisible();
  await expect(page.getByRole('tab', {name: /主观题试卷/})).toBeVisible();
  await expect(page.getByRole('button', {name: /新建客观题试卷/})).toBeVisible();

  await page.getByRole('tab', {name: /主观题试卷/}).click();
  await expect(page.getByRole('button', {name: /新建主观题试卷/})).toBeVisible();
  await expect(page.getByText('2026 民法主观题专项套卷（一）', {exact: true})).toBeVisible();

  await page.getByRole('button', {name: /新建主观题试卷/}).click();
  const drawer = page.getByRole('dialog', {name: '新建主观题试卷'});
  await expect(drawer.getByLabel('所属科目')).toBeVisible();
  await expect(drawer.getByRole('button', {name: /从主观题题库选题/})).toBeVisible();
  await expect(drawer.getByLabel('答题时长（分钟）')).toHaveCount(0);
});
