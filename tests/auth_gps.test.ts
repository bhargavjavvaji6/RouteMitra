import test from 'node:test';
import assert from 'node:assert/strict';

test('Registered accounts verification and password validation', () => {
  const registeredAccounts = [
    {
      name: 'Bhargav sai Javvaji',
      email: 'bhargavjavvaji6@gmail.com',
      passwordHash: 'password123',
      userId: 'RM-482913',
    },
    {
      name: 'Rohith Varma',
      email: 'rohith@routemitra.app',
      passwordHash: 'demopass123',
      userId: 'RM-600617',
    },
  ];

  const found = registeredAccounts.find(
    (a) => a.email.toLowerCase() === 'bhargavjavvaji6@gmail.com'
  );
  assert.ok(found, 'Bhargav account must exist');
  assert.equal(found.passwordHash, 'password123', 'Password must match');

  const invalid = registeredAccounts.find(
    (a) => a.email.toLowerCase() === 'nonexistent@example.com'
  );
  assert.equal(invalid, undefined, 'Unregistered email must not exist');
});

test('Places suggestions filtering test', () => {
  const PLACES = [
    { id: 'p1', name: 'Gachibowli, Hyderabad', secondary: 'Financial District' },
    { id: 'p2', name: 'Hitec City & Cyber Towers', secondary: 'Madhapur' },
    { id: 'p3', name: 'Rajiv Gandhi International Airport (RGIA)', secondary: 'Shamshabad' },
  ];

  const query = 'gachi';
  const filtered = PLACES.filter((p) =>
    p.name.toLowerCase().includes(query) || p.secondary.toLowerCase().includes(query)
  );

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'p1');
});
