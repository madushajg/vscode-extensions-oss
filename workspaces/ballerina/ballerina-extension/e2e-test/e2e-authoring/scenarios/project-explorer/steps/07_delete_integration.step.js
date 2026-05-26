{
  const state = JSON.parse(fs.readFileSync(path.join(sessionDir, 'state.json'), 'utf8'));

  await ensureWorkbench();

  // Ensure sidebar is open
  const sideBar = window.locator('#workbench\\.parts\\.sidebar');
  const isEmptyOrClosed = await sideBar.evaluate(el => el.classList.contains('empty')).catch(() => true);
  if (isEmptyOrClosed) {
    await openIntegratorActivity();
    await window.waitForTimeout(1000);
  }

  // Navigate back to WorkspaceOverview
  const openOverviewBtn = sideBar.getByRole('button', { name: 'Open Overview' });
  const openOverviewVisible = await openOverviewBtn.isVisible({ timeout: 5000 }).catch(() => false);
  if (openOverviewVisible) {
    await openOverviewBtn.click({ force: true });
  } else {
    await window.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+P' : 'Control+Shift+P');
    await window.waitForTimeout(500);
    await window.keyboard.type('BI.project-explorer.overview');
    await window.keyboard.press('Enter');
  }

  const frame = await getBIWebview();
  await frame.getByText(state.thirdIntegration, { exact: true }).waitFor({ timeout: 60000 });

  // Find the card for thirdIntegration, hover it, then click its delete button
  const thirdCard = frame.getByText(state.thirdIntegration, { exact: true })
    .locator('xpath=ancestor::div[.//button[@title="Delete integration"]][1]');
  await thirdCard.hover();

  const deleteBtn = thirdCard.locator('button[title="Delete integration"]');
  await deleteBtn.waitFor({ state: 'visible', timeout: 5000 });
  await deleteBtn.click({ force: true });

  // Confirm the VS Code warning dialog: "Delete Integration '...'?"
  const confirmBtn = window.getByRole('button', { name: 'Delete', exact: true });
  await confirmBtn.waitFor({ state: 'visible', timeout: 10000 });
  await confirmBtn.click();

  await frame.getByText(state.thirdIntegration, { exact: true }).waitFor({ state: 'hidden', timeout: 30000 });
  console.log(`deleted integration: ${state.thirdIntegration}`);
}
