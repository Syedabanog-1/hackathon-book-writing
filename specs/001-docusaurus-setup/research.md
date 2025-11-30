# Research Findings

This document consolidates findings from research conducted during the planning phase to address 'NEEDS CLARIFICATION' items in the technical context.

## Performance Goals for Docusaurus site

**Decision**: Sub-second load times for end-users, optimized build times (2 to 4 times faster), and improved memory consumption.
**Rationale**: These goals ensure a fast, efficient, and user-friendly experience for the textbook readers, while also optimizing the development and deployment process.
**Alternatives considered**: None, these are standard best practices for Docusaurus performance.

## Constraints for Docusaurus site deployment on GitHub Pages

**Decision**: Acknowledge and plan for GitHub Pages deployment configuration complexity, handling of trailing slashes in URLs, deployment branch specificity, and SSH key management for automation (if using CI/CD).
**Rationale**: These are known limitations and configuration considerations when deploying Docusaurus on GitHub Pages, and addressing them upfront will prevent deployment issues.
**Alternatives considered**: None, these are inherent to GitHub Pages deployment.
