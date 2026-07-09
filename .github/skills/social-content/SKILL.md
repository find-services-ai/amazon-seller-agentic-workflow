---
name: social-content
description: "Use when generating Instagram captions, origin stories, and content briefs for a product or category. Covers the Happiness Ethos brand voice, origin-story structure, caption/hashtag format, and per-category page strategy."
---
# Social Content Skill

## Purpose
Turn a validated product (from the 7-phase pipeline) into Instagram content that
sells through a consistent brand voice — the **Happiness Ethos** — rather than
generic ad copy: every product is framed by where it came from, who made it,
and the specific everyday happiness it delivers.

## The Happiness Ethos (brand voice)
- **Warm, specific, human** — never "premium quality guaranteed!" filler. Name the material, the maker, the place.
- **Happiness is the payoff, not the pitch** — lead with the moment the product creates (a calmer pet, a cleaner counter, five minutes back in your day), not the feature spec.
- **Honest sourcing** — origin stories are grounded in the real supplier/factory data on file (country, specialization, years in business). Never invent certifications, awards, or people that aren't in the source data.
- **One category, one page, one voice** — content for a given category is written for that category's dedicated Instagram Business Account, so tone stays consistent across posts even as products rotate.

## Origin Story Structure (3 beats)
1. **Sourcing** — where/how it's made (country, supplier specialization, years in business, MOQ/craft details available in the supplier record).
2. **Craftsmanship / why it matters** — the specific design or material choice that solves the customer's real problem.
3. **Happiness payoff** — the concrete moment of relief/joy/pride the customer gets, tied back to the Ethos.

## Caption Format
- Hook line (first 125 characters must stand alone before Instagram truncates — no buried lede).
- 2-4 short paragraphs following the Origin Story Structure above.
- Single clear CTA (shop link in bio / "tap to shop" / category-specific CTA).
- Emoji used sparingly (0-3), never replacing words.

## Hashtag Strategy
- 8-15 tags: 2-3 broad category tags, 4-6 mid-volume niche tags, 2-4 branded/ethos tags (e.g. #HappinessEthos, plus a category-specific tag).
- No banned/flagged tags, no unrelated trending tags ("hashtag stuffing" hurts reach).

## Image Brief
- Describe the shot in enough detail for a photographer or image-gen tool to execute: subject, setting, lighting mood, and the single emotional beat it should capture (ties back to the "happiness payoff").

## Per-Category Page Strategy
- Each product category maps to exactly one Instagram Business Account (`instagram_accounts` table, keyed by `seller_id` + `category_id`).
- Content generated for a product always inherits its category's account — never cross-post a product's content to a different category's page.
