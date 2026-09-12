import {
  generateKeyPair,
  encryptForPublicKey,
  decryptWithPrivateKey,
  encryptCircleCredential,
  decryptCircleCredential,
  wrapCirclePrivateKey,
  unwrapCirclePrivateKey,
} from "./crypto";

test("generates a public and private key pair", async () => {
  const keyPair = await generateKeyPair();

  expect(keyPair.publicKey).toBeTruthy();
  expect(keyPair.privateKey).toBeTruthy();
});
test("encrypts and decrypts with the matching key pair", async () => {
  const keyPair = await generateKeyPair();
  const plaintext = "Circle private key";

  const ciphertext = await encryptForPublicKey(
    plaintext,
    keyPair.publicKey
  );

  expect(ciphertext).toBeTruthy();
  expect(ciphertext).not.toContain(plaintext);

  const decrypted = await decryptWithPrivateKey(
    ciphertext,
    keyPair.publicKey,
    keyPair.privateKey
  );

  expect(decrypted).toBe(plaintext);
});
test("cannot decrypt with a different key pair", async () => {
  const alice = await generateKeyPair();
  const bob = await generateKeyPair();

  const ciphertext = await encryptForPublicKey(
    "Circle private key",
    alice.publicKey
  );

  await expect(
    decryptWithPrivateKey(
      ciphertext,
      bob.publicKey,
      bob.privateKey
    )
  ).rejects.toThrow();
});
test("encrypts and decrypts a Circle credential", async () => {
  const circleKeys = await generateKeyPair();

  const credential = {
    legalName: "Test Voter",
    address: "123 Main Street",
  };

  const encrypted = await encryptCircleCredential(
    credential,
    circleKeys.publicKey
  );

  expect(encrypted).toBeTruthy();
  expect(encrypted).not.toContain("Test Voter");
  expect(encrypted).not.toContain("123 Main Street");

  const decrypted = await decryptCircleCredential(
    encrypted,
    circleKeys.publicKey,
    circleKeys.privateKey
  );

  expect(decrypted).toEqual(credential);
});
test("wraps and unwraps a Circle private key for a member", async () => {
  const circleKeys = await generateKeyPair();
  const memberKeys = await generateKeyPair();

  const wrappedKey = await wrapCirclePrivateKey(
    circleKeys.privateKey,
    memberKeys.publicKey
  );

  expect(wrappedKey).toBeTruthy();
  expect(wrappedKey).not.toContain(circleKeys.privateKey);

  const unwrappedKey = await unwrapCirclePrivateKey(
    wrappedKey,
    memberKeys.publicKey,
    memberKeys.privateKey
  );

  expect(unwrappedKey).toBe(circleKeys.privateKey);
});
test("member can decrypt a Circle credential through their key envelope", async () => {
  const circleKeys = await generateKeyPair();
  const memberKeys = await generateKeyPair();

  const credential = {
    legalName: "Test Voter",
    address: "123 Main Street",
  };

  const encryptedCredential = await encryptCircleCredential(
    credential,
    circleKeys.publicKey
  );

  const wrappedCirclePrivateKey = await wrapCirclePrivateKey(
    circleKeys.privateKey,
    memberKeys.publicKey
  );

  const recoveredCirclePrivateKey = await unwrapCirclePrivateKey(
    wrappedCirclePrivateKey,
    memberKeys.publicKey,
    memberKeys.privateKey
  );

  const decryptedCredential = await decryptCircleCredential(
    encryptedCredential,
    circleKeys.publicKey,
    recoveredCirclePrivateKey
  );

  expect(decryptedCredential).toEqual(credential);
});
