# Firebase data and security notes

The existing app uses `trips/{tripId}/members/{uid}` for live location. Keep the same model consistently.

Recommended Firestore rules must enforce:
- users can read/write only their own `users/{uid}` document;
- only authenticated users can read a trip if they are members or joining through a server-validated invite;
- only the trip owner can end/delete a trip;
- each member can write only `trips/{tripId}/members/{theirUid}`;
- members can read other member locations only while they belong to that active trip;
- clients cannot change owner ID, trip status, invite code or other users' membership fields.

The current repository's `firestore.rules` expects `ownerId` and `isActive`, but `TripService` writes `createdBy` and `status`. Reconcile this before deployment. The sample app code is not a substitute for reviewing and deploying production security rules.

For invite-code uniqueness, use a trusted Cloud Function with a transaction and an `inviteCodes/{code}` document. A client-generated random code can collide and should not be treated as a security boundary.
