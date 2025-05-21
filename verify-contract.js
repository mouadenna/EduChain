// Script to verify contract functions are available in the ABI
const fs = require('fs');
const path = require('path');

// Load contract ABI
const contractPath = path.join(__dirname, 'client', 'src', 'contracts', 'EduChain.json');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

console.log('Contract ABI loaded from:', contractPath);

// Required functions that should be in the ABI
const requiredFunctions = [
  'createCourse',
  'enrollInCourse',
  'completeModule',
  'issueCertificate',
  'getCourseCount',
  'getTeacherCourses',
  'getStudentCourses',
  'getStudentCertificates',
  'getStudentProgress',
  'verifyCertificate',
  'courses'
];

// Check if all required functions are in the ABI
console.log('\nChecking ABI for required functions:');
console.log('-'.repeat(40));

const abiFunctions = contract.abi
  .filter(item => item.type === 'function')
  .map(func => func.name);

console.log('Available functions in ABI:', abiFunctions);
console.log('-'.repeat(40));

let missingFunctions = [];

requiredFunctions.forEach(funcName => {
  const found = contract.abi.some(item => 
    item.type === 'function' && item.name === funcName
  );
  
  console.log(`${funcName}: ${found ? '✅ Available' : '❌ Missing'}`);
  
  if (!found) {
    missingFunctions.push(funcName);
  }
});

if (missingFunctions.length > 0) {
  console.log('\n⚠️ WARNING: Missing required functions in ABI!');
  console.log('The following functions are missing:', missingFunctions);
  console.log('\nPlease check your contract compilation and ABI generation process.');
} else {
  console.log('\n✅ All required functions are available in the ABI!');
}

// Check if contract address is properly set
const contextPath = path.join(__dirname, 'client', 'src', 'contexts', 'Web3Context.js');
const contextContent = fs.readFileSync(contextPath, 'utf8');

const contractAddressMatch = contextContent.match(/CONTRACT_ADDRESS\s*=\s*['"]([^'"]+)['"]/);
const contractAddress = contractAddressMatch ? contractAddressMatch[1] : null;

console.log('\nChecking contract address in Web3Context.js:');
console.log('-'.repeat(40));

if (!contractAddress) {
  console.log('❌ CONTRACT_ADDRESS not found in Web3Context.js');
} else if (contractAddress === '0x0000000000000000000000000000000000000000') {
  console.log('❌ CONTRACT_ADDRESS is set to the default zero address');
} else {
  console.log(`✅ CONTRACT_ADDRESS is set to: ${contractAddress}`);
}

console.log('\nVerification complete!'); 