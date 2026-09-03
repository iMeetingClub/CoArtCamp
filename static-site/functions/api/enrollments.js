// 报名提交 API → 飞书多维表格
// POST /api/enrollments : 手机号查重 + 写入记录（409 = 该手机号已提交过）
// GET  /api/enrollments?code=邀请码 : 全量记录（导出用）
// env: FEISHU_APP_ID / FEISHU_APP_SECRET / FEISHU_APP_TOKEN(多维表格app token) / FEISHU_TABLE_ID / ADMIN_CODE
// 表内字段需预建，列名见 FIELDS（与 enroll.html 的 answers key 一一对应）

const FIELDS = {
  q1: "姓名", q2: "性别", q3: "年龄", q4: "所在城市", q5: "电话", q6: "微信", q7: "邮箱",
  q8: "职业专业背景", q9: "绘画艺术基础", q10: "技能", q11: "吸引原因", q12: "共创看法",
  q13: "规则看法", q14: "共同生活", q15: "角色", q16: "分歧处理", q17: "健康状况",
  q18: "社交主页", q19: "了解渠道",
};

const PHONE_RE = /^1[3-9]\d{9}$/;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function getToken(env) {
  const r = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: env.FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET }),
  });
  const j = await r.json();
  if (j.code !== 0) throw new Error("获取飞书凭证失败: " + j.msg);
  return j.tenant_access_token;
}

async function bitable(env, token, path, init) {
  const u = `https://open.feishu.cn/open-apis/bitable/v1/apps/${env.FEISHU_APP_TOKEN}/tables/${env.FEISHU_TABLE_ID}${path}`;
  const r = await fetch(u, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init && init.headers) },
  });
  const j = await r.json();
  if (j.code !== 0) throw new Error("多维表格请求失败: " + j.msg);
  return j.data;
}

export async function onRequestPost(ctx) {
  const env = ctx.env;
  if (!env.FEISHU_APP_ID) return json(500, { error: "服务端未配置飞书凭证" });
  let payload;
  try { payload = await ctx.request.json(); } catch (e) { return json(400, { error: "请求体不是 JSON" }); }
  const a = payload.answers || {};
  const phone = String(a.q5 || "").trim();
  if (!PHONE_RE.test(phone)) return json(400, { error: "手机号格式不正确" });

  const token = await getToken(env);
  // 查重：拉全表按手机号匹配（报名量级 <500 条，够用）
  const list = await bitable(env, token, "/records?page_size=500", { method: "GET" });
  const dup = (list.items || []).some(it => String((it.fields && it.fields[FIELDS.q5]) || "") === phone);
  if (dup) return json(409, { error: "该手机号已提交过报名" });

  // 写入：中文列名 → 值（多选数组 join）
  const fields = { "提交ID": payload.id || "", "提交时间": payload.submittedAt || "", "来源": payload.source || "" };
  for (const [k, name] of Object.entries(FIELDS)) {
    const v = a[k];
    if (v === undefined || v === null || v === "") continue;
    fields[name] = Array.isArray(v) ? v.join("、") : String(v);
  }
  await bitable(env, token, "/records", { method: "POST", body: JSON.stringify({ fields }) });
  return json(200, { ok: true });
}

export async function onRequestGet(ctx) {
  const env = ctx.env;
  const code = new URL(ctx.request.url).searchParams.get("code");
  if (!env.ADMIN_CODE || code !== env.ADMIN_CODE) return json(403, { error: "无权查看" });
  const token = await getToken(env);
  const list = await bitable(env, token, "/records?page_size=500", { method: "GET" });
  return json(200, { count: (list.items || []).length, records: list.items || [] });
}
