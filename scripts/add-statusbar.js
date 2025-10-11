const fs = require('fs');
const path = require('path');

// Lista de archivos que necesitan StatusBar (excluyendo login e index/splash)
const filesToUpdate = [
  'app/(screens)/policies/PrivacyPolicy.tsx',
  'app/(screens)/policies/TermsOfService.tsx',
  'app/(screens)/policies/LongGrassPolicy.tsx',
  'app/(screens)/policies/ThreeCutMinimum.tsx',
  'app/(screens)/registerComplete.tsx',
  'app/(screens)/verificodeReset.tsx',
];

const addStatusBarToFile = (filePath) => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if StatusBar is already imported
  if (content.includes('from \'expo-status-bar\'')) {
    console.log(`StatusBar already imported in: ${filePath}`);
    return;
  }

  // Add StatusBar import
  const importRegex = /(import.*from\s+['"]expo-router['"];?\n)/;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, '$1import { StatusBar } from \'expo-status-bar\';\n');
  } else {
    // Fallback: add after React import
    const reactImportRegex = /(import.*React.*from\s+['"]react['"];?\n)/;
    content = content.replace(reactImportRegex, '$1import { StatusBar } from \'expo-status-bar\';\n');
  }

  // Add Theme import if not present
  if (!content.includes('from \'@/constants/Theme\'')) {
    const lastImportRegex = /(import.*from\s+['"][^'"]*['"];?\n)(?!import)/;
    content = content.replace(lastImportRegex, '$1import { Theme } from \'@/constants/Theme\';\n');
  }

  // Add StatusBar to return statement
  const returnRegex = /(\s+return\s+\(\s*\n\s*<)/;
  if (returnRegex.test(content)) {
    content = content.replace(returnRegex, '$1>\n      <StatusBar \n        style="light" \n        backgroundColor={Theme.colors.primary[500]}\n      />\n      <');
    
    // Close the fragment
    const endReturnRegex = /(\s+<\/[^>]+>\s*\n\s*\);)/;
    content = content.replace(endReturnRegex, '$1\n    </>');
  }

  fs.writeFileSync(fullPath, content);
  console.log(`Updated: ${filePath}`);
};

// Update all files
filesToUpdate.forEach(addStatusBarToFile);

console.log('StatusBar update completed!');