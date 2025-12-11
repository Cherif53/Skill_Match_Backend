import * as bcrypt from 'bcryptjs';

async function test() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('hash:', hash);
  console.log('compare ok:', await bcrypt.compare('admin123', hash));
  console.log('compare fail:', await bcrypt.compare('wrong', hash));
}
test();
