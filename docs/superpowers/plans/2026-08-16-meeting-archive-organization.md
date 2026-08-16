# Meeting Archive Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize existing meeting records by phase and restore sortable original-style filenames without converting or adding file formats.

**Architecture:** Keep exactly one directory level beneath `project-files/meetings/all-meetings/`: phase one, phase two, and phase three. Move every existing record directly into its phase directory. Normalize the organization prefix to the full phase-directory name while preserving the iMeeting generation timestamp, meeting name, content type, three-digit code, meeting ID, and original extension.

**Tech Stack:** Git file renames, iMeeting read-only meeting metadata, Markdown documentation

## Global Constraints

- Preserve every existing file byte-for-byte.
- Do not convert Word files to Markdown or Markdown files to Word.
- Do not download or synthesize currently missing records.
- Keep only the three phase directories; do not keep per-meeting subdirectories.
- Preserve both content types when present: `发言记录` and `会议纪要`.
- Preserve both existing extensions when present: `.md` and `.docx`.
- Use the filename pattern `<完整期别名称>-<YYYYMMDD_HHMMSS>-<会议名称>-<发言记录|会议纪要>-<三位编号>-<九位会议编号>.<md|docx>` so all files within a phase sort chronologically.

---

### Task 1: Build and validate the rename manifest

**Files:**
- Read: `project-files/meetings/all-meetings/**`
- Read: iMeeting organization meeting metadata for all three phases

**Interfaces:**
- Consumes: Existing parent-directory meeting IDs and each file's content type and extension.
- Produces: One unique destination path for every existing source file.

- [x] **Step 1: Inventory existing files by phase, meeting ID, content type, and extension**

Run a repository inventory and confirm the starting totals are 16 files in phase one, 66 in phase two, and 100 in phase three.

- [x] **Step 2: Match every existing meeting ID to iMeeting metadata**

Require one metadata match per existing meeting ID and select the corresponding `script`, `scriptMd`, `minutes`, or `minutesMd` timestamp according to the file's existing type and extension.

- [x] **Step 3: Validate destinations before moving files**

Require 182 sources, 182 unique destinations, no missing source paths, and no destination collisions.

### Task 2: Flatten and rename existing records

**Files:**
- Move: `project-files/meetings/all-meetings/<期别>/<单场会议资料夹>/*`
- To: `project-files/meetings/all-meetings/<期别>/*`

**Interfaces:**
- Consumes: The validated source-to-destination manifest from Task 1.
- Produces: Three flat phase directories containing the same 182 files.

- [x] **Step 1: Move each tracked file to its canonical phase-level path**

Use Git-aware renames so history records the operation as path changes rather than delete-and-recreate operations.

- [x] **Step 2: Confirm per-meeting directories are empty and removed**

Verify there are no files deeper than the phase-directory level.

- [x] **Step 3: Confirm no untracked example files were included**

Verify the four user-provided Markdown examples remain outside the commit unless they were already tracked.

### Task 3: Verify archival integrity and PR scope

**Files:**
- Verify: `project-files/meetings/all-meetings/**`

**Interfaces:**
- Consumes: The flattened archive from Task 2.
- Produces: Evidence that structure, naming, formats, and contents satisfy the approved rules.

- [x] **Step 1: Verify counts and allowed extensions**

Require phase totals of 16, 66, and 100 files; allow only `.md` and `.docx`.

- [x] **Step 2: Verify the filename grammar**

Require every basename to match the approved timestamped pattern and its directory's phase name.

- [x] **Step 3: Verify byte preservation**

Compare the multiset of Git blob object IDs before and after reorganization; require an exact match.

- [x] **Step 4: Verify website isolation**

Confirm deployment still serves only `static-site/` and repository code contains no references to the old meeting paths.

- [ ] **Step 5: Review and publish the updated PR**

Confirm the diff contains only the intended archive renames plus this plan, commit the changes, push the existing branch, and re-check the GitHub PR summary.
