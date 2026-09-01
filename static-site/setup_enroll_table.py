"""在现有南塘云村 Base 中创建「共创营报名」表（复用 gnt 凭证，不写入 gnt 配置）。

用法: python setup_enroll_table.py
输出: 表已创建时的 table_id（幂等：同名表已存在则复用，不重复建）。
"""
import json, os, sys

# 复用南塘云村 gnt 工具的现有飞书凭证
GNT_CFG = os.path.join(os.path.dirname(__file__), '..', '..', '南塘DAO', 'gnt计算机制', '工具', 'feishu_config.json')

TABLE_NAME = '共创营报名'

# 字段类型: 1=文本（含多行）, 2=数字（全用文本族，避免单选/多选需预建选项）
FIELDS = [
    ('提交ID', 1), ('提交时间', 1), ('来源', 1),
    ('姓名', 1), ('性别', 1), ('年龄', 2), ('所在城市', 1),
    ('电话', 1),   # 查重依据，必须文本（防前导零丢失）
    ('微信', 1), ('邮箱', 1),
    ('职业专业背景', 1), ('绘画艺术基础', 1), ('技能', 1),
    ('吸引原因', 1), ('共创看法', 1), ('规则看法', 1), ('共同生活', 1),
    ('角色', 1), ('分歧处理', 1), ('健康状况', 1), ('社交主页', 1), ('了解渠道', 1),
]

sys.path.insert(0, os.path.dirname(GNT_CFG))
from feishu_api import FeishuClient

cli = FeishuClient(GNT_CFG)

# 幂等：已有同名表 → 复用；表存在但缺字段 → 补齐
table_id = None
for t in cli.list_tables():
    if t['name'] == TABLE_NAME:
        table_id = t['table_id']
        break

if table_id is None:
    table_id = cli.create_table(TABLE_NAME, FIELDS)
    print(f"CREATED {table_id}")
else:
    # 检查已有字段，补齐缺失项（如上次中断遗留的空表）
    app_token = cli.cfg['app_token']
    resp = cli._request('GET', f"{cli.base_url}/bitable/v1/apps/{app_token}/tables/{table_id}/fields")
    existing = {f['field_name'] for f in resp.get('data', {}).get('items', [])}
    missing = [f for f in FIELDS if f[0] not in existing]
    for name, ftype in missing:
        cli._request('POST',
            f"{cli.base_url}/bitable/v1/apps/{app_token}/tables/{table_id}/fields",
            {"field_name": name, "type": ftype})
    print(f"{'FILLED' if missing else 'EXISTS'} {table_id}" + (f" (+{len(missing)} fields)" if missing else ""))
