{
  // Click the second integration card to navigate into its PackageOverview.
  const state = JSON.parse(fs.readFileSync(path.join(sessionDir, 'state.json'), 'utf8'));

  const frame = await getBIWebview();
  await frame.getByText(state.secondIntegration, { exact: true }).click({ force: true });

  await waitForText('Add Artifact', 30000);
  console.log(`navigated into integration: ${state.secondIntegration}`);
}
