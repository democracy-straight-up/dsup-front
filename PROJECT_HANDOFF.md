# CYSVP Project Handoff

Updated: 2026-09-16 UTC

This file preserves the Claim Your Seat Voting Portal's current checkpoint, recovered design decisions, and next steps so work can continue across chats. It is a partial reconstruction, not a complete record of the earlier conversation. Treat the current repository as authoritative for implementation and the explicitly identified decisions below as requirements or intended design.

## Start here

1. Read this file before proposing the next feature. Check current Git status, branches, and PR state; the checkpoint below is dated.
2. Preserve the recovery design and Circle lifecycle decisions below. Do not assume signup integration is the immediate next task.
3. Update this file at completed PRs and before switching chats. Commit and push it so a new chat or developer can retrieve it.

## Project and working environment

The Democracy, Straight-Up! Project is building CYSVP to support its Directly-connected Legislature, including Circles, membership, delegation, credentials, and voting. The recent work concerns authorization and browser encryption of private Circle credentials.

| Item | Known value |
| --- | --- |
| Frontend repository | https://github.com/democracy-straight-up/dsup-front |
| Frontend local folder | C:\Users\dahli\CYSVP\dsup-front |
| Backend local folder | C:\Users\dahli\CYSVP\claim-your-seat |
| Frontend stack inspected | React 18, react-scripts 5.0.1, Node 24, libsodium-wrappers |
| Backend | Django; recent code in api, vote, and live |
| Backend Python | .venv\Scripts\python within the backend folder |
| User environment | Windows 11, Command Prompt, VS Code, Chrome |

The backend repository URL, current branch, and complete current API contract have not yet been verified in this resumed session.

## Working preferences

- Give small, concrete steps and exact insertion or replacement locations when asking Dahlia to edit code.
- Join consecutive Command Prompt commands with `&&` so a failure stops the sequence.
- Save files intended for upload to `%USERPROFILE%\Downloads`.
- Follow focused test-driven changes: demonstrate the intended failure, implement, then verify. Distinguish test-environment failures from feature failures.
- Review the actual GitHub diff before merging. The established workflow is for Dahlia to merge after review.
- Avoid unrelated edits and broad formatting changes. An earlier global whitespace cleanup caused excessive changes in api/views.py.
- Keep secrets, credentials, private keys, and personal account data out of this public repository and this handoff.

## Verified checkpoint

Frontend PR [#117 Add browser account key vault](https://github.com/democracy-straight-up/dsup-front/pull/117) is merged. GitHub reported merged_at 2026-09-12T23:08:15Z; this was verified on 2026-09-13.

The reviewed branch was `account-key-vault`, with these commits:

- `ab7b779`: Add browser account key vault.
- `c5aecf8595a47e869a367f5558de6aa0bdc0edd5`: Fix vault key creation race with atomic IndexedDB transaction.

The race fix was pushed successfully. PR #117 changed only package.json, src/keyVault.js, and src/keyVault.test.js. It introduced core-js and fake-indexeddb as test dependencies.

Local main was synchronized to origin/main at 319ae6d after PR #117 merged. The documentation branch docs/project-handoff was created from that commit, and PROJECT_HANDOFF.md was copied into the repository.

Validation for the reviewed code:

- All 3 frontend suites passed: 20 tests total.
- Production build succeeded with warnings.
- No PR-triggered GitHub Actions runs were returned by the queried workflow tool. This is not a claim that CI tests passed.
- A recovered manual Chrome probe stored and retrieved a real non-exportable CryptoKey through IndexedDB. Output showed `extractable: false`. It did not demonstrate a full browser reload or cross-tab workflow.

## Implemented frontend pieces

### Browser encryption

src/crypto.js provides keypair generation, public-key encryption/decryption, Circle credential encryption/decryption, and Circle-private-key wrapping/unwrapping for members. The algorithm identifier is `libsodium-sealed-box-v1`.

Earlier merged frontend work includes #115 (crypto foundation), #116 (crypto hardening), #114 (Node 24), #112 and #113 (voter attestation), and #104 through #111 (login/signup repairs).

### Account vault

src/keyVault.js uses a non-exportable AES-256-GCM CryptoKey persisted in IndexedDB. Account private keys are encrypted using a random 12-byte IV and stored as base64 ciphertext and IV, indexed by account ID.

The high-level functions are `saveAccountPrivateKey(accountId, privateKey)` and `loadAccountPrivateKey(accountId)`. Loading returns null when the account record or vault key is absent; it does not create a replacement vault key to try to decrypt existing ciphertext.

Concurrent first use is handled by checking for and, if absent, writing the key in the same readwrite transaction. The regression test confirms that both callers' keys and the stored key can decrypt the same ciphertext.

Vault test shims are isolated in src/keyVault.test.js. The CryptoKey clone workaround preserves object identity in fake IndexedDB and does not simulate real browser serialization. Moving these shims into shared setupTests.js previously broke libsodium tests.

### Signup integration status

The supplied current Claim-Your-Seat.jsx sends ordinary registration fields and eligibility_attested to /api/register/. It does not generate Account keys or call the vault. Its existing test file covers password generation only. Passing these tests does not establish end-to-end registration or recovery.

## Recovered design decisions

### Private credentials and keys

The intended design keeps the Account private key local to the browser/device, without sending it to Django or storing it in localStorage. The server may hold the Account public key. An Account private key opens that member's envelope containing a Circle private key; the Circle private key decrypts private Circle credentials such as legal name and address.

This is the intended architecture, not a claim that every existing registration/backend flow already meets it. Login authentication and cryptographic key possession are separate concerns.

### Recovery without another user-managed secret

Dahlia rejected requiring another recovery code or phrase to write down. The recovered direction is:

1. Lost local Account key: create a replacement Account keypair and register the new public key after appropriate account authentication.
2. Another full Circle member with the surviving Circle key re-encrypts that key to the returning member's new Account public key.
3. If no usable Circle key survives, create a new Circle keypair and have affected members/candidates re-enter or resubmit credentials as necessary. Old ciphertext cannot be decrypted merely by generating a new key.

The exact rotation authorization, multi-device behavior, and replacement protocol remain implementation/design work. Do not silently regenerate keys on every login or declare recovery implemented.

### Revised envelope authorization

Earlier backend work limited creating another member's envelope and retrieving their Account public key to the delegate. The later recovered design revises this because the delegate may be the person who loses access:

Any full Circle member possessing the current Circle key should be able to create an envelope for another existing full member of that Circle, never for a candidate or outsider.

The server should select the applicable active Circle key and recipient Account key, rather than trust browser-supplied key identities. Existing membership checks remain essential. How possession and freshness are enforced must be reviewed against the actual API before implementation.

This is a planned backend authorization change, not a verified current capability.

### Circle lifecycle

Dahlia specified that a Circle has one remaining full member at creation (the founder is First Delegate) or when preparing for dissolution (the First Delegate must be the sole remaining member). Candidates do not provide cryptographic redundancy because they do not have the Circle private key.

- Before a second full member has a usable envelope, founder key loss may require re-keying and candidate credential resubmission.
- Dissolution is final. Do not introduce a revive-dissolved-Circle state.
- A subsequent group creates a new Circle number/code, invitation key, keypair, and memberships.
- Dissolution should depend on authorization, not on successfully decrypting credentials.

## Current priority: working prototype

As of 2026-09-16, Dahlia has prioritized a demonstrable working
prototype: React screens with enough real backend functionality
to form Circles and Links and demonstrate member lists,
Housekeeping, Voter Pages, advisement, and especially custom
bill ordering.

Broader scaling and recovery hardening are deferred. Preserve
existing protections and the recovery design decisions above.

Recommended implementation sequence:
1. Repair Circle joining, authenticated live connections, and
   Housekeeping updates.
2. Make Voter Pages dependable and implement saved custom bill
   ordering. Clarify whether ordering is personal, published
   by delegates, or both before choosing its data model.
3. Correct advisement role wiring and delegation-chain lookup;
   verify voting and tally updates.
4. Complete First Link and Second Link formation and membership
   flows.
5. Rehearse the complete journey across separate accounts,
   including reloads and failed-request recovery.

The source review identified missing Circle WebSocket tokens,
broken reconnect logic, and Second Delegate/MoDA advisement
tabs using the First Delegate type. These findings have not
yet been repaired or verified in a live demonstration.

## Paused recovery checkpoint

Backend repository:
https://github.com/democracy-straight-up/claim-your-seat

Branch: circle-recovery-auth
Checkpoint commit: 9154fe0
Pushed to origin: 2026-09-16
Status: unfinished; leave unmerged.

The checkpoint changes api/tests.py to expect an ordinary full
Circle member to retrieve another full member's Account public
key within the same Circle.

Last confirmed focused test result: five tests ran; four passed,
and the revised test failed with 404 instead of the expected 200.
No passing result for the proposed view fix has been confirmed.

To resume:
1. Inspect the saved branch and its diff against current main.
2. Review CircleMemberAccountKeyView in api/views.py.
3. Allow the intended full-member access while retaining
   same-Circle and full-membership restrictions.
4. Rerun CircleMemberAccountKeyAPITests, then the API suite.
5. Address Circle-key envelope authorization separately.

Keep prototype implementation on separate branches from main.
The recovery and Circle lifecycle decisions above remain valid.

## Evidence and limits

Sources used in this reconstruction:

- GitHub PR #117 metadata and full changed-file patches.
- Dahlia's git log, push output, test results, and production build output in the resumed chat.
- vault-review.txt and signup-review.zip, containing current frontend files/diffs.
- Github Repo Access Chat Very Bad Paste Job.txt: fragmented earlier conversation, including backend credential and envelope work.
- GitHub Repo Access.docx: incomplete, out-of-order export recovering the later no-code recovery model, lifecycle rules, browser probe, and planned backend authorization revision.

The partial backend transcript mentions Circle action-target hardening in PR #160, CircleCredentialAPITests, CircleKeyEnvelopeAPITests, member Account-key retrieval work, and a historical 24-test API pass. These are historical evidence, not verification of today's backend state. Attachment filenames in the transcript do not supply their contents.

Do not repeat superseded advice from the exports: recovery phrases were rejected, and delegate-only recovery was slated for revision. Preserve uncertainty when older discussion is absent.

## Maintenance and next-chat instructions

At each milestone, update the dated checkpoint, test evidence, PR links, unresolved questions, and exact next action. Keep lasting decisions even when tasks are completed; mark superseded decisions explicitly. If design history grows, move it into a separate architecture document and link it here.

Suggested opening instruction for a new chat: Read PROJECT_HANDOFF.md in democracy-straight-up/dsup-front, verify current repository and PR state, and continue from the recorded next step using small Windows Command Prompt steps.

This handoff is maintained in the frontend repository. Update and push it at completed milestones and before moving to a new chat.
