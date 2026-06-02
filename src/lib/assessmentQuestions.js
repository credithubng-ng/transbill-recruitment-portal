// 225-question bank with new structure
// category: 'digital' | 'affiliate' | 'field' | 'professionalism'
// difficulty: 'medium' | 'hard' | 'advanced'
// correctAnswer: 'A' | 'B' | 'C' | 'D'

export const QUESTIONS = [
  // ─── Q1–Q75 ───
  {
    id: 1, category: 'digital', difficulty: 'medium',
    questionText: 'An advert gets many clicks but few applications. What should be checked first?',
    options: [{ key: 'A', text: 'Add extra images' }, { key: 'B', text: 'Increase daily posts' }, { key: 'C', text: 'Expand target ages' }, { key: 'D', text: 'Review form clarity' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Clicks indicate interest; low completion often points to friction in the form or landing process.',
    active: true
  },
  {
    id: 2, category: 'digital', difficulty: 'medium',
    questionText: 'Which metric most directly reflects conversion?',
    options: [{ key: 'A', text: 'Application completions' }, { key: 'B', text: 'Reach counts' }, { key: 'C', text: 'Logo views' }, { key: 'D', text: 'Daily spend' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Completed applications measure how many people have taken the desired action.',
    active: true
  },
  {
    id: 3, category: 'digital', difficulty: 'medium',
    questionText: 'Poor applicant quality usually signals what?',
    options: [{ key: 'A', text: 'Long survey' }, { key: 'B', text: 'Extra training' }, { key: 'C', text: 'Higher pay' }, { key: 'D', text: 'Weak targeting' }],
    correctAnswer: 'D',
    explanationForAdmin: 'When many applicants are unqualified, the audience targeting or message position is often misaligned.',
    active: true
  },
  {
    id: 4, category: 'digital', difficulty: 'medium',
    questionText: 'What is the primary purpose of a call to action in an advert?',
    options: [{ key: 'A', text: 'Shorten copy' }, { key: 'B', text: 'Drive action' }, { key: 'C', text: 'Build partnerships' }, { key: 'D', text: 'Raise costs' }],
    correctAnswer: 'B',
    explanationForAdmin: 'A call to action is meant to encourage a specific next step from the audience.',
    active: true
  },
  {
    id: 5, category: 'digital', difficulty: 'medium',
    questionText: 'Audience segmentation mainly means what?',
    options: [{ key: 'A', text: 'Changing logos' }, { key: 'B', text: 'Posting on Sundays' }, { key: 'C', text: 'Group similar contacts' }, { key: 'D', text: 'Writing shorter copy' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Segmentation divides audiences into meaningful groups to tailor messages more effectively.',
    active: true
  },
  {
    id: 6, category: 'digital', difficulty: 'medium',
    questionText: 'Tracking where applicants heard about a role helps you primarily to do what?',
    options: [{ key: 'A', text: 'Extend forms' }, { key: 'B', text: 'Evaluate channel quality' }, { key: 'C', text: 'Lower budgets' }, { key: 'D', text: 'Remove reports' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Source tracking identifies which channels produce stronger candidates and where to invest.',
    active: true
  },
  {
    id: 7, category: 'digital', difficulty: 'medium',
    questionText: 'Many clicks but high form abandonment usually suggests what?',
    options: [{ key: 'A', text: 'High pay' }, { key: 'B', text: 'Weak conversion flow' }, { key: 'C', text: 'Low impressions' }, { key: 'D', text: 'Good branding' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Interest without completion often points to friction in the form or landing experience.',
    active: true
  },
  {
    id: 8, category: 'digital', difficulty: 'medium',
    questionText: 'Organic reach refers to what?',
    options: [{ key: 'A', text: 'Paid ads' }, { key: 'B', text: 'Telephone leads' }, { key: 'C', text: 'Market shows' }, { key: 'D', text: 'Unpaid exposure' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Organic reach is the audience exposed to content without paid promotion.',
    active: true
  },
  {
    id: 9, category: 'digital', difficulty: 'medium',
    questionText: 'Many likes but few applications most likely indicate what?',
    options: [{ key: 'A', text: 'High costs' }, { key: 'B', text: 'Weak conversion' }, { key: 'C', text: 'Low traffic' }, { key: 'D', text: 'High conversion' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Engagement does not always lead to applications; low conversion shows the message or process is not compelling enough.',
    active: true
  },
  {
    id: 10, category: 'digital', difficulty: 'medium',
    questionText: 'Testing different headlines helps to do what?',
    options: [{ key: 'A', text: 'Increase budget' }, { key: 'B', text: 'Improve response' }, { key: 'C', text: 'Delay launch' }, { key: 'D', text: 'Reduce copy' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Headline variations can influence how many people engage with the content.',
    active: true
  },
  {
    id: 11, category: 'digital', difficulty: 'medium',
    questionText: 'Which metric best reflects audience interaction with content?',
    options: [{ key: 'A', text: 'Visual design' }, { key: 'B', text: 'Engagement rate' }, { key: 'C', text: 'Staff numbers' }, { key: 'D', text: 'Office capacity' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Engagement rate measures how actively people interact with your posts through likes, comments and clicks.',
    active: true
  },
  {
    id: 12, category: 'digital', difficulty: 'medium',
    questionText: 'A marketing funnel is best described as what?',
    options: [{ key: 'A', text: 'Payment process' }, { key: 'B', text: 'Office visits' }, { key: 'C', text: 'Customer journey' }, { key: 'D', text: 'Salary review' }],
    correctAnswer: 'C',
    explanationForAdmin: 'A funnel maps the journey from initial awareness through interest to final conversion.',
    active: true
  },
  {
    id: 13, category: 'digital', difficulty: 'medium',
    questionText: 'Short video content often works well because why?',
    options: [{ key: 'A', text: 'It reduces budget' }, { key: 'B', text: 'It requires no script' }, { key: 'C', text: 'It guarantees hires' }, { key: 'D', text: 'Users watch quickly' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Many people consume content on mobile devices in short sessions, so concise videos retain attention.',
    active: true
  },
  {
    id: 14, category: 'digital', difficulty: 'medium',
    questionText: 'Retargeting most often reaches whom?',
    options: [{ key: 'A', text: 'Past visitors' }, { key: 'B', text: 'Partners only' }, { key: 'C', text: 'Unreached teams' }, { key: 'D', text: 'New markets' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Retargeting is a practice of showing follow-up messages to people who have already engaged or visited.',
    active: true
  },
  {
    id: 15, category: 'digital', difficulty: 'medium',
    questionText: 'Monitoring campaign performance regularly helps you mainly to do what?',
    options: [{ key: 'A', text: 'Spot trends' }, { key: 'B', text: 'Increase bounce' }, { key: 'C', text: 'Hide issues' }, { key: 'D', text: 'Replace forms' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Regular review allows you to identify what is working and what needs adjustment early.',
    active: true
  },
  {
    id: 16, category: 'digital', difficulty: 'hard',
    questionText: 'High traffic but poor lead quality usually indicates what?',
    options: [{ key: 'A', text: 'Poor targeting' }, { key: 'B', text: 'Smaller form' }, { key: 'C', text: 'Extra staff' }, { key: 'D', text: 'Fewer channels' }],
    correctAnswer: 'A',
    explanationForAdmin: 'If many people respond but the applicants are not qualified, your targeting or messaging is likely misaligned.',
    active: true
  },
  {
    id: 17, category: 'digital', difficulty: 'hard',
    questionText: 'A campaign performs well on WhatsApp but poorly on Instagram. What is the first sensible step?',
    options: [{ key: 'A', text: 'Lower pay' }, { key: 'B', text: 'Extend quiz' }, { key: 'C', text: 'Compare user behaviour' }, { key: 'D', text: 'Delete ads' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Analysing differences in audience behaviour and message reception across channels helps determine adjustments.',
    active: true
  },
  {
    id: 18, category: 'digital', difficulty: 'hard',
    questionText: 'Good marketing messaging should be primarily what?',
    options: [{ key: 'A', text: 'Legalistic' }, { key: 'B', text: 'Vague' }, { key: 'C', text: 'Simple and relevant' }, { key: 'D', text: 'Lengthy' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Clear and relevant messages resonate better than long or vague ones.',
    active: true
  },
  {
    id: 19, category: 'digital', difficulty: 'hard',
    questionText: 'Strong click volume but low assessment entries typically points to what?',
    options: [{ key: 'A', text: 'Price issues' }, { key: 'B', text: 'Stage friction' }, { key: 'C', text: 'Time to market' }, { key: 'D', text: 'Perfect fit' }],
    correctAnswer: 'B',
    explanationForAdmin: 'High engagement followed by drop-off often suggests a problem between the application and assessment stages.',
    active: true
  },
  {
    id: 20, category: 'digital', difficulty: 'hard',
    questionText: 'Keeping a talent pipeline helps primarily to do what?',
    options: [{ key: 'A', text: 'Speed future hiring' }, { key: 'B', text: 'Use posters' }, { key: 'C', text: 'Avoid forms' }, { key: 'D', text: 'Lower wages' }],
    correctAnswer: 'A',
    explanationForAdmin: 'A pipeline ensures there are candidates in reserve when new roles open or replacements are needed.',
    active: true
  },
  {
    id: 21, category: 'affiliate', difficulty: 'medium',
    questionText: 'In this context, affiliate activation means what?',
    options: [{ key: 'A', text: 'Doing activities' }, { key: 'B', text: 'Paying salaries' }, { key: 'C', text: 'Signing forms' }, { key: 'D', text: 'Changing names' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Activation is turning registered affiliates into actual performers who open accounts or generate business.',
    active: true
  },
  {
    id: 22, category: 'affiliate', difficulty: 'medium',
    questionText: 'A strong Affiliate Banker usually has what?',
    options: [{ key: 'A', text: 'Tech degree' }, { key: 'B', text: 'Community access' }, { key: 'C', text: 'Large office' }, { key: 'D', text: 'Expensive car' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Community connections and the ability to persuade local prospects are key.',
    active: true
  },
  {
    id: 23, category: 'affiliate', difficulty: 'medium',
    questionText: 'Onboarding mainly helps affiliates to do what?',
    options: [{ key: 'A', text: 'Avoid tasks' }, { key: 'B', text: 'Understand processes' }, { key: 'C', text: 'Increase budgets' }, { key: 'D', text: 'Cut meetings' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Onboarding prepares affiliates with the process, target and support so they can perform effectively.',
    active: true
  },
  {
    id: 24, category: 'affiliate', difficulty: 'medium',
    questionText: 'In an SME account acquisition programme, which outcome matters most?',
    options: [{ key: 'A', text: 'Verified accounts' }, { key: 'B', text: 'Travel miles' }, { key: 'C', text: 'Likes on posts' }, { key: 'D', text: 'Flyer count' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Verified account openings are the core performance metric.',
    active: true
  },
  {
    id: 25, category: 'affiliate', difficulty: 'medium',
    questionText: 'What should be done first when affiliates become inactive?',
    options: [{ key: 'A', text: 'Pay cut' }, { key: 'B', text: 'Extra salary' }, { key: 'C', text: 'Public scolding' }, { key: 'D', text: 'Provide support and contact' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Understanding the barrier and offering support is more constructive than immediate penalties.',
    active: true
  },
  {
    id: 26, category: 'affiliate', difficulty: 'medium',
    questionText: 'Why are simple earning examples useful?',
    options: [{ key: 'A', text: 'Clarify opportunity' }, { key: 'B', text: 'Confuse prospects' }, { key: 'C', text: 'Delay training' }, { key: 'D', text: 'Raise targets' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Showing how earnings work in practice helps prospects understand the value of the opportunity.',
    active: true
  },
  {
    id: 27, category: 'affiliate', difficulty: 'medium',
    questionText: 'Retention improves when affiliates have what?',
    options: [{ key: 'A', text: 'Unclear pay' }, { key: 'B', text: 'Clear support' }, { key: 'C', text: 'Excess paperwork' }, { key: 'D', text: 'No communication' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Ongoing communication, training and clear rewards encourage affiliates to stay active.',
    active: true
  },
  {
    id: 28, category: 'affiliate', difficulty: 'medium',
    questionText: 'Reactivation refers to what?',
    options: [{ key: 'A', text: 'Returning to activity' }, { key: 'B', text: 'Changing titles' }, { key: 'C', text: 'Salary advance' }, { key: 'D', text: 'New registration' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Reactivation brings inactive affiliates back into productive work.',
    active: true
  },
  {
    id: 29, category: 'affiliate', difficulty: 'hard',
    questionText: 'Many registrations but low activity most likely point to what?',
    options: [{ key: 'A', text: 'Strong training' }, { key: 'B', text: 'Weak onboarding' }, { key: 'C', text: 'Simple forms' }, { key: 'D', text: 'Large budgets' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Without proper onboarding and follow-up, many affiliates never begin real work.',
    active: true
  },
  {
    id: 30, category: 'affiliate', difficulty: 'hard',
    questionText: 'Leaderboards motivate affiliates when they do what?',
    options: [{ key: 'A', text: 'Recognise effort' }, { key: 'B', text: 'Increase tasks' }, { key: 'C', text: 'Replace pay' }, { key: 'D', text: 'Publicly shame' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Recognition and visibility inspire healthy competition; shaming and replacement do not.',
    active: true
  },
  {
    id: 31, category: 'affiliate', difficulty: 'hard',
    questionText: 'A dormant affiliate responds after two weeks. What should you do?',
    options: [{ key: 'A', text: 'Stop training' }, { key: 'B', text: 'Lower pay' }, { key: 'C', text: 'Remove them' }, { key: 'D', text: 'Offer support' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Positive re-engagement should be followed by targeted support to revive performance.',
    active: true
  },
  {
    id: 32, category: 'affiliate', difficulty: 'hard',
    questionText: 'Poor commission communication usually leads to what?',
    options: [{ key: 'A', text: 'Rising metrics' }, { key: 'B', text: 'Confusion and doubt' }, { key: 'C', text: 'Free leads' }, { key: 'D', text: 'Extra trust' }],
    correctAnswer: 'B',
    explanationForAdmin: 'If earnings are unclear, affiliates become confused and may complain or disengage.',
    active: true
  },
  {
    id: 33, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate struggles to explain the offer. Which support is most useful?',
    options: [{ key: 'A', text: 'Provide script' }, { key: 'B', text: 'Raise pay' }, { key: 'C', text: 'Lower quota' }, { key: 'D', text: 'Send policy' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Simple pitch scripts help affiliates communicate clearly and confidently.',
    active: true
  },
  {
    id: 34, category: 'affiliate', difficulty: 'hard',
    questionText: 'Which group deserves early recovery focus?',
    options: [{ key: 'A', text: 'Office staff' }, { key: 'B', text: 'Random hires' }, { key: 'C', text: 'High potential inactives' }, { key: 'D', text: 'Everyone equally' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Focusing on inactive affiliates who could become productive yields the best return on effort.',
    active: true
  },
  {
    id: 35, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate complains publicly about delayed payment. What is the best first response?',
    options: [{ key: 'A', text: 'Ignore' }, { key: 'B', text: 'Fire them' }, { key: 'C', text: 'Delay months' }, { key: 'D', text: 'Escalate professionally' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Acknowledge the concern, verify the issue and keep communication clear and professional.',
    active: true
  },
  {
    id: 36, category: 'affiliate', difficulty: 'hard',
    questionText: 'Too many unqualified affiliates usually cause what?',
    options: [{ key: 'A', text: 'No issues' }, { key: 'B', text: 'Support burden' }, { key: 'C', text: 'Strong growth' }, { key: 'D', text: 'High conversion' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Large numbers of untrained affiliates create support and quality problems.',
    active: true
  },
  {
    id: 37, category: 'affiliate', difficulty: 'hard',
    questionText: 'A top performer gives misleading earnings figures. The correct action is to do what?',
    options: [{ key: 'A', text: 'Correct their behaviour' }, { key: 'B', text: 'Reward activity' }, { key: 'C', text: 'Clone them' }, { key: 'D', text: 'Ignore results' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Performance does not justify misinformation; behaviour must be corrected to protect trust.',
    active: true
  },
  {
    id: 38, category: 'affiliate', difficulty: 'advanced',
    questionText: 'You manage 400 affiliates with mixed activity. What management approach works best?',
    options: [{ key: 'A', text: 'One message fits all' }, { key: 'B', text: 'Dismiss half' }, { key: 'C', text: 'Segment support' }, { key: 'D', text: 'Random calls' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Different groups need different strategies; segmentation allows targeted guidance and motivation.',
    active: true
  },
  {
    id: 39, category: 'affiliate', difficulty: 'advanced',
    questionText: 'A market has many affiliates but few verified results. What should be examined first?',
    options: [{ key: 'A', text: 'Office wifi' }, { key: 'B', text: 'Activation quality' }, { key: 'C', text: 'Advertising cost' }, { key: 'D', text: 'Employee age' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Low conversion after high registration often signals problems with activation and support.',
    active: true
  },
  {
    id: 40, category: 'affiliate', difficulty: 'advanced',
    questionText: 'When support capacity is limited, who deserves priority?',
    options: [{ key: 'A', text: 'All new sign-ups' }, { key: 'B', text: 'Those with high-impact blockers' }, { key: 'C', text: 'Social media followers' }, { key: 'D', text: 'People praising company' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Addressing issues that unlock performance has a greater impact than random outreach.',
    active: true
  },
  {
    id: 41, category: 'field', difficulty: 'medium',
    questionText: 'Quick follow-up with prospects in Nigeria often works best through what channel?',
    options: [{ key: 'A', text: 'Street signs' }, { key: 'B', text: 'WhatsApp' }, { key: 'C', text: 'Poster boards' }, { key: 'D', text: 'Car horns' }],
    correctAnswer: 'B',
    explanationForAdmin: 'WhatsApp is widely used for immediate communication and follow-up in many Nigerian communities.',
    active: true
  },
  {
    id: 42, category: 'field', difficulty: 'medium',
    questionText: 'Using local language content improves what?',
    options: [{ key: 'A', text: 'Salary' }, { key: 'B', text: 'Relatability' }, { key: 'C', text: 'Colour scheme' }, { key: 'D', text: 'Pricing' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Content in local languages or Pidgin feels more relatable and builds trust with prospects.',
    active: true
  },
  {
    id: 43, category: 'field', difficulty: 'medium',
    questionText: 'Before entering a new market, marketers should first understand what?',
    options: [{ key: 'A', text: 'Travel distance' }, { key: 'B', text: 'Staff birthdays' }, { key: 'C', text: 'Market dynamics' }, { key: 'D', text: 'Food vendors' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Knowing the structure, influencers and customer behaviour helps plan effective activation.',
    active: true
  },
  {
    id: 44, category: 'field', difficulty: 'medium',
    questionText: 'After meeting a prospect physically, the next step should be what?',
    options: [{ key: 'A', text: 'Send follow-up' }, { key: 'B', text: 'Cancel contact' }, { key: 'C', text: 'Increase forms' }, { key: 'D', text: 'Wait months' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Prompt follow-up converts initial interest into action.',
    active: true
  },
  {
    id: 45, category: 'field', difficulty: 'medium',
    questionText: 'Busy markets often respond best to pitches that are what?',
    options: [{ key: 'A', text: 'Financial statements' }, { key: 'B', text: 'Short and practical' }, { key: 'C', text: 'Complex graphs' }, { key: 'D', text: 'Long policy' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Simple, practical messages hold attention in noisy environments.',
    active: true
  },
  {
    id: 46, category: 'field', difficulty: 'medium',
    questionText: 'Referral marketing works primarily because of what?',
    options: [{ key: 'A', text: 'Print ads' }, { key: 'B', text: 'Network trust' }, { key: 'C', text: 'Cold calling' }, { key: 'D', text: 'SMS blasts' }],
    correctAnswer: 'B',
    explanationForAdmin: 'People trust recommendations from those they know.',
    active: true
  },
  {
    id: 47, category: 'field', difficulty: 'hard',
    questionText: 'Weak conversion despite high traffic usually indicates what?',
    options: [{ key: 'A', text: 'Good times' }, { key: 'B', text: 'Balanced budget' }, { key: 'C', text: 'Unclear message' }, { key: 'D', text: 'Good design' }],
    correctAnswer: 'C',
    explanationForAdmin: 'A large audience that does not convert often means the message or offer is not resonating.',
    active: true
  },
  {
    id: 48, category: 'field', difficulty: 'hard',
    questionText: 'When a WhatsApp activation group is inactive, what is the first action?',
    options: [{ key: 'A', text: 'Diagnose cause' }, { key: 'B', text: 'Immediate closure' }, { key: 'C', text: 'More admin posts' }, { key: 'D', text: 'New flyers' }],
    correctAnswer: 'A',
    explanationForAdmin: 'You need to understand why the group is quiet before deciding next steps.',
    active: true
  },
  {
    id: 49, category: 'field', difficulty: 'hard',
    questionText: 'Market association leaders mainly influence what?',
    options: [{ key: 'A', text: 'Office design' }, { key: 'B', text: 'Car rentals' }, { key: 'C', text: 'Payment cycles' }, { key: 'D', text: 'Trust access' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Leaders shape trust and can grant or withhold access to their communities.',
    active: true
  },
  {
    id: 50, category: 'field', difficulty: 'hard',
    questionText: 'Broadcast messages are less effective when they lack what?',
    options: [{ key: 'A', text: 'Heavy budgets' }, { key: 'B', text: 'Personal relevance' }, { key: 'C', text: 'Brand logos' }, { key: 'D', text: 'Long sentences' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Generic messages without a personal angle often fail to engage.',
    active: true
  },
  {
    id: 51, category: 'field', difficulty: 'hard',
    questionText: 'A trader says they tried something similar before. What is an appropriate response?',
    options: [{ key: 'A', text: 'Apologise' }, { key: 'B', text: 'Avoid contact' }, { key: 'C', text: 'Provide proof' }, { key: 'D', text: 'Cut costs' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Addressing concerns with evidence helps rebuild trust.',
    active: true
  },
  {
    id: 52, category: 'field', difficulty: 'hard',
    questionText: 'Timing matters in field marketing primarily because why?',
    options: [{ key: 'A', text: 'Audiences travel' }, { key: 'B', text: 'Audience attention varies' }, { key: 'C', text: 'Tariffs change' }, { key: 'D', text: 'Colours change' }],
    correctAnswer: 'B',
    explanationForAdmin: 'The attention and availability of prospects differ across times and days.',
    active: true
  },
  {
    id: 53, category: 'field', difficulty: 'hard',
    questionText: 'A script that succeeds in one market but not in another should be what?',
    options: [{ key: 'A', text: 'Abandoned entirely' }, { key: 'B', text: 'Adapted to local context' }, { key: 'C', text: 'Shared publicly' }, { key: 'D', text: 'Copied everywhere' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Local differences mean messaging often needs adjustment.',
    active: true
  },
  {
    id: 54, category: 'field', difficulty: 'hard',
    questionText: 'A sceptical market leader should be approached with what attitude?',
    options: [{ key: 'A', text: 'Pressure tactics' }, { key: 'B', text: 'Bypassing them' }, { key: 'C', text: 'Respectful engagement' }, { key: 'D', text: 'Bribes' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Respect and transparency improve the chances of gaining cooperation.',
    active: true
  },
  {
    id: 55, category: 'field', difficulty: 'advanced',
    questionText: 'Two similar markets produce different conversion rates. What should you analyse first?',
    options: [{ key: 'A', text: 'Staff height' }, { key: 'B', text: 'Engagement methods' }, { key: 'C', text: 'Office hours' }, { key: 'D', text: 'Travel distance' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Differences in engagement and follow-up methods often explain why one market performs better than another.',
    active: true
  },
  {
    id: 56, category: 'field', difficulty: 'advanced',
    questionText: 'When resources are limited, where should you focus your activation efforts?',
    options: [{ key: 'A', text: 'Everyone equally' }, { key: 'B', text: 'Widely spaced markets' }, { key: 'C', text: 'Highest potential zones' }, { key: 'D', text: 'Low potential areas' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Directing effort toward high-potential markets yields better returns than spreading thinly across all areas.',
    active: true
  },
  {
    id: 57, category: 'field', difficulty: 'advanced',
    questionText: 'Fast growth with poor submissions indicates a need for what?',
    options: [{ key: 'A', text: 'Encouragement only' }, { key: 'B', text: 'Quality controls' }, { key: 'C', text: 'Bonus removal' }, { key: 'D', text: 'More teams' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Growth must be accompanied by verification and quality assurance to avoid reputational risk.',
    active: true
  },
  {
    id: 58, category: 'professionalism', difficulty: 'medium',
    questionText: 'A candidate asks for another candidate\'s details. What should you do?',
    options: [{ key: 'A', text: 'Share summary' }, { key: 'B', text: 'Post publicly' }, { key: 'C', text: 'Ask for payment' }, { key: 'D', text: 'Decline politely' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Applicant data is confidential and should not be disclosed.',
    active: true
  },
  {
    id: 59, category: 'professionalism', difficulty: 'medium',
    questionText: 'Documentation primarily supports what?',
    options: [{ key: 'A', text: 'Decoration' }, { key: 'B', text: 'Travel' }, { key: 'C', text: 'Accountability' }, { key: 'D', text: 'Entertainment' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Keeping good records enables transparency, follow-up and dispute resolution.',
    active: true
  },
  {
    id: 60, category: 'professionalism', difficulty: 'medium',
    questionText: 'A frustrated candidate should receive what?',
    options: [{ key: 'A', text: 'Jokes' }, { key: 'B', text: 'Clarification' }, { key: 'C', text: 'Short replies' }, { key: 'D', text: 'Silence' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Respectful clarification helps address misunderstandings and rebuild trust.',
    active: true
  },
  {
    id: 61, category: 'professionalism', difficulty: 'medium',
    questionText: 'Integrity in this role primarily means what?',
    options: [{ key: 'A', text: 'Strict dress code' }, { key: 'B', text: 'Honest conduct' }, { key: 'C', text: 'Lax rules' }, { key: 'D', text: 'Efficient scheduling' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Integrity involves acting truthfully with data, people and processes.',
    active: true
  },
  {
    id: 62, category: 'professionalism', difficulty: 'medium',
    questionText: 'A request to bypass the process should be what?',
    options: [{ key: 'A', text: 'Ignored' }, { key: 'B', text: 'Celebrated' }, { key: 'C', text: 'Declined' }, { key: 'D', text: 'Encouraged' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Fair recruitment requires that everyone follow the same process.',
    active: true
  },
  {
    id: 63, category: 'professionalism', difficulty: 'hard',
    questionText: 'A colleague asks you to inflate figures. What is the correct response?',
    options: [{ key: 'A', text: 'Delay reports' }, { key: 'B', text: 'Lower targets' }, { key: 'C', text: 'Cooperate quietly' }, { key: 'D', text: 'Escalate the concern' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Fabricating data undermines the organisation; it must be raised through proper channels.',
    active: true
  },
  {
    id: 64, category: 'professionalism', difficulty: 'hard',
    questionText: 'Persistent misinformation in your affiliate network should trigger what?',
    options: [{ key: 'A', text: 'Silent observation' }, { key: 'B', text: 'Policy removal' }, { key: 'C', text: 'Celebration' }, { key: 'D', text: 'Structured escalation' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Dealing with misinformation requires formal investigation and correction.',
    active: true
  },
  {
    id: 65, category: 'professionalism', difficulty: 'hard',
    questionText: 'When you receive conflicting instructions, you should primarily do what?',
    options: [{ key: 'A', text: 'Clarification' }, { key: 'B', text: 'Delay forever' }, { key: 'C', text: 'Dodging' }, { key: 'D', text: 'Guesswork' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Seeking clarification ensures you follow the correct directive and prevent mistakes.',
    active: true
  },
  {
    id: 66, category: 'professionalism', difficulty: 'hard',
    questionText: 'Unexpected spikes in performance should be what before celebration?',
    options: [{ key: 'A', text: 'Minimised' }, { key: 'B', text: 'Celebrated' }, { key: 'C', text: 'Verified' }, { key: 'D', text: 'Ignored' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Verification protects against false reporting and ensures results are legitimate.',
    active: true
  },
  {
    id: 67, category: 'professionalism', difficulty: 'hard',
    questionText: 'If your message caused confusion, what is the best course?',
    options: [{ key: 'A', text: 'Argue with recipients' }, { key: 'B', text: 'Delay replies' }, { key: 'C', text: 'Deny responsibility' }, { key: 'D', text: 'Correct promptly' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Taking responsibility and clarifying the message builds trust and avoids further confusion.',
    active: true
  },
  {
    id: 68, category: 'professionalism', difficulty: 'advanced',
    questionText: 'Strong results accompanied by repeated complaints may indicate what?',
    options: [{ key: 'A', text: 'Better design' }, { key: 'B', text: 'Guaranteed success' }, { key: 'C', text: 'Perfect system' }, { key: 'D', text: 'Hidden risk' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Good numbers can hide compliance issues or misrepresentation that must be addressed.',
    active: true
  },
  {
    id: 69, category: 'professionalism', difficulty: 'advanced',
    questionText: 'A candidate threatens publicity after being rejected. What should you do?',
    options: [{ key: 'A', text: 'Uphold process' }, { key: 'B', text: 'Agree with them' }, { key: 'C', text: 'Attack them back' }, { key: 'D', text: 'Reverse the result' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Maintain fairness and explain the transparent process rather than yielding to threats.',
    active: true
  },
  {
    id: 70, category: 'professionalism', difficulty: 'advanced',
    questionText: 'A high performing team ignores communication rules. The biggest concern is what?',
    options: [{ key: 'A', text: 'Higher pay' }, { key: 'B', text: 'Compliance risk' }, { key: 'C', text: 'Better quality' }, { key: 'D', text: 'Longer meetings' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Ignoring rules may create legal and reputational problems despite high performance.',
    active: true
  },
  {
    id: 71, category: 'digital', difficulty: 'medium',
    questionText: 'Lead generation primarily aims to do what?',
    options: [{ key: 'A', text: 'Train staff' }, { key: 'B', text: 'Arrange meetings' }, { key: 'C', text: 'Gain qualified interest' }, { key: 'D', text: 'Increase page views' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Lead generation is about attracting people who are ready to engage, not just raising awareness.',
    active: true
  },
  {
    id: 72, category: 'digital', difficulty: 'medium',
    questionText: 'Campaign reach measures what?',
    options: [{ key: 'A', text: 'Audience exposure' }, { key: 'B', text: 'Sales numbers' }, { key: 'C', text: 'Budget size' }, { key: 'D', text: 'Employee count' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Reach tells you how many unique people have seen your message.',
    active: true
  },
  {
    id: 73, category: 'digital', difficulty: 'medium',
    questionText: 'A weak headline most often causes what?',
    options: [{ key: 'A', text: 'Larger fonts' }, { key: 'B', text: 'More hires' }, { key: 'C', text: 'Lower response' }, { key: 'D', text: 'Big budgets' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Poor headlines fail to capture attention and reduce engagement.',
    active: true
  },
  {
    id: 74, category: 'digital', difficulty: 'medium',
    questionText: 'CTR measures what?',
    options: [{ key: 'A', text: 'Click response' }, { key: 'B', text: 'Channel share' }, { key: 'C', text: 'Payment due' }, { key: 'D', text: 'Employee ratio' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Click-through rate shows how many people click your advert relative to views.',
    active: true
  },
  {
    id: 75, category: 'digital', difficulty: 'medium',
    questionText: 'Comparing campaign channels helps you to do what?',
    options: [{ key: 'A', text: 'Increase costs' }, { key: 'B', text: 'Evaluate effectiveness' }, { key: 'C', text: 'Avoid changes' }, { key: 'D', text: 'Increase form length' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Assessing the performance of each channel helps you allocate resources more effectively.',
    active: true
  },

  // ─── Q76–Q150 ───
  {
    id: 76, category: 'digital', difficulty: 'hard',
    questionText: 'A campaign drives many leads but few qualified applicants. What should be changed?',
    options: [{ key: 'A', text: 'Change colour scheme' }, { key: 'B', text: 'Increase spend' }, { key: 'C', text: 'Adjust targeting and message' }, { key: 'D', text: 'Post at night' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Poor fit usually indicates the wrong audience or message.',
    active: true
  },
  {
    id: 77, category: 'digital', difficulty: 'hard',
    questionText: 'Why is promising guaranteed employment risky in recruitment marketing?',
    options: [{ key: 'A', text: 'It slows applications' }, { key: 'B', text: 'It increases budget' }, { key: 'C', text: 'It erodes credibility' }, { key: 'D', text: 'It reduces training' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Overpromising hiring outcomes damages trust and can violate compliance rules.',
    active: true
  },
  {
    id: 78, category: 'digital', difficulty: 'advanced',
    questionText: 'Two regions deliver similar cost per click but different conversion rates. What should be compared first?',
    options: [{ key: 'A', text: 'Company size' }, { key: 'B', text: 'Social media time' }, { key: 'C', text: 'Brand colours' }, { key: 'D', text: 'Audience segments and follow-up methods' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Differences in targeting and lead nurturing often explain conversion gaps.',
    active: true
  },
  {
    id: 79, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate registers but never submits any accounts and asks many questions. What should you do?',
    options: [{ key: 'A', text: 'Provide guidance and follow-up' }, { key: 'B', text: 'Replace them' }, { key: 'C', text: 'Assign penalties' }, { key: 'D', text: 'Ignore messages' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Engagement without action usually means they need clearer guidance and follow-up.',
    active: true
  },
  {
    id: 80, category: 'affiliate', difficulty: 'hard',
    questionText: 'Why is it dangerous to recruit many affiliates without screening?',
    options: [{ key: 'A', text: 'It boosts morale' }, { key: 'B', text: 'It increases inactivity and poor submissions' }, { key: 'C', text: 'It simplifies reporting' }, { key: 'D', text: 'It lowers costs' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Volume without quality creates support burden and reduces overall performance.',
    active: true
  },
  {
    id: 81, category: 'affiliate', difficulty: 'advanced',
    questionText: 'An affiliate submits unverified accounts to meet their quota. What is the proper response?',
    options: [{ key: 'A', text: 'Praise volume' }, { key: 'B', text: 'Accept temporarily' }, { key: 'C', text: 'Ignore numbers' }, { key: 'D', text: 'Count only verified accounts and review training' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Only verified results should count; the affiliate needs guidance to improve quality.',
    active: true
  },
  {
    id: 82, category: 'field', difficulty: 'hard',
    questionText: 'A market shows interest but prospects stop when cost is mentioned. What adjustment helps?',
    options: [{ key: 'A', text: 'Emphasize practical returns and payment structure' }, { key: 'B', text: 'Increase cost' }, { key: 'C', text: 'Shorten explanation' }, { key: 'D', text: 'Hide fee details' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Clarifying benefits relative to costs improves acceptance of paid services.',
    active: true
  },
  {
    id: 83, category: 'field', difficulty: 'hard',
    questionText: 'When activating rural communities, which factor is most critical?',
    options: [{ key: 'A', text: 'Local trust networks and language' }, { key: 'B', text: 'Import tariffs' }, { key: 'C', text: 'Company headquarters' }, { key: 'D', text: 'High-rise advertising' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Working with local languages and trusted figures drives adoption in rural areas.',
    active: true
  },
  {
    id: 84, category: 'professionalism', difficulty: 'hard',
    questionText: 'You notice inconsistent data entry by a colleague. What should you do?',
    options: [{ key: 'A', text: 'Discuss discrepancies privately and offer support' }, { key: 'B', text: 'Highlight mistakes publicly' }, { key: 'C', text: 'Ignore the issue' }, { key: 'D', text: 'Adjust their work silently' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Addressing the issue privately protects dignity while ensuring quality.',
    active: true
  },
  {
    id: 85, category: 'professionalism', difficulty: 'hard',
    questionText: 'An applicant demands to see other candidates\' scores. What is the proper response?',
    options: [{ key: 'A', text: 'Share the average' }, { key: 'B', text: 'Reveal scores' }, { key: 'C', text: 'Provide names' }, { key: 'D', text: 'Explain confidentiality and decline' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Applicant information must remain confidential; do not disclose others\' scores.',
    active: true
  },
  {
    id: 86, category: 'digital', difficulty: 'hard',
    questionText: 'Which combination of metrics best indicates recruitment funnel health?',
    options: [{ key: 'A', text: 'Profile views and colours' }, { key: 'B', text: 'Emails and flyer count' }, { key: 'C', text: 'Number of meetings' }, { key: 'D', text: 'Clicks, form starts, assessments, pass rate' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Looking at each stage from interest through assessment gives a holistic view of funnel quality.',
    active: true
  },
  {
    id: 87, category: 'digital', difficulty: 'advanced',
    questionText: 'A large paid campaign has a low cost per lead but a very low hire rate. What does this suggest?',
    options: [{ key: 'A', text: 'Advertising should stop' }, { key: 'B', text: 'Hiring process is too short' }, { key: 'C', text: 'Cost efficiency alone is enough' }, { key: 'D', text: 'Lead quality may be weak' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Many inexpensive leads that do not convert to hires usually means they are not the right fit.',
    active: true
  },
  {
    id: 88, category: 'affiliate', difficulty: 'advanced',
    questionText: 'Two affiliate cohorts show similar productivity, but one cohort has higher retention. What is the likely reason?',
    options: [{ key: 'A', text: 'Age difference' }, { key: 'B', text: 'Better communication and support' }, { key: 'C', text: 'Commission frequency' }, { key: 'D', text: 'Platform colour scheme' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Ongoing support and recognition improve retention even when productivity is similar.',
    active: true
  },
  {
    id: 89, category: 'affiliate', difficulty: 'hard',
    questionText: 'When addressing widespread affiliate inactivity, what should you do first?',
    options: [{ key: 'A', text: 'Send generic warnings' }, { key: 'B', text: 'Identify root causes and segment groups' }, { key: 'C', text: 'Increase targets' }, { key: 'D', text: 'Reduce training' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Understanding why people are inactive and grouping them by cause helps design effective interventions.',
    active: true
  },
  {
    id: 90, category: 'field', difficulty: 'advanced',
    questionText: 'Coastal markets have seasonal travel patterns. What should marketers prioritise?',
    options: [{ key: 'A', text: 'Bank holidays' }, { key: 'B', text: 'Timing and context-sensitive campaigns' }, { key: 'C', text: 'Rainfall data' }, { key: 'D', text: 'Head office distance' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Understanding when people are available and tailoring activation to context improves impact.',
    active: true
  },
  {
    id: 91, category: 'field', difficulty: 'hard',
    questionText: 'A town hall has low turnout but your digital engagement is high. What strategy is best?',
    options: [{ key: 'A', text: 'Stop digital messaging' }, { key: 'B', text: 'Continue a multi-channel approach' }, { key: 'C', text: 'Focus only on meetings' }, { key: 'D', text: 'Increase print materials' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Using multiple channels compensates for low physical attendance and reaches a wider audience.',
    active: true
  },
  {
    id: 92, category: 'professionalism', difficulty: 'medium',
    questionText: 'A colleague asks for your login details to access data quickly. What should you do?',
    options: [{ key: 'A', text: 'Set a joint password' }, { key: 'B', text: 'Share details' }, { key: 'C', text: 'Refuse politely and report if necessary' }, { key: 'D', text: 'Change your password to something simple' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Credentials should never be shared; decline politely and follow security policy.',
    active: true
  },
  {
    id: 93, category: 'professionalism', difficulty: 'hard',
    questionText: 'A meeting reveals tension between marketing and operations about reporting deadlines. How should this be addressed?',
    options: [{ key: 'A', text: 'Clarify expectations and create joint accountability' }, { key: 'B', text: 'Criticise operations publicly' }, { key: 'C', text: 'Extend deadlines without explanation' }, { key: 'D', text: 'Drop all data requirements' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Shared understanding and accountability resolve cross-team tension better than blame or avoidance.',
    active: true
  },
  {
    id: 94, category: 'digital', difficulty: 'medium',
    questionText: 'CTR stands for what?',
    options: [{ key: 'A', text: 'Click-through rate' }, { key: 'B', text: 'Customer ticket rate' }, { key: 'C', text: 'Conversion tracking ratio' }, { key: 'D', text: 'Client turnover record' }],
    correctAnswer: 'A',
    explanationForAdmin: 'CTR measures the proportion of clicks to impressions.',
    active: true
  },
  {
    id: 95, category: 'digital', difficulty: 'hard',
    questionText: 'In recruitment, A/B testing is primarily used to do what?',
    options: [{ key: 'A', text: 'Compare two versions of content or design' }, { key: 'B', text: 'Test different application forms' }, { key: 'C', text: 'Reduce campaign budget' }, { key: 'D', text: 'Predict final hire numbers' }],
    correctAnswer: 'A',
    explanationForAdmin: 'A/B tests show which version of a message or page performs better.',
    active: true
  },
  {
    id: 96, category: 'affiliate', difficulty: 'medium',
    questionText: 'Why are daily goals set for affiliates?',
    options: [{ key: 'A', text: 'Improve logo recall' }, { key: 'B', text: 'Ensure everyone starts together' }, { key: 'C', text: 'Make performance tracking easier' }, { key: 'D', text: 'Eliminate monthly targets' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Smaller daily targets make performance easier to measure and adjust.',
    active: true
  },
  {
    id: 97, category: 'affiliate', difficulty: 'hard',
    questionText: 'A new affiliate joins several groups but does not participate. What should you do first?',
    options: [{ key: 'A', text: 'Ignore until month-end' }, { key: 'B', text: 'Remove them from all groups' }, { key: 'C', text: 'Send payment reminders' }, { key: 'D', text: 'Contact them directly to understand' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Speaking one-on-one uncovers why they are disengaged and how to support them.',
    active: true
  },
  {
    id: 98, category: 'field', difficulty: 'medium',
    questionText: 'Which tactic often increases follow-up response?',
    options: [{ key: 'A', text: 'More emojis' }, { key: 'B', text: 'Personal voice notes' }, { key: 'C', text: 'Complex statistics' }, { key: 'D', text: 'Longer text' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Voice notes convey tone and clarity, making follow-up feel more personal and easy to understand.',
    active: true
  },
  {
    id: 99, category: 'field', difficulty: 'hard',
    questionText: 'In a market where people distrust online banking, messages should focus on what?',
    options: [{ key: 'A', text: 'Technical jargon' }, { key: 'B', text: 'Banking regulations' }, { key: 'C', text: 'Tangible benefits and security assurances' }, { key: 'D', text: 'Brand colours' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Clear explanations of benefits and security help overcome distrust more than technical detail alone.',
    active: true
  },
  {
    id: 100, category: 'professionalism', difficulty: 'hard',
    questionText: 'A complaint reaches you about a field associate\'s rude behaviour. What is your first action?',
    options: [{ key: 'A', text: 'Mock the complainer' }, { key: 'B', text: 'Ignore the complaint' }, { key: 'C', text: 'Terminate them immediately' }, { key: 'D', text: 'Investigate the incident and gather context' }],
    correctAnswer: 'D',
    explanationForAdmin: 'A thorough investigation is needed before deciding on further action.',
    active: true
  },
  {
    id: 101, category: 'digital', difficulty: 'medium',
    questionText: 'Why use a drip email sequence for engaged applicants?',
    options: [{ key: 'A', text: 'It increases budget' }, { key: 'B', text: 'It eliminates human interaction' }, { key: 'C', text: 'It nurtures interest and provides information over time' }, { key: 'D', text: 'It reduces brand recall' }],
    correctAnswer: 'C',
    explanationForAdmin: 'A drip sequence sustains engagement and guides candidates toward completion of the process.',
    active: true
  },
  {
    id: 102, category: 'digital', difficulty: 'hard',
    questionText: 'A campaign with the highest click-through rate does not produce the highest hire rate. What should be examined?',
    options: [{ key: 'A', text: 'Message-to-assessment continuity' }, { key: 'B', text: 'Comment length' }, { key: 'C', text: 'CPU speed' }, { key: 'D', text: 'Number of hashtags' }],
    correctAnswer: 'A',
    explanationForAdmin: 'High click rates alone do not guarantee conversions; the journey from click to hire matters.',
    active: true
  },
  {
    id: 103, category: 'affiliate', difficulty: 'medium',
    questionText: 'What should a starter pack for affiliates include?',
    options: [{ key: 'A', text: 'Office layout plan' }, { key: 'B', text: 'Corporate slogans' }, { key: 'C', text: 'Role summary and earning guide' }, { key: 'D', text: 'Discount codes' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Summarising roles, processes and earnings expectations prepares affiliates for success.',
    active: true
  },
  {
    id: 104, category: 'affiliate', difficulty: 'hard',
    questionText: 'Which outcome indicates a high-quality affiliate?',
    options: [{ key: 'A', text: 'Access to network cable' }, { key: 'B', text: 'Consistent verified results' }, { key: 'C', text: 'Group membership count' }, { key: 'D', text: 'Frequency of interest messages' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Verified performance over time is a stronger indicator of affiliate quality than network or chatter.',
    active: true
  },
  {
    id: 105, category: 'field', difficulty: 'medium',
    questionText: 'How can marketers overcome language barriers?',
    options: [{ key: 'A', text: 'Use local translators or simplified materials' }, { key: 'B', text: 'Use technical terms' }, { key: 'C', text: 'Deliver longer scripts in English' }, { key: 'D', text: 'Avoid visits' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Speaking in local languages or simplifying materials increases understanding and trust.',
    active: true
  },
  {
    id: 106, category: 'field', difficulty: 'hard',
    questionText: 'A big activation draws a crowd but few sign-ups. What is most likely missing?',
    options: [{ key: 'A', text: 'Weather conditions' }, { key: 'B', text: 'Venue size' }, { key: 'C', text: 'Clear call to action and follow-up' }, { key: 'D', text: 'Government permits' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Without clear instructions and follow-up, crowd interest does not translate into conversions.',
    active: true
  },
  {
    id: 107, category: 'professionalism', difficulty: 'medium',
    questionText: 'A candidate thanks you with a small gift for assistance. What should you do?',
    options: [{ key: 'A', text: 'Decline and explain policy' }, { key: 'B', text: 'Exchange gifts' }, { key: 'C', text: 'Ask for a bigger gift' }, { key: 'D', text: 'Accept quietly' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Policies usually prohibit gifts to avoid conflicts of interest.',
    active: true
  },
  {
    id: 108, category: 'professionalism', difficulty: 'hard',
    questionText: 'You learn a colleague has been sharing confidential applicant data. What must you do?',
    options: [{ key: 'A', text: 'Report to management and reinforce confidentiality' }, { key: 'B', text: 'Ignore the issue' }, { key: 'C', text: 'Join them' }, { key: 'D', text: 'Ask for part of the data' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Protecting sensitive information is a shared responsibility; breaches must be reported.',
    active: true
  },
  {
    id: 109, category: 'digital', difficulty: 'hard',
    questionText: 'ROAS stands for what in performance marketing?',
    options: [{ key: 'A', text: 'Revenue over ad spend' }, { key: 'B', text: 'Return on advertising spend' }, { key: 'C', text: 'Roles of affiliate staff' }, { key: 'D', text: 'Recruitment over assessment speed' }],
    correctAnswer: 'B',
    explanationForAdmin: 'ROAS measures the return generated per unit of advertising spend.',
    active: true
  },
  {
    id: 110, category: 'digital', difficulty: 'advanced',
    questionText: 'A campaign generates balanced traffic, strong engagement and high assessment participation, but few hires. Which part likely needs attention?',
    options: [{ key: 'A', text: 'Interview scheduling and candidate fit' }, { key: 'B', text: 'Landing page design' }, { key: 'C', text: 'Payment method' }, { key: 'D', text: 'Background music' }],
    correctAnswer: 'A',
    explanationForAdmin: 'If conversion is low at the final stage, review interview scheduling and candidate fit criteria.',
    active: true
  },
  {
    id: 111, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate complains of insufficient training after multiple sessions. What should you do?',
    options: [{ key: 'A', text: 'Blame them for not listening' }, { key: 'B', text: 'Provide targeted guidance after assessing their understanding' }, { key: 'C', text: 'End the programme' }, { key: 'D', text: 'Remove them from all groups' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Identify gaps and tailor guidance rather than dismissing their concerns.',
    active: true
  },
  {
    id: 112, category: 'affiliate', difficulty: 'advanced',
    questionText: 'A long-standing affiliate meets performance goals but mentors new affiliates poorly. What should management do?',
    options: [{ key: 'A', text: 'Reduce their commissions' }, { key: 'B', text: 'Promote them to lead the programme' }, { key: 'C', text: 'Provide coaching for mentoring and set clear expectations' }, { key: 'D', text: 'Ignore mentoring issues' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Coaching and clear expectations can help a strong performer support others effectively.',
    active: true
  },
  {
    id: 113, category: 'field', difficulty: 'medium',
    questionText: 'A potential applicant is hesitant due to a long process. What is a reasonable response?',
    options: [{ key: 'A', text: 'Explain the timeline and benefits clearly' }, { key: 'B', text: 'Deny any delay exists' }, { key: 'C', text: 'Increase the timeline' }, { key: 'D', text: 'Suggest skipping steps' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Transparency helps manage expectations and shows commitment to supporting them through the process.',
    active: true
  },
  {
    id: 114, category: 'field', difficulty: 'hard',
    questionText: 'A market association will only consider proposals from local small businesses. What should Transbill do first?',
    options: [{ key: 'A', text: 'Use a large billboard' }, { key: 'B', text: 'Wait for policy change' }, { key: 'C', text: 'Partner with a local affiliate or business' }, { key: 'D', text: 'Send proposals anyway' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Working with local businesses meets association requirements and builds credibility.',
    active: true
  },
  {
    id: 115, category: 'professionalism', difficulty: 'medium',
    questionText: 'You promised to call back a candidate but missed it. What is the best approach?',
    options: [{ key: 'A', text: 'Blame your supervisor' }, { key: 'B', text: 'Apologise and call back promptly with an update' }, { key: 'C', text: 'Ignore until they call again' }, { key: 'D', text: 'Share your personal number publicly' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Acknowledging the oversight and keeping your promise demonstrates professionalism.',
    active: true
  },
  {
    id: 116, category: 'professionalism', difficulty: 'hard',
    questionText: 'Why should notes from candidate interactions be maintained?',
    options: [{ key: 'A', text: 'To support consistent follow-up and accountability' }, { key: 'B', text: 'To delay decisions' }, { key: 'C', text: 'To share on social media' }, { key: 'D', text: 'To evaluate what jokes to use' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Accurate records ensure reliable follow-up and transparency.',
    active: true
  },
  {
    id: 117, category: 'digital', difficulty: 'medium',
    questionText: 'Segmenting an email list is useful primarily because it allows what?',
    options: [{ key: 'A', text: 'Metrics inflation' }, { key: 'B', text: 'Everyone to receive identical emails' }, { key: 'C', text: 'Tailored messages to groups' }, { key: 'D', text: 'Higher server costs' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Segmentation ensures content is relevant for different audience segments.',
    active: true
  },
  {
    id: 118, category: 'digital', difficulty: 'hard',
    questionText: 'A recruitment email campaign has a high unsubscribe rate. What is the most likely cause?',
    options: [{ key: 'A', text: 'Hidden unsubscribe link' }, { key: 'B', text: 'Overly frequent or irrelevant content' }, { key: 'C', text: 'Short subject lines' }, { key: 'D', text: 'Lack of emojis' }],
    correctAnswer: 'B',
    explanationForAdmin: 'People unsubscribe when emails become too frequent or are not relevant to them.',
    active: true
  },
  {
    id: 119, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate meets daily targets but refuses to attend update sessions. What should you do?',
    options: [{ key: 'A', text: 'Deduct earnings' }, { key: 'B', text: 'Ignore their attendance' }, { key: 'C', text: 'Explain the importance of communication and set expectations' }, { key: 'D', text: 'Increase their targets' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Effective communication and alignment are necessary for sustainable performance even for high achievers.',
    active: true
  },
  {
    id: 120, category: 'affiliate', difficulty: 'advanced',
    questionText: 'An affiliate leader wants a special commission rate. What is the best approach?',
    options: [{ key: 'A', text: 'Refuse all custom requests to avoid complexity' }, { key: 'B', text: 'Explain that commission structures must remain transparent, consistent and subject to policy review' }, { key: 'C', text: 'Promise personal gifts' }, { key: 'D', text: 'Offer unique rates immediately' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Commission policies should be clear and apply fairly to all affiliates.',
    active: true
  },
  {
    id: 121, category: 'field', difficulty: 'hard',
    questionText: 'In an overcrowded market, what most reduces message impact?',
    options: [{ key: 'A', text: 'Short sentences' }, { key: 'B', text: 'Complex language and long explanations' }, { key: 'C', text: 'Bright colours' }, { key: 'D', text: 'Loudspeakers' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Busy environments require clear and concise messages; complexity loses attention.',
    active: true
  },
  {
    id: 122, category: 'field', difficulty: 'hard',
    questionText: 'A prospect expresses distrust because of previous scams. What is the most effective initial response?',
    options: [{ key: 'A', text: 'Sell aggressively' }, { key: 'B', text: 'Share verified success stories and contact details' }, { key: 'C', text: 'Offer instant rewards' }, { key: 'D', text: 'Ignore the concern' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Evidence of success and transparency help rebuild trust.',
    active: true
  },
  {
    id: 123, category: 'professionalism', difficulty: 'medium',
    questionText: 'You overhear a colleague making disparaging remarks about applicants. What is the proper reaction?',
    options: [{ key: 'A', text: 'Address the behaviour privately' }, { key: 'B', text: 'Ignore permanently' }, { key: 'C', text: 'Laugh along' }, { key: 'D', text: 'Share the remarks' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Unprofessional behaviour should be addressed respectfully to maintain fairness.',
    active: true
  },
  {
    id: 124, category: 'professionalism', difficulty: 'hard',
    questionText: 'A team member uses personal social media to share confidential programme details. How should you respond?',
    options: [{ key: 'A', text: 'Like the post' }, { key: 'B', text: 'Investigate the breach and address it through policy enforcement' }, { key: 'C', text: 'Ask them to share more' }, { key: 'D', text: 'Ignore the leak' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Breaching confidentiality requires investigation and corrective action.',
    active: true
  },
  {
    id: 125, category: 'digital', difficulty: 'medium',
    questionText: 'What metric shows the average amount spent to get one lead?',
    options: [{ key: 'A', text: 'Overall reach' }, { key: 'B', text: 'Staff salary' }, { key: 'C', text: 'Cost per lead' }, { key: 'D', text: 'Daily budget' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Cost per lead measures spending efficiency on lead generation.',
    active: true
  },
  {
    id: 126, category: 'digital', difficulty: 'hard',
    questionText: 'Two campaigns have the same cost per click and lead volume, but one has a much higher pass rate. What should you adjust?',
    options: [{ key: 'A', text: 'Staff training' }, { key: 'B', text: 'Targeting criteria and message fit' }, { key: 'C', text: 'Company logo' }, { key: 'D', text: 'Daily spend' }],
    correctAnswer: 'B',
    explanationForAdmin: 'The quality of targeting and messaging affects how well leads convert.',
    active: true
  },
  {
    id: 127, category: 'affiliate', difficulty: 'medium',
    questionText: 'What often differentiates high-performing affiliates from others?',
    options: [{ key: 'A', text: 'Device colour' }, { key: 'B', text: 'Clothing brand' }, { key: 'C', text: 'Music preference' }, { key: 'D', text: 'Persistence and follow-up discipline' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Persistent outreach and disciplined follow-up create success.',
    active: true
  },
  {
    id: 128, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate submits poor-quality data in a rush. What is the right corrective action?',
    options: [{ key: 'A', text: 'Praise their speed' }, { key: 'B', text: 'Accept temporarily' }, { key: 'C', text: 'Provide feedback on quality standards and monitor improvements' }, { key: 'D', text: 'Terminate affiliation' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Constructive feedback with monitoring helps raise performance standards.',
    active: true
  },
  {
    id: 129, category: 'field', difficulty: 'medium',
    questionText: 'Why is accurate contact information important during market activation?',
    options: [{ key: 'A', text: 'To delay marketing' }, { key: 'B', text: 'To track performance and provide support' }, { key: 'C', text: 'To sell data' }, { key: 'D', text: 'To spam prospects' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Accurate contacts enable proper follow-up and analysis of activation outcomes.',
    active: true
  },
  {
    id: 130, category: 'field', difficulty: 'hard',
    questionText: 'A market consistently shows no interest despite repeated visits. What is the best next step?',
    options: [{ key: 'A', text: 'Assess viability and reallocate resources' }, { key: 'B', text: 'Reduce training' }, { key: 'C', text: 'Increase visits' }, { key: 'D', text: 'Print more flyers' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Not every market is viable; resources should be focused where there is potential.',
    active: true
  },
  {
    id: 131, category: 'professionalism', difficulty: 'medium',
    questionText: 'A candidate insists on meeting at your home. What should you do?',
    options: [{ key: 'A', text: 'Share your address' }, { key: 'B', text: 'Go ahead for convenience' }, { key: 'C', text: 'Allow the visit' }, { key: 'D', text: 'Decline and offer to meet in an appropriate setting' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Maintaining boundaries by meeting in a professional setting protects safety and professionalism.',
    active: true
  },
  {
    id: 132, category: 'professionalism', difficulty: 'hard',
    questionText: 'You notice biases in your team\'s interview decisions. What should you do?',
    options: [{ key: 'A', text: 'Laugh about it' }, { key: 'B', text: 'Raise the concern and encourage fair, objective evaluations' }, { key: 'C', text: 'Speed up interviews' }, { key: 'D', text: 'Join the bias' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Identifying and addressing bias ensures fairness and improves hiring quality.',
    active: true
  },
  {
    id: 133, category: 'digital', difficulty: 'hard',
    questionText: 'Why should marketing messages be consistent across channels?',
    options: [{ key: 'A', text: 'It drives up page length' }, { key: 'B', text: 'It lowers cost' }, { key: 'C', text: 'It prevents confusion and builds trust' }, { key: 'D', text: 'It reduces campaign variety' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Consistency across channels reinforces credibility and avoids mixed signals.',
    active: true
  },
  {
    id: 134, category: 'digital', difficulty: 'advanced',
    questionText: 'Given three channels where Channel A yields 500 leads with 100 conversions, Channel B yields 300 leads with 90 conversions, and Channel C yields 100 leads with 80 conversions, which channel has the highest conversion rate?',
    options: [{ key: 'A', text: 'Channel C' }, { key: 'B', text: 'Channel B' }, { key: 'C', text: 'Channel A and B' }, { key: 'D', text: 'Channel A' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Channel C converts 80 out of 100 leads (80%), which is higher than the other channels.',
    active: true
  },
  {
    id: 135, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate consistently inflates results to appear more productive. Which signal may indicate this?',
    options: [{ key: 'A', text: 'Many verified accounts' }, { key: 'B', text: 'Discrepancies between self-reported and system-verified results' }, { key: 'C', text: 'Frequent group participation' }, { key: 'D', text: 'High social media activity' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Comparing reported data with verified records helps detect discrepancies.',
    active: true
  },
  {
    id: 136, category: 'affiliate', difficulty: 'advanced',
    questionText: 'When scaling an affiliate programme to thousands of participants, what infrastructure becomes critical?',
    options: [{ key: 'A', text: 'A performance tracking and reporting system' }, { key: 'B', text: 'Fancy office chairs' }, { key: 'C', text: 'Random reward distribution' }, { key: 'D', text: 'More WhatsApp groups' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Scaling requires structured data systems to track and manage performance across a large network.',
    active: true
  },
  {
    id: 137, category: 'field', difficulty: 'hard',
    questionText: 'If affiliates conflict over the same prospects, what is the best resolution?',
    options: [{ key: 'A', text: 'Remove both affiliates' }, { key: 'B', text: 'Increase commission' }, { key: 'C', text: 'Clarify territorial boundaries and assign market segments' }, { key: 'D', text: 'Allow competition to continue' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Defining boundaries prevents overlap and conflict.',
    active: true
  },
  {
    id: 138, category: 'field', difficulty: 'advanced',
    questionText: 'Your team must double account openings within three months. Which strategy improves efficiency without doubling headcount?',
    options: [{ key: 'A', text: 'Increase random calls' }, { key: 'B', text: 'Reduce onboarding training' }, { key: 'C', text: 'Extend working hours' }, { key: 'D', text: 'Improve lead quality and conversion processes' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Better quality leads and conversion processes produce more results without proportionate resource increases.',
    active: true
  },
  {
    id: 139, category: 'professionalism', difficulty: 'medium',
    questionText: 'During an interview, a candidate mentions knowing your friend. What should you do?',
    options: [{ key: 'A', text: 'Cancel the interview' }, { key: 'B', text: 'Ask for gossip' }, { key: 'C', text: 'Continue using the same fair process' }, { key: 'D', text: 'Offer special treatment' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Personal connections should not influence the assessment or process.',
    active: true
  },
  {
    id: 140, category: 'professionalism', difficulty: 'hard',
    questionText: 'A colleague takes credit for your contribution in a team report. What is the most professional action?',
    options: [{ key: 'A', text: 'Claim credit later without proof' }, { key: 'B', text: 'Congratulate them publicly' }, { key: 'C', text: 'Ignore it permanently' }, { key: 'D', text: 'Address the issue privately and request proper acknowledgment' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Private discussion protects the relationship and ensures credit is given appropriately.',
    active: true
  },
  {
    id: 141, category: 'digital', difficulty: 'medium',
    questionText: 'Why is mobile optimisation critical for recruitment pages?',
    options: [{ key: 'A', text: 'It increases printing cost' }, { key: 'B', text: 'It lengthens the page' }, { key: 'C', text: 'It adds more images' }, { key: 'D', text: 'Many candidates use smartphones' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Most users access content on mobile devices; pages must work well on phones to avoid abandonment.',
    active: true
  },
  {
    id: 142, category: 'digital', difficulty: 'hard',
    questionText: 'Why might long forms reduce completion rates?',
    options: [{ key: 'A', text: 'They improve data quality' }, { key: 'B', text: 'They attract better applicants' }, { key: 'C', text: 'They provide more context' }, { key: 'D', text: 'They increase drop-off points' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Longer forms create friction that leads to abandonment.',
    active: true
  },
  {
    id: 143, category: 'affiliate', difficulty: 'medium',
    questionText: 'KYC is primarily used to ensure what?',
    options: [{ key: 'A', text: 'Fun group activities' }, { key: 'B', text: 'Compliance with regulations and account validity' }, { key: 'C', text: 'Frequent event updates' }, { key: 'D', text: 'Creative marketing slogans' }],
    correctAnswer: 'B',
    explanationForAdmin: 'KYC protects against fraud and complies with regulatory requirements.',
    active: true
  },
  {
    id: 144, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate programme experiences rapid churn despite high payments. Which factor is likely to reduce churn?',
    options: [{ key: 'A', text: 'Increase group size' }, { key: 'B', text: 'Extend working hours' }, { key: 'C', text: 'Improve communication, training and recognition programmes' }, { key: 'D', text: 'Print more flyers' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Retention is influenced by support, clarity and recognition as much as by money.',
    active: true
  },
  {
    id: 145, category: 'field', difficulty: 'medium',
    questionText: 'Which resource supports efficiency during market activation?',
    options: [{ key: 'A', text: 'Random pamphlets' }, { key: 'B', text: 'A simple contact tracker or dashboard' }, { key: 'C', text: 'Cash rewards' }, { key: 'D', text: 'Expensive billboards' }],
    correctAnswer: 'B',
    explanationForAdmin: 'A tracking tool helps organise contacts and follow-ups.',
    active: true
  },
  {
    id: 146, category: 'field', difficulty: 'hard',
    questionText: 'A market leader is reluctant because of past scams. What approach can help gain access?',
    options: [{ key: 'A', text: 'Avoid associations permanently' }, { key: 'B', text: 'Offer incentives without verification' }, { key: 'C', text: 'Increase advertising budget' }, { key: 'D', text: 'Partner with respected local individuals or groups' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Working through trusted local partners builds credibility and counteracts past negative experiences.',
    active: true
  },
  {
    id: 147, category: 'professionalism', difficulty: 'medium',
    questionText: 'Why should you avoid negative comments about previous employers during interviews?',
    options: [{ key: 'A', text: 'It reduces stress' }, { key: 'B', text: 'It saves time' }, { key: 'C', text: 'It demonstrates professionalism and focus' }, { key: 'D', text: 'It guarantees better offers' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Staying positive about past employers reflects professionalism and maturity.',
    active: true
  },
  {
    id: 148, category: 'professionalism', difficulty: 'hard',
    questionText: 'A team member consistently arrives late but performs well. Which step might address the issue?',
    options: [{ key: 'A', text: 'Add more tasks' }, { key: 'B', text: 'Reduce their workload' }, { key: 'C', text: 'Discuss punctuality expectations and explore solutions' }, { key: 'D', text: 'Ignore because they perform well' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Addressing the behaviour while acknowledging performance fosters accountability and respect.',
    active: true
  },
  {
    id: 149, category: 'digital', difficulty: 'medium',
    questionText: 'Which channel is often best for establishing professional credibility?',
    options: [{ key: 'A', text: 'Professional networking platforms like LinkedIn' }, { key: 'B', text: 'Entertainment forums' }, { key: 'C', text: 'Personal diaries' }, { key: 'D', text: 'Photo albums' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Platforms like LinkedIn showcase professional experience and achievements.',
    active: true
  },
  {
    id: 150, category: 'digital', difficulty: 'hard',
    questionText: 'Why might a recruitment campaign underperform if the landing page loads slowly?',
    options: [{ key: 'A', text: 'Slow pages reduce server cost' }, { key: 'B', text: 'Slow pages increase curiosity' }, { key: 'C', text: 'Slow pages can cause visitors to leave' }, { key: 'D', text: 'Slow pages improve data collection' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Users often abandon slow pages, which reduces conversions.',
    active: true
  },

  // ─── Q151–Q225 ───
  {
    id: 151, category: 'digital', difficulty: 'medium',
    questionText: 'Which element most affects a landing page\'s load speed and user retention?',
    options: [{ key: 'A', text: 'Fewer form fields' }, { key: 'B', text: 'Short headlines' }, { key: 'C', text: 'Large uncompressed images' }, { key: 'D', text: 'Colour saturation' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Heavy, uncompressed images slow down page loading and can lead to higher bounce rates.',
    active: true
  },
  {
    id: 152, category: 'digital', difficulty: 'medium',
    questionText: 'Why should mobile responsiveness be tested on recruitment pages?',
    options: [{ key: 'A', text: 'It shortens the form' }, { key: 'B', text: 'It reduces analytics' }, { key: 'C', text: 'It increases word count' }, { key: 'D', text: 'Many users access via phones' }],
    correctAnswer: 'D',
    explanationForAdmin: 'With most candidates on mobile devices, responsive design ensures accessibility and usability.',
    active: true
  },
  {
    id: 153, category: 'digital', difficulty: 'medium',
    questionText: 'What does a high click-through rate but low conversion rate usually indicate?',
    options: [{ key: 'A', text: 'Strong brand trust' }, { key: 'B', text: 'Correct targeting' }, { key: 'C', text: 'Weak call to action' }, { key: 'D', text: 'High ad spend' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Users may click out of curiosity, but poor copy or unclear next steps prevent conversion.',
    active: true
  },
  {
    id: 154, category: 'digital', difficulty: 'medium',
    questionText: 'Why segment an email list by engagement level?',
    options: [{ key: 'A', text: 'To remove unsubscribes' }, { key: 'B', text: 'To increase bounce rates' }, { key: 'C', text: 'To reduce message length' }, { key: 'D', text: 'To tailor follow-up content' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Segmenting based on past interactions allows personalised messaging that resonates better.',
    active: true
  },
  {
    id: 155, category: 'digital', difficulty: 'hard',
    questionText: 'When a recruitment funnel sees heavy top-of-funnel volume but few hires, the first diagnostic should focus on:',
    options: [{ key: 'A', text: 'Domain registrar' }, { key: 'B', text: 'Office furniture' }, { key: 'C', text: 'Campaign colour palette' }, { key: 'D', text: 'Interview and selection process' }],
    correctAnswer: 'D',
    explanationForAdmin: 'If interest is high but hires remain low, the issue often lies with interviews or selection criteria.',
    active: true
  },
  {
    id: 156, category: 'digital', difficulty: 'hard',
    questionText: 'Which attribution model gives all credit to the final touchpoint before conversion?',
    options: [{ key: 'A', text: 'Time decay attribution' }, { key: 'B', text: 'First-click attribution' }, { key: 'C', text: 'Linear attribution' }, { key: 'D', text: 'Last-click attribution' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Last-click attribution assumes the last channel gets full credit, ignoring earlier interactions.',
    active: true
  },
  {
    id: 157, category: 'digital', difficulty: 'hard',
    questionText: 'Why might a high open rate but low click rate occur in recruitment emails?',
    options: [{ key: 'A', text: 'Offer not compelling' }, { key: 'B', text: 'Too many colours' }, { key: 'C', text: 'High budgets' }, { key: 'D', text: 'Good landing pages' }],
    correctAnswer: 'A',
    explanationForAdmin: 'If recipients open emails but do not click, the content or call to action may not interest them.',
    active: true
  },
  {
    id: 158, category: 'digital', difficulty: 'advanced',
    questionText: 'In multi-channel campaigns, what is the primary advantage of using UTM parameters?',
    options: [{ key: 'A', text: 'Shortening links' }, { key: 'B', text: 'Increasing font sizes' }, { key: 'C', text: 'Avoiding cookies' }, { key: 'D', text: 'Tracking source and medium' }],
    correctAnswer: 'D',
    explanationForAdmin: 'UTM tags allow marketers to identify which channel and campaign generate conversions.',
    active: true
  },
  {
    id: 159, category: 'affiliate', difficulty: 'medium',
    questionText: 'Why are clear first-week milestones important for affiliates?',
    options: [{ key: 'A', text: 'They increase pay instantly' }, { key: 'B', text: 'They remove oversight' }, { key: 'C', text: 'They reduce targets' }, { key: 'D', text: 'They guide early activity' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Simple, achievable milestones help new affiliates build momentum and confidence.',
    active: true
  },
  {
    id: 160, category: 'affiliate', difficulty: 'medium',
    questionText: 'A new affiliate is active in all group chats but has not opened any accounts. What is the best response?',
    options: [{ key: 'A', text: 'Reach out directly for support' }, { key: 'B', text: 'Remove them from the programme' }, { key: 'C', text: 'Increase their goals' }, { key: 'D', text: 'Ignore their engagement' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Direct contact helps identify barriers and offers guidance toward productive actions.',
    active: true
  },
  {
    id: 161, category: 'affiliate', difficulty: 'medium',
    questionText: 'What is the purpose of performance dashboards for affiliate managers?',
    options: [{ key: 'A', text: 'To slow down agents' }, { key: 'B', text: 'To decorate reports' }, { key: 'C', text: 'To reduce salaries' }, { key: 'D', text: 'To monitor activity and results' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Dashboards provide visibility into metrics like registrations, activations and verified accounts.',
    active: true
  },
  {
    id: 162, category: 'affiliate', difficulty: 'hard',
    questionText: 'Why should commission structures be published and consistent?',
    options: [{ key: 'A', text: 'To increase complexity' }, { key: 'B', text: 'To discourage recruits' }, { key: 'C', text: 'To ensure transparency and trust' }, { key: 'D', text: 'To hide earnings' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Clear, consistent commission policies prevent misunderstandings and build confidence in the programme.',
    active: true
  },
  {
    id: 163, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate repeatedly exaggerates account numbers. Which procedure helps prevent this?',
    options: [{ key: 'A', text: 'Removing training' }, { key: 'B', text: 'Cross-checking submissions with bank reports' }, { key: 'C', text: 'Reducing targets' }, { key: 'D', text: 'Ignoring data' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Verifying with official reporting ensures accurate performance metrics.',
    active: true
  },
  {
    id: 164, category: 'affiliate', difficulty: 'hard',
    questionText: 'What is an effective way to support affiliates who are struggling with the pitch?',
    options: [{ key: 'A', text: 'Raise their commission rate' }, { key: 'B', text: 'Change logos' }, { key: 'C', text: 'Shorten the pitches further' }, { key: 'D', text: 'Provide example scripts and role plays' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Practical materials and practice sessions help affiliates refine their message and respond to questions.',
    active: true
  },
  {
    id: 165, category: 'affiliate', difficulty: 'advanced',
    questionText: 'When launching in a new region, which factor should be considered before recruiting affiliates?',
    options: [{ key: 'A', text: 'Colour of the uniform' }, { key: 'B', text: 'Local financial regulations and cultural practices' }, { key: 'C', text: 'Size of the head office' }, { key: 'D', text: 'Number of email templates' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Understanding regional rules and customs prevents compliance issues and supports acceptance.',
    active: true
  },
  {
    id: 166, category: 'field', difficulty: 'medium',
    questionText: 'Which communication tool is often most effective for quick updates to market prospects?',
    options: [{ key: 'A', text: 'Printed newsletters' }, { key: 'B', text: 'WhatsApp messages' }, { key: 'C', text: 'Office memos' }, { key: 'D', text: 'Billboards' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Instant messaging platforms like WhatsApp allow timely and direct outreach to individuals and groups.',
    active: true
  },
  {
    id: 167, category: 'field', difficulty: 'medium',
    questionText: 'Why is it helpful to record local market feedback after activation visits?',
    options: [{ key: 'A', text: 'To reduce the number of emails sent' }, { key: 'B', text: 'To fill storage space' }, { key: 'C', text: 'To avoid personal contact' }, { key: 'D', text: 'To refine future messaging and strategy' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Notes from market visits help adjust and improve subsequent engagement and campaigns.',
    active: true
  },
  {
    id: 168, category: 'field', difficulty: 'medium',
    questionText: 'A trader says they will think about becoming an affiliate later. What should a marketer do next?',
    options: [{ key: 'A', text: 'Increase pressure immediately' }, { key: 'B', text: 'Remove them from the contact list' }, { key: 'C', text: 'Note their contact details and follow up' }, { key: 'D', text: 'End all communication' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Capturing details and scheduling follow-up preserves the opportunity without pressuring the prospect.',
    active: true
  },
  {
    id: 169, category: 'field', difficulty: 'hard',
    questionText: 'Which approach builds trust in markets where digital banking is unfamiliar?',
    options: [{ key: 'A', text: 'Avoid discussing benefits' }, { key: 'B', text: 'Present simple explanations and in-person demos' }, { key: 'C', text: 'Focus on technical jargon' }, { key: 'D', text: 'Use only social media posts' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Demonstrations and plain language help people understand and trust new services.',
    active: true
  },
  {
    id: 170, category: 'field', difficulty: 'hard',
    questionText: 'A market leader asks for proof that the programme is legitimate. What is the best response?',
    options: [{ key: 'A', text: 'Change the topic' }, { key: 'B', text: 'Provide official documentation and references' }, { key: 'C', text: 'Tell them to search online' }, { key: 'D', text: 'Insist that proof is unnecessary' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Formal letters and credible references reassure leaders and open doors for engagement.',
    active: true
  },
  {
    id: 171, category: 'field', difficulty: 'hard',
    questionText: 'If a community\'s peak market day is Friday morning, when should an activation be planned?',
    options: [{ key: 'A', text: 'Monday evening' }, { key: 'B', text: 'Friday morning when attendance is highest' }, { key: 'C', text: 'During public holidays' }, { key: 'D', text: 'Early Saturday' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Choosing the busiest time increases the chance to meet prospects and community leaders.',
    active: true
  },
  {
    id: 172, category: 'field', difficulty: 'advanced',
    questionText: 'A cluster of affiliates in a market generates many signups but few verified accounts. Which action should be taken first?',
    options: [{ key: 'A', text: 'Investigate onboarding and verification processes' }, { key: 'B', text: 'Ignore the discrepancy' }, { key: 'C', text: 'Remove the cluster' }, { key: 'D', text: 'Increase the registration form length' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Identifying where the conversion fails helps adjust training and tools for better verification.',
    active: true
  },
  {
    id: 173, category: 'professionalism', difficulty: 'medium',
    questionText: 'A candidate requests personal favours in return for placement. How should this be addressed?',
    options: [{ key: 'A', text: 'Delay the response indefinitely' }, { key: 'B', text: 'Consider the favour privately' }, { key: 'C', text: 'Ask for more details' }, { key: 'D', text: 'Decline and restate fair process' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Ethical recruitment requires refusing special favours and reinforcing impartiality.',
    active: true
  },
  {
    id: 174, category: 'professionalism', difficulty: 'medium',
    questionText: 'Why is confidentiality important when handling applicant data?',
    options: [{ key: 'A', text: 'To create longer forms' }, { key: 'B', text: 'To protect privacy and comply with regulations' }, { key: 'C', text: 'To share details with others' }, { key: 'D', text: 'To reduce application numbers' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Respecting data privacy builds trust and meets legal obligations.',
    active: true
  },
  {
    id: 175, category: 'professionalism', difficulty: 'medium',
    questionText: 'A team member disagrees with a supervisor\'s instructions and raises it constructively. What is this an example of?',
    options: [{ key: 'A', text: 'Insubordination' }, { key: 'B', text: 'Disregard for policy' }, { key: 'C', text: 'Professional communication' }, { key: 'D', text: 'Poor attitude' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Raising concerns respectfully within channels demonstrates professional integrity.',
    active: true
  },
  {
    id: 176, category: 'professionalism', difficulty: 'hard',
    questionText: 'Why document the outcomes of candidate interviews?',
    options: [{ key: 'A', text: 'For social media posts' }, { key: 'B', text: 'For entertainment' }, { key: 'C', text: 'For accountability and record keeping' }, { key: 'D', text: 'For creative writing' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Recording decisions and rationale ensures accountability and helps manage disputes or audits.',
    active: true
  },
  {
    id: 177, category: 'professionalism', difficulty: 'hard',
    questionText: 'A recruiter overhears a colleague making discriminatory remarks about an applicant\'s background. What action should follow?',
    options: [{ key: 'A', text: 'Join the conversation' }, { key: 'B', text: 'Discuss the incident with HR or management' }, { key: 'C', text: 'Post it online' }, { key: 'D', text: 'Pretend not to hear it' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Reporting such conduct ensures the organisation addresses discrimination and maintains standards.',
    active: true
  },
  {
    id: 178, category: 'professionalism', difficulty: 'hard',
    questionText: 'If a candidate repeatedly demands a precise score breakdown despite policy, how should you respond?',
    options: [{ key: 'A', text: 'Ignore them' }, { key: 'B', text: 'Explain the policy clearly and decline to share specifics' }, { key: 'C', text: 'Offer a higher score to end the discussion' }, { key: 'D', text: 'Provide the full breakdown' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Upholding assessment confidentiality while explaining policies maintains fairness.',
    active: true
  },
  {
    id: 179, category: 'professionalism', difficulty: 'advanced',
    questionText: 'A recruiter realises a mistake in a candidate\'s report after submitting it. What should be done?',
    options: [{ key: 'A', text: 'Blame another team member' }, { key: 'B', text: 'Notify the appropriate manager and correct the report' }, { key: 'C', text: 'Delete the report entirely' }, { key: 'D', text: 'Do nothing to avoid attention' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Transparency and prompt corrections maintain data integrity and trust.',
    active: true
  },
  {
    id: 180, category: 'professionalism', difficulty: 'advanced',
    questionText: 'A senior leader asks you to give preferential treatment to a candidate. What is the correct response?',
    options: [{ key: 'A', text: 'Offer a different favour' }, { key: 'B', text: 'Agree to comply' }, { key: 'C', text: 'Seek to hide the action' }, { key: 'D', text: 'Refuse politely and highlight the agreed process' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Fair recruitment means following established criteria and resisting undue influence.',
    active: true
  },
  {
    id: 181, category: 'digital', difficulty: 'medium',
    questionText: 'In performance marketing, "bounce rate" measures what?',
    options: [{ key: 'A', text: 'Percentage of visitors leaving without interaction' }, { key: 'B', text: 'Commission rates' }, { key: 'C', text: 'Number of likes on posts' }, { key: 'D', text: 'Staff meeting attendance' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Bounce rate indicates how many visitors leave a site without any meaningful engagement.',
    active: true
  },
  {
    id: 182, category: 'digital', difficulty: 'medium',
    questionText: 'Which statement best describes remarketing?',
    options: [{ key: 'A', text: 'Rewriting the privacy policy' }, { key: 'B', text: 'Printing flyers for the next event' }, { key: 'C', text: 'Hiring new staff' }, { key: 'D', text: 'Showing ads to people who previously engaged' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Remarketing targets audiences who have already shown interest, prompting them to return.',
    active: true
  },
  {
    id: 183, category: 'digital', difficulty: 'hard',
    questionText: 'A channel produces many applicants but low pass rates. This likely indicates:',
    options: [{ key: 'A', text: 'Strict salary requirements' }, { key: 'B', text: 'Proper segmentation' }, { key: 'C', text: 'High volume but weak fit' }, { key: 'D', text: 'Strong referral loyalty' }],
    correctAnswer: 'C',
    explanationForAdmin: 'High applicant numbers with poor quality typically signal misaligned targeting or message.',
    active: true
  },
  {
    id: 184, category: 'affiliate', difficulty: 'medium',
    questionText: 'A new affiliate often misses deadlines but communicates openly about personal challenges. How should the manager proceed?',
    options: [{ key: 'A', text: 'Increase penalties' }, { key: 'B', text: 'Ignore their messages' }, { key: 'C', text: 'Offer support and establish realistic plans' }, { key: 'D', text: 'Decrease their commission' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Managers should provide support and adjust goals collaboratively to improve performance.',
    active: true
  },
  {
    id: 185, category: 'affiliate', difficulty: 'medium',
    questionText: 'Why might experienced affiliates be asked to mentor newer recruits?',
    options: [{ key: 'A', text: 'To transfer skills and improve overall performance' }, { key: 'B', text: 'To reduce their own workload' }, { key: 'C', text: 'To reassign territory' }, { key: 'D', text: 'To change branding' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Mentoring leverages expertise to help new affiliates ramp up efficiently.',
    active: true
  },
  {
    id: 186, category: 'affiliate', difficulty: 'hard',
    questionText: 'The best way to encourage inactive affiliates to contribute is to:',
    options: [{ key: 'A', text: 'Remove reporting entirely' }, { key: 'B', text: 'Recognise their past efforts and set specific goals' }, { key: 'C', text: 'Announce random quizzes' }, { key: 'D', text: 'Lower quality expectations' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Acknowledging contributions and providing clear, achievable targets motivates re-engagement.',
    active: true
  },
  {
    id: 187, category: 'field', difficulty: 'medium',
    questionText: 'Local influencers can help marketing campaigns primarily because they:',
    options: [{ key: 'A', text: 'Replace product training' }, { key: 'B', text: 'Hire more staff' }, { key: 'C', text: 'Enhance credibility and reach' }, { key: 'D', text: 'Raise budgets' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Influencers provide trusted voices within the community to drive adoption.',
    active: true
  },
  {
    id: 188, category: 'field', difficulty: 'hard',
    questionText: 'A cluster of agents in a city consistently meets quotas but receives growing complaints. What should managers review?',
    options: [{ key: 'A', text: 'Their bank account details' }, { key: 'B', text: 'Their messaging practices and compliance' }, { key: 'C', text: 'Their social media profiles' }, { key: 'D', text: 'Their location proximity to headquarters' }],
    correctAnswer: 'B',
    explanationForAdmin: 'High output with issues may indicate poor messaging or compliance problems.',
    active: true
  },
  {
    id: 189, category: 'field', difficulty: 'hard',
    questionText: 'If an activation fails repeatedly in one area, which conclusion might be most reasonable?',
    options: [{ key: 'A', text: 'The staff should be replaced' }, { key: 'B', text: 'The product is illegal' }, { key: 'C', text: 'The budget is too small' }, { key: 'D', text: 'The market may not be viable' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Persistent failures suggest that resources might be better invested elsewhere.',
    active: true
  },
  {
    id: 190, category: 'field', difficulty: 'advanced',
    questionText: 'When planning a large multi-community activation event, what factor could increase attendance and conversions?',
    options: [{ key: 'A', text: 'Using only online posts' }, { key: 'B', text: 'Shortening the programme timeline' }, { key: 'C', text: 'Collaborating with existing local associations' }, { key: 'D', text: 'Raising participation fees' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Partnerships with community organisations can draw a receptive audience and build trust.',
    active: true
  },
  {
    id: 191, category: 'professionalism', difficulty: 'medium',
    questionText: 'Why should recruiters avoid assumptions about a candidate\'s abilities based on appearance?',
    options: [{ key: 'A', text: 'It reduces paperwork' }, { key: 'B', text: 'Such assumptions can lead to biased decisions' }, { key: 'C', text: 'It improves team morale' }, { key: 'D', text: 'It speeds up interviews' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Relying on superficial cues undermines fairness and may overlook qualified candidates.',
    active: true
  },
  {
    id: 192, category: 'professionalism', difficulty: 'medium',
    questionText: 'An upset applicant demands to speak with senior management. Appropriate next step?',
    options: [{ key: 'A', text: 'Delete their details' }, { key: 'B', text: 'Offer to connect them to a manager through proper channels' }, { key: 'C', text: 'Refuse any communication' }, { key: 'D', text: 'Give out personal numbers' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Directing the complaint through the right channels ensures that it is handled properly.',
    active: true
  },
  {
    id: 193, category: 'professionalism', difficulty: 'hard',
    questionText: 'A recruitment team receives credible allegations of unethical behaviour by an affiliate. What must be done?',
    options: [{ key: 'A', text: 'Ignore until targets are met' }, { key: 'B', text: 'Investigate promptly and take appropriate action' }, { key: 'C', text: 'Offer payment for silence' }, { key: 'D', text: 'Cancel all affiliate programmes' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Ethical issues must be addressed to maintain organisational integrity and protect stakeholders.',
    active: true
  },
  {
    id: 194, category: 'professionalism', difficulty: 'hard',
    questionText: 'A manager is uncertain about the legality of a proposed incentive plan. The next course of action should be:',
    options: [{ key: 'A', text: 'Consult legal or compliance teams before proceeding' }, { key: 'B', text: 'Ask affiliates to decide' }, { key: 'C', text: 'Implement the plan quietly' }, { key: 'D', text: 'Avoid raising questions' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Legal review ensures that the programme complies with relevant regulations and policies.',
    active: true
  },
  {
    id: 195, category: 'digital', difficulty: 'medium',
    questionText: 'Which content format generally captures attention quickest for online campaigns?',
    options: [{ key: 'A', text: 'Long text documents' }, { key: 'B', text: 'Detailed spreadsheets' }, { key: 'C', text: 'Short video clips' }, { key: 'D', text: 'Technical white papers' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Brief videos engage users quickly, especially on mobile platforms.',
    active: true
  },
  {
    id: 196, category: 'digital', difficulty: 'medium',
    questionText: 'What is the primary benefit of using A/B tests in recruitment marketing?',
    options: [{ key: 'A', text: 'Increasing manual work' }, { key: 'B', text: 'Reducing the number of applicants' }, { key: 'C', text: 'Identifying which variation performs better' }, { key: 'D', text: 'Hiding performance data' }],
    correctAnswer: 'C',
    explanationForAdmin: 'A/B tests allow marketers to compare versions and choose the most effective option.',
    active: true
  },
  {
    id: 197, category: 'digital', difficulty: 'hard',
    questionText: 'Which metric would show the proportion of people who complete an assessment after starting it?',
    options: [{ key: 'A', text: 'Cost per hire' }, { key: 'B', text: 'Email open rate' }, { key: 'C', text: 'Impression share' }, { key: 'D', text: 'Assessment completion rate' }],
    correctAnswer: 'D',
    explanationForAdmin: 'The completion rate divides the number of completions by the number of starts.',
    active: true
  },
  {
    id: 198, category: 'affiliate', difficulty: 'medium',
    questionText: 'How can you encourage affiliates to share more accurate information?',
    options: [{ key: 'A', text: 'Hide instructions' }, { key: 'B', text: 'Increase message length' }, { key: 'C', text: 'Replace support channels' }, { key: 'D', text: 'Emphasise transparency and monitor submissions regularly' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Encouraging honesty and verifying data sets expectations for accuracy.',
    active: true
  },
  {
    id: 199, category: 'affiliate', difficulty: 'hard',
    questionText: 'An affiliate manager wants to reward top performers while avoiding resentment. What is a fair approach?',
    options: [{ key: 'A', text: 'Keep rewards secret' }, { key: 'B', text: 'Double targets' }, { key: 'C', text: 'Give random bonuses' }, { key: 'D', text: 'Recognise success publicly and highlight criteria' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Public recognition with clear criteria motivates performers and shows fairness to others.',
    active: true
  },
  {
    id: 200, category: 'affiliate', difficulty: 'hard',
    questionText: 'Why might an affiliate network adopt a multi-tiered referral system?',
    options: [{ key: 'A', text: 'To simplify the pay structure' }, { key: 'B', text: 'To decrease total payments' }, { key: 'C', text: 'To incentivise current affiliates to bring in new recruits' }, { key: 'D', text: 'To reduce field visits' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Multi-tier referrals reward affiliates not just for their direct performance but also for bringing in others.',
    active: true
  },
  {
    id: 201, category: 'field', difficulty: 'medium',
    questionText: 'After a successful demonstration in a market, what next step helps maintain momentum?',
    options: [{ key: 'A', text: 'Cease communication' }, { key: 'B', text: 'Capture contact details and send follow-up information' }, { key: 'C', text: 'Reduce follow-up' }, { key: 'D', text: 'Schedule only online meetings' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Following up keeps interest alive and moves prospects toward action.',
    active: true
  },
  {
    id: 202, category: 'field', difficulty: 'hard',
    questionText: 'What should marketers focus on when feedback shows that prospect trust is low?',
    options: [{ key: 'A', text: 'Building credibility through testimonials and transparent processes' }, { key: 'B', text: 'Demanding immediate commitments' }, { key: 'C', text: 'Increasing technical jargon' }, { key: 'D', text: 'Ignoring the concerns' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Trust can be improved with transparency, proof of success, and clear processes.',
    active: true
  },
  {
    id: 203, category: 'professionalism', difficulty: 'medium',
    questionText: 'Why should complaints be handled through official channels?',
    options: [{ key: 'A', text: 'They ensure structured and fair handling' }, { key: 'B', text: 'They prevent escalation' }, { key: 'C', text: 'They cut down on work' }, { key: 'D', text: 'They delay decisions' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Structured processes ensure accountability and consistent resolution.',
    active: true
  },
  {
    id: 204, category: 'professionalism', difficulty: 'hard',
    questionText: 'When an applicant offers a bribe to influence their selection, what is the appropriate action?',
    options: [{ key: 'A', text: 'Delay response' }, { key: 'B', text: 'Accept quietly' }, { key: 'C', text: 'Negotiate a higher amount' }, { key: 'D', text: 'Refuse and report the incident immediately' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Accepting or ignoring bribery undermines integrity; it must be refused and reported.',
    active: true
  },
  {
    id: 205, category: 'digital', difficulty: 'medium',
    questionText: 'If social metrics look strong but cost per hire is rising, what should be evaluated first?',
    options: [{ key: 'A', text: 'Brand tagline' }, { key: 'B', text: 'Efficiency of the selection process' }, { key: 'C', text: 'Colour of the logo' }, { key: 'D', text: 'Platform size' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Rising cost per hire may indicate inefficiencies in screening and hiring rather than marketing.',
    active: true
  },
  {
    id: 206, category: 'digital', difficulty: 'hard',
    questionText: 'Why might a marketer choose to run a retargeting campaign for people who abandoned an application form?',
    options: [{ key: 'A', text: 'They already showed interest and may convert with reminders' }, { key: 'B', text: 'They ignored previous emails' }, { key: 'C', text: 'They are not interested' }, { key: 'D', text: 'They cannot afford the programme' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Retargeting people who started but did not finish is often more fruitful than cold outreach.',
    active: true
  },
  {
    id: 207, category: 'affiliate', difficulty: 'medium',
    questionText: 'Clear communication of key performance indicators (KPIs) is essential because it:',
    options: [{ key: 'A', text: 'Helps affiliates understand expectations' }, { key: 'B', text: 'Reduces workload' }, { key: 'C', text: 'Doubles earnings automatically' }, { key: 'D', text: 'Eliminates the need for training' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Affiliates perform better when they know exactly what they are being measured against.',
    active: true
  },
  {
    id: 208, category: 'affiliate', difficulty: 'hard',
    questionText: 'When planning an incentive programme, why should non-monetary rewards be considered?',
    options: [{ key: 'A', text: 'They eliminate quotas' }, { key: 'B', text: 'Recognition and development opportunities enhance motivation' }, { key: 'C', text: 'They reduce data collection' }, { key: 'D', text: 'They increase confusion' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Non-monetary rewards like recognition, training, or career development appeal to diverse motivations.',
    active: true
  },
  {
    id: 209, category: 'field', difficulty: 'medium',
    questionText: 'Why is it valuable for field marketers to collaborate with local civic groups or associations?',
    options: [{ key: 'A', text: 'They facilitate access and credibility' }, { key: 'B', text: 'They reduce message reach' }, { key: 'C', text: 'They increase cost per click' }, { key: 'D', text: 'They slow recruitment' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Community organisations provide networks and trust necessary for acceptance of new programmes.',
    active: true
  },
  {
    id: 210, category: 'field', difficulty: 'hard',
    questionText: 'When a region reports high sign-ups but low activity after training, what should be examined?',
    options: [{ key: 'A', text: 'Time of day messages were sent' }, { key: 'B', text: 'Number of flyers printed' }, { key: 'C', text: 'Mobile brand used by trainees' }, { key: 'D', text: 'Whether the onboarding addressed practical steps' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Training must equip affiliates with actionable knowledge; low activity may signal a gap.',
    active: true
  },
  {
    id: 211, category: 'professionalism', difficulty: 'medium',
    questionText: 'A manager asks you to share applicants\' scores with a third-party vendor. You should:',
    options: [{ key: 'A', text: 'Post on social media' }, { key: 'B', text: 'Decline unless there is an approved reason' }, { key: 'C', text: 'Share everything' }, { key: 'D', text: 'Ask for a bribe' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Candidate data must be protected; only authorised data sharing is appropriate.',
    active: true
  },
  {
    id: 212, category: 'professionalism', difficulty: 'hard',
    questionText: 'What is the ethical way to handle candidate feedback suggesting an assessor might be biased?',
    options: [{ key: 'A', text: 'Investigate and address the feedback through formal channels' }, { key: 'B', text: 'Remove the assessor immediately' }, { key: 'C', text: 'Share the claim publicly without proof' }, { key: 'D', text: 'Ignore the suggestion' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Fair investigation ensures that concerns are taken seriously while protecting reputations.',
    active: true
  },
  {
    id: 213, category: 'digital', difficulty: 'medium',
    questionText: 'Why integrate a chatbot into your recruitment site?',
    options: [{ key: 'A', text: 'To reduce site speed' }, { key: 'B', text: 'To inflate form length' }, { key: 'C', text: 'To ignore human interaction' }, { key: 'D', text: 'To provide immediate answers to candidate questions' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Chatbots enhance user experience by offering real-time support and clarifying next steps.',
    active: true
  },
  {
    id: 214, category: 'digital', difficulty: 'hard',
    questionText: 'Which metric best evaluates the success of a referral bonus programme in hiring?',
    options: [{ key: 'A', text: 'Number of hires from referrals' }, { key: 'B', text: 'Total email opens' }, { key: 'C', text: 'Number of interviews scheduled' }, { key: 'D', text: 'Team lunch cost' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Referral programme success is measured by the hires generated, not just initial interest.',
    active: true
  },
  {
    id: 215, category: 'affiliate', difficulty: 'medium',
    questionText: 'What is one key benefit of pairing underperforming affiliates with top performers?',
    options: [{ key: 'A', text: 'Decreasing workload' }, { key: 'B', text: 'Knowledge transfer and support' }, { key: 'C', text: 'Reducing incentives' }, { key: 'D', text: 'Shortening deadlines' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Pairing fosters mentoring, improving skills and increasing confidence.',
    active: true
  },
  {
    id: 216, category: 'affiliate', difficulty: 'hard',
    questionText: 'When designing training for affiliates, why include interactive practice sessions?',
    options: [{ key: 'A', text: 'They reduce engagement' }, { key: 'B', text: 'They extend the training time unnecessarily' }, { key: 'C', text: 'They increase printing costs' }, { key: 'D', text: 'They reinforce learning and build confidence' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Practice helps trainees apply knowledge and receive feedback in a supportive environment.',
    active: true
  },
  {
    id: 217, category: 'field', difficulty: 'medium',
    questionText: 'A local celebrity endorses the programme. How should this be used?',
    options: [{ key: 'A', text: 'Hide the news' }, { key: 'B', text: 'Ignore community reaction' }, { key: 'C', text: 'Replace all scripts' }, { key: 'D', text: 'Share their endorsement as social proof' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Prominent supporters enhance credibility and encourage others to join.',
    active: true
  },
  {
    id: 218, category: 'field', difficulty: 'hard',
    questionText: 'During a market visit, several prospects express concerns about safety and data security. What is the best way to reassure them?',
    options: [{ key: 'A', text: 'Suggest they trust without questions' }, { key: 'B', text: 'Avoid answering' }, { key: 'C', text: 'Explain data protection measures and give examples of secure practices' }, { key: 'D', text: 'Promise them anything' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Clearly explaining how data is protected builds confidence and addresses fears.',
    active: true
  },
  {
    id: 219, category: 'professionalism', difficulty: 'medium',
    questionText: 'A colleague shares a rumour about a competitor\'s failure. How should you respond?',
    options: [{ key: 'A', text: 'Share it widely' }, { key: 'B', text: 'Add to the rumour' }, { key: 'C', text: 'Avoid spreading it and focus on your own programme' }, { key: 'D', text: 'Criticise the competitor publicly' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Professionalism involves avoiding gossip and focusing on one\'s own performance.',
    active: true
  },
  {
    id: 220, category: 'professionalism', difficulty: 'hard',
    questionText: 'A candidate follows up multiple times in a short period about their application status. The appropriate response is to:',
    options: [{ key: 'A', text: 'Provide a polite status update and timeline' }, { key: 'B', text: 'Ignore the messages' }, { key: 'C', text: 'Redirect them to another channel' }, { key: 'D', text: 'Block the candidate' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Professional courtesy requires timely, clear communication to manage expectations.',
    active: true
  },
  {
    id: 221, category: 'digital', difficulty: 'medium',
    questionText: 'Why should recruitment messages avoid jargon?',
    options: [{ key: 'A', text: 'Clear language improves understanding' }, { key: 'B', text: 'It shortens posts' }, { key: 'C', text: 'Jargon impresses readers' }, { key: 'D', text: 'It increases budgets' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Plain language ensures that audiences quickly grasp the opportunity without confusion.',
    active: true
  },
  {
    id: 222, category: 'digital', difficulty: 'hard',
    questionText: 'A campaign gets high mobile traffic but low desktop traffic. What does this suggest?',
    options: [{ key: 'A', text: 'Abandon mobile platforms' }, { key: 'B', text: 'Focus on mobile optimisation and channels' }, { key: 'C', text: 'Stop digital marketing' }, { key: 'D', text: 'Increase the form length' }],
    correctAnswer: 'B',
    explanationForAdmin: 'Marketing should invest where the audience is most active and ensure mobile experiences are excellent.',
    active: true
  },
  {
    id: 223, category: 'affiliate', difficulty: 'medium',
    questionText: 'Which action helps maintain affiliate enthusiasm over the long term?',
    options: [{ key: 'A', text: 'Regular recognition and constructive feedback' }, { key: 'B', text: 'Unclear targets' }, { key: 'C', text: 'Irregular contact' }, { key: 'D', text: 'Infrequent communication' }],
    correctAnswer: 'A',
    explanationForAdmin: 'Ongoing recognition and feedback motivate affiliates and help them improve.',
    active: true
  },
  {
    id: 224, category: 'affiliate', difficulty: 'hard',
    questionText: 'A cluster of new affiliates feels overwhelmed by the onboarding process. What could improve their experience?',
    options: [{ key: 'A', text: 'Increasing complexity' }, { key: 'B', text: 'Removing training' }, { key: 'C', text: 'Extending targets' }, { key: 'D', text: 'Providing a clear, step-by-step onboarding guide' }],
    correctAnswer: 'D',
    explanationForAdmin: 'Structured onboarding guides reduce confusion and build confidence for new affiliates.',
    active: true
  },
  {
    id: 225, category: 'field', difficulty: 'medium',
    questionText: 'A market with many leads but slow conversions may require what adjustment?',
    options: [{ key: 'A', text: 'Shorter onboarding' }, { key: 'B', text: 'No data collection' }, { key: 'C', text: 'Stronger follow-up and clearer instructions' }, { key: 'D', text: 'Higher advertising costs' }],
    correctAnswer: 'C',
    explanationForAdmin: 'Conversion issues often stem from unclear next steps or insufficient follow-up.',
    active: true
  }
];

// Adaptive difficulty mix by experience level
export const DIFFICULTY_MIX = {
  'Less than 1 year': { medium: 15, hard: 10, advanced: 0 },
  '1–3 years':        { medium: 10, hard: 15, advanced: 0 },
  '3–5 years':        { medium: 5,  hard: 15, advanced: 5 },
  '5+ years':         { medium: 0,  hard: 5,  advanced: 20 },
};

// Target category distribution for 25 questions: digital=6, affiliate=7, field=6, professionalism=6
export const CATEGORY_TARGETS = { digital: 6, affiliate: 7, field: 6, professionalism: 6 };