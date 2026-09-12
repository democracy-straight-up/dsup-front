import {
  generateVaultEncryptionKey,
  saveVaultEncryptionKey,
  loadVaultEncryptionKey,
  encryptAccountPrivateKey,
  decryptAccountPrivateKey,
  saveEncryptedAccountPrivateKey,
  loadEncryptedAccountPrivateKey,
  getOrCreateVaultEncryptionKey,
  saveAccountPrivateKey,
  loadAccountPrivateKey,
} from "./keyVault";
const { webcrypto } = require("crypto");
const { TextEncoder, TextDecoder } = require("util");

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  configurable: true,
});

require("core-js/stable/structured-clone");

const structuredClonePolyfill = globalThis.structuredClone;

globalThis.structuredClone = (value, options) => {
  if (value?.constructor?.name === "CryptoKey") {
    return value;
  }

  return structuredClonePolyfill(value, options);
};

require("fake-indexeddb/auto");
beforeEach(async () => {
  await new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.deleteDatabase(
      "cysvp-key-vault"
    );

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(
      new Error("Key vault database deletion was blocked")
    );
  });
});
test("key vault browser APIs are available", () => {
  expect(globalThis.crypto?.subtle).toBeTruthy();
  expect(globalThis.indexedDB).toBeTruthy();
});
test("generates a non-exportable AES-GCM vault key", async () => {
  const vaultKey = await generateVaultEncryptionKey();

  expect(vaultKey.algorithm.name).toBe("AES-GCM");
  expect(vaultKey.algorithm.length).toBe(256);
  expect(vaultKey.extractable).toBe(false);
  expect(vaultKey.usages).toEqual(["encrypt", "decrypt"]);

  await expect(
    globalThis.crypto.subtle.exportKey("raw", vaultKey)
  ).rejects.toThrow();
});
test("stores and retrieves the vault encryption key", async () => {
  const vaultKey = await generateVaultEncryptionKey();

  await saveVaultEncryptionKey(vaultKey);

  const storedKey = await loadVaultEncryptionKey();

  expect(storedKey).toBeTruthy();
  expect(storedKey.algorithm.name).toBe("AES-GCM");
  expect(storedKey.extractable).toBe(false);
  expect(storedKey.usages).toEqual(["encrypt", "decrypt"]);
});
test("encrypts and decrypts an Account private key", async () => {
  const vaultKey = await generateVaultEncryptionKey();
  const accountPrivateKey = "test-account-private-key";

  const encrypted = await encryptAccountPrivateKey(
    accountPrivateKey,
    vaultKey
  );

  expect(encrypted.ciphertext).toBeTruthy();
  expect(encrypted.iv).toBeTruthy();
  expect(encrypted.ciphertext).not.toContain(accountPrivateKey);

  const decrypted = await decryptAccountPrivateKey(
    encrypted,
    vaultKey
  );

  expect(decrypted).toBe(accountPrivateKey);
});
test("stores only the encrypted Account private key", async () => {
  const vaultKey = await generateVaultEncryptionKey();
  const accountPrivateKey = "test-account-private-key";

  const encrypted = await encryptAccountPrivateKey(
    accountPrivateKey,
    vaultKey
  );

    await saveEncryptedAccountPrivateKey(
    "account-1",
    encrypted
    );

    const stored = await loadEncryptedAccountPrivateKey(
    "account-1"
    );

  expect(stored).toEqual(encrypted);
  expect(stored.ciphertext).not.toContain(accountPrivateKey);

  const decrypted = await decryptAccountPrivateKey(
    stored,
    vaultKey
  );

  expect(decrypted).toBe(accountPrivateKey);
});
test("reuses the existing vault encryption key", async () => {
  const firstVaultKey = await getOrCreateVaultEncryptionKey();

  const encrypted = await encryptAccountPrivateKey(
    "test-account-private-key",
    firstVaultKey
  );

  const secondVaultKey = await getOrCreateVaultEncryptionKey();

  const decrypted = await decryptAccountPrivateKey(
    encrypted,
    secondVaultKey
  );

  expect(decrypted).toBe("test-account-private-key");
});
test("keeps encrypted Account private keys separate by account", async () => {
  const vaultKey = await generateVaultEncryptionKey();

  const firstEncrypted = await encryptAccountPrivateKey(
    "first-private-key",
    vaultKey
  );

  const secondEncrypted = await encryptAccountPrivateKey(
    "second-private-key",
    vaultKey
  );

  await saveEncryptedAccountPrivateKey(
    "account-1",
    firstEncrypted
  );

  await saveEncryptedAccountPrivateKey(
    "account-2",
    secondEncrypted
  );

  const firstStored = await loadEncryptedAccountPrivateKey(
    "account-1"
  );

  const secondStored = await loadEncryptedAccountPrivateKey(
    "account-2"
  );

  expect(
    await decryptAccountPrivateKey(firstStored, vaultKey)
  ).toBe("first-private-key");

  expect(
    await decryptAccountPrivateKey(secondStored, vaultKey)
  ).toBe("second-private-key");
});
test("saves and loads an Account private key through the vault", async () => {
  await saveAccountPrivateKey(
    "account-1",
    "test-account-private-key"
  );

  const privateKey = await loadAccountPrivateKey(
    "account-1"
  );

  expect(privateKey).toBe("test-account-private-key");
});
test("rejects a tampered encrypted Account private key", async () => {
  const vaultKey = await generateVaultEncryptionKey();

  const encrypted = await encryptAccountPrivateKey(
    "test-account-private-key",
    vaultKey
  );

  const tampered = {
    ...encrypted,
    ciphertext:
      (encrypted.ciphertext[0] === "A" ? "B" : "A") +
      encrypted.ciphertext.slice(1),
  };

  await expect(
    decryptAccountPrivateKey(tampered, vaultKey)
  ).rejects.toThrow();
});
test("concurrent first use shares one vault encryption key", async () => {
  const [firstVaultKey, secondVaultKey] = await Promise.all([
    getOrCreateVaultEncryptionKey(),
    getOrCreateVaultEncryptionKey(),
  ]);

  const encrypted = await encryptAccountPrivateKey(
    "test-account-private-key",
    firstVaultKey
  );

  await expect(
    decryptAccountPrivateKey(encrypted, secondVaultKey)
  ).resolves.toBe("test-account-private-key");

  const storedVaultKey = await loadVaultEncryptionKey();

  await expect(
    decryptAccountPrivateKey(encrypted, storedVaultKey)
  ).resolves.toBe("test-account-private-key");
});