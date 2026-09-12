export async function generateVaultEncryptionKey() {
  return globalThis.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}
const DB_NAME = "cysvp-key-vault";
const DB_VERSION = 1;
const STORE_NAME = "keys";
const VAULT_KEY_ID = "vault-encryption-key";
const ACCOUNT_PRIVATE_KEY_ID = "account-private-key";

function openKeyVaultDatabase() {
  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVaultEncryptionKey(vaultKey) {
  const db = await openKeyVaultDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(
      vaultKey,
      VAULT_KEY_ID
    );

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function loadVaultEncryptionKey() {
  const db = await openKeyVaultDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction
      .objectStore(STORE_NAME)
      .get(VAULT_KEY_ID);

    request.onsuccess = () => {
      db.close();
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}
export async function getOrCreateVaultEncryptionKey() {
  const existingVaultKey = await loadVaultEncryptionKey();

  if (existingVaultKey) {
    return existingVaultKey;
  }

  const candidateVaultKey = await generateVaultEncryptionKey();
  const db = await openKeyVaultDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(VAULT_KEY_ID);

    let vaultKey;

    request.onsuccess = () => {
      if (request.result) {
        vaultKey = request.result;
      } else {
        vaultKey = candidateVaultKey;
        store.put(candidateVaultKey, VAULT_KEY_ID);
      }
    };

    transaction.oncomplete = () => {
      db.close();
      resolve(vaultKey);
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}
export async function saveEncryptedAccountPrivateKey(
  accountId,
  encryptedPrivateKey
) {
  const db = await openKeyVaultDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(
      encryptedPrivateKey,
      `${ACCOUNT_PRIVATE_KEY_ID}:${accountId}`
    );

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function loadEncryptedAccountPrivateKey(accountId) {
  const db = await openKeyVaultDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction
      .objectStore(STORE_NAME)
      .get(`${ACCOUNT_PRIVATE_KEY_ID}:${accountId}`);

    request.onsuccess = () => {
      db.close();
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}
function bytesToBase64(bytes) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return globalThis.btoa(binary);
}

function base64ToBytes(base64) {
  const binary = globalThis.atob(base64);

  return Uint8Array.from(
    binary,
    (character) => character.charCodeAt(0)
  );
}
export async function encryptAccountPrivateKey(
  accountPrivateKey,
  vaultKey
) {
  const iv = globalThis.crypto.getRandomValues(
    new Uint8Array(12)
  );

  const plaintext = new TextEncoder().encode(
    accountPrivateKey
  );

  const ciphertext = await globalThis.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    vaultKey,
    plaintext
  );

  return {
    ciphertext: bytesToBase64(
      new Uint8Array(ciphertext)
    ),
    iv: bytesToBase64(iv),
  };
}

export async function decryptAccountPrivateKey(
  encrypted,
  vaultKey
) {
  const ciphertext = base64ToBytes(
    encrypted.ciphertext
  );

  const iv = base64ToBytes(encrypted.iv);

  const plaintext = await globalThis.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    vaultKey,
    ciphertext
  );

  return new TextDecoder().decode(plaintext);
}
export async function saveAccountPrivateKey(
  accountId,
  accountPrivateKey
) {
  const vaultKey = await getOrCreateVaultEncryptionKey();

  const encryptedPrivateKey = await encryptAccountPrivateKey(
    accountPrivateKey,
    vaultKey
  );

  await saveEncryptedAccountPrivateKey(
    accountId,
    encryptedPrivateKey
  );
}

export async function loadAccountPrivateKey(accountId) {
  const encryptedPrivateKey =
    await loadEncryptedAccountPrivateKey(accountId);

  if (!encryptedPrivateKey) {
    return null;
  }

  const vaultKey = await loadVaultEncryptionKey();

  if (!vaultKey) {
    return null;
  }

  return decryptAccountPrivateKey(
    encryptedPrivateKey,
    vaultKey
  );
}

