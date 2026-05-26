{
  const suffix = Date.now();
  const integrationName = `ProjOvIntA${suffix}`;

  await openIntegratorActivity();

  const sideBar = window.locator('#workbench\\.parts\\.sidebar');
  const getStarted = sideBar.getByRole('button', { name: 'Get Started' }).first();
  await getStarted.waitFor({ state: 'visible', timeout: 120000 });
  await getStarted.click();

  // The Welcome form may open directly or need a "Create" click first
  let frame = await waitForGuest('Welcome', 60000).catch(() => waitForGuest(BI_INTEGRATOR_LABEL, 60000));
  const createHeading = frame.getByRole('heading', { name: 'Create New Integration' });
  if (await createHeading.isVisible({ timeout: 10000 }).catch(() => false)) {
    await frame.getByRole('button', { name: 'Create' }).first().click();
    frame = await waitForGuest('Welcome', 30000).catch(() => waitForGuest(BI_INTEGRATOR_LABEL, 30000));
  }

  // Fill Integration Name only (standalone — no Project Name)
  const integrationInput = frame.getByRole('textbox', { name: /Integration Name/i });
  await integrationInput.waitFor({ state: 'visible', timeout: 30000 });
  await integrationInput.fill(integrationName);

  const pathInput = frame.getByRole('textbox', { name: /Select Path/i })
    .or(frame.locator('input#project-folder-selector-input'));
  if (await pathInput.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    await pathInput.first().fill(dataFolder);
  }

  await frame.getByRole('button', { name: 'Create Integration' }).click({ force: true });

  // Wait for PackageOverview of the standalone integration
  await waitForText('Add Artifact', 120000);

  const state = { integrationName };
  fs.writeFileSync(path.join(sessionDir, 'state.json'), JSON.stringify(state, null, 2));
  console.log(`created standalone integration: ${integrationName}`);
}
