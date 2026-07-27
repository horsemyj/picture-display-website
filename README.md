# 图片展示静态网页

## 简介

这是一个提供图片展示的静态网页，提供基础登录保护与预览和下载功能。登录功能采用本地哈希值比对，故不建议在生产环境中使用，仅作为简单图片展示使用，且不应作为展示涉及机密、隐私等内容所用，警惕资产泄露与隐私侵权。

> 由忽略警告使用本项目所造成的损失自负

> 此项目使用fetch，因此请使用liveserver或本地服务器进行挂载测试，否则可能失败。如果实在需要，请参阅页尾方案

> 此项目效果参见[example](https://pdsite-example.pages.dev/)

## 使用方法

### 1.图片存放

图片存放于assets文件夹中，须运行generate-images.js以将图片信息数集写入images.json

```
node generate-images.js
```

### 2.登录设置

相关脚本存放于encrypt文件夹中，部署网站时可将其删除。运行generate_credentials.js，写入若干组参数用户名与密码。示例：

```
node generate_credentials.js admin:password user:password
```

脚本会将哈希数组写入credentials.json，将内容复制入根目录下的credentials.json中即可（此举动可防止意外覆写）

> encrypt 文件夹中的server.js与index.html是凭据生成脚本的图形化版本，先运行server.js再根据server.js的输出指引访问localhost:3000即可

### 3.登入动效

将1.ico替换为自己想要的图片即可，一定为ico格式且命名为1.ico

> 此项目预置一个演示账号admin,密码为admin

### 4.注释（在本地调试的方法）

> 未经作者验证

把下面这段放到 index.html 里，放在主脚本前面：

```
<script id="credentials-data" type="application/json">
（插入credentials.json的内容）
</script>
```

然后把原来的 `loadCredentials()` 替换成下面这一版：（做好备份）

```
let credentials = null;
const credentialsDataEl = document.getElementById('credentials-data');

async function loadCredentials() {
  if (credentials) return credentials;
  try {
    const res = await fetch(CREDENTIALS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('无法加载凭据文件');
    credentials = await res.json();
    return credentials;
  } catch (e) {
    console.warn('loadCredentials failed, fallback to inline credentials', e);
    try {
      credentials = JSON.parse(credentialsDataEl?.textContent || '[]');
    } catch (parseErr) {
      console.error('inline credentials parse failed', parseErr);
      credentials = [];
    }
    return credentials;
  }
}
```

