// Survey content for scripts/seed.js.
//
// Question design follows common survey-methodology guidance: one idea per question,
// neutral wording, fully labelled options, short recall windows, and an open "why"
// next to any score. Distributions are deliberately uneven, like real data.
//
// Per question:
//   type 'Multiple choice' | 'Drop down'  -> weights: relative likelihood per option
//   type 'Checkbox'                       -> probs: chance each option is ticked
//   type 'Paragraph' | 'Short answer'     -> pool: sample comments, fill: share who answer

const SCORE_OPTIONS = [
  '0 - Not at all likely', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10 - Extremely likely',
];

export const SURVEYS = [
  // ───────────────────────── Workplace · unlocked ─────────────────────────
  {
    key: 'speak-up',
    title: 'Can you speak up here?',
    category: 'Workplace',
    description:
      'A short, anonymous check on how safe it feels to raise concerns, admit mistakes and disagree at work. Your answers are encrypted until results open, and nothing links them to you.',
    state: 'unlocked',
    responses: 84,
    activatedDaysAgo: 21,
    durationDays: 14,
    questions: [
      {
        title: 'When someone on your team makes a mistake, how is it usually treated?',
        type: 'Multiple choice', required: true,
        options: ['Held against them for a long time', 'Noticed, but rarely discussed openly', 'It depends on who is involved', 'Treated as something to learn from'],
        weights: [9, 22, 37, 32],
      },
      {
        title: 'In the past month, have you held back a concern because of how it might be received?',
        type: 'Multiple choice', required: true,
        options: ['Yes, more than once', 'Yes, once', 'No, I raised everything I needed to'],
        weights: [34, 31, 35],
      },
      {
        title: 'Who do you feel comfortable raising a problem with?',
        type: 'Checkbox', required: false,
        options: ['My direct manager', 'My teammates', 'HR', 'A leader above my manager', 'Nobody at work'],
        probs: [0.52, 0.66, 0.21, 0.18, 0.12],
      },
      {
        title: 'How easy is it to ask a teammate for help when you are stuck?',
        type: 'Drop down', required: true,
        options: ['Very difficult', 'Somewhat difficult', 'Neither easy nor difficult', 'Somewhat easy', 'Very easy'],
        weights: [3, 9, 16, 38, 34],
      },
      {
        title: 'What is one thing that would make it easier to speak up here?',
        type: 'Paragraph', required: false, fill: 0.72,
        pool: [
          'Seeing someone raise an issue and nothing bad happen to them. Right now we just hear stories.',
          'If managers said "I got this wrong" out loud once in a while, the rest of us would relax.',
          'A way to flag problems without my name on it, and a promise that something gets done.',
          'Fewer meetings where the loudest person wins.',
          'Honestly, trust. It took one bad reaction two years ago and nobody has forgotten.',
          'Feedback that is about the work and not about the person.',
          'Having my manager ask me directly instead of waiting for me to volunteer.',
          'A skip-level conversation every quarter, with no agenda.',
          'Not being told "that is just how it works here" every time.',
          'Clear consequences for people who shut others down.',
          'More time. When everything is urgent, nobody has space to raise a concern properly.',
          'Knowing who actually reads what I send to HR.',
          'Nothing really, my team is great. The gap is between teams.',
          'Written follow-ups. Verbal promises disappear.',
          'Being able to disagree with a decision after it is made, not just before.',
          'If raising a risk was treated as part of the job, not as negativity.',
          'Smaller groups. I will not say anything in a room of 40.',
          'Leaders going first when they share something that went badly.',
          'Protection for juniors. It is much harder for us.',
          'I would like to see the same rules applied to senior people.',
        ],
      },
    ],
  },

  // ───────────────────────── Workplace · unlocked ─────────────────────────
  {
    key: 'leadership-feedback',
    title: 'Honest feedback for leadership',
    category: 'Workplace',
    description:
      'Leaders rarely hear the unfiltered version. This takes about three minutes, is fully anonymous, and the results are shared openly once the survey closes.',
    state: 'unlocked',
    responses: 63,
    activatedDaysAgo: 16,
    durationDays: 10,
    questions: [
      {
        title: 'On a scale of 0 to 10, how likely are you to recommend working here to a friend?',
        type: 'Drop down', required: true,
        options: SCORE_OPTIONS,
        weights: [1, 1, 2, 3, 3, 6, 8, 14, 18, 20, 24],
        scoreFor: 'enps',
      },
      {
        title: 'What is the main reason for your score?',
        type: 'Paragraph', required: true, fill: 1, byScore: true,
        pool: {
          detractor: [
            'Decisions get made above us and we find out afterwards. It is hard to care about a direction nobody explains.',
            'I have raised the same workload problem three times. Nothing has changed.',
            'People who leave are replaced by fewer people, and the work just gets redistributed.',
            'Good colleagues, but the way promotions work feels arbitrary.',
            'I do not feel my effort is noticed unless something goes wrong.',
            'Constant reorganisations. I have had four managers in two years.',
            'Pay has not kept up and nobody will talk about it honestly.',
          ],
          passive: [
            'It is a fine place to work. Nothing terrible, nothing that makes me excited either.',
            'I like my team a lot. I am less sure about where the company is heading.',
            'Flexible hours are great, but growth opportunities are limited.',
            'Depends on the week. Some are great and some are chaos.',
            'Decent pay and people, but I cannot see my next step here.',
            'Leadership means well, communication is the weak spot.',
          ],
          promoter: [
            'My manager genuinely backs me and gives me room to do the work properly.',
            'I learn something every month and people are generous with their time.',
            'Honest culture. When something goes wrong we talk about it and fix it.',
            'Flexibility and trust. I am treated like an adult.',
            'Great people, interesting problems, fair pay.',
            'I have been here three years and still look forward to Mondays most weeks.',
            'Leadership explains the why behind decisions, even the unpopular ones.',
          ],
        },
      },
      {
        title: 'In the last 7 days, did anyone recognise or thank you for your work?',
        type: 'Multiple choice', required: true,
        options: ['Yes, my manager', 'Yes, a teammate or someone else', 'No, not this week'],
        weights: [30, 28, 42],
      },
      {
        title: 'Does your direct manager seem to care about you as a person?',
        type: 'Multiple choice', required: true,
        options: ['Not at all', 'A little', 'Mostly', 'Very much'],
        weights: [6, 17, 41, 36],
      },
      {
        title: 'How often do you trust senior leadership to be honest about the company’s challenges?',
        type: 'Multiple choice', required: true,
        options: ['Almost never', 'Sometimes', 'Usually', 'Almost always'],
        weights: [14, 33, 35, 18],
      },
      {
        title: 'If you could ask leadership one thing and get an honest answer, what would it be?',
        type: 'Paragraph', required: false, fill: 0.68,
        pool: [
          'Is there a plan if the next quarter is as slow as this one?',
          'How are bonuses actually decided?',
          'Why do some teams get headcount and others do not?',
          'What would make you change your mind about the return-to-office policy?',
          'Are any more layoffs coming? Please just tell us.',
          'What does success look like for this company in two years?',
          'Who is accountable when a big project fails?',
          'What is the real reason senior people have been leaving?',
          'Will you share salary bands?',
          'How do you decide what not to do?',
          'What keeps you up at night about the business?',
          'Would you take the same decision again about the reorg?',
          'When will we hear about the promotion cycle?',
          'Do you read the feedback we give you?',
        ],
      },
    ],
  },

  // ───────────────────────── Workplace · unlocked ─────────────────────────
  {
    key: 'remote-hybrid-office',
    title: 'Remote, hybrid or office: what actually works?',
    category: 'Workplace',
    description:
      'Everyone has an opinion on where work should happen. This asks where you actually get your best work done, and what gets in the way. Anonymous, and the results open to everyone.',
    state: 'unlocked',
    responses: 112,
    activatedDaysAgo: 28,
    durationDays: 21,
    questions: [
      {
        title: 'Which best describes how you work today?',
        type: 'Multiple choice', required: true,
        options: ['Fully in the office', 'Hybrid, mostly in the office', 'Hybrid, mostly remote', 'Fully remote'],
        weights: [14, 33, 31, 22],
      },
      {
        title: 'Which setup would you choose if it were entirely up to you?',
        type: 'Multiple choice', required: true,
        options: ['Fully in the office', 'Hybrid, mostly in the office', 'Hybrid, mostly remote', 'Fully remote'],
        weights: [5, 19, 38, 38],
      },
      {
        title: 'Where do you get your best focused work done?',
        type: 'Multiple choice', required: true,
        options: ['At home', 'At the office', 'Both about equally', 'Somewhere else'],
        weights: [51, 19, 26, 4],
      },
      {
        title: 'What gets in the way of your work most often?',
        type: 'Checkbox', required: false,
        options: ['Too many meetings', 'Unclear priorities', 'Slow or unreliable tools', 'Noise or interruptions', 'Time zone differences', 'Commute or travel time', 'Nothing significant'],
        probs: [0.62, 0.41, 0.33, 0.38, 0.14, 0.29, 0.08],
      },
      {
        title: 'What is one change to how we work that would help you most?',
        type: 'Paragraph', required: false, fill: 0.66,
        pool: [
          'No-meeting mornings. Protect two hours a day and I would get twice as much done.',
          'Pick office days as a team so the trip is actually worth it.',
          'Better video setup in meeting rooms. Half the hybrid calls are unusable.',
          'Write things down. Half my meetings could have been a document.',
          'A real quiet space in the office. Open plan is not for deep work.',
          'Stop scheduling things across lunch.',
          'Let people choose, and judge the work not the location.',
          'Fix the VPN. I lose an hour a week to it.',
          'Anchor days where everyone is in, and otherwise leave us alone.',
          'A stipend for a proper home desk and chair.',
          'Make async the default and meetings the exception.',
          'Be honest about what you expect. The mixed messages are the worst part.',
          'More time to just talk to colleagues, without an agenda. I miss that remotely.',
          'Shorter meetings. 25 and 50 minutes, not 30 and 60.',
          'Commute subsidy. Office days cost me real money.',
        ],
      },
    ],
  },

  // ───────────────────────── Education · live (locked) ─────────────────────────
  {
    key: 'students-coping',
    title: 'How are students really coping this semester?',
    category: 'Education',
    description:
      'Nobody asks students this honestly, because it is hard to answer with your name attached. Anonymous and encrypted. Results open to everyone when the survey closes.',
    state: 'live',
    responses: 47,
    activatedDaysAgo: 4,
    durationDays: 10,
    questions: [
      {
        title: 'How would you describe your stress level over the past two weeks?',
        type: 'Multiple choice', required: true,
        options: ['Low and manageable', 'Moderate, but I cope', 'High, and it is affecting me', 'Overwhelming'],
        weights: [9, 38, 41, 12],
      },
      {
        title: 'How many hours do you usually sleep on a weeknight?',
        type: 'Multiple choice', required: true,
        options: ['Under 5 hours', '5 to 6 hours', '6 to 7 hours', '7 to 8 hours', 'More than 8 hours'],
        weights: [14, 33, 29, 20, 4],
      },
      {
        title: 'What is putting the most pressure on you right now?',
        type: 'Checkbox', required: false,
        options: ['Workload and deadlines', 'Exams and grades', 'Money or part-time work', 'Family or home situation', 'Loneliness or social life', 'Career uncertainty', 'My health', 'Nothing in particular'],
        probs: [0.71, 0.58, 0.44, 0.19, 0.27, 0.46, 0.16, 0.05],
      },
      {
        title: 'If you were struggling, how likely are you to ask your school or university for support?',
        type: 'Multiple choice', required: true,
        options: ['Very unlikely', 'Unlikely', 'Likely', 'Very likely'],
        weights: [22, 34, 32, 12],
      },
      {
        title: 'What is one thing your school could change that would make the biggest difference to you?',
        type: 'Paragraph', required: false, fill: 0.7,
        pool: [
          'Stop putting three deadlines in the same week. It is avoidable.',
          'Make counselling appointments possible within days, not weeks.',
          'Be clear about extensions. Asking for one feels like confessing something.',
          'Spread assessments across the semester instead of everything at the end.',
          'Cheaper food on campus. I skip meals more than I admit.',
          'Let us know the marking criteria before we start, not after.',
          'More flexibility for people who work alongside studying.',
          'Lecturers who reply to emails.',
          'Talk about mental health outside of one awareness week a year.',
          'Reading weeks that are real breaks, not catch-up weeks.',
          'Peer groups for people who feel isolated. It is hard to start from nothing.',
          'Recorded lectures for everything. It helps me and a lot of people I know.',
        ],
      },
    ],
  },

  // ───────────────────────── Technology · live (locked) ─────────────────────────
  {
    key: 'ai-at-work-and-study',
    title: 'How do you really use AI at work and study?',
    category: 'Technology',
    description:
      'Everyone is using it and few people say so. Answer honestly: nothing here is tied to you, and the combined results will be public once the survey closes.',
    state: 'live',
    responses: 29,
    activatedDaysAgo: 2,
    durationDays: 14,
    questions: [
      {
        title: 'How often do you use AI tools, such as chatbots, for work or study?',
        type: 'Multiple choice', required: true,
        options: ['Never', 'A few times a month', 'A few times a week', 'Every day'],
        weights: [4, 14, 34, 48],
      },
      {
        title: 'What do you mostly use them for?',
        type: 'Checkbox', required: false,
        options: ['Writing or editing', 'Research or summarising', 'Coding', 'Brainstorming ideas', 'Homework or assignments', 'Translation', 'Something else'],
        probs: [0.68, 0.59, 0.37, 0.52, 0.31, 0.18, 0.12],
      },
      {
        title: 'Have you used AI for something you were not sure you were allowed to?',
        type: 'Multiple choice', required: true,
        options: ['Yes', 'No', 'I am not sure what the rules are'],
        weights: [31, 22, 47],
      },
      {
        title: 'How do you feel about AI’s effect on your future work?',
        type: 'Multiple choice', required: true,
        options: ['Mostly worried', 'Mixed feelings', 'Mostly optimistic', 'I have not thought about it much'],
        weights: [27, 46, 22, 5],
      },
      {
        title: 'What do you wish people understood about how you use AI?',
        type: 'Paragraph', required: false, fill: 0.7,
        pool: [
          'I use it to get started, not to finish. I still check everything.',
          'It is a calculator for words. Nobody asks if you cheat with a calculator.',
          'I am afraid to admit it because people assume the work is not mine.',
          'It saves me hours on boring tasks so I can spend time on the hard part.',
          'The rules are unclear, so everyone quietly does their own thing.',
          'It makes me faster, but I do worry I am getting worse at writing from scratch.',
          'I would use it more if I knew it was fine to.',
          'Please stop pretending it is either magic or cheating.',
        ],
      },
    ],
  },

  // ───────────────────────── Consumers & Products · draft ─────────────────────────
  {
    key: 'brand-trust',
    title: 'What makes you trust a brand?',
    category: 'Consumers & Products',
    description:
      'Trust is hard to earn and easy to lose. Tell us what actually moves it for you, without any of it being tied back to you.',
    state: 'draft',
    responses: 0,
    activatedDaysAgo: 0,
    durationDays: 7,
    questions: [
      {
        title: 'Which of these make you more likely to trust a brand?',
        type: 'Checkbox', required: false,
        options: ['Honest pricing', 'Real customer reviews', 'A clear return policy', 'Transparent use of my data', 'Founders who speak openly', 'Recommendations from people I know', 'Consistent quality'],
      },
      {
        title: 'Where do you look first before buying something new?',
        type: 'Multiple choice', required: true,
        options: ['Search engines', 'Friends and family', 'Review sites', 'Social media', 'The brand’s own website'],
      },
      {
        title: 'How often do you read a privacy policy before signing up?',
        type: 'Multiple choice', required: true,
        options: ['Always', 'Sometimes', 'Rarely', 'Never'],
      },
      {
        title: 'Which of these damages your trust the most?',
        type: 'Multiple choice', required: true,
        options: ['Hidden fees', 'Fake reviews', 'My data being sold', 'Pushy marketing', 'Poor customer support'],
      },
      {
        title: 'Describe a time a brand earned or lost your trust.',
        type: 'Paragraph', required: false,
      },
    ],
  },
];
