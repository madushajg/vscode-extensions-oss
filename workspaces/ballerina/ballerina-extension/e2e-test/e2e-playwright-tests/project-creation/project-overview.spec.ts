/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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
import { test } from '@playwright/test';
import { BI_INTEGRATOR_LABEL, BI_WEBVIEW_NOT_FOUND_ERROR, initTest, logStep, page } from '../utils/helpers';
import { switchToIFrame } from '@wso2/playwright-vscode-tester';
import { dataFolder } from '../utils/helpers/setup';

export default function createTests() {
    test.describe.serial('Project Overview Tests', async () => {
        initTest(false);

        let integrationName: string;
        let secondIntegration: string;
        let thirdIntegration: string;

        test('Create standalone integration', async () => {
            logStep('Clicking WSO2 Integrator activity tab');
            const workbenchPage = page.page;
            const wso2IntegratorActivity = workbenchPage.locator(
                `#workbench\\.parts\\.activitybar a.action-label[aria-label="${BI_INTEGRATOR_LABEL}"]`
            ).first();
            await wso2IntegratorActivity.waitFor({ state: 'visible', timeout: 120000 });
            await wso2IntegratorActivity.click();

            logStep('Clicking Get Started button');
            const getStartedButton = workbenchPage.getByRole('button', { name: 'Get Started' }).first();
            await getStartedButton.waitFor({ timeout: 10000 });
            await getStartedButton.click();

            logStep('Waiting for Welcome webview');
            let welcomeWebView = await switchToIFrame('Welcome', workbenchPage);
            if (!welcomeWebView) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }
            await welcomeWebView.waitForLoadState();

            const createHeading = welcomeWebView.getByRole('heading', { name: 'Create New Integration' });
            if (await createHeading.isVisible({ timeout: 10000 }).catch(() => false)) {
                logStep('Clicking Create on Create New Integration card');
                await welcomeWebView.locator('h3').filter({ hasText: 'Create New Integration' })
                    .locator('..').getByRole('button', { name: 'Create' }).click();
                welcomeWebView = await switchToIFrame('Welcome', workbenchPage);
                if (!welcomeWebView) {
                    throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
                }
            }

            logStep('Filling integration create form');
            integrationName = `ProjOvIntA${Date.now()}`;
            const integrationInput = welcomeWebView.getByRole('textbox', { name: /Integration Name/i });
            await integrationInput.waitFor({ state: 'visible', timeout: 30000 });
            await integrationInput.fill(integrationName);

            const projectPathInput = welcomeWebView.locator('input#project-folder-selector-input');
            if (await projectPathInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                await projectPathInput.fill(dataFolder);
            }

            await welcomeWebView.getByRole('button', { name: 'Create Integration' }).click({ force: true });

            logStep('Waiting for PackageOverview to load');
            const biWebview = await switchToIFrame(BI_INTEGRATOR_LABEL, workbenchPage);
            if (!biWebview) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }
            await biWebview.getByText('Add Artifact').waitFor({ timeout: 120000 });
            logStep(`Created standalone integration: ${integrationName}`);
        });

        test('Convert to project by adding second integration', async () => {
            logStep('Opening Add Integration form via sidebar + button');
            const workbenchPage = page.page;

            const sideBar = workbenchPage.locator('#workbench\\.parts\\.sidebar');
            const isEmptyOrClosed = await sideBar.evaluate(el => el.classList.contains('empty')).catch(() => true);
            if (isEmptyOrClosed) {
                const activityTab = workbenchPage.locator(
                    `#workbench\\.parts\\.activitybar a.action-label[aria-label="${BI_INTEGRATOR_LABEL}"]`
                ).first();
                await activityTab.click();
                await workbenchPage.waitForTimeout(1000);
            }

            const addBtn = sideBar.getByRole('button', { name: 'Add Integration or Library' });
            await addBtn.waitFor({ state: 'visible', timeout: 30000 });
            await addBtn.click({ force: true });

            logStep('Filling second integration name in Convert form');
            secondIntegration = `ProjOvIntB${Date.now()}`;
            const frame = await switchToIFrame(BI_INTEGRATOR_LABEL, workbenchPage);
            if (!frame) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }
            await frame.getByRole('textbox', { name: /Integration Name/i }).waitFor({ timeout: 30000 });
            await frame.getByRole('textbox', { name: /Integration Name/i }).fill(secondIntegration);
            await frame.getByRole('button', { name: /Add Integration|Convert & Add/i }).click({ force: true });

            logStep('Waiting for second integration to appear in WorkspaceOverview');
            const frame2 = await switchToIFrame(BI_INTEGRATOR_LABEL, workbenchPage);
            if (!frame2) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }
            await frame2.getByText(secondIntegration, { exact: true }).waitFor({ timeout: 60000 });
            logStep(`Added second integration: ${secondIntegration}`);
        });

        test('Add third integration to project', async () => {
            logStep('Opening Add Integration form via sidebar + button');
            const workbenchPage = page.page;

            const sideBar = workbenchPage.locator('#workbench\\.parts\\.sidebar');
            const isEmptyOrClosed = await sideBar.evaluate(el => el.classList.contains('empty')).catch(() => true);
            if (isEmptyOrClosed) {
                const activityTab = workbenchPage.locator(
                    `#workbench\\.parts\\.activitybar a.action-label[aria-label="${BI_INTEGRATOR_LABEL}"]`
                ).first();
                await activityTab.click();
                await workbenchPage.waitForTimeout(1000);
            }

            const addBtn = sideBar.getByRole('button', { name: 'Add Integration or Library' });
            await addBtn.waitFor({ state: 'visible', timeout: 30000 });
            await addBtn.click({ force: true });

            logStep('Filling third integration name');
            thirdIntegration = `ProjOvIntC${Date.now()}`;
            const frame = await switchToIFrame(BI_INTEGRATOR_LABEL, workbenchPage);
            if (!frame) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }
            await frame.getByRole('textbox', { name: /Integration Name/i }).waitFor({ timeout: 30000 });
            await frame.getByRole('textbox', { name: /Integration Name/i }).fill(thirdIntegration);
            await frame.getByRole('button', { name: /Add Integration|Convert & Add/i }).click({ force: true });

            logStep('Waiting for third integration to appear');
            const frame2 = await switchToIFrame(BI_INTEGRATOR_LABEL, workbenchPage);
            if (!frame2) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }
            await frame2.getByText(thirdIntegration, { exact: true }).waitFor({ timeout: 60000 });
            logStep(`Added third integration: ${thirdIntegration}`);
        });

        test('List all integrations in WorkspaceOverview', async () => {
            logStep('Navigating to WorkspaceOverview via command palette');
            const workbenchPage = page.page;
            await workbenchPage.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+P' : 'Control+Shift+P');
            await workbenchPage.waitForTimeout(300);
            await workbenchPage.keyboard.type('BI.project-explorer.overview');
            await workbenchPage.keyboard.press('Enter');

            const frame = await switchToIFrame(BI_INTEGRATOR_LABEL, workbenchPage);
            if (!frame) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }

            logStep('Verifying all three integration cards are visible');
            await frame.getByText(integrationName, { exact: true }).waitFor({ timeout: 30000 });
            await frame.getByText(secondIntegration, { exact: true }).waitFor({ timeout: 10000 });
            await frame.getByText(thirdIntegration, { exact: true }).waitFor({ timeout: 10000 });
            logStep(`All three integrations listed: ${integrationName}, ${secondIntegration}, ${thirdIntegration}`);
        });

        test('Navigate into integration', async () => {
            logStep(`Clicking on integration card: ${secondIntegration}`);
            const workbenchPage = page.page;
            const frame = await switchToIFrame(BI_INTEGRATOR_LABEL, workbenchPage);
            if (!frame) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }
            await frame.getByText(secondIntegration, { exact: true }).click({ force: true });

            logStep('Waiting for PackageOverview (Add Artifact button)');
            const frame2 = await switchToIFrame(BI_INTEGRATOR_LABEL, workbenchPage);
            if (!frame2) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }
            await frame2.getByText('Add Artifact').waitFor({ timeout: 30000 });
            logStep(`Navigated into integration: ${secondIntegration}`);
        });

        test('Delete an integration', async () => {
            logStep('Navigating back to WorkspaceOverview via Open Overview button');
            const workbenchPage = page.page;

            const sideBar = workbenchPage.locator('#workbench\\.parts\\.sidebar');
            const isEmptyOrClosed = await sideBar.evaluate(el => el.classList.contains('empty')).catch(() => true);
            if (isEmptyOrClosed) {
                const activityTab = workbenchPage.locator(
                    `#workbench\\.parts\\.activitybar a.action-label[aria-label="${BI_INTEGRATOR_LABEL}"]`
                ).first();
                await activityTab.click();
                await workbenchPage.waitForTimeout(1000);
            }

            const openOverviewBtn = sideBar.getByRole('button', { name: 'Open Overview' });
            const openOverviewVisible = await openOverviewBtn.isVisible({ timeout: 5000 }).catch(() => false);
            if (openOverviewVisible) {
                await openOverviewBtn.click({ force: true });
            } else {
                await workbenchPage.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+P' : 'Control+Shift+P');
                await workbenchPage.waitForTimeout(500);
                await workbenchPage.keyboard.type('BI.project-explorer.overview');
                await workbenchPage.keyboard.press('Enter');
            }

            const frame = await switchToIFrame(BI_INTEGRATOR_LABEL, workbenchPage);
            if (!frame) {
                throw new Error(BI_WEBVIEW_NOT_FOUND_ERROR);
            }
            await frame.getByText(thirdIntegration, { exact: true }).waitFor({ timeout: 60000 });

            logStep(`Hovering card and clicking delete for: ${thirdIntegration}`);
            const thirdCard = frame.getByText(thirdIntegration, { exact: true })
                .locator('xpath=ancestor::div[.//button[@title="Delete integration"]][1]');
            await thirdCard.hover();

            const deleteBtn = thirdCard.locator('button[title="Delete integration"]');
            await deleteBtn.waitFor({ state: 'visible', timeout: 5000 });
            await deleteBtn.click({ force: true });

            logStep('Confirming delete in VS Code warning dialog');
            const confirmBtn = workbenchPage.getByRole('button', { name: 'Delete', exact: true });
            await confirmBtn.waitFor({ state: 'visible', timeout: 10000 });
            await confirmBtn.click();

            await frame.getByText(thirdIntegration, { exact: true }).waitFor({ state: 'hidden', timeout: 30000 });
            logStep(`Deleted integration: ${thirdIntegration}`);
        });
    });
}
