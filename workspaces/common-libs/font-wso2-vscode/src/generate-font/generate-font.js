/**
 * Copyright (c) 2025 WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const { generateFonts } = require('@twbs/fantasticon');
const fs = require('fs');
const path = require('path');

async function generateIconFont() {
  try {
    // Ensure dist directory exists
    const distDir = path.join(__dirname, '..', '..', 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    console.log('Generating icon font...');

    // Lock in codepoints already assigned to existing icons, read from this
    // checked-in snapshot (NOT from dist/, which is gitignored and won't exist
    // on a fresh checkout/CI run). Without this, adding or removing an icon
    // re-numbers every glyph alphabetically after it, which silently breaks the
    // `fontCharacter` values VS Code's native `contributes.icons` hardcodes per
    // icon in packages/ballerina-extension/package.json (those aren't generated
    // from this font's own json/css — they have to be updated by hand, and only
    // for icons that actually moved). Keeping existing codepoints fixed means a
    // build only ever assigns *new* codepoints to *new* icons, deterministically,
    // on every machine.
    const codepointsPath = path.join(__dirname, 'codepoints.json');
    const codepoints = fs.existsSync(codepointsPath)
      ? JSON.parse(fs.readFileSync(codepointsPath, 'utf8'))
      : {};

    // Fantasticon configuration
    const config = {
      inputDir: path.join(__dirname, '..', 'icons'),
      outputDir: distDir,
      fontTypes: ['eot', 'woff2', 'woff'],
      assetTypes: ['css', 'html', 'json', 'ts'],
      name: 'wso2-vscode',
      prefix: 'fw',
      normalize: true,
      codepoints,
      formatOptions: {
        json: {
          indent: 2
        }
      }
    };

    await generateFonts(config);

    // Persist the (possibly extended) codepoint assignments so the next build —
    // on this machine or a fresh one — locks in today's new icons too.
    const finalCodepoints = JSON.parse(fs.readFileSync(path.join(distDir, 'wso2-vscode.json'), 'utf8'));
    fs.writeFileSync(codepointsPath, JSON.stringify(finalCodepoints, null, 2) + '\n');

    console.log('✅ Icon font generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating icon font:', error);
    process.exit(1);
  }
}

generateIconFont();
