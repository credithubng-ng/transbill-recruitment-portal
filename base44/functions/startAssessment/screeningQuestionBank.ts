// Production v2 screening question bank — private same-directory copy for startAssessment.
// BANK_VERSION lagos-youth-2026-v2. Never expose correctAnswer or rationale to the client.

export type Category = 'digital' | 'content' | 'sales' | 'affiliate' | 'performance' | 'learning';
export type Dimension = 'common' | 'digital' | 'sales';
export type Tier = 'foundation' | 'early' | 'intermediate' | 'advanced' | 'expert';
export type Difficulty = 'foundation' | 'applied' | 'judgement';

export type ScreeningQuestion = {
  id: number;
  category: Category;
  experienceDimension: Dimension;
  tier: Tier;
  difficulty: Difficulty;
  questionText: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  rationale: string;
  critical: boolean;
};

export const BANK_VERSION = 'lagos-youth-2026-v2';
export const ASSESSMENT_BLUEPRINT = {
  commonCore: { digitalContent: 7, salesAffiliate: 5, performance: 3, learning: 3 },
  validation: { digital: 4, sales: 4 },
  learningAgility: 4,
};

export const TIER_MAP: Record<string, Tier> = {
  'No formal experience': 'foundation',
  'Less than 1 year': 'early',
  '1–3 years': 'intermediate',
  '3–5 years': 'advanced',
  '5+ years': 'expert',
};
export const TIERS: Tier[] = ['foundation', 'early', 'intermediate', 'advanced', 'expert'];

const keys = ['A', 'B', 'C', 'D'];
const q = (
  id: number,
  category: Category,
  experienceDimension: Dimension,
  tier: Tier,
  difficulty: Difficulty,
  questionText: string,
  options: string[],
  correctAnswer: string,
  rationale: string,
  critical = false,
): ScreeningQuestion => ({
  id, category, experienceDimension, tier, difficulty, questionText, correctAnswer, rationale, critical,
  options: options.map((text, index) => ({ key: keys[index], text })),
});

export const SCREENING_QUESTION_BANK: ScreeningQuestion[] = [
  // ===== Digital marketing (1-30) =====
  q(1,'digital','common','foundation','foundation','A trader in Balogun wants more customers from Instagram. What should you establish first?',['Who she wants to reach and what they should do next','How many posts she can afford to publish each week','Which phone has the best camera for product shots','Whether her competitors already use Instagram'],'A','Audience and objective must precede execution.'),
  q(2,'digital','common','foundation','early','Which outcome is the strongest sign that a campaign is succeeding?',['The campaign reached a large number of feeds','The intended audience completed the desired action at a healthy rate','The page gained new followers','The daily budget was fully spent'],'B','Conversions measure success better than reach.'),
  q(3,'digital','common','foundation','early','An advert gets many clicks but very few people fill the enquiry form. What should you check first?',['Whether the advert creative uses brand colours','Whether the campaign is running on weekends','Whether the landing page and form are easy to complete on a phone','Whether the audience size is large enough'],'C','Friction on the landing page is the likely leak.'),
  q(4,'digital','common','foundation','intermediate','Before launching a campaign for a client, what is most important to agree on?',['The number of hashtags to include','The posting frequency','The graphic design style','The audience to reach and the result they want'],'D','Objective and audience define the campaign.'),
  q(5,'digital','common','early','foundation','What does it mean to segment an audience?',['Grouping people by characteristics relevant to the offer so you can message them appropriately','Removing inactive followers each month','Posting the same message to everyone at the same time','Choosing only one platform for all promotion'],'A','Segmentation enables relevant messaging.'),
  q(6,'digital','common','early','early','A client says their organic reach has dropped. What is the most useful explanation to offer?',['The algorithm now requires paid ads for any visibility','Unpaid distribution competes with many posts, so relevant content and engagement matter more','Their account has been shadow-banned without evidence','They should delete the page and start again'],'B','Organic reach reflects relevance and engagement.'),
  q(7,'digital','common','early','early','Which metric best reflects how much people interact with content rather than just seeing it?',['Total impressions','Follower count','Engagement rate relative to reach','Amount spent'],'C','Engagement rate captures interaction.'),
  q(8,'digital','common','early','intermediate','A salon in Surulere wants to attract nearby clients. What is the most appropriate target audience?',['Everyone in Lagos with an Instagram account','People interested in beauty across Nigeria','Existing competitors followers only','Adults living near Surulere who are likely to need salon services'],'D','Local relevance drives useful reach.'),
  q(9,'digital','common','intermediate','foundation','Why does mobile-friendly design matter for Lagos campaigns?',['Most users reach the content by phone, so a poor mobile experience loses them','It removes the need for clear messaging','It automatically improves search ranking everywhere','It guarantees a certain number of sales'],'A','Mobile-first audience demands mobile-friendly design.'),
  q(10,'digital','common','intermediate','early','Which person should be counted as a lead?',['Anyone whose post the page liked','Someone who has shown relevant interest and shared contact details','Every account that follows the page','A passer-by who glanced at a billboard'],'B','A lead has shown relevant interest.'),
  q(11,'digital','common','intermediate','early','What is the main purpose of A/B testing two advert versions?',['To publish more content in less time','To reduce the total amount spent','To compare them and identify the stronger performer before scaling','To avoid needing any audience research'],'C','Testing identifies the stronger performer.'),
  q(12,'digital','common','intermediate','intermediate','Why attach tracking parameters to campaign links?',['To make links shorter and tidier','To prevent bots from clicking','To hide the landing page from competitors','To identify which sources and creatives produce results'],'D','Tracking attributes results to sources.'),
  q(13,'digital','digital','foundation','foundation','A client wants to know why one campaign performed better than another. What should you compare?',['The audience, creative, placement and objective each was set up against','The number of posts each campaign had','The font used in each caption','The time of day you published them'],'A','Compare the variables that drive performance.'),
  q(14,'digital','digital','foundation','early','A campaign has high reach but low engagement. What is the best next step?',['Increase the budget to reach more people','Review whether the message and creative are relevant to the audience','Stop measuring engagement and track spend only','Repeat the same advert unchanged for another month'],'B','Relevance drives engagement.'),
  q(15,'digital','digital','foundation','intermediate','What does retargeting allow you to do?',['Delete past visitors from your audience','Prevent anyone from seeing an advert twice','Show relevant messages to people who previously interacted','Change the business name shown on adverts'],'C','Retargeting re-engages prior interactions.'),
  q(16,'digital','digital','early','early','Which result best indicates lead quality rather than volume?',['Total impressions served','Number of clicks received','Number of hashtags used','Leads that progress through qualification and convert'],'D','Qualified leads that convert indicate quality.'),
  q(17,'digital','digital','early','applied','A campaign report should compare results against what?',['The objectives and targets agreed before the campaign','Only the positive comments received','The competitors reported figures','The previous years holiday sales'],'A','Results are meaningful against objectives.'),
  q(18,'digital','digital','early','applied','A channel has high cost and no conversions after a fair test. What is appropriate?',['Increase spend without review to force results','Pause it and reallocate the budget based on evidence','Hide the result from the client','Report conversions that did not happen'],'B','Evidence-based reallocation protects budget.'),
  q(19,'digital','digital','early','judgement','A campaign is generating cheap but unsuitable leads. What should change first?',['The daily budget alone','The reporting cadence','The targeting and qualification message','The brand colour palette'],'C','Targeting and message fix lead suitability.'),
  q(20,'digital','digital','intermediate','applied','Which attribution statement is most responsible?',['The last click deserves all the credit','Attribution never matters for small budgets','Every impression should be treated as a sale','Results may involve several touchpoints, so consider the mix'],'D','Multi-touch attribution is more honest.'),
  q(21,'digital','digital','intermediate','applied','A client wants to scale a winning advert. What is the safest approach?',['Increase budget gradually while monitoring cost per result','Duplicate it to every platform at once without testing','Replace the audience entirely before scaling','Ten times the budget on day one'],'A','Gradual scaling preserves efficiency.'),
  q(22,'digital','digital','intermediate','judgement','Two creatives perform similarly in testing. What should guide the choice?',['Which one you personally prefer','Which one aligns with the brand and performs slightly better on the target metric','Which one uses the most colours','Which one took longest to design'],'B','Brand fit and target metric guide choice.'),
  q(23,'digital','digital','intermediate','judgement','A client insists on a claim the product cannot support. What should you do?',['Use the claim because the client asked','Soften it slightly without telling the client','Decline the claim and propose compliant alternatives','Run it only on weekends to avoid detection'],'C','Compliance overrides client pressure.'),
  q(24,'digital','digital','advanced','applied','You are allocating budget across Search and Social. What is the sound basis?',['Equal split regardless of performance','Whatever channel you have used longest','The channel with the most impressive-looking dashboard','Where each channels marginal cost per qualified result is favourable'],'D','Marginal cost per qualified result guides allocation.'),
  q(25,'digital','digital','advanced','judgement','A lookalike audience is underperforming the interest audience. What is the best response?',['Test a smaller seed or refine the source list before discarding it','Delete all audiences and start over','Never use lookalikes again','Increase budget to force performance'],'A','Refine the seed before abandoning lookalikes.'),
  q(26,'digital','digital','advanced','judgement','A campaigns cost per lead rose sharply this week. What should you do first?',['Blame the platform and stop all ads','Check changes to audience, creative fatigue, bidding and placement before acting','Ignore it; weekly fluctuations never matter','Immediately double the budget'],'B','Diagnose causes before acting.'),
  q(27,'digital','digital','advanced','applied','What is the most defensible way to report ROAS to a client?',['Estimate it from memory','Include every impression as revenue','Tie revenue to tracked conversions and state assumptions clearly','Round all numbers up favourably'],'C','Tie revenue to tracked conversions.'),
  q(28,'digital','digital','expert','judgement','A client wants to attribute offline sales to online ads. What is the most honest approach?',['Assume all offline sales came from the ads','Count only sales that mentioned the ads','Ignore offline sales entirely','Use a consistent attribution model and state its limits'],'D','Consistent model with stated limits is honest.'),
  q(29,'digital','digital','expert','judgement','You manage a large budget with seasonal demand swings. What is the sound planning approach?',['Plan spend against forecast demand and review against actuals regularly','Spend evenly every week regardless of season','Spend the whole budget in the first month','Avoid forecasting; react only after results arrive'],'A','Forecast-based planning with review.'),
  q(30,'digital','digital','expert','judgement','Which is the most responsible use of automation in campaign management?',['Let automation make all decisions without review','Use rules for routine optimisation but review exceptions and outcomes','Never use automation for any task','Hide automation use from the client'],'B','Automate routine work, review exceptions.'),

  // ===== Content and lead generation (31-48) =====
  q(31,'content','common','foundation','foundation','What makes a social media headline effective?',['Using as many words as possible','Including unfamiliar jargon','A clear, relevant benefit for the reader','No connection to the audience'],'C','Clear benefit drives engagement.'),
  q(32,'content','common','foundation','early','Which element helps a reader know what to do next?',['A decorative border','A profile photo','A timestamp','A clear call to action'],'D','A call to action directs the reader.'),
  q(33,'content','common','foundation','foundation','What is a content calendar?',['A plan of topics, formats and publishing dates','A payroll document','A list of passwords','A bank statement'],'A','A calendar plans topics and dates.'),
  q(34,'content','common','foundation','early','Why should content use plain language?',['It removes the need for facts','It helps readers understand and act','It guarantees the post will go viral','It makes all audiences identical'],'B','Plain language improves understanding.'),
  q(35,'content','common','early','foundation','Which format is useful for demonstrating a process?',['An unexplained logo','A blank image','A short instructional video','An unrelated quotation'],'C','Video demonstrates process well.'),
  q(36,'content','common','early','early','What is social proof?',['A private password','An internal invoice','A random stock photo','Evidence that others have used or valued the offer'],'D','Social proof builds trust.'),
  q(37,'content','common','early','applied','Which message is most likely to attract qualified applicants?',['Clear eligibility, value and application steps','Apply now with no explanation','Guaranteed job for everyone who clicks','Send money first to secure a slot'],'A','Clarity attracts qualified applicants.'),
  q(38,'content','common','early','judgement','A testimonial cannot be verified. What should you do?',['Publish it anonymously as proof','Do not present it as fact','Add stronger claims to it','Invent a customer name for it'],'B','Unverified claims should not be presented as fact.'),
  q(39,'content','digital','foundation','foundation','How should one campaign idea be adapted across platforms?',['Post the identical asset everywhere regardless of fit','Change the facts on each platform','Keep the core message but adjust format and context','Remove the call to action on some platforms'],'C','Adapt format while keeping the core message.'),
  q(40,'content','digital','early','applied','A WhatsApp broadcast is being ignored. What should you review?',['The sender display name','The broadcast frequency alone','The phone used to send it','Relevance, clarity, timing and permission'],'D','Relevance and timing drive WhatsApp response.'),
  q(41,'content','digital','early','applied','Which landing page headline is strongest?',['A specific outcome for the intended audience','Welcome to our page','Many words about the company','Click because we said so'],'A','Specific outcome resonates with the audience.'),
  q(42,'content','digital','intermediate','applied','What is the best way to improve a weak content draft?',['Defend it without review','Use feedback and test a revised version','Delete all performance data','Copy another brand exactly'],'B','Feedback and testing improve drafts.'),
  q(43,'content','digital','intermediate','judgement','Why create different messages for different segments?',['Metrics become unnecessary','Every segment sees the same context','Their needs and barriers differ','It prevents learning'],'C','Segments have different needs.'),
  q(44,'content','digital','advanced','applied','Which lead form is usually more effective?',['Every possible personal question','No explanation of data use','A form that does not work on mobile','Only necessary fields with clear privacy context'],'D','Minimal fields with privacy context convert better.'),
  q(45,'content','digital','advanced','judgement','A video has many views but no action. What should you test?',['A clearer offer and call to action','Removing the offer entirely','A longer introduction only','Hiding the link'],'A','Clearer offer and CTA drive action.'),
  q(46,'content','digital','advanced','judgement','An audience speaks English and Pidgin. What is the best approach?',['Assume one version works for everyone','Test respectful language variants with the audience','Use confusing slang','Change eligibility facts by language'],'B','Test language variants with the audience.'),
  q(47,'content','digital','expert','judgement','Negative comments reveal a genuine misunderstanding. What should the team do?',['Delete every comment','Attack the commenter','Clarify the message and respond professionally','Stop monitoring responses'],'C','Clarify and respond professionally.'),
  q(48,'content','digital','expert','judgement','What should happen before publishing content about regulated financial products?',['Promise returns','Remove all conditions','Use any available logo','Verify claims, terms and approvals'],'D','Verify claims before publishing.'),

  // ===== Direct sales and prospect qualification (49-72) =====
  q(49,'sales','common','foundation','foundation','When approaching a prospective Affiliate Banker for the first time, what is the best opening?',['Explain the opportunity accurately and check it suits them','Promise guaranteed monthly earnings','Ask for a registration fee upfront','Add them to a group without their consent'],'A','Accurate explanation and fit check first.'),
  q(50,'sales','common','foundation','early','Why qualify a prospect before onboarding them?',['To increase the contact list only','To check fit, readiness and realistic expectations','To avoid explaining the role','To guarantee their performance'],'B','Qualification checks fit and readiness.'),
  q(51,'sales','common','foundation','foundation','Which channel mix can support community recruitment in Lagos?',['Foreign television only','Unsolicited bulk messages with no context','Targeted social media, WhatsApp and trusted local networks','A private file nobody sees'],'C','Targeted local channels recruit effectively.'),
  q(52,'sales','common','foundation','early','A prospect asks a question you cannot answer. What should you do?',['Invent a confident answer','End the conversation quickly','Give a competitors information','Acknowledge it and confirm the correct answer promptly'],'D','Confirm the correct answer promptly.'),
  q(53,'sales','common','early','applied','Many people register but do not activate. What should you investigate?',['Onboarding barriers and expectation gaps','The welcome message tone','The day they registered','The recruiter personal style'],'A','Barriers and gaps explain low activation.'),
  q(54,'sales','common','early','judgement','Which recruitment message is most responsible?',['Guaranteed earnings with no conditions','Clear opportunity, eligibility, responsibilities and realistic conditions','Pay before you learn more','Everyone will succeed regardless of effort'],'B','Honest conditions attract suitable recruits.'),
  q(55,'sales','common','early','applied','A prospect is interested but not ready. What is appropriate?',['Message them every hour','Mark them as activated immediately','Record consent and schedule a relevant follow-up','Share their details publicly'],'C','Consent and scheduled follow-up respect readiness.'),
  q(56,'sales','common','intermediate','applied','A referral partner keeps sending unsuitable candidates. What is best?',['Accept everyone to keep the relationship','Stop tracking the source','Publish their details publicly','Clarify the target profile and give evidence-based feedback'],'D','Clarify the profile with evidence.'),
  q(57,'sales','common','intermediate','judgement','A prospect provides inconsistent identity information. What should happen?',['Pause progression and follow the verification process','Correct it without asking','Ignore the issue','Share it in a group chat'],'A','Verification protects integrity.'),
  q(58,'sales','common','intermediate','judgement','A recruiter wants to exaggerate benefits to hit target. What should you do?',['Allow it temporarily','Reject it and use accurate, approved information','Hide any complaints that follow','Remove eligibility conditions'],'B','Accuracy overrides target pressure.'),
  q(59,'sales','sales','foundation','foundation','What is the best first step when meeting a small business owner about opening an SME account?',['Ask for the account number immediately','Quote fees before understanding their needs','Understand their business and how banking could help','Insist they decide today'],'C','Understand needs before pitching.'),
  q(60,'sales','sales','foundation','early','A prospect says they are not interested. What is the most professional response?',['Keep calling back daily until they agree','Argue with their reasons','Remove their number from all records','Acknowledge it, leave contact details, and note them for a later check'],'D','Respect the refusal and keep the door open.'),
  q(61,'sales','sales','foundation','applied','How should you prioritise a list of prospects?',['By likelihood to need the offer and ability to act','By whose name sounds familiar','By the order they were added','Randomly'],'A','Prioritise by need and ability to act.'),
  q(62,'sales','sales','early','applied','A prospect agrees in principle but keeps delaying. What is the best approach?',['Threaten to withdraw the offer','Confirm the specific blocker and agree a concrete next step','Mark them as closed and move on','Visit their home unannounced'],'B','Identify the blocker and agree a next step.'),
  q(63,'sales','sales','early','judgement','Which is the strongest sign a prospect is qualified?',['They answered the phone','They live near your office','They have a relevant need, authority and willingness to act','They follow you on social media'],'C','Need, authority and willingness define qualification.'),
  q(64,'sales','sales','early','applied','What is the purpose of a follow-up shortly after first contact?',['To pressure the prospect daily','To replace any need for information','To avoid keeping records','To resolve early questions and keep momentum'],'D','Follow-up resolves questions and maintains momentum.'),
  q(65,'sales','sales','intermediate','applied','A prospect raises an objection about fees. What is the best response?',['Understand the concern, show value, and offer accurate options','Immediately drop the price','Dismiss the concern','Promise a hidden discount later'],'A','Address the concern with value and options.'),
  q(66,'sales','sales','intermediate','judgement','During a pitch, the prospect mentions a competitors product. What should you do?',['Criticise the competitor harshly','Acknowledge it and explain your differences honestly','Claim the competitor is closing down','Refuse to discuss it'],'B','Honest comparison builds trust.'),
  q(67,'sales','sales','intermediate','applied','What is the most useful way to record a sales conversation?',['From memory at the end of the week','Only when a sale is made','Key facts, objections and next steps, soon after the call','Not at all, to save time'],'C','Timely records capture key facts.'),
  q(68,'sales','sales','advanced','applied','Your pipeline shows many prospects at interested but few advance. What is the best diagnosis?',['The prospects are all wrong; replace them','You need more prospects immediately','Stop tracking stages','Check whether follow-up, qualification or objection handling is weak'],'D','Diagnose the funnel bottleneck.'),
  q(69,'sales','sales','advanced','judgement','A prospect asks for something outside policy. What should you do?',['Explain what is possible and escalate if a genuine case exists','Promise it to close the sale','Agree and hide it from records','Blame policy to avoid effort'],'A','Stay within policy and escalate genuine cases.'),
  q(70,'sales','sales','advanced','judgement','Which is the best use of a slow sales day?',['Wait for leads to arrive','Review the pipeline, refine prospects and prepare follow-ups','Stop all activity','Delete old prospects'],'B','Refine the pipeline on slow days.'),
  q(71,'sales','sales','expert','judgement','A high-value prospect is ready but wants a non-standard arrangement. What is appropriate?',['Agree verbally and skip records','Refuse to engage and walk away','Confirm the request with the authorised approver and document it','Promise it regardless of policy'],'C','Non-standard terms need authorisation and records.'),
  q(72,'sales','sales','expert','judgement','What is the most sustainable way to hit a challenging recruitment target?',['Lower quality standards silently','Copy another recruiters list','Pressure existing contacts repeatedly','Focus the funnel on qualified prospects and consistent follow-up'],'D','Qualified prospects and follow-up sustain results.'),

  // ===== Affiliate Banker recruitment/onboarding (73-90) =====
  q(73,'affiliate','common','foundation','foundation','What should onboarding explain to a new Affiliate Banker?',['Responsibilities, process, support and next steps','Only the programme name','A guarantee of income','Internal passwords'],'A','Onboarding covers responsibilities and process.'),
  q(74,'affiliate','common','foundation','early','Why record the recruitment source of each Affiliate Banker?',['To avoid follow-up','To learn which channels produce suitable recruits','To hide poor performance','To replace consent'],'B','Source tracking reveals effective channels.'),
  q(75,'affiliate','common','foundation','foundation','What is activation in this context?',['Adding a name to a list','Sending one greeting','Helping a recruit complete required steps and begin productive activity','Closing their account'],'C','Activation means productive activity begins.'),
  q(76,'affiliate','common','foundation','early','Which prospect is most promising for the Affiliate Banker role?',['One who expects guaranteed money without activity','One who refuses verification','One who cannot be contacted','One who understands the role, meets requirements and commits to next steps'],'D','Understanding and commitment signal promise.'),
  q(77,'affiliate','common','early','applied','What should a recruitment pipeline show?',['Prospects at each stage and the next action','Only the total contact count','Personal rumours','Unverified income claims'],'A','Pipelines show stages and next actions.'),
  q(78,'affiliate','common','early','judgement','A community leader demands payment per name regardless of quality. What matters most?',['Paying immediately from personal funds','Approved terms, compliance and verified outcomes','Ignoring quality entirely','Recording every name as active'],'B','Terms, compliance and outcomes matter.'),
  q(79,'affiliate','common','early','applied','Recruitment is behind target halfway through the week. What is the best response?',['Offer unapproved bonuses','Lower standards silently','Analyse the funnel, focus on the bottleneck and test an action plan','Stop reporting'],'C','Diagnose and act on the bottleneck.'),
  q(80,'affiliate','common','early','judgement','What protects a prospects trust during follow-up?',['Daily pressure regardless of response','Hidden sender identity','Unapproved promises','Consent, relevant frequency and accurate information'],'D','Consent and accuracy protect trust.'),
  q(81,'affiliate','sales','foundation','foundation','Two channels produce equal recruits but one has higher activation. Which deserves priority?',['The channel with stronger activation at a suitable cost','The channel with more impressions only','Whichever is more familiar','Neither should be measured'],'A','Activation and cost determine priority.'),
  q(82,'affiliate','sales','early','applied','Why follow up shortly after onboarding a new Affiliate Banker?',['To guarantee results without effort','To resolve early barriers and support activation','To replace training','To avoid keeping records'],'B','Early follow-up supports activation.'),
  q(83,'affiliate','sales','early','judgement','A new recruit expects income without activity. What should you do?',['Confirm the expectation to keep them engaged','Ignore it and hope they adjust','Correct the expectation clearly and explain what drives earnings','Remove them immediately without explanation'],'C','Correct expectations about earnings.'),
  q(84,'affiliate','sales','intermediate','applied','A recruit is unsure how to approach prospects. What is the best support?',['Tell them to figure it out alone','Reassign them to a different role','Remove them from the pipeline','Coach them with a simple script and practice'],'D','Coaching with practice builds skill.'),
  q(85,'affiliate','sales','intermediate','judgement','Several recruits from the same source are inactive. What should you check?',['Whether the source over-promised or targeted the wrong profile','The flyer design','The time of day they were called','The day of the week they joined'],'A','Source quality affects activation.'),
  q(86,'affiliate','sales','advanced','applied','What is the best way to set realistic expectations with a new Affiliate Banker?',['Promise a fixed monthly income','Explain how earnings relate to activity and compliance','Avoid mentioning effort required','Guarantee results by week one'],'B','Earnings relate to activity and compliance.'),
  q(87,'affiliate','sales','advanced','judgement','A high-performing recruit uses misleading claims to sign people. What should you do?',['Reward the volume only','Hide complaints','Stop the behaviour and follow compliance procedures','Use the same claims elsewhere'],'C','Compliance overrides performance.'),
  q(88,'affiliate','sales','advanced','judgement','A recruit wants to recruit friends who do not meet the criteria. What is appropriate?',['Approve them to keep the recruit happy','Approve and hide it','Ignore the criteria','Decline and explain the criteria and why they matter'],'D','Criteria protect programme integrity.'),
  q(89,'affiliate','sales','expert','judgement','How should you decide between two large recruitment partnerships?',['Choose the one with the most names','Choose whichever pays faster','Choose the one with the strongest record of suitable, compliant recruits','Choose both regardless of capacity'],'C','Suitable, compliant recruits decide value.'),
  q(90,'affiliate','sales','expert','judgement','What is the best indicator a recruitment channel is sustainable?',['Volume of names collected','Consistent activation and compliant activity at a reasonable cost','Number of impressions','How long the channel has existed'],'B','Activation and compliance at reasonable cost.'),

  // ===== Performance management/coaching (91-108) =====
  q(91,'performance','common','foundation','foundation','Which metrics matter when managing Affiliate Bankers?',['Number of posts published','Profile updates','Recruitment, activation and productive activity','Device type used'],'C','Activity metrics matter for management.'),
  q(92,'performance','common','foundation','early','What is a performance target?',['A personal opinion','An unrecorded promise','A list of contacts only','A defined result expected within a period'],'D','Targets are defined results in a period.'),
  q(93,'performance','common','foundation','foundation','Why establish a baseline before coaching?',['To understand starting performance and measure change','To avoid setting any targets','To remove context','To replace reporting'],'A','Baselines measure change.'),
  q(94,'performance','common','foundation','early','What should a daily performance report contain?',['Only good news','Verified results, gaps, actions and next steps','Unverified estimates','No dates'],'B','Verified results, gaps and next steps.'),
  q(95,'performance','common','early','foundation','What is coaching?',['Doing all the persons work','Criticising without examples','Helping someone improve through specific feedback and action','Changing targets secretly'],'C','Coaching improves through specific feedback.'),
  q(96,'performance','common','early','early','Why distinguish active from registered Affiliate Bankers?',['They always mean the same thing','Activity cannot be measured','It reduces the contact list','Registration alone does not show productive activity'],'D','Registration does not equal activity.'),
  q(97,'performance','common','early','applied','Several registered Affiliate Bankers are inactive. What should happen first?',['Identify barriers and provide targeted re-engagement','Remove everyone immediately','Report them as active','Stop tracking activity'],'A','Identify barriers and re-engage.'),
  q(98,'performance','common','early','applied','An Affiliate Banker misses target for the first time. What is the best response?',['Publicly shame them','Review evidence, diagnose the cause and agree support actions','Change the records','Ignore it permanently'],'B','Diagnose and support after a miss.'),
  q(99,'performance','common','intermediate','applied','Which coaching feedback is most useful?',['You are not serious','Do better somehow','Specific behaviour, impact and agreed next action','Everyone else is better'],'C','Specific feedback drives improvement.'),
  q(100,'performance','common','intermediate','applied','Performance improves after a coaching action. What should you do?',['Stop measuring','Claim the improvement without evidence','Change the metric','Record the result and reinforce what worked'],'D','Record and reinforce improvements.'),
  q(101,'performance','common','intermediate','applied','A high performer has stopped reporting. What is appropriate?',['Address reporting expectations while recognising actual results','Ignore reporting forever','Delete their results','Reduce every target'],'A','Address reporting while recognising results.'),
  q(102,'performance','common','intermediate','applied','How should a manager prioritise support?',['Support friends first','Use performance gaps, potential impact and urgency','Use rumours','Choose randomly'],'B','Gaps, impact and urgency prioritise support.'),
  q(103,'performance','common','advanced','judgement','Reported figures do not match system records. What is the best response?',['Approve them to avoid conflict','Adjust the system to match','Verify the discrepancy and correct the record using evidence','Publish accusations'],'C','Verify and correct with evidence.'),
  q(104,'performance','common','advanced','judgement','A team member repeatedly misses agreed actions despite support. What should happen?',['Reassign them without discussion','Keep changing expectations','Ignore it indefinitely','Document the pattern and follow the performance process'],'D','Document and follow the process.'),
  q(105,'performance','common','advanced','judgement','A target is unrealistic because assumptions changed. What should a manager do?',['Present evidence and agree an authorised adjustment','Change it secretly','Stop reporting','Blame the team only'],'A','Authorised adjustment based on evidence.'),
  q(106,'performance','common','expert','judgement','One Affiliate Banker produces volume through misleading claims. How should this be treated?',['Reward the volume only','Stop the behaviour and follow compliance procedures','Hide complaints','Use the same claims elsewhere'],'B','Compliance overrides volume.'),
  q(107,'performance','common','expert','judgement','What is the best balance between support and accountability?',['Excuse every missed target','Provide no support','Remove genuine barriers while maintaining clear commitments','Change owners daily'],'C','Support with clear commitments.'),
  q(108,'performance','common','expert','judgement','Which decision best reflects evidence-based management?',['Rely on the loudest opinion','Use one isolated anecdote only','Avoid documenting decisions','Compare verified patterns, context and tested actions'],'D','Verified patterns guide decisions.'),

  // ===== Learning agility, integrity and financial-services compliance (109-120) =====
  q(109,'learning','common','foundation','foundation','You receive a tool you have never used. What should you do first?',['Follow the guide, practise and ask focused questions','Pretend to know it','Use live customer data immediately','Wait without trying'],'A','Guided practice builds skill.'),
  q(110,'learning','common','foundation','early','Which behaviour best demonstrates trainability?',['Repeating an error without review','Applying feedback to the next task','Rejecting unfamiliar work','Waiting for constant supervision'],'B','Applying feedback shows trainability.'),
  q(111,'learning','common','foundation','foundation','What is active listening?',['Waiting only to speak','Ignoring instructions','Paying attention, clarifying and confirming understanding','Agreeing without understanding'],'C','Active listening confirms understanding.'),
  q(112,'learning','common','early','early','What should you do when instructions are unclear?',['Guess silently','Blame the trainer later','Skip the task','Ask a specific clarifying question'],'D','Clarifying questions prevent errors.'),
  q(113,'learning','common','early','applied','Feedback says your draft is unclear. What is the strongest response?',['Revise it using the feedback and test again','Defend it without review','Ignore the feedback','Delete the brief'],'A','Revise using feedback.'),
  q(114,'learning','common','early','applied','You make an error in a report. What should you do?',['Hide it','Correct it, explain the impact and prevent recurrence','Change another persons figures','Quietly fix it without telling anyone'],'B','Correct, explain and prevent recurrence.'),
  q(115,'learning','common','intermediate','judgement','A teammate suggests recording a result that did not happen. What should you do?',['Agree to keep team numbers up','Adjust it slightly and say nothing','Refuse and report it through the proper channel','Ignore it and let them proceed'],'C','Integrity requires refusing and reporting.',true),
  q(116,'learning','common','intermediate','applied','A task is taking longer than expected. What should you do?',['Wait until the deadline passes','Report it complete','Abandon it without notice','Communicate early, identify the blocker and adjust the plan'],'D','Early communication and adjustment.'),
  q(117,'learning','common','intermediate','judgement','You discover a colleague is collecting small fees from applicants. What is appropriate?',['Decline involvement and report it through the proper channel','Ignore it; it is not your role','Help them keep it quiet','Take a share'],'A','Report facilitation payments.',true),
  q(118,'learning','common','advanced','judgement','You disagree with feedback from a trainer. What is the best response?',['Argue publicly without listening','Ask for evidence, understand the standard and test the advice','Ignore future feedback','Leave the task unfinished'],'B','Seek evidence and test advice.'),
  q(119,'learning','common','advanced','judgement','Which practice protects a regulated financial-services campaign?',['Promising returns to attract applicants','Hiding eligibility conditions','Accurate claims and transparent terms','Collecting unnecessary personal data'],'C','Accuracy and transparency protect compliance.',true),
  q(120,'learning','common','advanced','judgement','What does ownership mean in a learning programme?',['Waiting to be reminded of every step','Blaming the tools','Reporting activity instead of outcomes','Taking responsibility for preparation, action and follow-through'],'D','Ownership is responsibility for outcomes.',true),
];

export const QUESTION_BY_ID = new Map(SCREENING_QUESTION_BANK.map(question => [question.id, question]));

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function tierForExperience(value: string | undefined | null): Tier {
  return (value && TIER_MAP[value]) || 'foundation';
}

function pickCommon(pool: ScreeningQuestion[], count: number, exclude: Set<number>): ScreeningQuestion[] {
  const candidates = shuffle(pool.filter(question => !exclude.has(question.id)));
  return candidates.slice(0, count);
}

function pickValidation(pool: ScreeningQuestion[], targetTier: Tier, count: number, exclude: Set<number>): ScreeningQuestion[] {
  const ti = TIERS.indexOf(targetTier);
  const order: number[] = [ti];
  for (let d = 1; d < TIERS.length; d++) {
    if (ti - d >= 0) order.push(ti - d);
    if (ti + d < TIERS.length) order.push(ti + d);
  }
  const selected: ScreeningQuestion[] = [];
  for (const t of order) {
    if (selected.length >= count) break;
    const candidates = shuffle(pool.filter(question => question.tier === TIERS[t] && !exclude.has(question.id)));
    for (const candidate of candidates) {
      if (selected.length >= count) break;
      selected.push(candidate);
      exclude.add(candidate.id);
    }
  }
  return selected;
}

export type AttemptItem = { id: number; order: number[]; bucket: 'common' | 'digital_validation' | 'sales_validation' | 'learning_agility' };

export function selectAssessmentQuestions(digitalExperience: string | undefined | null, salesExperience: string | undefined | null): AttemptItem[] {
  const dmTier = tierForExperience(digitalExperience);
  const salesTier = tierForExperience(salesExperience);
  const exclude = new Set<number>();
  const selected: { question: ScreeningQuestion; bucket: AttemptItem['bucket'] }[] = [];

  const digitalContentCommon = SCREENING_QUESTION_BANK.filter(q => q.experienceDimension === 'common' && (q.category === 'digital' || q.category === 'content'));
  pickCommon(digitalContentCommon, ASSESSMENT_BLUEPRINT.commonCore.digitalContent, exclude).forEach(question => { selected.push({ question, bucket: 'common' }); exclude.add(question.id); });

  const salesAffiliateCommon = SCREENING_QUESTION_BANK.filter(q => q.experienceDimension === 'common' && (q.category === 'sales' || q.category === 'affiliate'));
  pickCommon(salesAffiliateCommon, ASSESSMENT_BLUEPRINT.commonCore.salesAffiliate, exclude).forEach(question => { selected.push({ question, bucket: 'common' }); exclude.add(question.id); });

  const performanceCommon = SCREENING_QUESTION_BANK.filter(q => q.experienceDimension === 'common' && q.category === 'performance');
  pickCommon(performanceCommon, ASSESSMENT_BLUEPRINT.commonCore.performance, exclude).forEach(question => { selected.push({ question, bucket: 'common' }); exclude.add(question.id); });

  const learningCommon = SCREENING_QUESTION_BANK.filter(q => q.experienceDimension === 'common' && q.category === 'learning');
  pickCommon(learningCommon, ASSESSMENT_BLUEPRINT.commonCore.learning, exclude).forEach(question => { selected.push({ question, bucket: 'common' }); exclude.add(question.id); });

  const digitalPool = SCREENING_QUESTION_BANK.filter(q => q.experienceDimension === 'digital');
  pickValidation(digitalPool, dmTier, ASSESSMENT_BLUEPRINT.validation.digital, exclude).forEach(question => { selected.push({ question, bucket: 'digital_validation' }); exclude.add(question.id); });

  const salesPool = SCREENING_QUESTION_BANK.filter(q => q.experienceDimension === 'sales');
  pickValidation(salesPool, salesTier, ASSESSMENT_BLUEPRINT.validation.sales, exclude).forEach(question => { selected.push({ question, bucket: 'sales_validation' }); exclude.add(question.id); });

  const learningAgilityPool = SCREENING_QUESTION_BANK.filter(q => q.experienceDimension === 'common' && q.category === 'learning');
  pickCommon(learningAgilityPool, ASSESSMENT_BLUEPRINT.learningAgility, exclude).forEach(question => { selected.push({ question, bucket: 'learning_agility' }); exclude.add(question.id); });

  const finalOrder = shuffle(selected.map((_, index) => index));
  return finalOrder.map(i => ({
    id: selected[i].question.id,
    order: shuffle([0, 1, 2, 3]),
    bucket: selected[i].bucket,
  }));
}

export function publicQuestion(question: ScreeningQuestion) {
  const { correctAnswer: _correctAnswer, rationale: _rationale, critical: _critical, ...rest } = question;
  return rest;
}