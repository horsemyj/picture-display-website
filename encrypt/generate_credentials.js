// Node.js 脚本：生成 PBKDF2 哈希凭据并写入 credentials.json
// 用法示例：node generate_credentials.js admin:admin user:user user1:user1
const fs = require('fs');
const crypto = require('crypto');

const args = process.argv.slice(2);
if (!args.length) {
  console.error('用法: node generate_credentials.js user:password ...');
  process.exit(1);
}

const iterations = 150000;
const keyLen = 32; // bytes
const digest = 'sha256';

const entries = args.map(pair => {
  const [username, password] = pair.split(':');
  if (!username || password === undefined) {
    throw new Error('参数格式 user:password');
  }
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLen, digest);
  return {
    username,
    salt: salt.toString('base64'),
    iterations,
    hash: hash.toString('base64'),
    digest // e.g. 'sha256'
  };
});

fs.writeFileSync('credentials.json', JSON.stringify(entries, null, 2), 'utf8');
console.log('已写入 credentials.json（当前目录）');