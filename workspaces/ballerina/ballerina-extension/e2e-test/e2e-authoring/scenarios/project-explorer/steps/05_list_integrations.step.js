{
  // Navigate to WorkspaceOverview and verify all three integration cards are visible.
  const state = JSON.parse(fs.readFileSync(path.join(sessionDir, 'state.json'), 'utf8'));

  await ensureWorkbench();
  await window.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+P' : 'Control+Shift+P');
  await window.waitForTimeout(300);
  await window.keyboard.type('BI.project-explorer.overview');
  await window.keyboard.press('Enter');

  const frame = await getBIWebview();
  await frame.getByText(state.integrationName, { exact: true }).waitFor({ timeout: 30000 });
  await frame.getByText(state.secondIntegration, { exact: true }).waitFor({ timeout: 10000 });
  await frame.getByText(state.thirdIntegration, { exact: true }).waitFor({ timeout: 10000 });

  console.log(`all three integrations listed: ${state.integrationName}, ${state.secondIntegration}, ${state.thirdIntegration}`);
}
