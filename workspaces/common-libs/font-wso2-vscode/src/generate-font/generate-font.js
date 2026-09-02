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

    // Fantasticon assigns every glyph a codepoint alphabetically on each run, so
    // adding or removing one icon renumbers every glyph after it. That's fine
    // for glyphs used only by name (via the generated css/json — the app's
    // Icon component and its consumers), but VS Code's native
    // `contributes.icons` in packages/ballerina-extension/package.json
    // hardcodes a `fontCharacter` codepoint per icon by hand, disconnected
    // from this build. Pin exactly those codepoints so they can't drift; every
    // other glyph (the vast majority) is free to renumber as usual.
    //
    // This list must stay in sync with the `fontCharacter` values under
    // packages/ballerina-extension/package.json's `contributes.icons` (only
    // entries whose fontPath points at this font). If you add a new
    // `contributes.icons` entry here, add its glyph name below too.
    const codepoints = {
      'bi-ai-agent': 61714,                            // \f112
      'bi-ai-chat': 61715,                              // \f113
      'bi-data-table': 61749,                           // \f135
      'bi-ai-function': 61716,                          // \f114
      'bi-output': 61813,                               // \f175
      'scheduled-message-forwarding-processor': 62026,  // \f24a
      'custom': 61889,                                  // \f1c1
      'bi-fit-screen': 61769,                           // \f149
      'nested': 61984,                                  // \f220
      'Aggregate': 61702,                               // \f106
      'alarm-round': 61703,                             // \f107
      'bi-bold': 61728,                                 // \f120
      'bi-back': 61727,                                 // \f11f
      'bi-attach-file': 61724,                          // \f11c
      'bi-audio': 61725,                                // \f11d
      'bi-download-loop': 61757,                        // \f13d
      'add-circle-outline': 61698,                      // \f102
      'bi-cut': 61748,                                  // \f134
      'database-round': 61894,                          // \f1c6
    };

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
    console.log('✅ Icon font generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating icon font:', error);
    process.exit(1);
  }
}

generateIconFont();
