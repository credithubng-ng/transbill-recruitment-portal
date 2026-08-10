export type ScreeningQuestion = {
  id: number;
  category: 'digital' | 'content' | 'learnability' | 'affiliate' | 'performance';
  difficulty: 'foundation' | 'applied' | 'judgement';
  questionText: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
};

const keys = ['A', 'B', 'C', 'D'];
const q = (id: number, category: ScreeningQuestion['category'], difficulty: ScreeningQuestion['difficulty'], questionText: string, options: string[], correctAnswer: string): ScreeningQuestion => ({
  id, category, difficulty, questionText, correctAnswer,
  options: options.map((text, index) => ({ key: keys[index], text })),
});

export const BANK_VERSION = 'lagos-youth-2026-v1';
export const ASSESSMENT_BLUEPRINT = { digital: 8, content: 5, learnability: 6, affiliate: 6, performance: 5 };

export const SCREENING_QUESTION_BANK: ScreeningQuestion[] = [
  // Digital marketing fundamentals (1-20)
  q(1,'digital','foundation','What is the main purpose of a call to action?',['Make a post longer','Tell the audience the next step','Add more colours','Hide the offer'],'B'),
  q(2,'digital','foundation','Which metric best measures whether visitors complete a desired action?',['Reach','Conversion rate','Impressions','Follower count'],'B'),
  q(3,'digital','foundation','An advert gets clicks but few completed forms. What should be checked first?',['Landing-page and form friction','Logo colour','Office size','Follower biographies'],'A'),
  q(4,'digital','foundation','What should be defined before creating a campaign?',['Audience and objective','Font family only','Number of emojis','Competitor password'],'A'),
  q(5,'digital','foundation','What is audience segmentation?',['Grouping people by relevant characteristics','Deleting inactive accounts','Using one platform only','Sending everyone the same message'],'A'),
  q(6,'digital','foundation','What does organic reach mean?',['Unpaid distribution of content','Paid advertising only','Email delivery failure','Website hosting cost'],'A'),
  q(7,'digital','foundation','Which metric shows how often people interact with content?',['Engagement rate','Office attendance','Page colour score','Invoice total'],'A'),
  q(8,'digital','foundation','What is a target audience?',['The people most likely to need the offer','Everyone online','Only existing employees','A list of competitors'],'A'),
  q(9,'digital','foundation','Why is mobile-friendly design important in Lagos campaigns?',['Many users access content by phone','It removes the need for content','It guarantees sales','It prevents measurement'],'A'),
  q(10,'digital','foundation','Which is a lead?',['A person who has shown relevant interest','Every social-media account','A deleted contact','An unrelated website visit'],'A'),
  q(11,'digital','applied','What is A/B testing used for?',['Comparing two versions to identify the stronger performer','Posting unrelated campaigns','Avoiding reports','Replacing customer research'],'A'),
  q(12,'digital','applied','Why should campaign links use tracking parameters?',['To identify which sources produce results','To stop clicks','To hide the landing page','To increase spelling errors'],'A'),
  q(13,'digital','applied','A campaign has high reach but low engagement. What is the best response?',['Review message relevance and creative','Buy followers immediately','Stop measuring','Repeat it unchanged forever'],'A'),
  q(14,'digital','applied','What is retargeting?',['Showing relevant messages to people who previously interacted','Deleting past visitors','Changing the company name','Posting without an audience'],'A'),
  q(15,'digital','applied','Which result best indicates lead quality?',['Leads progressing through qualification','Total impressions alone','Number of hashtags','Video length'],'A'),
  q(16,'digital','applied','What should a campaign report compare?',['Results against objectives and targets','Only positive comments','Staff birthdays','Competitors’ logos'],'A'),
  q(17,'digital','judgement','A campaign is generating cheap but unsuitable leads. What should change first?',['Targeting and qualification message','Office furniture','Company letterhead','Reporting frequency only'],'A'),
  q(18,'digital','judgement','Which practice protects trust in financial-services marketing?',['Accurate claims and transparent conditions','Guaranteed-income promises','Hidden eligibility rules','Collecting unnecessary data'],'A'),
  q(19,'digital','judgement','A channel has high cost and no conversions after adequate testing. What is appropriate?',['Pause it and reallocate based on evidence','Increase spend without review','Hide the result','Report conversions that did not happen'],'A'),
  q(20,'digital','judgement','Which attribution statement is most responsible?',['Results may involve several touchpoints','The last click always deserves all credit','Attribution never matters','Every impression is a sale'],'A'),

  // Content creation and lead generation (21-40)
  q(21,'content','foundation','What makes a social-media headline effective?',['A clear relevant benefit','Unrelated jargon','No connection to the audience','Maximum length in every case'],'A'),
  q(22,'content','foundation','Which content element helps a reader know what to do next?',['Call to action','Decorative border','Profile photo','Timestamp'],'A'),
  q(23,'content','foundation','What is a content calendar?',['A plan of topics, formats and publishing dates','A payroll document','A list of passwords','A bank statement'],'A'),
  q(24,'content','foundation','Why should content use plain language?',['It improves understanding and action','It makes facts unnecessary','It removes audience differences','It guarantees virality'],'A'),
  q(25,'content','foundation','Which format is useful for demonstrating a process?',['Short instructional video','An unexplained logo','A blank image','An unrelated quotation'],'A'),
  q(26,'content','foundation','What is social proof?',['Evidence that others have used or valued an offer','A private password','An internal invoice','A random stock photo'],'A'),
  q(27,'content','applied','Which message is most likely to attract qualified applicants?',['Clear eligibility, value and application steps','Apply now with no explanation','Guaranteed job for everyone','Send us money first'],'A'),
  q(28,'content','applied','How should one campaign idea be adapted across platforms?',['Keep the core message but adjust format and context','Post the identical asset everywhere regardless of fit','Change the facts on each platform','Remove the call to action'],'A'),
  q(29,'content','applied','A WhatsApp message is being ignored. What should be reviewed?',['Relevance, clarity, timing and permission','Recipient profile pictures','Phone colour','Office opening music'],'A'),
  q(30,'content','applied','Which landing-page headline is strongest?',['A specific outcome for the intended audience','Welcome to our page','Many words about the company','Click because we said so'],'A'),
  q(31,'content','applied','What is the best way to improve a weak content draft?',['Use feedback and test a revised version','Defend it without review','Delete all performance data','Copy another brand exactly'],'A'),
  q(32,'content','applied','Why create different messages for different audience segments?',['Their needs and barriers differ','Metrics become unnecessary','Every segment sees the same context','It prevents learning'],'A'),
  q(33,'content','applied','Which lead form is usually more effective?',['Only necessary fields with clear privacy context','Every possible personal question','No explanation of data use','A form that does not work on mobile'],'A'),
  q(34,'content','applied','A video has many views but no action. What should be tested?',['A clearer offer and call to action','Removing the offer','Longer introductions only','Hiding the link'],'A'),
  q(35,'content','judgement','A testimonial cannot be verified. What should you do?',['Do not publish it as fact','Publish it anonymously as proof','Add stronger claims','Invent a customer name'],'A'),
  q(36,'content','judgement','An audience speaks both English and Pidgin. What is the best approach?',['Test respectful language variants with the audience','Assume one version works for everyone','Use confusing slang','Change eligibility facts by language'],'A'),
  q(37,'content','judgement','Negative comments reveal a genuine misunderstanding. What should the team do?',['Clarify the message and respond professionally','Delete every comment','Attack the commenter','Stop monitoring responses'],'A'),
  q(38,'content','judgement','Which lead magnet is most appropriate?',['Useful information connected to the offer','An unrelated celebrity image','A misleading prize','A hidden fee'],'A'),
  q(39,'content','judgement','A campaign asset performs well once. What is the best next step?',['Validate the result and test controlled variations','Assume it will work forever','Stop recording results','Copy it into unrelated campaigns'],'A'),
  q(40,'content','judgement','What should happen before publishing content about regulated financial products?',['Verify claims, terms and approvals','Promise returns','Remove conditions','Use any available logo'],'A'),

  // Learning agility and trainability (41-60)
  q(41,'learnability','foundation','You receive a tool you have never used. What should you do first?',['Follow the guide, practise and ask focused questions','Pretend to know it','Use live customer data immediately','Wait without trying'],'A'),
  q(42,'learnability','foundation','Which behaviour best demonstrates trainability?',['Applying feedback to the next task','Repeating an error without review','Rejecting unfamiliar work','Waiting for constant supervision'],'A'),
  q(43,'learnability','foundation','What is active listening?',['Paying attention, clarifying and confirming understanding','Waiting only to speak','Ignoring instructions','Agreeing without understanding'],'A'),
  q(44,'learnability','foundation','Why take notes during practical training?',['To retain steps, decisions and questions','To avoid practising','To replace attendance','To hide confusion'],'A'),
  q(45,'learnability','foundation','What should you do when instructions are unclear?',['Ask a specific clarifying question','Guess silently','Blame the trainer later','Skip the task'],'A'),
  q(46,'learnability','foundation','What supports learning during an intensive two-week programme?',['Consistent practice and timely feedback','Attendance only on the last day','Relying only on prior knowledge','Avoiding difficult tasks'],'A'),
  q(47,'learnability','applied','Feedback says your campaign draft is unclear. What is the strongest response?',['Revise it using the feedback and test again','Defend it without review','Ignore the feedback','Delete the brief'],'A'),
  q(48,'learnability','applied','You make an error in a report. What should you do?',['Correct it, explain the impact and prevent recurrence','Hide it','Change another person’s figures','Delete all reports'],'A'),
  q(49,'learnability','applied','A task is taking longer than expected. What should you do?',['Communicate early, identify the blocker and adjust the plan','Wait until the deadline passes','Report it complete','Abandon it without notice'],'A'),
  q(50,'learnability','applied','How should you use an example provided by a trainer?',['Understand the principle and apply it to a new case','Copy it without understanding','Ignore the instructions','Claim it as your own work'],'A'),
  q(51,'learnability','applied','You receive two pieces of conflicting feedback. What is best?',['Clarify the objective and decision owner','Apply both blindly','Ignore both','Choose based on friendship'],'A'),
  q(52,'learnability','applied','What is a useful way to prepare for the next training day?',['Review learning, practise weak areas and list questions','Avoid the material','Wait for a test','Memorise answers without context'],'A'),
  q(53,'learnability','applied','You finish an assignment early. What should you do?',['Check quality and support the agreed next priority','Submit without review','Distract others','Change the task requirements'],'A'),
  q(54,'learnability','applied','A new process replaces one you know well. What demonstrates adaptability?',['Learn why it changed and practise the new process','Continue the old process secretly','Refuse to participate','Tell others to ignore it'],'A'),
  q(55,'learnability','judgement','A teammate is struggling with a tool you understand. What should you do?',['Offer clear help without doing all their work','Mock them','Withhold information','Take credit for their task'],'A'),
  q(56,'learnability','judgement','You disagree with feedback from a trainer. What is the best response?',['Ask for evidence, understand the standard and test the advice','Argue publicly without listening','Ignore future feedback','Leave the task unfinished'],'A'),
  q(57,'learnability','judgement','Which pattern most strongly predicts rapid skill development?',['Practice, feedback, reflection and another attempt','Passive attendance alone','Avoiding measurement','Repeating only easy tasks'],'A'),
  q(58,'learnability','judgement','A training exercise reveals a major skills gap. What should you do?',['Create a focused improvement plan and seek support','Hide the result','Change your score','Avoid similar exercises'],'A'),
  q(59,'learnability','judgement','When is it appropriate to escalate a blocker?',['When it threatens delivery and cannot be resolved within your authority','Whenever a task feels unfamiliar','Only after the deadline','Never'],'A'),
  q(60,'learnability','judgement','What does ownership mean in a learning programme?',['Taking responsibility for preparation, action and follow-through','Waiting to be reminded of every step','Blaming the tools','Reporting activity instead of outcomes'],'A'),

  // Affiliate Banker recruitment and onboarding (61-80)
  q(61,'affiliate','foundation','What is the best first step when speaking to a potential Affiliate Banker?',['Explain the opportunity accurately and confirm suitability','Promise guaranteed earnings','Collect money first','Add them to a group without consent'],'A'),
  q(62,'affiliate','foundation','Why qualify a prospective Affiliate Banker?',['To check fit, readiness and realistic expectations','To increase the contact list only','To avoid explaining the role','To guarantee performance'],'A'),
  q(63,'affiliate','foundation','Which channels can support community recruitment in Lagos?',['Targeted social media, WhatsApp and trusted local networks','Only foreign television','Unsolicited bulk messages without context','A private file nobody sees'],'A'),
  q(64,'affiliate','foundation','What should onboarding explain?',['Responsibilities, process, support and next steps','Only the programme name','Guaranteed income','Internal passwords'],'A'),
  q(65,'affiliate','foundation','Why record recruitment source?',['To learn which channels produce suitable recruits','To avoid follow-up','To hide poor performance','To replace consent'],'A'),
  q(66,'affiliate','foundation','What is activation?',['Helping a recruited person complete required steps and begin productive activity','Adding a name to a list only','Sending one greeting','Closing their account'],'A'),
  q(67,'affiliate','applied','A prospect asks a question you cannot answer. What should you do?',['Acknowledge it and confirm the correct answer promptly','Invent an answer','End the conversation','Use a competitor’s information'],'A'),
  q(68,'affiliate','applied','Many people register but do not activate. What should be investigated?',['Onboarding barriers and expectation gaps','Profile photo quality','Office decoration','Number of emojis used'],'A'),
  q(69,'affiliate','applied','Which recruitment message is most responsible?',['Clear opportunity, eligibility, responsibilities and realistic conditions','Guaranteed earnings with no conditions','Pay before you learn more','Everyone will succeed'],'A'),
  q(70,'affiliate','applied','A referral partner sends unsuitable candidates. What is best?',['Clarify the target profile and provide feedback using evidence','Accept everyone','Stop tracking the source','Publish their details'],'A'),
  q(71,'affiliate','applied','Why follow up shortly after onboarding?',['To resolve early barriers and support activation','To guarantee results without effort','To replace training','To avoid keeping records'],'A'),
  q(72,'affiliate','applied','Which prospect is most promising?',['One who understands the role, meets requirements and commits to next steps','One who expects guaranteed money without activity','One who refuses verification','One who cannot be contacted'],'A'),
  q(73,'affiliate','applied','What should a recruitment pipeline show?',['Prospects at each stage and the next action','Only the total contact count','Personal rumours','Unverified income claims'],'A'),
  q(74,'affiliate','applied','A prospect is interested but not ready. What is appropriate?',['Record consent and schedule a relevant follow-up','Message them every hour','Mark them activated','Share their details publicly'],'A'),
  q(75,'affiliate','judgement','A recruiter wants to exaggerate benefits to meet target. What should you do?',['Reject the approach and use accurate approved information','Allow it temporarily','Hide the complaints','Remove eligibility conditions'],'A'),
  q(76,'affiliate','judgement','A community leader requests payment for every name supplied, regardless of quality. What matters most?',['Approved terms, compliance and verified outcomes','Paying immediately from personal funds','Ignoring quality','Recording every name as active'],'A'),
  q(77,'affiliate','judgement','A prospect provides inconsistent identity information. What should happen?',['Pause progression and follow the verification process','Correct it without asking','Ignore the issue','Share it in a group chat'],'A'),
  q(78,'affiliate','judgement','Recruitment is below target halfway through the week. What is the best response?',['Analyse the funnel, focus on the bottleneck and test an action plan','Invent results','Lower quality standards silently','Stop reporting'],'A'),
  q(79,'affiliate','judgement','Two channels produce equal recruits but one has much higher activation. Which deserves priority?',['The channel with stronger activation and suitable cost','The channel with more impressions only','Whichever is familiar','Neither should be measured'],'A'),
  q(80,'affiliate','judgement','What protects a prospect’s trust during follow-up?',['Consent, relevant frequency and accurate information','Daily pressure regardless of response','Hidden sender identity','Unapproved promises'],'A'),

  // Performance management (81-100)
  q(81,'performance','foundation','Which metrics matter when managing Affiliate Bankers?',['Recruitment, activation and productive activity','Profile picture changes','Chat emojis','Phone model'],'A'),
  q(82,'performance','foundation','What is a performance target?',['A defined result expected within a period','A personal opinion','An unrecorded promise','A list of contacts only'],'A'),
  q(83,'performance','foundation','Why establish a baseline?',['To understand starting performance and measure change','To avoid setting targets','To remove context','To replace reporting'],'A'),
  q(84,'performance','foundation','What should a daily performance report contain?',['Verified results, gaps, actions and next steps','Only good news','Unverified estimates','No dates'],'A'),
  q(85,'performance','foundation','What is coaching?',['Helping someone improve through specific feedback and action','Doing all their work','Criticising without examples','Changing targets secretly'],'A'),
  q(86,'performance','foundation','Why distinguish active from registered Affiliate Bankers?',['Registration alone does not show productive activity','They always mean the same thing','Activity cannot be measured','It reduces the contact list'],'A'),
  q(87,'performance','applied','Several registered Affiliate Bankers are inactive. What should happen first?',['Identify barriers and provide targeted re-engagement','Remove everyone immediately','Report them active','Stop tracking activity'],'A'),
  q(88,'performance','applied','An Affiliate Banker misses target for the first time. What is the best response?',['Review evidence, diagnose the cause and agree support actions','Publicly shame them','Change the records','Ignore it permanently'],'A'),
  q(89,'performance','applied','Which coaching feedback is most useful?',['Specific behaviour, impact and agreed next action','You are not serious','Do better somehow','Everyone else is better'],'A'),
  q(90,'performance','applied','Performance improves after a coaching action. What should you do?',['Record the result and reinforce what worked','Stop measuring','Claim the improvement without evidence','Change the metric'],'A'),
  q(91,'performance','applied','A high performer has stopped reporting. What is appropriate?',['Address reporting expectations while recognising actual results','Ignore reporting forever','Delete their results','Reduce every target'],'A'),
  q(92,'performance','applied','How should a manager prioritise support?',['Use performance gaps, potential impact and urgency','Support friends first','Use rumours','Choose randomly'],'A'),
  q(93,'performance','applied','A team meets recruitment target but activation is low. Where is the main bottleneck?',['Onboarding and early support','Recruitment volume only','Office attendance','Report design'],'A'),
  q(94,'performance','applied','What is a useful weekly review question?',['Which actions moved the target and what should change next?','Who posted the most messages?','Can we avoid the data?','Which result should we hide?'],'A'),
  q(95,'performance','judgement','Reported figures do not match system records. What is the best response?',['Verify the discrepancy and correct the record using evidence','Approve them to avoid conflict','Delete both records','Publish accusations'],'A'),
  q(96,'performance','judgement','A team member repeatedly misses agreed actions despite support. What should happen?',['Document the pattern and follow the performance process','Invent better results','Keep changing expectations','Ignore it indefinitely'],'A'),
  q(97,'performance','judgement','A target is clearly unrealistic because assumptions changed. What should a manager do?',['Present evidence and agree an authorised adjustment','Change it secretly','Stop reporting','Blame the team only'],'A'),
  q(98,'performance','judgement','One Affiliate Banker produces volume through misleading claims. How should this be treated?',['Stop the behaviour and follow compliance procedures','Reward the volume only','Hide complaints','Use the same claims elsewhere'],'A'),
  q(99,'performance','judgement','What is the best balance between support and accountability?',['Remove genuine barriers while maintaining clear commitments','Excuse every missed target','Provide no support','Change owners daily'],'A'),
  q(100,'performance','judgement','Which decision best reflects evidence-based management?',['Compare verified patterns, context and tested actions','Rely on the loudest opinion','Use one isolated anecdote only','Avoid documenting decisions'],'A'),
];

export const publicQuestion = ({ correctAnswer: _correctAnswer, ...question }: ScreeningQuestion) => question;
export const QUESTION_BY_ID = new Map(SCREENING_QUESTION_BANK.map(question => [question.id, question]));
