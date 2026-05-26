{
  // Click the "+" (Add Integration or Library) button in the project explorer title bar.
  // In SINGLE_PROJECT mode this opens "Convert to Project & Add New Integration" form.
  const state = JSON.parse(fs.readFileSync(path.join(sessionDir, 'state.json'), 'utf8'));
  const secondIntegration = `ProjOvIntB${Date.now()}`;

  await ensureWorkbench();

  const sideBar = window.locator('#workbench\\.parts\\.sidebar');
  const isEmptyOrClosed = await sideBar.evaluate(el => el.classList.contains('empty')).catch(() => true);
  if (isEmptyOrClosed) {
    await openIntegratorActivity();
    await window.waitForTimeout(1000);
  }

  // The button's accessible name is "Add Integration or Library" (aria-label on the toolbar button)
  const addBtn = sideBar.getByRole('button', { name: 'Add Integration or Library' });
  await addBtn.waitFor({ state: 'visible', timeout: 30000 });
  await addBtn.click({ force: true });

  console.log('clicked + button in sidebar');

  // AddProjectForm opens; in SINGLE_PROJECT mode shows "Convert to Project & Add New Integration"
  const frame = await getBIWebview();
  await frame.getByRole('textbox', { name: /Integration Name/i }).waitFor({ timeout: 30000 });

  await frame.getByRole('textbox', { name: /Integration Name/i }).fill(secondIntegration);
  await frame.getByRole('button', { name: /Add Integration|Convert & Add/i }).click({ force: true });

  await waitForText(secondIntegration, 60000);

  state.secondIntegration = secondIntegration;
  fs.writeFileSync(path.join(sessionDir, 'state.json'), JSON.stringify(state, null, 2));
  console.log(`added second integration: ${secondIntegration}`);
}
