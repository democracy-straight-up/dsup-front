import sodium from "libsodium-wrappers";

export async function generateKeyPair() {
  await sodium.ready;

  const keyPair = sodium.crypto_box_keypair();

  return {
    publicKey: sodium.to_base64(keyPair.publicKey),
    privateKey: sodium.to_base64(keyPair.privateKey),
  };
}

export async function encryptForPublicKey(plaintext, publicKey) {
  await sodium.ready;

  const message = sodium.from_string(plaintext);
  const publicKeyBytes = sodium.from_base64(publicKey);

  const ciphertext = sodium.crypto_box_seal(
    message,
    publicKeyBytes
  );

  return sodium.to_base64(ciphertext);
}

export async function decryptWithPrivateKey(
  ciphertext,
  publicKey,
  privateKey
) {
  await sodium.ready;

  const ciphertextBytes = sodium.from_base64(ciphertext);
  const publicKeyBytes = sodium.from_base64(publicKey);
  const privateKeyBytes = sodium.from_base64(privateKey);

  const plaintext = sodium.crypto_box_seal_open(
    ciphertextBytes,
    publicKeyBytes,
    privateKeyBytes
  );

  return sodium.to_string(plaintext);
}
export async function encryptCircleCredential(
  credential,
  circlePublicKey
) {
  return encryptForPublicKey(
    JSON.stringify(credential),
    circlePublicKey
  );
}

export async function decryptCircleCredential(
  ciphertext,
  circlePublicKey,
  circlePrivateKey
) {
  const plaintext = await decryptWithPrivateKey(
    ciphertext,
    circlePublicKey,
    circlePrivateKey
  );

  return JSON.parse(plaintext);
}
export async function wrapCirclePrivateKey(
  circlePrivateKey,
  memberPublicKey
) {
  return encryptForPublicKey(
    circlePrivateKey,
    memberPublicKey
  );
}

export async function unwrapCirclePrivateKey(
  wrappedKey,
  memberPublicKey,
  memberPrivateKey
) {
  return decryptWithPrivateKey(
    wrappedKey,
    memberPublicKey,
    memberPrivateKey
  );
}
