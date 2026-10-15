import {useCallback, useEffect, useState} from "react";
import {Alert, Button, Card, Drawer, Form, Input, message, Select, Space, Table, Tag, Typography} from "antd";
import {getLearningInquiries, replyLearningInquiry, type LearningInquiry} from "@/services/api";

export default function LearningInquiries() {
  const [items, setItems] = useState<LearningInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<LearningInquiry>();
  const [form] = Form.useForm<{reply: string; teacherName: string}>();
  const load = useCallback(async () => {
    setLoading(true);
    try {setItems(await getLearningInquiries()); setError(undefined);}
    catch (e) {setError(e instanceof Error ? e.message : "加载失败");}
    finally {setLoading(false);}
  }, []);
  useEffect(() => {void load();}, [load]);
  return <Card title="学员错因答疑" extra={<Button onClick={() => void load()}>刷新</Button>}>
    {error && <Alert type="error" message={error} showIcon style={{marginBottom: 16}} />}
    <Space style={{marginBottom: 16}}>
      <Typography.Text>回复状态</Typography.Text>
      <Select value={status} onChange={setStatus} style={{width: 150}}
        options={[{value: "all", label: "全部"}, {value: "pending", label: "待回复"}, {value: "answered", label: "已回复"}]} />
    </Space>
    <Table<LearningInquiry> rowKey="id" loading={loading}
      dataSource={items.filter(item => status === "all" || item.status === status)}
      columns={[
        {title: "学员", dataIndex: "studentName", width: 120},
        {title: "题目", render: (_, item) => item.question.stem, ellipsis: true},
        {title: "错因 / 疑问", dataIndex: "reason", ellipsis: true},
        {title: "状态", width: 110, render: (_, item) => <Tag color={item.status === "answered" ? "green" : "orange"}>{item.status === "answered" ? "已回复" : "待回复"}</Tag>},
        {title: "提交时间", dataIndex: "createdAt", render: value => new Date(value).toLocaleString()},
        {title: "操作", render: (_, item) => <Button type="link" onClick={() => {
          setSelected(item); form.setFieldsValue({reply: item.reply ?? "", teacherName: item.teacherName ?? ""});
        }}>{item.status === "answered" ? "查看 / 编辑回复" : "答疑回复"}</Button>},
      ]} />
    <Drawer title="错因答疑回复" width={660} open={!!selected} onClose={() => {if (!saving) setSelected(undefined);}}
      destroyOnHidden>
      {selected && <>
        <Typography.Title level={5}>题目</Typography.Title>
        <Typography.Paragraph style={{whiteSpace: "pre-wrap"}}>{selected.question.stem}</Typography.Paragraph>
        {selected.question.options.map((option, index) => <p key={index}>{String.fromCharCode(65 + index)}. {option}</p>)}
        <Typography.Paragraph>学员答案：{selected.question.answers.map(i => String.fromCharCode(65 + Number(i))).join("、") || "未作答"}</Typography.Paragraph>
        <Typography.Paragraph>正确答案：{selected.question.correctAnswers.map(i => String.fromCharCode(65 + Number(i))).join("、")}</Typography.Paragraph>
        <Typography.Paragraph style={{whiteSpace: "pre-wrap"}}>解析：{selected.question.analysis || "暂无"}</Typography.Paragraph>
        <Alert message="学员错因 / 疑问" description={<div style={{whiteSpace: "pre-wrap"}}>{selected.reason}</div>} style={{marginBottom: 24}} />
        <Form form={form} layout="vertical" onFinish={async values => {
          setSaving(true);
          try {
            await replyLearningInquiry(selected.id, values.reply.trim(), values.teacherName.trim());
            message.success("回复已保存，学员可在我的答疑中查看");
            setSelected(undefined); await load();
          } catch (e) {message.error(e instanceof Error ? e.message : "回复失败");}
          finally {setSaving(false);}
        }}>
          <Form.Item name="teacherName" label="答疑老师姓名" rules={[{required: true, whitespace: true, max: 80}]}>
            <Input maxLength={80} disabled={saving} />
          </Form.Item>
          <Form.Item name="reply" label="老师回复" rules={[{required: true, whitespace: true, min: 2, max: 10000}]}>
            <Input.TextArea rows={8} maxLength={10000} showCount disabled={saving} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>保存并回复学员</Button>
        </Form>
      </>}
    </Drawer>
  </Card>;
}
