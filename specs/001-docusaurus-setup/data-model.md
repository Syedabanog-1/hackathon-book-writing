# Data Model: Textbook Chapters

This document outlines the structure of the textbook chapters.

## Entities

### Chapter
- **Name**: chapter-1, chapter-2, chapter-3
- **Attributes**:
  - `title`: String (e.g., "Foundations of Physical AI")
  - `learning_objectives`: Array of Strings
  - `sections`: Array of Objects (each object representing a section with `title` and `content`)
  - `key_terms`: Array of Strings
  - `summary`: String
  - `questions`: Array of Strings
- **Relationships**: Each chapter is an independent markdown file within the `docusaurus-app/docs/` directory.

## Validation Rules

- Each chapter markdown file MUST adhere to the `Spec Structure` defined in the initial prompt: `title`, `learning_objectives`, `sections[]`, `key_terms`, `summary`, `questions`.
- All fields MUST be present and correctly formatted.

## State Transitions

- Chapters are created via `/sp.specify create <chapter-name>` and generated via `/sp.specify generate <chapter-name>`.
- Modifications to chapter content are done by editing the respective markdown files.
- The sidebar (`sidebars.js`) is updated manually or via a script to include new chapters.
