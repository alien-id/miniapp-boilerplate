# Cosign — PRD

## One-liner
A personal card for freelancers and service providers with verified human reviews, powered by Alien identity.

## The Problem
Freelancers and service providers have no trustworthy way to prove they're good at what they do. LinkedIn recommendations are fake-able. Fiverr reviews are gameable. Testimonials on personal sites could be made up. There's no portable proof that **real humans** actually vouch for your work.

## The Solution
**Cosign** is a personal professional card that lives inside the Alien App. You create your card, share a link with past clients/collaborators, and they leave verified reviews — each one tied to a unique verified human. No bots. No fake accounts. No sock puppets.

Your card becomes your portable proof: "23 verified humans rated me 4.9"

## Core User Flows

### Flow 1: Create Your Card (the professional)
1. Open Cosign inside Alien App → verify with Alien ID
2. Fill in: Name, what you do (title/skill), one-line bio, link to portfolio/site
3. **Apify magic**: paste your LinkedIn or personal site URL → app auto-scrapes and pre-fills your card (name, headline, profile photo)
4. Card is created → you get a shareable link

### Flow 2: Request a Review (the professional)
1. From your card, tap "Request Review"
2. Enter a name/contact or generate a unique review link
3. **Pay**: send Aliencoin/stablecoin with the request as incentive ("buy them a coffee to write the review")
4. Link is sent → reviewer opens it in Alien App

### Flow 3: Leave a Review (the reviewer)
1. Open review link → Alien App opens → verify with Alien ID
2. See the professional's card
3. Answer: "How do you know this person?" (worked with / hired / collaborated)
4. Leave a rating (1-5 stars) + short text review (max 280 chars)
5. **Collect payment**: receive the Aliencoin the professional sent
6. Review is posted → permanently tied to a verified human (but reviewer can choose to be anonymous or show name)

### Flow 4: View a Card (anyone)
1. Open card link → see the professional's info
2. See all verified reviews with ratings
3. See trust score: total reviews, average rating, "Verified by X humans"
4. Each review shows a "Verified Human" badge

## Screens (5 total)

### Screen 1: My Card (Profile)
- Your name, title, one-line bio
- Portfolio link (auto-populated via Apify)
- Trust score badge: "⭐ 4.8 — Verified by 12 humans"
- "Share Card" button (copy link)
- "Request Review" button
- List of your reviews below

### Screen 2: Create/Edit Card
- Name (pre-filled from Alien ID)
- Title / What you do
- One-line bio (280 char max)
- Portfolio URL input → "Auto-fill from URL" button (Apify scrape)
- Save

### Screen 3: Request Review
- Generate unique link
- Set payment amount (Aliencoin / stablecoin)
- Optional: add a personal note ("Hey, would love an honest review!")
- Send / Copy link

### Screen 4: Leave a Review
- Professional's card shown at top
- "How do you know this person?" (select)
- Star rating (1-5)
- Text review (280 char max)
- "Submit & Collect [X] Aliencoin" button

### Screen 5: Public Card View
- Professional's card info
- Trust score prominently displayed
- List of verified reviews
- Each review shows: stars, text, "Verified Human" badge, relationship type, date
- "Leave a Review" CTA at bottom

## Alien Identity Integration
- **Card creation**: requires Alien ID verification
- **Reviewing**: requires Alien ID verification (one review per verified human per card)
- **Sybil resistance**: you literally cannot fake reviews because each one is tied to a unique verified human
- **Privacy**: reviewers can choose anonymous (still verified) or public name

## Payments Integration
- **Pay to request review**: professional sends Aliencoin with review request
- **Reviewer collects on submission**: payment released when review is posted
- **Currency**: Aliencoin + stablecoins supported via Alien Mini App payments SDK

## Apify Integration ($100 credits)
- **Auto-fill card**: paste LinkedIn URL → Apify LinkedIn scraper pulls name, headline, photo, summary
- **Auto-fill card**: paste personal site URL → Apify web scraper pulls relevant info
- **Enrich card**: optionally scrape GitHub, Dribbble, Behance for portfolio stats
- Keeps onboarding under 30 seconds

## Tech Stack (Hackathon MVP)
- **Frontend**: HTML/JS rendered in Alien App webview
- **Backend**: simple server (Node.js or Python)
- **Alien SDK**: SSO for identity verification + JS Bridge for payments
- **Apify API**: profile scraping for card auto-fill
- **Database**: simple key-value or SQLite (just needs to store cards + reviews)

## What to Cut for MVP
- ❌ No search/discovery (just direct card links)
- ❌ No categories or filtering
- ❌ No editing reviews after submission
- ❌ No dispute system
- ❌ No Apify enrichment beyond LinkedIn (nice to have)
- ✅ Keep: create card, share link, leave review, payments, verified identity

## Demo Script (2 minutes on stage)
1. "I'm a freelance designer. I just created my Cosign card in 20 seconds." → show card
2. "I sent a review request to my friend here with 1 Aliencoin." → show request
3. "They opened the link, verified as a real human, and left me a review." → show review appearing
4. "Now my card shows: verified by 1 human, 5 stars. Every single review is from a real, unique, verified person. You can't fake this."
5. "This is the future of professional reputation. Not LinkedIn recommendations you can write yourself. Not Fiverr reviews from bots. Real humans, real trust."

## Judging Criteria Hit List
- ✅ **Alien-native**: identity IS the product — reviews are meaningless without verification
- ✅ **Feature-worthy**: would absolutely belong in a Mini App Store
- ✅ **Clear problem → clear loop**: create card → share → get reviewed (under 1 min to understand)
- ✅ **Practicality / completeness**: works end-to-end in MVP
- ✅ **Originality**: nothing like this exists in any mini app ecosystem
- ✅ **Impact potential**: every freelancer needs trustworthy social proof
- ✅ **AI × trust**: Apify AI-powered scraping + verified human trust layer
- ✅ **Payments**: pay to request reviews, collect on submission
