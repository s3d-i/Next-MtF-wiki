// 简单的测试用例，验证换算功能
import { convertHormoneValue, performConversion, getHormoneById } from './utils';
import { HORMONES } from './constants';

// 测试雌二醇换算
function testEstradiolConversion() {
  const estradiol = getHormoneById('estradiol');
  if (!estradiol) throw new Error('Estradiol not found');

  // 测试 100 pg/mL 转换为 pmol/L
  const result1 = convertHormoneValue(100, 'pg/mL', 'pmol/L', estradiol);
  console.log('100 pg/mL =', result1.toFixed(2), 'pmol/L');
  
  // 测试 367 pmol/L 转换为 pg/mL
  const result2 = convertHormoneValue(367, 'pmol/L', 'pg/mL', estradiol);
  console.log('367 pmol/L =', result2.toFixed(2), 'pg/mL');
}

// 测试睾酮换算
function testTestosteroneConversion() {
  const testosterone = getHormoneById('testosterone');
  if (!testosterone) throw new Error('Testosterone not found');

  // 测试 300 ng/dL 转换为 nmol/L
  const result1 = convertHormoneValue(300, 'ng/dL', 'nmol/L', testosterone);
  console.log('300 ng/dL =', result1.toFixed(2), 'nmol/L');
  
  // 测试 10 nmol/L 转换为 ng/dL
  const result2 = convertHormoneValue(10, 'nmol/L', 'ng/dL', testosterone);
  console.log('10 nmol/L =', result2.toFixed(2), 'ng/dL');
}

// 测试完整转换功能
function testPerformConversion() {
  // 测试有效输入
  const result1 = performConversion('100', 'pg/mL', 'pmol/L', 'estradiol');
  console.log('Conversion result:', result1);
  
  // 测试无效输入
  const result2 = performConversion('abc', 'pg/mL', 'pmol/L', 'estradiol');
  console.log('Invalid input result:', result2);
}

// 运行测试（仅在开发环境）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('=== 激素换算器测试 ===');
  testEstradiolConversion();
  testTestosteroneConversion();
  testPerformConversion();
  console.log('=== 测试完成 ===');
}

export { testEstradiolConversion, testTestosteroneConversion, testPerformConversion };
