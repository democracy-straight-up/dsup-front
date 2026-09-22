# CYSVP Project Handoff

Updated: 2026-09-22 UTC

This file preserves the Claim Your Seat Voting Portal's current checkpoint, recovered design decisions, and next steps so work can continue across chats. It is a partial reconstruction, not a complete record of the earlier conversation. Treat the current repository as authoritative for implementation and the explicitly identified decisions below as requirements or intended design.

## Start here

1. Read this file before proposing the next feature. Check current Git status, branches, and PR state; the checkpoint below is dated.
2. Preserve the recovery design and Circle lifecycle decisions below. Do not assume signup integration is the immediate next task.
3. Update this file at completed PRs and before switching chats. Commit and push it so a new chat or developer can retrieve it.

## Caucus activity checkpoint — 2026-09-20

Backend commit: 51bd859, pushed to origin/feat/role-transitions.
This supplements the earlier checkpoint below; merge and deployment
remain unconfirmed.

- Caucus activity now requires at least one accepted member, with no
  upper limit.
- Removed the global membership-cap check from HolcMembers.save().
- Three tests cover one-member activation, fourteen-member admission
  and activity, and clearing active status for an empty Caucus.
- Full backend suite: 48 tests passed in 9.979 seconds.
  Evidence: caucus-activity-full-tests.txt.
- Backend working tree was clean after committing and pushing.

This completes the model-level activity/cap change previously listed
as unfinished below. Activity status is refreshed when is_active is
evaluated; automatic refresh on every membership transition is not
established by these tests.

Next: review API/WebSocket admission rules and membership transitions,
including General Caucus assignment and succession.

## Latest checkpoint — 2026-09-20

Backend branch: `feat/role-transitions`.
Backend checkpoint committed and pushed to origin/feat/role-transitions:
7b12d27 — Checkpoint role transitions, Caucus numbering, and Bill vote authentication.
All 45 backend tests passed before this commit.
This checkpoint has not yet been confirmed merged or deployed.

### Verified results

Full backend suite: 45 tests passed in 9.673 seconds using local
in-memory SQLite. Evidence: `backend-checkpoint-tests.txt`.
Django system checks found no issues. The missing staticfiles directory
warning did not prevent tests from passing.

Coverage includes:
- 24 existing API credential, envelope, and account-key tests.
- 13 Second Link role and Caucus-numbering tests.
- One Caucus-number sequence data-migration test.
- Three repaired Bill API tests.
- Four replacement Django-native Bill WebSocket tests.

### Implemented in this checkpoint

- A forming Second Link founder receives U4D3 without joining General
  Caucus before activation.
- Second Links activate at six accepted members; candidates do not count.
- Activation assigns a delegate without an existing Caucus membership
  to district General Caucus 01; its first member becomes HoLC, U4D4.
- Caucus numbers are unique within each district. Ordinary numbering
  starts at 02, retires deleted numbers until 99, then reuses the lowest
  available number. Creation is blocked when 02–99 are all occupied.
- Model saves reject changes to an existing Caucus's number or district
  and reject explicit assignments that bypass the allocation sequence.
- A persistent district sequence preserves numbering progress.
- Migration 0012 initializes sequences from surviving Caucus records;
  its test verifies progress survives subsequent deletion.
- Bill API test setup now supplies the required eligibility attestation,
  activates its test account, and uses congress_url.
- Obsolete pytest WebSocket scaffolding was replaced with Django tests.
- Bill WebSocket connections reject anonymous/inactive users. Voting
  uses the authenticated username and rejects a mismatched supplied
  username before changing votes.
- Tests verify authenticated connection/counts, anonymous rejection,
  protection against changing another user's vote, and own-vote updates.

New files included in commit 7b12d27:
- holc/migrations/0010_caucus_code_per_district.py
- holc/migrations/0011_caucus_number_sequence.py
- holc/migrations/0012_seed_caucus_number_sequences.py
- holc/test_caucus_number_migration.py

### Remaining work and limits

- Backend checkpoint 7b12d27 is committed and pushed.
  Commit and push this updated frontend handoff next.
- This is not approval to deploy the completed role conversion.
- SQLite tests do not establish concurrent row-lock behavior on the
  deployment database.
- Sequence initialization cannot reconstruct numbers deleted before
  migration. Reconcile legacy numbering and General Caucus 01 identity.
- Numbering deletion tests use QuerySet deletion; actual dissolution
  and preservation of historical records remain unfinished.
- Activation and General Caucus assignment still need atomicity,
  failure/retry, pending-membership, and concurrent first-HoLC review.
- Implement Caucus activity with one or more members and no size cap,
  then continue agreed capabilities, succession, and transfers.
- Before deploying Bill WebSocket authentication, verify React's Bill
  connections send the access token and handle rejection/error messages.
- Bill WebSocket vote-value validation, complete bill identity,
  district-specific broadcasts, and connection cleanup remain review
  items. AdviceConsumer has not received this authentication fix.
- The existing vote-save signal assumes a GroupMember exists; tests
  now supply memberships, but missing/multiple membership handling
  remains unresolved.
- U5D5 remains reserved; no Council of Co-Reps is to be implemented.
  Resume paused Bill Focus after the required role alignment.

### Paused frontend and recovery work

- Frontend Bill Focus: `feat/bill-focus-sections`, based on `9a8c809`;
  latest verified full run was 48 tests across eight suites. The detailed
  checkpoint below records unfinished changes and unconfirmed tests.
- Recovery: `circle-recovery-auth`, pushed checkpoint `9154fe0`, remains
  unfinished and separate from role work.
- Member Contact feedback and cancellation work were merged. Cancellation
  reached main at `58e6c92`; Dahlia confirmed cancellation in the browser.

## Project and working environment

The Democracy, Straight-Up! Project is building CYSVP to support its Directly-connected Legislature, including Circles, membership, delegation, credentials, and voting. The current priority is a working prototype; role transitions and Caucus numbering are being aligned before resuming Bill Focus. Browser encryption and recovery remain preserved workstreams.

| Item | Known value |
| --- | --- |
| Frontend repository | https://github.com/democracy-straight-up/dsup-front |
| Frontend local folder | C:\Users\dahli\CYSVP\dsup-front |
| Backend local folder | C:\Users\dahli\CYSVP\claim-your-seat |
| Frontend stack inspected | React 18, react-scripts 5.0.1, Node 24, libsodium-wrappers |
| Backend repository | https://github.com/democracy-straight-up/claim-your-seat |
| Backend | Django/DRF; current changes in moda and holc |
| Backend Python | .venv\Scripts\python within the backend folder |
| User environment | Windows 11, Command Prompt, VS Code, Chrome |

Backend branch last reported: `feat/role-transitions`. Reviews have used uploaded source excerpts and local test output; a complete current API audit has not been performed.

## Working preferences

- Give small, concrete steps and exact insertion or replacement locations when asking Dahlia to edit code.
- Join consecutive Command Prompt commands with `&&` so a failure stops the sequence.
- Save files intended for upload to `%USERPROFILE%\Downloads`; redirect test and review output there with `> "..." 2>&1`.
- Use VS Code. Say **create** for a new file, **open** for an existing file, and distinguish append from replace.
- Use **forwardmost**, not highest, for representation along the delegation chain.
- Keep recovered handoff backups. Use uniquely named downloads and verify their actual contents before supplying overwrite commands.
- Follow focused test-driven changes: demonstrate the intended failure, implement, then verify. Distinguish test-environment failures from feature failures.
- Review the actual GitHub diff before merging. The established workflow is for Dahlia to merge after review.
- Avoid unrelated edits and broad formatting changes. An earlier global whitespace cleanup caused excessive changes in api/views.py.
- Keep secrets, credentials, private keys, and personal account data out of this public repository and this handoff.

## Historical vault checkpoint — September 13, 2026

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

## Circle join feedback checkpoint — 2026-09-17

Branch: fix/circle-join-feedback
Status: merged; frontend main reached `2f36d7f`. The later network-error fix also merged (merge commit not recorded).

Changes:
- A correctly formatted invitation key no longer produces an
  invalid-key error while the join request is pending.
- A corrected submission replaces the previous invalid-key
  error with "Joining Circle...".

Validation:
- Both new regression tests failed before their respective fixes
  and passed afterward.
- All five frontend suites passed: 27 tests total.
- git diff --check passed.
- This feedback change has not been browser-verified.
- React act deprecation warnings remain.

Follow-up: network failures now show a helpful message without assuming an HTTP response exists; the full frontend suite reached 28 tests across five suites. End-to-end joining still needs a complete browser rehearsal.

Previous Circle connection fix:
- Merged into main at 6704ad6 and pulled locally.
## Circle connection checkpoint — 2026-09-17

Branch: fix/circle-live-connection
Status: merged into main at `6704ad6` and pulled locally.

Changes:
- Circle Housekeeping and joining connections include an access token.
- Successful Circle creation/joining retains the refreshed access token.
- Housekeeping retries dropped connections after five seconds, with
  a limit of three unsuccessful retries.
- Leaving Housekeeping closes its socket and cancels pending retries.

Validation:
- All four frontend test suites passed: 25 tests total.
- Five focused Housekeeping connection tests passed.
- The first four focused tests also failed for the intended reasons
  against the original component.
- Production build succeeded with warnings before the final
  unused-variable cleanup.
- Local browser check against the hosted backend: member data loaded
  after refresh and after navigating away and returning; no persistent
  connection error.

Limits and next work:
- Circle creation/joining has not yet been browser-verified.
- Browser network-interruption recovery has not been manually tested;
  reconnect timing and limits are covered by mocked WebSocket tests.
- React act deprecation warning remains.
- Hosted Admin Chrome phishing warning remains unresolved; Dahlia
  chose to defer its investigation.
- Continue Circle joining and membership-update work using test-first changes.

## Current priority: working prototype

As of 2026-09-16, Dahlia has prioritized a demonstrable working
prototype: React screens with enough real backend functionality
to form Circles and Links and demonstrate member lists,
Housekeeping, Voter Pages, advisement, and especially custom
bill ordering.

Broader scaling and recovery hardening are deferred. Preserve
existing protections and the recovery design decisions above.

Current implementation order:
1. Complete the agreed role transitions, group-scoped capabilities,
   General Caucus behavior, and numbering work, with tests.
2. Resume Bill Focus using the agreed Draft 3 design below. Personal
   stars and delegate-published lists are distinct; this is no longer
   an unresolved personal-versus-published ordering question.
3. Correct advisement role wiring and actual delegation-chain lookup;
   verify voting and tally updates.
4. Complete Circle, First Link, and Second Link membership journeys.
5. Rehearse the complete journey across separate accounts, including
   reloads and failed-request recovery.

Circle WebSocket authentication and reconnection fixes are merged.
The earlier finding that Second Delegate/MoDA advisement tabs use the
First Delegate type remains a review item; do not assume it is fixed.

## Member Contact feedback — completed milestone

- Loading and fetch-failure feedback, save-failure feedback preserving
  drafts, pending-save controls, and successful-save confirmation added.
- First Delegate edit-control visibility retained. UI visibility tests
  do not establish backend authorization.
- Heading is "Member Contact Page"; feedback occupies a separate row
  spanning all five columns.
- At that milestone, 37 frontend tests passed across seven suites.
- Local frontend loaded contacts from the hosted backend; Contact Rules
  saved and persisted after refresh. Half-window and full-window screenshots
  were different viewport sizes, not evidence of a layout regression.
- Local login was restored with `REACT_APP_BASE_URL` in `.env.local`
  and a React restart. The current URL builder expects a host without
  a scheme; keep local environment files out of commits.
- Further review: keyboard access, missing sessions, response validation,
  loading lifecycle, and editing during saves. Cancellation was addressed
  in the subsequent merged milestone below.

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

## Checkpoint — 2026-09-18: Member Contact cancellation

Branch: fix/member-contact-cancel
Status: merged and pulled to frontend main at `58e6c92`; cancellation confirmed working in the browser.

- Cancel restores saved email/phone, address, and contact rules.
- Reopening each editor shows the restored values.
- Cancel sends no PATCH request and clears save feedback.
- Cancel buttons are disabled while saving.
- Successful saves update the values used for subsequent cancellation.
- Contact Rules textareas use controlled values to prevent stale display.

Validation:
- Each new cancellation test failed before its corresponding fix.
- Focused suite: 10 tests passed.
- Full suite: 40 tests passed across 7 suites.
- git diff --check passed.
- Existing React act deprecation warnings remain.

Next: retain this behavior while developing subsequent features.

## Bill Focus tabs checkpoint — September 19, 2026

Branch: feat/bill-focus-tabs
Status: merged; frontend main reached `9a8c809` before the next Bill Focus branch.

Implemented:
- Replaced "List of Bills" with My Bills and All Bills tabs.
- My Bills is selected initially and contains a temporary placeholder.
- The existing bills table, pagination, and voting controls are
  contained in All Bills.
- Bill Focus lists, private stars, and backend persistence are
  not implemented yet.

Validation:
- Two tests cover initial tab selection and switching.
- The switching test includes Bootstrap's tab visibility CSS because
  the test environment does not load it.
- Full frontend suite: 42 tests passed across 8 suites.
- Browser check confirmed initial selection and switching both ways.
- Existing act deprecation warnings remain.

Next:
- Continue with Bill Focus sections using the agreed Draft 3 design,
  then connect each workflow to backend storage.

## Bill Focus paused for revised user-role model — updated September 20

### Preserved coding checkpoint

- Frontend branch `feat/bill-focus-sections`, based on main `9a8c809`.
- Latest reviewed changes were uncommitted edits to
  `src/components/voter_page_components/billsWrapper.jsx` and
  `src/components/voter_page_components/billsWrapper.test.jsx`.
- My Bills receiving/publishing headings exist for selected old role
  codes; content remains placeholders. This slice has no persistence
  or publishing API.
- Last verified full run: 48 tests passed across eight suites;
  `git diff --check` clean.
- Four more tests were proposed for U2D1/U3D2/U4D3/U5D4; execution is
  unconfirmed. U5D4 is obsolete. Existing JSX/tests also use U3D3 and
  treat U5D5 as Rep; those expectations must change.
- Check status and preserve working changes before switching branches.
  Do not treat placeholder headings as a completed revised-role feature.
- `VoterPage`'s reported `setMessage={() => setMessage()}` wiring drops
  the argument; inspect and test it when resuming that workflow.

### Agreed role guidance

Dahlia's revised user-role document is accepted guidance. Remaining
explicit TBDs do not reopen settled decisions. Earlier Co-Rep/Council
proposals are superseded: **no Council of Co-Reps, ranking, or Council
eligibility machinery is to be implemented.** A future DcL can design
an intermediate role if it wants one; reserve U5D5 only.

| Code | Meaning |
| --- | --- |
| U0D0 | No accepted Circle membership; includes Circle candidates |
| U1D0 | Ordinary Circle voter |
| U1D1 | First Delegate outside a First Link |
| U2D1 | First Delegate accepted into a First Link |
| U2D2 | Second Delegate outside a Second Link |
| U3D2 | Second Delegate accepted into a Second Link |
| U4D3 | Caucus Delegate, including delegate of a forming Second Link |
| U4D4 | Head of a Legislative Caucus (HoLC) |
| U5D5 | Reserved Custom Role; no current assignment or permissions |
| U6D6 | Straight-Up Rep |

U3D3 and U5D4 are not valid target roles. Role codes are not sufficient
authorization by themselves: membership, office, group activation, and
pending applications are separate facts. Pending applicants retain their
previous role until accepted. Lower-role functions remain available where
supported by the user's actual memberships and mandate, except for the
Rep transition described below.

### Formation, activation, and General Caucus

- Assign the intended delegate role at group creation; do not introduce
  a temporary role while waiting for activation.
- Special functions requiring activation appear grayed out. Attempting
  them explains: "This function becomes available to you when your group
  becomes active." Use an accessible guarded interaction; a native disabled
  button alone will not provide click feedback. Backend checks remain required.
- A forming Second Link delegate is U4D3 immediately, but is not yet a
  General Caucus member. Accepted membership reaches six before activation;
  candidates do not count. Circle and Link size rules remain 6–12.
- When the Second Link activates, its eligible delegate joins district
  General Caucus 01. The very first such General Caucus member becomes
  its HoLC at that time, receiving U4D4.
- General Caucus has no admission voting or member-expulsion controls.
  HoLC selection/replacement remains. Removal occurs through existing
  mandate and succession mechanisms adapted to the revised roles.
- Caucuses are active with at least one member and have no 12-member cap.
  These Caucus rules still need implementation review; do not confuse
  them with the Second Link activation test already passing.
- Effects on Caucus membership/HoLC when a previously active Second Link
  drops below six remain to be settled explicitly.

### Caucus creation and transfers

- Any Caucus Delegate who is not a HoLC may create a Caucus, leave the
  previous Caucus, and become the new Caucus's HoLC.
- A HoLC must relinquish that office before creating or switching Caucuses.
- A transfer applicant remains in their existing Caucus until accepted
  by the destination; pending applications do not create two memberships.
- Expulsion from an ordinary Caucus returns an otherwise eligible Caucus
  Delegate to General Caucus. Losing the underlying delegate mandate is a
  different transition requiring succession, not automatic reassignment.

### Representative and reserved role

- U5D5 has no current operational meaning beyond reservation for a future
  DcL-defined Custom Role. Do not build a Co-Rep page or proxy layer for it.
- DSUp administrators record the DcL's Straight-Up Rep designation; the
  initial software does not impose a method of selecting the person.
- U6D6 designation preserves the account and history but ends active Circle
  membership and delegate offices through appropriate succession.
- The Rep has no ordinary voter ballot and retains no prior delegate proxy.
  The Rep may view bills/tallies; Bill Focus publication and recording an
  actual congressional action are separate capabilities. Details of Rep
  functions remain TBD and must not accidentally grant ordinary proxy votes.
- On replacement, the outgoing Rep returns to U0D0 and may apply to join
  a Circle again. Portal designation does not establish that the person
  holds a congressional seat.

### Legacy terminology and implementation impact

Internal names can remain if their behavior matches these requirements:

| Existing model | Intended current meaning |
| --- | --- |
| SecDelModel | First Link |
| ModaModel | Second Link |
| ModaMembers | Second Delegates who belong to that Second Link |
| HolcModel | Caucus |
| HolcMembers | Caucus memberships |

MoDA and the temporary L-Cauc terminology preceded Caucus Delegate.
The district-wide body is intended to be capable of meeting in person.
`ModaMembers` is not itself the roster of that whole district assembly.
Inspect behavior rather than undertaking a cosmetic rename.

Known implementation gaps from source review:
- The tested forming-founder assignment in `moda/models.py` now uses U4D3;
  other old U3D3 writes in succession, removal, election, and WebSocket
  paths still require review, including `holc/models.py` and
  `live/consumerHolc.py`.
- `rep/models.py` uses obsolete U5D4/U5D5 Council semantics. Do not map those
  legacy accounts automatically onto the reserved Custom Role.
- `succession_line.py` encodes the old hierarchy.
- Some membership cap checks count across all groups rather than within
  the current group. Caucus activity/cap rules and `HolcModel.delete()`
  require review; passing allocator tests does not resolve these issues.
- Role-prefix checks in API creation/joining may conflict with U4D3.
  Inspect full views, serializers, API/WebSocket authorization, and
  delegate/vote resolution before relying on the new codes.
- Frontend `wrapper.jsx` currently routes U5 to HouseRepWrapper and needs
  explicit U6 routing and handling of reserved U5. Use common components
  and capabilities rather than new Council screens.

### Implementation direction

1. Preserve the focused backend checkpoint and review its diff/migrations
   as listed at the start of this file.
2. Maintain an agreed role/capability/transition table and update Developer
   Guidance. Implement shared role calculation and transition handling,
   with tests for group-specific permissions and activation gating.
3. Complete General Caucus assignment, succession, transfers, and ordinary
   Caucus creation, adapting existing removal mechanisms. Review concurrent
   and partially failed transitions.
4. Implement representative designation only with settled capabilities;
   leave U5D5 reserved. No Co-Rep or Council ranking implementation.
5. Prepare a dry-run migration using real memberships and mandates. Review
   ambiguous legacy accounts individually and reconcile numbering history.
6. Coordinate frontend/backend rollout and refresh persisted frontend user
   data. Do not deploy incompatible role meanings independently.
7. Resume Bill Focus with shared role helpers/API capabilities, TDD, and
   browser verification, keeping the recovery branch separate.

## Bill Focus — agreed Draft 3 design to preserve

Source: `Bills on Voter Page` Draft 3 and Dahlia's subsequent role clarifications.
These are requirements, not a claim that storage or workflows are implemented.

- My Bills is the default tab; All Bills retains the eight-column bill
  table and existing browsing controls.
- My Bills shows received delegate focus first, followed by the voter's
  private starred bills in the order added. Stars are private and do not
  automatically publish anything.
- Delegate roles receive focus through the actual delegation chain and
  publish a list for their represented group. The Rep publishes to HoLCs
  and has no received focus list from a further delegate.
- Copying a bill into a published list preserves its Added value. A bill
  can also be published directly from All Bills. Add/remove one at a time;
  arbitrary manual reordering is outside this agreed design.
- Avoid duplicate bills. A bill both focused and starred appears once in
  the focus section; after focus removal it returns to its original place
  among private stars.
- Removing a bill locally does not cascade into other lists or erase votes.
  Published group lists survive a change of delegate.
- Use the forwardmost applicable source along the voter's actual chain;
  do not infer it from role rank alone.
- A voter choosing Present revokes their delegate proxy for that bill.
  A delegate holding proxy power who selects Present retains that proxy
  power and can change the vote again.
- Bill identity includes Congress, bill type, and number. The current
  planned prototype dataset is the 119th Congress's House bills. Link to
  Congress.gov, with a sensible fallback when a title is missing.
- Daily import is planned for midnight America/New_York. Preserve existing
  data on import failure. January 3, 2027 rollover clears focus lists,
  not historical bill/vote records.
- National/district tallies must avoid double-counting delegated votes.
- Detailed history views and other deferred Draft 3 questions remain
  deferred; do not invent requirements while implementing the next slice.

### Caucus numbering — agreed September 20, 2026

- Numbering is independent within each congressional district.
- General Caucus always uses 01; that number is permanently reserved.
- Other Caucuses receive 02 through 99 sequentially.
- Dissolved Caucus numbers remain retired until 99 has been assigned
  in that district.
- After reaching 99, assign the lowest currently unused number
  from 02–99. Never reuse a number held by an existing Caucus.
- If all numbers are occupied, block creation with a clear message.
- Preserve district numbering progress despite Caucus dissolution.
- Each Caucus retains a distinct permanent internal identity;
  reusing its display number must not combine historical records.
- Display numbers with two digits.

Implementation checkpoint: 13 role/numbering tests and one sequence
data-migration test pass within the 45-test backend suite. Production
data reconciliation, actual dissolution, concurrency, and API behavior
remain unfinished; see the latest checkpoint at the start of this file.

## Handoff recovery and evidence — September 20, 2026

This revision uses `PROJECT_HANDOFF_RECOVERED.md`, restored by Dahlia from
VS Code Timeline, as its base. An outdated September 13 download previously
overwrote the newer local handoff. The recovered source is preserved unchanged;
this update is delivered under a distinct filename.

Later statuses above reconcile earlier pending-PR notes with supplied Git
output and browser reports. Backend results are taken from uploaded local
logs, especially `caucus-numbering-boundaries.txt`. The assistant has not run Dahlia's Windows checkout. Uploaded
backend-checkpoint-save.txt confirms commit 7b12d27 was pushed to
origin/feat/role-transitions; merge and deployment remain unconfirmed. Check actual
repository state before continuing. Test counts are dated milestones, not
interchangeable claims about the current full suite.

## Latest completed checkpoint — 2026-09-22: Caucus admission hardening and transfers

Backend branch:
`feat/role-transitions`

Latest pushed backend checkpoint:
`9496ef8` — `Harden Caucus admission and transfers`

Parent checkpoint:
`a8065cc` — `Implement Caucus admission and exit transitions`

Backend working tree was clean after commit and push, and the branch was
confirmed up to date with `origin/feat/role-transitions`.

### Verified results

Full backend suite: **61 tests passed**.

Focused Caucus lifecycle suite: **13 tests passed**.

`git diff --check` was clean before commit.

### Implemented in this checkpoint

A new atomic transition,
`accept_eligible_delegate_into_caucus()`, now represents a completed
acceptance of a pending ordinary-Caucus application.

The transition:

* Requires an existing pending Caucus membership rather than an already
  accepted membership.
* Rejects General Caucus 01 as an ordinary admission destination.
* Re-verifies an actual accepted delegate mandate in an active Second
  Link in the same district.
* Requires the applicant to have exactly one existing accepted Caucus
  membership before transfer.
* Prevents a current HoLC from transferring until the office is
  relinquished.
* Deletes the previous accepted Caucus membership and converts the
  pending destination membership to accepted status inside one atomic
  transaction.
* Preserves the applicant's active Second Link delegate mandate.
* Preserves the U4D3 Caucus Delegate role.
* Refreshes activity status for the source and destination Caucuses.
* Deliberately bypasses the legacy `HolcMembers.delete()` instance
  behavior because that method still writes obsolete U3D3.

### Admission API hardening

`HolcMembersViewSet.join_invite_key()` now also:

* Rejects ordinary applications to General Caucus 01. General membership
  remains system-assigned from the underlying Second Link mandate.
* Rejects a duplicate membership or pending application for the same
  user and destination Caucus.
* Checks actual accepted `HolcMembers.is_delegate` office state, so a
  stale U4D3 profile code cannot allow a current HoLC to apply to another
  Caucus.
* Continues to require authentication, self-application, U4D3, and an
  actual active Second Link delegate mandate.

### Tests added

Four additional focused tests brought the full backend suite from
57 to 61.

They verify:

1. Accepting a pending eligible delegate transfers the accepted Caucus
   membership from the source Caucus to the destination while preserving
   the Second Link mandate and U4D3.
2. An eligible delegate cannot apply manually to General Caucus.
3. A duplicate pending application to the same Caucus is rejected
   without creating another membership row.
4. A user who actually holds HoLC office cannot apply to another Caucus
   merely because their cached profile role has become inconsistent and
   says U4D3.

The completed-admission transition test belongs to
`CaucusAdmissionTests`; creation, admission, and exit tests remain
separated by lifecycle responsibility.

### Important remaining work

A completed-admission transition now exists, but the actual Caucus
decision mechanism that determines when a pending applicant has been
accepted has not yet been rebuilt.

The legacy WebSocket vote-in/vote-out code still references missing or
obsolete models and serializers. Do not restore its old role behavior
piecemeal.

Still outstanding:

* Define and implement the ordinary-Caucus acceptance decision workflow
  that invokes `accept_eligible_delegate_into_caucus()`.
* Rebuild the ordinary-Caucus expulsion decision workflow to invoke
  `expel_eligible_delegate_to_general()`.
* Keep General Caucus outside ordinary admission and expulsion workflows.
* Implement HoLC relinquishment/replacement deliberately before allowing
  HoLC transfer or departure.
* Keep loss of the underlying Second Link delegate mandate separate from
  ordinary Caucus departure or expulsion; mandate loss requires the
  succession path.
* Review legacy `HolcMembers.delete()`, `HolcModel.delete()`, succession,
  and WebSocket role writes that still use obsolete U3D3 or old hierarchy
  assumptions.
* SQLite tests do not establish production-database row-lock behavior.

### Frontend preservation

Frontend branch:
`feat/bill-focus-sections`

Continue preserving the two uncommitted Bill Focus files:

* `src/components/voter_page_components/billsWrapper.jsx`
* `src/components/voter_page_components/billsWrapper.test.jsx`

Do not restore, discard, or include those files in a handoff-only commit.

### Next

Continue from backend checkpoint `9496ef8`.

The next substantive Caucus work should define and test the actual
ordinary-Caucus acceptance/expulsion decision mechanism that calls the
now-tested transition functions, rather than reviving the obsolete
WebSocket vote-in/vote-out implementation unchanged.

## Latest completed checkpoint — 2026-09-22: Caucus admission voting

Backend branch:
`feat/role-transitions`

Latest pushed backend checkpoint:
`a2f1537` — `Implement Caucus admission voting`

Parent checkpoint:
`9496ef8` — `Harden Caucus admission and transfers`

Backend working tree was clean after commit and push, and the branch was confirmed up to date with `origin/feat/role-transitions`.

### Implemented in this checkpoint

Caucus admission now has a complete decision path from authenticated API vote through majority calculation to the previously tested atomic membership transfer.

New model:

`CaucusAdmissionVote`

Each record stores:

* The accepted Caucus member casting the vote.
* The pending Caucus application being voted on.
* The vote timestamp.

A database uniqueness constraint on `(voter, application)` enforces one admission vote per member per application.

Migration:

`holc/migrations/0013_caucusadmissionvote_and_more.py`

### Admission decision service

New transition/service:

`cast_caucus_admission_vote()`

The service:

* Requires the target `HolcMembers` record to remain a pending application.

* Rejects admission voting for General Caucus 01.

* Allows only a currently accepted member of the destination Caucus to vote.

* Prevents the same member from voting twice on the same application.

* Calculates the majority as:

  `current accepted member count // 2 + 1`

* Counts only votes cast by members who are still currently accepted members of the destination Caucus.

* Preserves historical vote records when a voter later leaves, but such votes cease contributing to the live majority.

* Invokes `accept_eligible_delegate_into_caucus()` when the current majority threshold is reached.

Both the vote operation and the completed membership-transfer transition are explicitly wrapped in `@transaction.atomic`.

### API

`HolcMembersViewSet` now exposes:

`POST /holc-members/<application-id>/vote_admission/`

through the DRF `vote_admission` detail action.

The action:

* Requires an authenticated active user.
* Passes the authenticated user to the admission-vote service rather than accepting an arbitrary voter identity from request data.
* Returns the current/accepted `HolcMembers` representation after a successful vote.
* Converts domain `ValidationError` failures into HTTP 400 responses.

The existing `join_invite_key` action remains a `detail=False` action; an accidental route change discovered during review was corrected before commit.

### Decision semantics verified

Six focused admission-decision tests now verify:

1. A majority of accepted Caucus members accepts a pending delegate.
2. A nonmember cannot vote on another Caucus's application.
3. One accepted member cannot vote twice on the same application.
4. An accepted member can cast an admission vote through the API.
5. The deciding majority vote through the API completes the full Caucus transfer while preserving the applicant's Second Link mandate and U4D3 role.
6. A vote cast by a member who subsequently leaves the Caucus remains in the audit record but no longer counts toward the current majority.

The completed admission path therefore now connects:

pending application
→ accepted-member vote
→ durable vote record
→ current-member majority
→ atomic source/destination Caucus transfer.

### Important remaining work

Ordinary-Caucus admission is now implemented through the decision layer.

The corresponding ordinary-Caucus expulsion decision workflow remains to be rebuilt.

That work should:

* Use the existing `expel_eligible_delegate_to_general()` domain transition after a completed expulsion.
* Apply only to ordinary Caucuses, never General Caucus 01.
* Define a durable one-member/one-vote expulsion record rather than restoring the deleted legacy `VoteOutHolcMember` model unchanged.
* Count only votes belonging to members who remain currently accepted in the Caucus.
* Prevent the target HoLC from being expelled through the ordinary member-expulsion path until HoLC relinquishment/replacement is handled deliberately.
* Preserve the distinction between ordinary Caucus expulsion and loss of the underlying Second Link delegate mandate.
* Keep historical vote records for auditability without letting departed voters continue to affect a live majority.

The old WebSocket vote-in/vote-out implementation remains stale and should not be revived piecemeal.

### Frontend preservation

Frontend branch:
`feat/bill-focus-sections`

Current pushed frontend handoff checkpoint:
`3bb7946` — `Update handoff for Caucus admission hardening`

Continue preserving these two uncommitted Bill Focus files:

* `src/components/voter_page_components/billsWrapper.jsx`
* `src/components/voter_page_components/billsWrapper.test.jsx`

Do not restore, discard, or include those files in a handoff-only commit.

### Next

Continue from backend checkpoint `a2f1537`.

The next backend slice should implement the ordinary-Caucus expulsion voting decision mechanism, using the same current-membership majority principles established for admission and invoking the already-tested `expel_eligible_delegate_to_general()` transition only after the required majority is reached.

## Latest completed checkpoint — 2026-09-22: Caucus admission and exit transitions

Backend repository:
`C:\Users\dahli\CYSVP\claim-your-seat`

Branch:
`feat/role-transitions`

Latest pushed backend checkpoint:
`a8065cc` — `Implement Caucus admission and exit transitions`

Parent checkpoint:
`d262b29` — `Implement Caucus creation and membership transfer`

The backend working tree was clean after commit and push, and the branch
was confirmed up to date with `origin/feat/role-transitions`.

### Verified results

Full backend suite: **57 tests passed in 8.621 seconds** using the local
in-memory SQLite test configuration.

Focused Caucus lifecycle suite: **9 tests passed**.

Django system checks reported no issues. The existing missing
`staticfiles` directory warning did not prevent the suite from passing.

`git diff --check` was clean before commit.

### Implemented in this checkpoint

Existing-Caucus admission now:

* Requires an authenticated, active user.
* Requires the submitted username to match the authenticated user.
* Requires U4D3 plus an actual accepted delegate mandate in an active
  Second Link in the destination Caucus's district.
* Does not treat the U4D3 role code alone as sufficient authorization.
* Creates a pending destination membership rather than immediately
  transferring the applicant.
* Preserves the applicant's existing accepted Caucus membership and
  U4D3 role while the destination application is pending.
* Uses current Caucus terminology in the reviewed error path and removes
  obsolete membership-cap exception handling from that path.

Voluntary ordinary-Caucus departure now:

* Uses the standard HolcMembers API DELETE route.
* Allows a user to leave only their own Caucus membership.
* Prevents a HoLC from leaving without first relinquishing that office.
* Prevents voluntary departure from General Caucus as if it were an
  ordinary Caucus.
* Allows cancellation of a pending application without affecting the
  user's accepted Caucus membership or role.
* Requires an actual active Second Link delegate mandate before an
  accepted ordinary-Caucus member can use the return-to-General
  transition.
* Returns an otherwise eligible Caucus Delegate automatically to district
  General Caucus 01.
* Preserves the underlying Second Link delegate mandate.
* Preserves U4D3 unless existing first-member model behavior legitimately
  makes the returning member the General Caucus HoLC.
* Refreshes activity status for the affected ordinary and General
  Caucuses.

### Shared transition layer

New file:
`holc/transitions.py`

`return_eligible_delegate_to_general()` centralizes the atomic transition
from an ordinary Caucus back to General Caucus.

It deliberately bypasses the legacy `HolcMembers.delete()` instance
method because that method still writes obsolete U3D3.

The transition locks and re-reads the relevant membership, verifies an
accepted non-HoLC ordinary-Caucus membership and an active Second Link
delegate mandate, removes the ordinary membership, restores General
Caucus membership, repairs the current Caucus role, and refreshes the
affected Caucus activity states.

`expel_eligible_delegate_to_general()` is an explicit semantic entry
point for the same transition after a completed ordinary-Caucus
expulsion. The actual voting/expulsion mechanism has not yet been
rebuilt.

### Tests added in this slice

`holc/test_caucus_admission.py` is now organized into:

* `CaucusCreationTests`
* `CaucusAdmissionTests`
* `CaucusExitTests`

Five additional tests brought the full backend suite from 52 to 57.

They verify:

1. A signed-in delegate cannot apply another user to an existing Caucus.
2. U4D3 role code alone cannot authorize an existing-Caucus application
   without an actual active Second Link delegate mandate.
3. An eligible delegate's application to another Caucus remains pending
   while the existing accepted Caucus membership and U4D3 role remain
   intact.
4. An eligible delegate voluntarily leaving an ordinary Caucus is
   returned automatically to General Caucus while retaining the active
   Second Link delegate mandate.
5. The explicit completed-expulsion transition returns an otherwise
   eligible ordinary-Caucus member to General Caucus with the same
   mandate preserved.

### Important remaining gaps

The old Caucus vote-in/vote-out WebSocket machinery is stale and should
not be patched piecemeal.

`live/consumerHolc.py` still references `VoteOutHolcMember` and
`VoteInHolcMember`, but those current model/serializer definitions are
absent. Its legacy removal path also writes obsolete U3D3 directly.

Therefore:

* The new expulsion transition exists and is tested.
* A functioning majority vote-out/expulsion workflow does **not** yet
  exist on this branch.
* Rebuild the expulsion decision path deliberately rather than layering
  new behavior onto the obsolete WebSocket implementation.
* General Caucus must not expose ordinary application or expulsion
  behavior; its membership is system-assigned from the underlying active
  Second Link mandate.
* Duplicate pending applications and other admission edge cases still
  need review.
* HoLC succession/relinquishment remains separate work.
* Loss of the underlying Second Link delegate mandate is a succession
  transition and must not be treated as an ordinary return-to-General
  exit.
* `HolcMembers.delete()` and `HolcModel.delete()` still contain obsolete
  role-transition behavior.
* Other succession paths still encode obsolete role codes and hierarchy.
* SQLite tests do not establish production-database row-lock behavior.

### Current frontend state

Frontend branch:
`feat/bill-focus-sections`

Preserve the existing uncommitted Bill Focus edits:

* `src/components/voter_page_components/billsWrapper.jsx`
* `src/components/voter_page_components/billsWrapper.test.jsx`

Do not restore, discard, or accidentally include those files in a
handoff-only commit.

### Next

Continue the Caucus lifecycle from checkpoint `a8065cc`.

The next substantive backend work should review and rebuild the actual
ordinary-Caucus admission/acceptance and expulsion decision mechanisms
against the revised role model, using the shared transition functions
rather than the obsolete WebSocket removal behavior.

Once enough Caucus/role behavior is aligned for the prototype, resume
the paused Bill Focus Draft 3 work on `feat/bill-focus-sections`.

## Completed checkpoint — 2026-09-22: Caucus creation and membership transfer

Backend repository:
`C:\Users\dahli\CYSVP\claim-your-seat`

Branch:
`feat/role-transitions`

Latest pushed backend checkpoint:
`d262b29` — `Implement Caucus creation and membership transfer`

Backend working tree was clean after the commit and push. The branch was
confirmed up to date with `origin/feat/role-transitions`.

### Verified results

Full backend suite: **52 tests passed in 8.471 seconds** using the local
in-memory SQLite test configuration.

Focused Caucus-creation suite: **4 tests passed**.

Django system checks reported no issues. The existing missing
`staticfiles` directory warning did not prevent the suite from passing.

`git diff --check` was clean before commit.

### Implemented in this checkpoint

`HolcViewSet.create` now:

* Requires an authenticated, active user whose profile role is U4D3.
* Requires the submitted username to match the authenticated user.
* Requires creation in the user's own congressional district.
* Verifies an actual accepted, active Second Link delegate mandate;
  U4D3 role code alone is not treated as sufficient authorization.
* Refuses creation by a user who currently holds a HoLC office.
* Performs existing-Caucus departure and new-Caucus creation inside an
  atomic transaction.
* Creates the new ordinary Caucus using the existing per-district
  numbering allocator.
* Makes the creator the first accepted member and therefore HoLC, U4D4,
  through the existing HolcMembers model behavior.
* Preserves the creator's underlying Second Link delegate mandate.
* Immediately evaluates the new Caucus's activity status.
* Converts Caucus-number exhaustion into a controlled HTTP 400 response.
* Rolls back the membership transfer if Caucus creation fails.

The transfer deliberately uses QuerySet deletion for the old
HolcMembers record rather than `HolcMembers.delete()`, because the
instance delete method still writes the obsolete U3D3 role.

### Tests added

New file:
`holc/test_caucus_admission.py`

The four tests verify:

1. An ordinary member cannot create a Caucus.
2. A signed-in Caucus Delegate cannot create a Caucus for another user.
3. An eligible active Second Link delegate can leave General Caucus 01,
   create ordinary Caucus 02, become its HoLC, retain the Second Link
   delegate mandate, and leave the existing General HoLC unchanged.
4. If ordinary Caucus numbers 02–99 are all occupied, creation returns
   HTTP 400 and the atomic transaction preserves the creator's existing
   General Caucus membership and U4D3 role.

### Current role/design constraints

* U4D3 is Caucus Delegate; U4D4 is HoLC.
* Forming Second Link delegates receive U4D3 immediately, but
  activation-gated functions require an active Second Link.
* General Caucus membership begins only upon Second Link activation.
* Any eligible Caucus Delegate who is not a HoLC may create a Caucus,
  leave the previous Caucus, and become HoLC of the new Caucus.
* A HoLC must relinquish office before creating or switching Caucuses.
* Actual membership, mandate, activation, office, and district matter;
  role code alone is insufficient authorization.
* A transfer applicant to an existing Caucus remains in the old Caucus
  until the destination accepts them. Pending membership must not create
  two accepted Caucus memberships.
* General Caucus is always 01.
* Ordinary Caucuses use 02–99 independently within each district.
* Retired ordinary numbers remain unavailable until 99 has been issued;
  thereafter the allocator uses the lowest currently available number.
* Caucuses are active with at least one accepted member and have no
  maximum membership.
* U5D5 remains a reserved Custom Role with no current permissions.
* U6D6 is Straight-Up Rep.
* U3D3 and U5D4 are obsolete target roles.

### Known remaining model/API gaps

* `HolcMembers.delete()` still writes obsolete U3D3.
* `HolcModel.delete()` also contains legacy role-transition behavior.
* `ModaMembers` still has an incorrect global membership-cap check.
* `ModaModel.is_active` performs activation side effects.
* Some Second Link succession paths still write obsolete role codes.
* Several succession and WebSocket paths still encode the old hierarchy.
* Existing-Caucus admission, switching, expulsion, HoLC succession, and
  return-to-General-Caucus behavior still require deliberate review and
  tests.
* SQLite tests do not establish production-database row-lock behavior.

Do not claim that the Caucus-creation checkpoint resolves these remaining
transition and succession issues.

### Frontend state

Frontend repository:
`C:\Users\dahli\CYSVP\dsup-front`

Branch:
`feat/bill-focus-sections`

Current local frontend edits must be preserved:

* `PROJECT_HANDOFF.md`
* `src/components/voter_page_components/billsWrapper.jsx`
* `src/components/voter_page_components/billsWrapper.test.jsx`

The Bill Focus work remains paused while the revised role and Caucus
behavior is aligned. Do not restore, discard, or casually commit the two
Bill Focus files.

Recovery/security work remains preserved separately on branch
`circle-recovery-auth`, checkpoint `9154fe0`.

### Working conventions

* Dahlia edits locally in VS Code and runs commands from Windows CMD.
* Give exact create/open/append/replace instructions.
* Use `&&` between consecutive CMD commands where appropriate.
* Follow TDD: establish and inspect the real RED before implementation,
  then focused GREEN, full-suite GREEN, and diff review.
* Do not assume access to Dahlia's local checkout.
* Do not use VS Code `Save As` merely to make upload copies of repository
  files; it retargets the editor to the copied file.
* Use `copy` from CMD when a repository file needs to be copied to
  Downloads for upload.
* For test runs, prefer showing output on screen while simultaneously
  saving it to Downloads with PowerShell `Tee-Object`. This lets Dahlia
  catch simple syntax or indentation errors immediately without having
  to copy terminal output manually.

### Next

Continue the revised Caucus lifecycle review from this committed
checkpoint. Prioritize the remaining admission and membership-transition
behavior needed for the working prototype, while preserving the paused
Bill Focus work.

After the required Caucus/role alignment is sufficient for the prototype,
resume Bill Focus Draft 3 on `feat/bill-focus-sections`.

## Latest completed checkpoint — 2026-09-22: Caucus expulsion voting

Backend repository:
`C:\Users\dahli\CYSVP\claim-your-seat`

Backend branch:
`feat/role-transitions`

Latest pushed backend checkpoint:
`84258d4` — `Implement Caucus expulsion voting`

Parent checkpoint:
`a2f1537` — `Implement Caucus admission voting`

The backend working tree was clean after commit and push. The branch was confirmed pushed to `origin/feat/role-transitions`.

### Verified results

Full backend suite: **75 tests passed**.

Focused ordinary-Caucus expulsion-decision suite: **8 tests passed**.

`makemigrations --check` reported no model changes after migration generation.

`git diff --check` was clean before commit.

Django system checks reported no issues. The previously known PowerShell `NativeCommandError` wrapper around Django's test-database stderr output remains harmless when the test suite proceeds normally and ends in `OK`.

### Implemented in this checkpoint

Ordinary Caucus expulsion now has a complete decision path from authenticated member vote through majority calculation to return of the expelled eligible delegate to General Caucus.

New model:

`CaucusExpulsionVote`

Migration:

`holc/migrations/0014_caucusexpulsionvote_and_more.py`

Each expulsion-vote record stores:

* The accepted Caucus member casting the vote.
* The user targeted for expulsion.
* The ordinary Caucus in which the vote occurs.
* A snapshot of the target's specific `HolcMembers` membership ID.
* The vote timestamp.

The target membership ID is intentionally stored as a numeric snapshot rather than as a foreign key to `HolcMembers`. This allows the expulsion-vote audit history to survive deletion of the expelled ordinary-Caucus membership.

The membership-ID snapshot also distinguishes separate membership episodes. If the same user later rejoins the same Caucus with a new `HolcMembers` record, votes from the previous membership episode do not apply to the new one.

A database uniqueness constraint on:

`(voter, caucus, target_membership_id)`

enforces one expulsion vote per accepted member per target membership episode.

### Expulsion decision service

New transition/service:

`cast_caucus_expulsion_vote()`

The service is wrapped in `@transaction.atomic`.

It:

* Requires the target to remain an accepted Caucus member.

* Applies only to ordinary Caucuses.

* Rejects use of the ordinary expulsion mechanism in General Caucus 01.

* Prevents an incumbent HoLC from being expelled through the ordinary member-expulsion path. The HoLC must first relinquish that office through the separate succession/replacement process.

* Allows only a currently accepted member of the target's Caucus to cast an expulsion vote.

* Prevents the same member from voting twice against the same membership episode.

* Calculates the live majority as:

  `current accepted member count // 2 + 1`

* Counts the target as part of the accepted Caucus membership when determining the majority threshold.

* Counts only votes belonging to users who remain currently accepted members of that Caucus.

* Preserves historical votes after a voter leaves the Caucus, while removing that departed voter's vote from the live majority calculation.

* Invokes `expel_eligible_delegate_to_general()` when the required current-member majority is reached.

### Completed expulsion transition

When the deciding vote reaches the majority threshold, the existing domain transition:

`expel_eligible_delegate_to_general()`

returns the expelled delegate from the ordinary Caucus to district General Caucus 01.

The completed transition:

* Removes the ordinary-Caucus membership.
* Preserves the durable expulsion-vote records.
* Preserves the user's underlying accepted delegate mandate in an active Second Link.
* Preserves the U4D3 Caucus Delegate role unless existing first-member General-Caucus behavior legitimately assigns HoLC office.
* Creates or restores accepted General Caucus membership.
* Does not treat ordinary Caucus expulsion as loss of the underlying Second Link delegate mandate.

Loss of that underlying mandate remains a separate succession transition.

### API

`HolcMembersViewSet` now exposes:

`POST /holc-members/<membership-id>/vote_expulsion/`

through the DRF `vote_expulsion` detail action.

The action:

* Requires an authenticated, active user.
* Uses the authenticated user as the voter rather than accepting an arbitrary voter identity from request data.
* Passes the target `HolcMembers` record to the expulsion service.
* Returns the resulting membership representation after a successful vote.
* Before majority, that is still the target's ordinary-Caucus membership.
* On the deciding majority vote, it is the resulting General Caucus membership.
* Converts domain `ValidationError` failures into HTTP 400 responses.

The existing `join_invite_key` action remains `detail=False`.

### Expulsion semantics verified

Eight focused tests in:

`holc/test_caucus_expulsion_decisions.py`

verify:

1. A majority of accepted ordinary-Caucus members expels an eligible delegate and returns that delegate to General Caucus.
2. An accepted Caucus member can cast an expulsion vote through the API.
3. The deciding majority vote through the API completes the full expulsion-to-General transition.
4. An incumbent HoLC cannot be targeted through the ordinary expulsion mechanism.
5. General Caucus 01 cannot use ordinary member expulsion.
6. A nonmember/outsider cannot cast an expulsion vote.
7. One accepted member cannot vote twice against the same membership episode.
8. A historical vote cast by a member who subsequently leaves remains in the audit record but no longer counts toward the current majority.

The completed expulsion path therefore now connects:

accepted ordinary-Caucus membership
→ accepted-member expulsion vote
→ durable vote record
→ current-member majority
→ atomic return to General Caucus
→ preserved Second Link delegate mandate and U4D3 role.

### Caucus decision-layer status

Ordinary-Caucus admission and expulsion now both have working decision paths.

Admission:

pending application
→ current accepted-member vote
→ current-member majority
→ atomic transfer into destination Caucus.

Expulsion:

accepted ordinary-Caucus membership
→ current accepted-member vote
→ current-member majority
→ atomic return to General Caucus.

Both workflows deliberately avoid reviving the stale legacy `VoteInHolcMember` / `VoteOutHolcMember` WebSocket machinery unchanged.

### Important remaining Caucus and role work

The admission and ordinary-expulsion decision layers are now implemented, but the broader role-transition review is not complete.

Still outstanding:

* Implement HoLC relinquishment/replacement and succession deliberately.
* A HoLC must relinquish office before switching Caucuses, leaving an ordinary Caucus, or becoming subject to ordinary expulsion.
* Keep loss of the underlying Second Link delegate mandate separate from voluntary departure or ordinary-Caucus expulsion.
* Review succession behavior when a Second Link delegate loses that mandate.
* Review what happens to General Caucus membership and HoLC office when a previously active Second Link drops below its activation threshold.
* Review legacy `HolcMembers.delete()` and `HolcModel.delete()` behavior, which still contains obsolete U3D3 role writes.
* Review remaining succession and WebSocket paths that still encode obsolete role codes or hierarchy assumptions.
* Review stale `live/consumerHolc.py` vote-in/vote-out machinery rather than patching it piecemeal.
* Review `HolcMembersViewSet.get_holc_by_user` and other lookups that assume one `HolcMembers` record per user; accepted plus pending transfer records can make those assumptions false.
* Review similar contact/member lookups for accepted-plus-pending membership ambiguity.
* Continue treating actual membership, office, delegate mandate, district, and activation state as authorization facts; role code alone is not sufficient.
* SQLite tests do not establish production-database row-lock behavior.

Do not claim that completion of admission and expulsion voting resolves these succession, legacy-role, concurrency, or deployment issues.

### Current role/design constraints to preserve

* U0D0 — no accepted Circle membership.
* U1D0 — ordinary Circle voter.
* U1D1 — First Delegate outside a First Link.
* U2D1 — First Delegate accepted into a First Link.
* U2D2 — Second Delegate outside a Second Link.
* U3D2 — Second Delegate accepted into a Second Link.
* U4D3 — Caucus Delegate, including the delegate of a forming Second Link.
* U4D4 — HoLC.
* U5D5 — reserved Custom Role with no current permissions.
* U6D6 — Straight-Up Rep.
* U3D3 and U5D4 are obsolete target roles.

General Caucus 01 remains system-assigned from the active Second Link mandate. It does not expose ordinary application or ordinary member-expulsion behavior.

### Frontend preservation

Frontend repository:
`C:\Users\dahli\CYSVP\dsup-front`

Frontend branch:
`feat/bill-focus-sections`

Continue preserving the existing paused Bill Focus edits:

* `src/components/voter_page_components/billsWrapper.jsx`
* `src/components/voter_page_components/billsWrapper.test.jsx`

Do not restore, discard, or accidentally include those files in a handoff-only commit.

Recovery/security work remains preserved separately on backend branch:

`circle-recovery-auth`

checkpoint:

`9154fe0`

### Next

Continue the revised role/Caucus lifecycle from backend checkpoint:

`84258d4`

The ordinary admission and expulsion decision workflows are now sufficiently rebuilt that the next substantive backend work should move to **HoLC relinquishment/replacement and succession behavior**, including the role and membership consequences of a HoLC stepping down.

Do not revive the obsolete WebSocket succession/removal behavior unchanged. Establish the intended current behavior with focused TDD and use explicit transition functions where practical.

After enough remaining Caucus/role behavior is aligned for the working prototype, resume the paused Bill Focus Draft 3 work on frontend branch `feat/bill-focus-sections`.

## Latest completed checkpoint — 2026-09-22: HoLC replacement voting

Backend branch: `feat/role-transitions`

Current clean backend HEAD:

`61762afdab1d3e18d7f585fd4abd0588c2af3712` — `Add final newlines to HoLC replacement files`

Substantive implementation commit:

`a1f995a612dfbe9b43c70e2412236cc41db4b264` — `Implement HoLC replacement voting`

Parent completed checkpoint:

`84258d4d399cfc30ba5e313c1cd46e5500d4f4b7` — `Implement Caucus expulsion voting`

### HoLC replacement behavior now implemented

Authenticated accepted Caucus members can vote to replace the current HoLC through:

`POST /holc-members/<candidate-membership-id>/vote_holc_replacement/`

Current rules enforced:

* The candidate must be a currently accepted member of that Caucus.
* The candidate must not already be the incumbent HoLC.
* The candidate must hold an active Second Link delegate mandate in the same district.
* The voter must be a currently accepted member of the candidate’s Caucus.
* A member cannot cast more than one replacement vote for the same candidate.
* The database now enforces uniqueness for `(voter, candidate, holc)`.
* Only votes belonging to currently accepted Caucus members count toward the live majority.
* Historical votes from members who later leave remain stored but stop contributing to the live majority.
* A simple majority is `current accepted membership // 2 + 1`.
* When the candidate reaches the live majority:

  * the incumbent remains an accepted Caucus member;
  * the incumbent ceases to be HoLC and returns to U4D3;
  * the successful candidate becomes the sole HoLC and becomes U4D4.
* A pending Caucus applicant cannot become HoLC.
* An outsider cannot cast a HoLC replacement vote.
* A replacement vote cannot be associated with a different Caucus from the candidate.
* Direct legacy `PutForwardHolcMember` writes are also guarded against pending candidates, outsiders, Caucus mismatch, duplicate votes, and votes naming the incumbent as the replacement candidate.

Migration `holc/0015_putforwardholcmember_unique_holc_replacement_vote.py` removes pre-existing duplicate replacement-vote rows before installing the uniqueness constraint, preserving the earliest vote in each duplicate group.

### Test checkpoint

`holc.test_holc_replacement`:

**11 tests GREEN**

Coverage includes:

* departed-member vote excluded from live majority;
* duplicate vote protection;
* pending applicant rejection;
* outsider rejection;
* candidate/Caucus mismatch rejection;
* active Second Link mandate requirement;
* authenticated API vote;
* API rejection without active Second Link mandate;
* end-to-end majority HoLC replacement;
* direct-model rejection of incumbent self-candidacy;
* API rejection of incumbent self-candidacy.

Final backend suite:

**86 tests / OK**

Also verified:

* `manage.py makemigrations --check` → `No changes detected`
* `git diff --check` → clean
* backend working tree clean after push

### Known remaining succession cleanup

The successful HoLC replacement still invokes legacy `succession_line.py`.

During the passing replacement test, the succession logger reported that the former HoLC was updated to U4D3 “after removal from districtcouncil,” even though the test involved no District Council membership. This is stale hierarchy terminology/logic from the obsolete District Council / Co-Rep architecture and was deliberately not changed in the HoLC replacement slice.

`succession_line.py` still needs a deliberate cleanup for the current role architecture rather than piecemeal fixes.

### Still unresolved

Voluntary HoLC relinquishment semantics have not yet been specified.

The current implementation covers **replacement of an incumbent HoLC by Caucus majority**. It does not decide whether an HoLC may voluntarily resign and leave the office temporarily vacant, or whether relinquishment must occur only as part of an immediate successor transition.

Do not invent this behavior until the rule is explicitly settled.

### Next logical work

Continue the role-transition/lifecycle work from this clean checkpoint.

The next work should distinguish:

1. cleanup of obsolete succession behavior and role mappings in `succession_line.py`; and
2. the still-unresolved rule for voluntary HoLC relinquishment.

Do not reopen completed Caucus admission, expulsion, or HoLC replacement behavior unless a new failing test establishes a regression.
