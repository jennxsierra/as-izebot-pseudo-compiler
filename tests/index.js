// Test cases for the IZEBOT pseudo-compiler
const testCases = [
  {
    name: 'Single binding',
    input: 'EXEC key A = DRVF > HALT',
    expected: 'SUCCESS'
  },
  {
    name: 'Multiple bindings',
    input: 'EXEC key A = DRVF > key B = DRVB > HALT',
    expected: 'SUCCESS'
  },
  {
    name: 'All keys and movements',
    input: 'EXEC key A = DRVF > key B = DRVB > key C = TRNL > key D = TRNR > HALT',
    expected: 'SUCCESS'
  },
  {
    name: 'Overwrite key binding',
    input: 'EXEC key A = DRVF > key A = DRVB > HALT',
    expected: 'SUCCESS'
  },
  {
    name: 'Missing EXEC',
    input: 'key A = DRVF > HALT',
    expected: 'ERROR'
  },
  {
    name: 'Missing HALT',
    input: 'EXEC key A = DRVF >',
    expected: 'ERROR'
  },
  {
    name: 'Invalid key ID',
    input: 'EXEC key E = DRVF > HALT',
    expected: 'ERROR'
  },
  {
    name: 'Invalid movement',
    input: 'EXEC key A = MOVE > HALT',
    expected: 'ERROR'
  },
  {
    name: 'Missing equals sign',
    input: 'EXEC key A DRVF > HALT',
    expected: 'ERROR'
  },
  {
    name: 'Missing greater than',
    input: 'EXEC key A = DRVF HALT',
    expected: 'ERROR'
  },
  {
    name: 'Case sensitivity - lowercase exec',
    input: 'exec key A = DRVF > HALT',
    expected: 'ERROR'
  },
  {
    name: 'Case sensitivity - lowercase key',
    input: 'EXEC Key A = DRVF > HALT',
    expected: 'ERROR'
  },
  {
    name: 'Spin movements',
    input: 'EXEC key A = SPNL > key B = SPNR > HALT',
    expected: 'SUCCESS'
  }
];

console.log('IZEBOT Pseudo-Compiler Test Suite');
console.log('===================================\n');

// Note: These tests are designed to be run manually
// or integrated with a test framework
testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`Input: ${test.input}`);
  console.log(`Expected: ${test.expected}`);
  console.log('---');
});

export { testCases };
