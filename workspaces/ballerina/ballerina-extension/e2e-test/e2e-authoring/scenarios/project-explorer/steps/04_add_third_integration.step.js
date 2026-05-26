{
  // Now in BALLERINA_WORKSPACE mode; the + button opens "Add New Integration" form.
  const state = JSON.parse(fs.readFileSync(path.join(sessionDir, 'state.json'), 'utf8'));
  const thirdIntegration = `ProjOvIntC${Date.now()}`;

  await ensureWorkbench();

  const sideBar = window.locator('#workbench\\.parts\\.sidebar');
  const isEmptyOrClosed = await sideBar.evaluate(el => el.classList.contains('empty')).catch(() => true);
  if (isEmptyOrClosed) {
    await openIntegratorActivity();
    await window.waitForTimeout(1000);
  }

  const addBtn = sideBar.getByRole('button', { name: 'Add Integration or Library' });
  await addBtn.waitFor({ state: 'visible', timeout: 30000 });
  await addBtn.click({ force: true });

  const frame = await getBIWebview();
  await frame.getByRole('textbox', { name: /Integration Name/i }).waitFor({ timeout: 30000 });

  await frame.getByRole('textbox', { name: /Integration Name/i }).fill(thirdIntegration);
  await frame.getByRole('button', { name: /Add Integration|Convert & Add/i }).click({ force: true });

  await waitForText(thirdIntegration, 60000);

  state.thirdIntegration = thirdIntegration;
  fs.writeFileSync(path.join(sessionDir, 'state.json'), JSON.stringify(state, null, 2));
  console.log(`added third integration: ${thirdIntegration}`);
}
