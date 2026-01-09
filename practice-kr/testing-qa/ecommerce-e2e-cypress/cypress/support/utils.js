export function uniqueEmail(prefix = 'user') {
  const stamp = `${Date.now()}-${Cypress._.random(1000, 9999)}`;
  return `${prefix}.${stamp}@example.com`;
}
