
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CREDENTIALS = {
  userName: '和光同尘',
  password: '1377482893',
};

const TARGET_ORGS = [
  { id: '691951f91f87993b78d43e66', name: 'Dao南塘艺术创作营（第一期）' },
  { id: '69477ad9d85aaf703cdc855b', name: 'Dao南塘艺术共创营（第二期）' },
  { id: '69e09099a299f2bcf3e63d30', name: 'Dao南塘艺术共创营（第三期）' },
];

const OUTPUT_DIR = path.join(__dirname, '..', 'meetings', 'all-meetings');
const REQUEST_DELAY_MS = 600;

function httpGet(hostname, method, requestPath, headers, bodyData) {
  return new Promise((resolve, reject) => {
    var client = https;
    var opts = { hostname, method, path: requestPath, headers: headers || {} };
    var req = client.request(opts, (res) => {
      let text = '';
      res.on('data', c => text += c);
      res.on('end', () => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve({ status: res.statusCode, headers: res.headers, body: text });
          return;
        }
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(text) }); }
        catch { resolve({ status: res.statusCode, headers: res.headers, body: text }); }
      });
    });
    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    var client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      var chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function sanitizeName(n) { return n.replace(/[<>:"/\\|?*]/g, '_').trim(); }

async function apiLogin(u, p) {
  var d = JSON.stringify({ userName: u, password: p });
  var r = await httpGet('imeeting.co', 'POST', '/api/v1/login/userName', {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(d, 'utf-8')
  }, d);
  return r.body;
}

async function apiGetOrgMeetings(accessToken, orgId) {
  var r = await httpGet('imeeting.co', 'GET', '/api/v1/org/meetings/' + orgId, {
    'Authorization': 'Bearer ' + accessToken
  });
  return r.body;
}

async function apiGetToken(accessToken, filePath, meetingCode) {
  var cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  var encoded = '/api/v1/meeting/' + encodeURI(cleanPath) + '?meetingCode=' + meetingCode;
  var r = await httpGet('imeeting.co', 'GET', encoded, {
    'Authorization': 'Bearer ' + accessToken
  });
  return r.body;
}

async function main() {
  console.log('=== iMeeting 数据采集（按组织） ===\n');

  console.log('[1/3] 登录中...');
  var loginResult = await apiLogin(CREDENTIALS.userName, CREDENTIALS.password);
  if (loginResult.code !== 1010) {
    console.error('登录失败:', loginResult.message);
    process.exit(1);
  }
  var accessToken = loginResult.accessToken;
  console.log('  登录成功\n');

  console.log('[2/3] 获取各组织会议列表...');
  var allOrgMeetings = {};
  var grandTotal = 0;

  for (var org of TARGET_ORGS) {
    try {
      var meetings = await apiGetOrgMeetings(accessToken, org.id);
      if (!Array.isArray(meetings)) {
        console.log('  ' + org.name + ': 返回非数组');
        continue;
      }
      allOrgMeetings[org.id] = meetings;
      console.log('  ' + org.name + ': ' + meetings.length + ' 场会议');
      grandTotal += meetings.length;
    } catch (e) {
      console.log('  ' + org.name + ': 获取失败 - ' + e.message);
    }
    await delay(REQUEST_DELAY_MS);
  }
  console.log('  总计: ' + grandTotal + ' 场会议\n');

  if (grandTotal === 0) {
    console.log('无会议，退出。');
    return;
  }

  console.log('[3/3] 开始下载...');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  var totalSuccess = 0;
  var totalFail = 0;

  for (var org of TARGET_ORGS) {
    var meetings = allOrgMeetings[org.id];
    if (!meetings || meetings.length === 0) continue;

    for (var i = 0; i < meetings.length; i++) {
      var m = meetings[i];
      var { meetingName, meetingCode, meetingOrgName, resultFiles, timeStamp } = m;
      var displayName = meetingName || '(unnamed)';
      var dateStr = (timeStamp && timeStamp.create) ? timeStamp.create.substring(0, 10) : '';
      console.log('\n[' + (i+1) + '/' + meetings.length + '] ' + org.name + ' | ' + dateStr + ' | ' + displayName);

      // File pairs: always try .md first (if exists), then .docx
      var pairs = [
        { field: 'minutesMd', suffix: '纪要.md' },
        { field: 'scriptMd', suffix: '发言记录.md' },
        { field: 'minutes', suffix: '纪要.docx' },
        { field: 'script', suffix: '发言记录.docx' },
      ];

      for (var p of pairs) {
        var fp = resultFiles[p.field];
        if (!fp || fp === '/' || fp === '') continue;

        // Skip .docx if .md exists for same type
        if (p.field.endsWith('docx')) {
          var mdField = p.field.replace('minutes', 'minutesMd').replace('script', 'scriptMd');
          if (resultFiles[mdField] && resultFiles[mdField] !== '/' && resultFiles[mdField] !== '') continue;
        }

        try {
          var tr = await apiGetToken(accessToken, fp, meetingCode);
          if (!tr.directUrl) {
            console.log('    ~ ' + p.suffix + ': 无下载链接');
            continue;
          }

          var content = await downloadFile(tr.directUrl);
          var orgDir = sanitizeName(org.name);
          var meetingDir = sanitizeName(org.name + '-' + meetingCode + '-' + displayName);
          var saveDir = path.join(OUTPUT_DIR, orgDir, meetingDir);
          fs.mkdirSync(saveDir, { recursive: true });

          var fn = org.name + '-' + displayName + '-' + p.suffix;
          fs.writeFileSync(path.join(saveDir, fn), content);

          var sizeKB = (content.length / 1024).toFixed(1);
          console.log('    success ' + p.suffix + ' (' + sizeKB + ' KB)');
          totalSuccess++;
        } catch (e) {
          console.log('    fail ' + p.suffix + ': ' + e.message);
          totalFail++;
        }
        await delay(REQUEST_DELAY_MS);
      }
    }
  }

  console.log('\n=== 采集完成 ===');
  console.log('成功: ' + totalSuccess + ' 个文件');
  console.log('失败: ' + totalFail + ' 个文件');
  console.log('保存: ' + OUTPUT_DIR);
}

main().catch(e => { console.error('脚本错误:', e); process.exit(1); });
