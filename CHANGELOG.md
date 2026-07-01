# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project does not yet follow strict semantic versioning tags in Git; the version numbers below are assigned retroactively to group related changes from the commit history for documentation purposes.

## [Unreleased]

### Added

- Project documentation: `README.md`, `docs/UX_v1.md`, `docs/ROADMAP.md`, and this changelog.

## [1.0.0] - 2026-07-01

### Added

- Conclusion card at the top of the result screen, giving an immediate answer before supporting detail.
- "Kết quả bạn sẽ nhận được" (what you'll get) preview section shown before the user starts the diagnosis.
- Trust badges in the hero ("Miễn phí," "Chỉ 2 câu hỏi," "Không cần đăng ký").
- Featured styling for the primary goal card (school admission) with a callout label.
- Sticky bottom CTA bar linking to PreCheck, visible throughout the result screen.

### Changed

- Hero redesign: headline rewritten from a generic product title to a direct, date-specific question ("Bạn có kịp nhập học Trường Nhật ngữ tháng 4/2027 không?").
- Landing page simplified: the original long explanatory panel about J.TEST exam frequency was replaced with concise trust badges and the "what you'll get" preview.
- CTA improvements: the primary submit button copy changed from a generic "Kiểm tra ngay" to the more specific "Xem lộ trình của tôi"; the action list on the result screen was restructured into three clearly numbered steps (PreCheck with a direct link, FGPS mention, final exam registration).
- Exam comparison card typography enlarged for the "next available session" figure to improve scannability.

### Known Issues

- The FGPS and formal J.TEST registration steps in the action list are text-only; no linked integration exists for either yet.

## [0.3.0] - 2026-06-09

### Added

- Page metadata for publishing: title, meta description, Open Graph, and Twitter Card tags.

### Changed

- Root route (`__root.tsx`) head configuration updated for the public/publish-ready site info.

## [0.2.0] - 2026-06-09

### Added

- Full Vietnamese localization of all user-facing UI copy.

### Changed

- JLPT exam schedule logic corrected, with additional supporting diagnosis fields.

### Fixed

- PreCheck button stacking/layout issue in the result screen actions.

## [0.1.0] - 2026-06-08

### Added

- Initial implementation of the J.TEST Navi diagnostic tool: goal selection (school admission vs. THPT exemption), the two-question input form, the client-side diagnosis engine, J.TEST/JLPT exam calendar generation, and the multi-section result screen.
- GitHub repository connected to the Lovable project for continuous sync between the Lovable editor and version control.

### Known Issues

- UI copy at this stage was not yet localized to Vietnamese (addressed in 0.2.0).
