import React, { FormEvent, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MissionStage } from '../types';
import '../styles/mission-mentor.css';

interface MissionMentorProps {
  stage: MissionStage;
  topic: string | null;
  landingComplete: boolean;
  onHighlight: (target: string | null) => void;
}

interface MentorLesson {
  message: string;
  hint: string;
  focus: string;
}

type MentorBehavior = 'enter' | 'idle' | 'travel' | 'point' | 'explain' | 'think' | 'celebrate' | 'caution' | 'exit';
type MentorSide = 'left' | 'right' | 'above' | 'below';

interface MentorPosition {
  left: number;
  top: number;
  side: MentorSide;
}

interface MentorPanelPosition {
  left: number;
  top: number;
  maxHeight: number;
}

const findMentorPosition = (focus: string, controlsOpen: boolean): MentorPosition => {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const mobile = viewportWidth <= 480;
  const size = mobile ? 64 : 88;
  const headerBottom = document.querySelector<HTMLElement>('.app-header')?.getBoundingClientRect().bottom ?? 0;
  const safeTop = Math.max(12, headerBottom + 12);
  const target = Array.from(document.querySelectorAll<HTMLElement>(`[data-mentor-focus~="${focus}"]`))
    .filter((element) => !element.closest('.mission-mentor') && element.getClientRects().length > 0)
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 24 && rect.height > 24
      && rect.right > 0 && rect.left < viewportWidth
      && rect.bottom > safeTop && rect.top < viewportHeight)
    .sort((first, second) => first.rect.width * first.rect.height - second.rect.width * second.rect.height)[0];

  const controls = Array.from(document.querySelectorAll<HTMLElement>(
    'button, a, input, select, textarea, [role="button"], .landing-game-hud, .outpost-resource-grid, .outpost-day-indicator',
  ))
    .filter((element) => !element.closest('.mission-mentor'))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0
      && rect.right > 0 && rect.left < viewportWidth
      && rect.bottom > safeTop && rect.top < viewportHeight);
  if (controlsOpen) {
    const panel = document.querySelector<HTMLElement>('.mission-mentor-panel');
    if (panel) controls.push(panel.getBoundingClientRect());
  }

  const intersects = (first: DOMRect | { left: number; top: number; right: number; bottom: number }, second: DOMRect | { left: number; top: number; right: number; bottom: number }) => (
    first.left < second.right && first.right > second.left
    && first.top < second.bottom && first.bottom > second.top
  );
  const overlapArea = (first: DOMRect | { left: number; top: number; right: number; bottom: number }, second: DOMRect | { left: number; top: number; right: number; bottom: number }) => {
    if (!intersects(first, second)) return 0;
    return Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left))
      * Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));
  };
  const candidates: MentorPosition[] = [];

  if (target) {
    const rect = target.rect;
    const centerTop = rect.top + (rect.height - size) / 2;
    const centerLeft = rect.left + (rect.width - size) / 2;
    candidates.push(
      { left: rect.left - size - 12, top: centerTop, side: 'left' },
      { left: rect.right + 12, top: centerTop, side: 'right' },
      { left: centerLeft, top: rect.top - size - 12, side: 'above' },
      { left: centerLeft, top: rect.bottom + 12, side: 'below' },
    );
  }

  candidates.push(
    { left: 12, top: viewportHeight - size - 16, side: 'right' },
    { left: viewportWidth - size - 12, top: viewportHeight - size - 16, side: 'left' },
    { left: 12, top: safeTop, side: 'right' },
    { left: viewportWidth - size - 12, top: safeTop, side: 'left' },
  );

  const validCandidates = candidates.filter(({ left, top }) => (
    left >= 8 && left + size <= viewportWidth - 8
    && top >= safeTop && top + size <= viewportHeight - 8
  ));
  const anchorRect = target?.rect;
  const rankedCandidates = validCandidates.map((candidate) => {
    const bounds = {
      left: candidate.left,
      top: candidate.top,
      right: candidate.left + size,
      bottom: candidate.top + size,
    };
    const controlOverlap = controls.reduce((total, rect) => total + overlapArea(bounds, rect), 0);
    const targetOverlap = anchorRect ? overlapArea(bounds, anchorRect) : 0;
    return { candidate, score: controlOverlap / (size * size) + targetOverlap / (size * size) * 100 };
  }).sort((first, second) => first.score - second.score);

  return rankedCandidates[0]?.candidate ?? {
    left: Math.max(8, viewportWidth - size - 12),
    top: Math.max(safeTop, viewportHeight - size - 12),
    side: 'left',
  };
};

const findMentorPanelPosition = (panelWidth: number, panelHeight: number): MentorPanelPosition => {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const mobile = viewportWidth <= 480;
  const margin = mobile ? 8 : 16;
  const headerBottom = document.querySelector<HTMLElement>('.app-header')?.getBoundingClientRect().bottom ?? 0;
  const safeTop = Math.max(margin, headerBottom + margin);
  const width = Math.min(panelWidth, viewportWidth - margin * 2);
  const maxHeight = Math.max(120, Math.min(
    viewportHeight * (mobile ? 0.72 : 0.76),
    mobile ? 640 : 690,
    viewportHeight - safeTop - margin,
  ));
  const height = Math.min(panelHeight, maxHeight);
  const controls = Array.from(document.querySelectorAll<HTMLElement>(
    'button:not(:disabled), a, input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [role="button"]',
  ))
    .filter((element) => !element.closest('.mission-mentor'))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0
      && rect.right > 0 && rect.left < viewportWidth
      && rect.bottom > safeTop && rect.top < viewportHeight);
  const toggle = document.querySelector<HTMLElement>('.mission-mentor-toggle')?.getBoundingClientRect();
  if (toggle) controls.push(toggle);

  const candidates = [
    { left: viewportWidth - width - margin, top: viewportHeight - height - margin, maxHeight },
    { left: viewportWidth - width - margin, top: safeTop, maxHeight },
    { left: margin, top: viewportHeight - height - margin, maxHeight },
    { left: margin, top: safeTop, maxHeight },
  ];
  const overlapArea = (first: DOMRect | MentorPanelPosition & { width: number; height: number }, second: DOMRect) => (
    Math.max(0, Math.min(first.left + first.width, second.right) - Math.max(first.left, second.left))
    * Math.max(0, Math.min(first.top + first.height, second.bottom) - Math.max(first.top, second.top))
  );
  return candidates
    .map((candidate) => ({
      candidate,
      overlap: controls.reduce((total, rect) => total + overlapArea({ ...candidate, width, height }, rect), 0),
    }))
    .sort((first, second) => first.overlap - second.overlap)[0]?.candidate
    ?? { left: margin, top: safeTop, maxHeight };
};

const STAGE_LESSONS: Record<MissionStage, MentorLesson> = {
  welcome: {
    message: "Hey, Junior Astronaut! I'm your Mission Mentor. I'll help you explore, one step at a time.",
    hint: 'Start the mission when you are ready. We will meet the crew and get the spacecraft ready together.',
    focus: 'crew',
  },
  prelaunch: {
    message: 'Before launch, check the weather, radio, cameras and spacecraft systems. Each one must be ready for a safe launch.',
    hint: 'Tap each rocket system card to mark it READY. The weather and radio must show GO, and the launch cameras must be online.',
    focus: 'checks',
  },
  countdown: {
    message: 'Listen to the countdown! The Super Rocket engines push the rocket up and away from Earth.',
    hint: 'The rocket can launch only when every required system is GO.',
    focus: 'rocket',
  },
  atmosphere: {
    message: "Earth's air gets thinner as Super Rocket climbs. Earth's gravity still pulls on the rocket, even high above us.",
    hint: 'Tap each colored layer to explore the sky. There are no hard walls between the layers.',
    focus: 'atmosphere',
  },
  saturnv: {
    message: 'Super Rocket used three rocket stages. Each stage burned its fuel, then separated so the lighter rocket could keep climbing.',
    hint: 'Select a stage to learn what it does. Try releasing a stage after it has finished its job.',
    focus: 'rocket',
  },
  earthorbit: {
    message: "We're circling Earth! Gravity pulls the spacecraft inward, while its sideways speed helps it keep moving around Earth.",
    hint: 'Change the orbit speed slider and watch the spacecraft move around Earth.',
    focus: 'orbit',
  },
  translunar: {
    message: 'TLI means Translunar Injection. It is a powerful engine push that sends Luna out of Earth orbit toward the Moon.',
    hint: 'Start the TLI burn and watch the spacecraft travel along its path to the Moon.',
    focus: 'moon',
  },
  docking: {
    message: 'Columbia turns around and connects to Eagle. Docking lets the astronauts move safely between the spacecraft.',
    hint: 'Follow each step. The docking ports need to line up before the spacecraft can connect.',
    focus: 'docking',
  },
  lunarorbit: {
    message: 'Luna 11 slowed down so the Moon’s gravity could hold it in orbit. From there, the crew could prepare Eagle for landing.',
    hint: 'Start the engine burn to enter lunar orbit. LOI means Lunar Orbit Insertion.',
    focus: 'moon',
  },
  landing: {
    message: 'Eagle is heading down to the Moon. Look for a clear landing spot, steer gently and slow down before touchdown.',
    hint: 'Avoid craters and rocks. Steer toward the safe area, use STABILIZE to reduce drifting, and tap DESCEND to control your speed.',
    focus: 'landing',
  },
  outpost: {
    message: 'Our space home needs air, water, food, power and protection. Your choices help the crew stay safe.',
    hint: 'Check the resources before choosing an action. Some upgrades use supplies that may be needed later.',
    focus: 'life-support',
  },
  debrief: {
    message: 'Welcome back, Junior Mission Controller! The report shows the mission steps and what the crew accomplished.',
    hint: 'Explore the report cards to review the journey. You can replay the mission or revisit a completed activity.',
    focus: 'report',
  },
};

const TOPIC_LESSONS: Record<string, MentorLesson> = {
  'saturnv:s-ic': {
    message: 'The S-IC was Super Rocket’s first stage. Its five engines lifted the heavy rocket away from Earth.',
    hint: 'After its fuel was used, the S-IC separated so the next stage could keep pushing.',
    focus: 'rocket',
  },
  'saturnv:s-ii': {
    message: 'The S-II was Super Rocket’s second stage. Its engines pushed Luna higher, through the upper atmosphere.',
    hint: 'When the S-II ran out of fuel, it separated and the next stage took over.',
    focus: 'rocket',
  },
  'saturnv:s-ivb': {
    message: 'The S-IVB was Super Rocket’s third stage. It helped place Luna in Earth orbit and later pushed it toward the Moon.',
    hint: 'The S-IVB had two important burns: one for Earth orbit and another for the trip to the Moon.',
    focus: 'rocket',
  },
  'landing-demonstration': {
    message: 'Watch Eagle’s landing demonstration. It shows why the crew must steer around craters and slow down gently.',
    hint: 'Look for the clear landing area and notice how Eagle changes speed and direction.',
    focus: 'landing',
  },
  'landing-game': {
    message: 'Now it is your turn to guide Eagle. Find the clear landing area, steady the spacecraft and control its downward speed.',
    hint: 'Steer gently, use STABILIZE to reduce drifting, and tap DESCEND to control the landing speed.',
    focus: 'landing',
  },
  'landing-touchdown': {
    message: 'Eagle has touched down! A gentle landing in a clear spot helps keep the crew safe.',
    hint: 'Watch the touchdown moment, then continue when you are ready.',
    focus: 'landing',
  },
  'landing-landed': {
    message: 'Eagle is safely on the Moon. The crew can now begin their next mission.',
    hint: 'Continue to review the landing and help plan for the astronauts’ next steps.',
    focus: 'landing',
  },
  'docking:configuration': {
    message: 'Meet the spacecraft: Columbia carried the crew, and Eagle was the Lunar Module that would land on the Moon.',
    hint: 'Watch how the spacecraft are arranged before the docking steps begin.',
    focus: 'docking',
  },
  'docking:separation': {
    message: 'Columbia leaves the empty S-IVB rocket stage behind. The spacecraft can now turn around to meet Eagle.',
    hint: 'Watch Columbia separate first. The crew will use the docking end to connect with Eagle.',
    focus: 'docking',
  },
  'docking:transposition': {
    message: 'Columbia turns around to face Eagle. This 180-degree turn is called transposition.',
    hint: 'The docking end of Columbia must point toward Eagle before they can connect.',
    focus: 'docking',
  },
  'docking:approach': {
    message: 'Columbia is moving slowly toward Eagle. Their docking ports need to line up carefully.',
    hint: 'A slow, careful approach helps the spacecraft meet safely.',
    focus: 'docking',
  },
  'docking:docking': {
    message: 'The docking probes touch, and latches hold Columbia and Eagle together.',
    hint: 'When the connection is secure, the crew can move between the two spacecraft.',
    focus: 'docking',
  },
  'docking:extraction': {
    message: 'Columbia pulls Eagle away from the S-IVB. The two spacecraft are joined and ready to travel toward the Moon.',
    hint: 'The astronauts will move between Columbia and Eagle during the journey.',
    focus: 'docking',
  },
  'docking:complete': {
    message: 'Docking is complete! Columbia and Eagle are connected and ready for the trip to the Moon.',
    hint: 'You can continue to lunar orbit when you are ready.',
    focus: 'docking',
  },
  'outpost:life-support': {
    message: 'Life-support systems help keep the habitat’s air, water and temperature safe for the crew.',
    hint: 'Check oxygen, water and temperature. Fixing one system may use power or building supplies.',
    focus: 'life-support',
  },
  'outpost:introduction': {
    message: 'You helped Luna 11 reach the Moon. Now you can help astronauts build a safe home in space.',
    hint: 'Continue to choose where to build. The Moon and Mars each have different challenges.',
    focus: 'life-support',
  },
  'outpost:destination': {
    message: 'Choose a lunar or Martian outpost. Each place has different weather, sunlight and supply challenges.',
    hint: 'Think about air, radiation, temperature and power before choosing a home for the crew.',
    focus: 'life-support',
  },
  'outpost:radiation': {
    message: 'Space has harmful radiation. Thick layers of Moon soil, called regolith, can help protect the crew.',
    hint: 'More shielding gives better protection, but it uses building supplies and power.',
    focus: 'radiation',
  },
  'outpost:power': {
    message: 'Solar panels turn sunlight into electricity, and batteries store power for later.',
    hint: 'Dusty panels make less power. Cleaning them helps, while power-saving mode uses less electricity today.',
    focus: 'power',
  },
  'outpost:food': {
    message: 'Plants need water, nutrients, light and time to grow. The greenhouse helps the crew grow fresh food.',
    hint: 'A bigger greenhouse can grow more food, but it also needs more water and power.',
    focus: 'food',
  },
  'outpost:daily-report': {
    message: 'This report shows how the habitat did today. Look at the supplies and crew safety before continuing.',
    hint: 'If a supply is getting low, plan how to protect it on the next day.',
    focus: 'report',
  },
  'outpost:results': {
    message: 'The outpost report shows how the crew did and which choices helped their space home.',
    hint: 'Review the report to see what went well and what you could try differently next time.',
    focus: 'report',
  },
  'outpost-event:solar-storm': {
    message: 'A solar storm can send extra harmful radiation toward the crew. A safe shelter helps protect them.',
    hint: 'Think about crew safety first. Some choices also use supplies or pause outdoor work.',
    focus: 'radiation',
  },
  'outpost-event:panel-dust': {
    message: 'Dust on solar panels blocks some sunlight, so they make less electricity.',
    hint: 'Cleaning panels can help power, but check whether you have enough materials and power to do it.',
    focus: 'power',
  },
  'outpost-event:recycler-fault': {
    message: 'The water recycler is not working. The crew can use stored water while you decide how to respond.',
    hint: 'Repairing the recycler uses materials and power. Saving water is another option.',
    focus: 'life-support',
  },
  'outpost-event:oxygen-leak': {
    message: 'A small leak is letting air out of the habitat. The crew is safe for now, but the leak needs attention.',
    hint: 'Sealing the leak protects the crew’s oxygen. Check the cost of each choice first.',
    focus: 'life-support',
  },
  'outpost-event:crop-stress': {
    message: 'The greenhouse plants need the right mix of water and nutrients to keep growing.',
    hint: 'Helping the plants can use supplies. Check food, water and nutrients before choosing.',
    focus: 'food',
  },
  'outpost-event:battery-low': {
    message: 'The habitat is running low on stored power. Some equipment may need to use less electricity.',
    hint: 'Save power for important systems, or use an available reserve if you have one.',
    focus: 'power',
  },
  'outpost-event:temperature-shift': {
    message: 'The habitat is getting too cold or too warm. The crew needs a safe temperature.',
    hint: 'Heaters use power. Other choices may use building supplies instead.',
    focus: 'life-support',
  },
};

const DEFINITIONS: { terms: string[]; answer: string; focus: string }[] = [
  { terms: ['luna 11', 'astronaut', 'astronauts', 'crew'], answer: 'Luna 11’s crew were Neil Armstrong, Buzz Aldrin and Michael Collins.', focus: 'crew' },
  { terms: ['super rocket', 'rocket'], answer: 'Super Rocket was the powerful rocket that carried Luna 11 away from Earth.', focus: 'rocket' },
  { terms: ['eagle', 'lunar module'], answer: 'Eagle was the Lunar Module. Armstrong and Aldrin used it to land on the Moon.', focus: 'landing' },
  { terms: ['columbia', 'command module'], answer: 'Columbia was the Command Module. Michael Collins stayed aboard while Armstrong and Aldrin explored the Moon.', focus: 'docking' },
  { terms: ['tli', 'translunar injection'], answer: 'TLI means Translunar Injection: the engine push that sends a spacecraft from Earth orbit toward the Moon.', focus: 'moon' },
  { terms: ['loi', 'lunar orbit insertion'], answer: 'LOI means Lunar Orbit Insertion. The spacecraft slows down so the Moon’s gravity can hold it in orbit.', focus: 'moon' },
  { terms: ['pdi', 'powered descent initiation'], answer: 'PDI means Powered Descent Initiation. It is when Eagle’s landing engines begin the powered trip down toward the Moon.', focus: 'landing' },
  { terms: ['orbit'], answer: 'An orbit is a path around a planet or moon. A spacecraft moves sideways fast enough to keep going around it.', focus: 'orbit' },
  { terms: ['dock', 'docking'], answer: 'Docking is when two spacecraft connect so astronauts can move between them.', focus: 'docking' },
  { terms: ['radiation', 'solar flare', 'solar storm'], answer: 'Space radiation is energy that can harm people. A solar storm can send extra radiation from the Sun, so shelters and shielding matter.', focus: 'radiation' },
  { terms: ['regolith', 'moon soil'], answer: 'Regolith is the loose soil and rock covering the Moon. It can be piled around a habitat to help shield astronauts.', focus: 'radiation' },
  { terms: ['greenhouse', 'food', 'plants'], answer: 'A greenhouse gives plants a place to grow. Plants need water, nutrients, light and time.', focus: 'food' },
  { terms: ['communication delay', 'messages', 'signal'], answer: 'Radio messages take time to travel between Earth and a distant spacecraft. The crew may need to make some decisions before a reply arrives.', focus: 'communication' },
  { terms: ['power', 'solar panel', 'battery'], answer: 'Solar panels make electricity from sunlight. Batteries store some of that power for times when sunlight is low.', focus: 'power' },
];

const STAGE_NAMES: Record<MissionStage, string> = {
  welcome: 'Mission welcome',
  prelaunch: 'Pre-launch checks',
  countdown: 'Countdown and launch',
  atmosphere: 'Atmospheric ascent',
  saturnv: 'Super Rocket stages',
  earthorbit: 'Earth orbit',
  translunar: 'Translunar injection',
  docking: 'Columbia and Eagle docking',
  lunarorbit: 'Lunar orbit',
  landing: 'Lunar landing',
  outpost: 'Outpost mission',
  debrief: 'Mission report',
};

const getLesson = (stage: MissionStage, topic: string | null, landingComplete: boolean): MentorLesson => {
  const topicBelongsToStage = Boolean(topic && (
    (stage === 'saturnv' && topic.startsWith('saturnv:'))
    || (stage === 'docking' && topic.startsWith('docking:'))
    || (stage === 'landing' && topic.startsWith('landing-'))
    || (stage === 'outpost' && (topic.startsWith('outpost:') || topic.startsWith('outpost-event:')))
  ));
  if (topicBelongsToStage && topic && topic in TOPIC_LESSONS) return TOPIC_LESSONS[topic];
  if (stage === 'debrief' && !landingComplete) {
    return {
      message: 'Welcome back, Junior Mission Controller! Explore the report to see which mission activities were completed.',
      hint: 'Check the report cards to review the journey and replay an activity.',
      focus: 'report',
    };
  }
  return STAGE_LESSONS[stage];
};

const getAnswer = (question: string, lesson: MentorLesson): { text: string; focus: string } => {
  const normalized = question.toLowerCase();
  const match = DEFINITIONS.find(({ terms }) => terms.some((term) => normalized.includes(term)));
  if (match) return { text: match.answer, focus: match.focus };
  if (/\b(hint|stuck|help|what should i do)\b/.test(normalized)) return { text: lesson.hint, focus: lesson.focus };
  if (/\b(why|what happens|consequence|trade.?off)\b/.test(normalized)) {
    return { text: `Here’s what matters right now: ${lesson.hint}`, focus: lesson.focus };
  }
  return {
    text: `Good question! ${lesson.message} Try asking me about a mission term, or tap “Get a hint” for this activity.`,
    focus: lesson.focus,
  };
};

const MentorAstronaut: React.FC = () => {
  const gradientId = useId().replace(/:/g, '');
  return (
    <svg className="mission-mentor-avatar" viewBox="0 0 64 64" role="img" aria-label="Friendly astronaut Mission Mentor">
      <defs>
        <linearGradient id={`${gradientId}-helmet`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id={`${gradientId}-visor`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path d="M12 57c1-10 8-16 20-16s19 6 20 16" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
      <path d="M18 45h28l4 9H14z" fill="#f59e0b" />
      <g className="mission-mentor-arm" fill="none" stroke="#e2e8f0" strokeLinecap="round" strokeLinejoin="round">
        <path d="M44 47 53 42 60 39" strokeWidth="6" />
        <path d="m55 41 5-2" stroke="#f59e0b" strokeWidth="3" />
      </g>
      <circle cx="32" cy="27" r="22" fill={`url(#${gradientId}-helmet)`} stroke="#fff" strokeWidth="2" />
      <path d="M15 27c0-9 7-16 17-16s17 7 17 16c0 7-5 12-17 12S15 34 15 27z" fill={`url(#${gradientId}-visor)`} stroke="#1e3a8a" strokeWidth="2" />
      <path d="M20 21c3-4 7-6 12-6" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2" opacity=".8" />
      <circle cx="24" cy="28" r="1.5" fill="#0f172a" />
      <circle cx="40" cy="28" r="1.5" fill="#0f172a" />
      <path d="M27 33c3 2 7 2 10 0" fill="none" stroke="#0f172a" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="9" cy="15" r="1.4" fill="#fde68a" />
      <circle cx="56" cy="10" r="1.6" fill="#67e8f9" />
      <path d="M56 35v5m-2.5-2.5h5" stroke="#fde68a" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
};

export const MissionMentor: React.FC<MissionMentorProps> = ({ stage, topic, landingComplete, onHighlight }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCaption, setActiveCaption] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [replyFocus, setReplyFocus] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [behavior, setBehavior] = useState<MentorBehavior>('enter');
  const [position, setPosition] = useState<MentorPosition>({ left: 16, top: 150, side: 'left' });
  const [panelPosition, setPanelPosition] = useState<MentorPanelPosition>({ left: 8, top: 8, maxHeight: 640 });
  const [guidedFocus, setGuidedFocus] = useState('crew');
  const behaviorRef = useRef<MentorBehavior>('enter');
  const positionRef = useRef(position);
  const panelRef = useRef<HTMLElement | null>(null);
  const firstPositionPending = useRef(true);
  const firstAnnouncementPending = useRef(true);
  const previousLandingComplete = useRef(landingComplete);
  const celebrationUntil = useRef(0);
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const behaviorTimer = useRef<number | null>(null);
  const highlightTimer = useRef<number | null>(null);
  const captionTimer = useRef<number | null>(null);
  const lesson = useMemo(() => getLesson(stage, topic, landingComplete), [stage, topic, landingComplete]);
  const displayedMessage = reply ?? lesson.message;

  useEffect(() => {
    setGuidedFocus(lesson.focus);
  }, [lesson.focus]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;
    const updatePanelPosition = () => {
      const bounds = panel.getBoundingClientRect();
      const nextPosition = findMentorPanelPosition(bounds.width, bounds.height);
      setPanelPosition((current) => (
        current.left === nextPosition.left
        && current.top === nextPosition.top
        && current.maxHeight === nextPosition.maxHeight ? current : nextPosition
      ));
    };
    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePanelPosition) : null;
    observer?.observe(panel);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
      observer?.disconnect();
    };
  }, [displayedMessage, isOpen]);

  const setBehaviorNow = useCallback((nextBehavior: MentorBehavior) => {
    if (behaviorTimer.current !== null) window.clearTimeout(behaviorTimer.current);
    behaviorTimer.current = null;
    behaviorRef.current = nextBehavior;
    setBehavior(nextBehavior);
  }, []);

  const animateBehavior = useCallback((nextBehavior: MentorBehavior, duration: number) => {
    setBehaviorNow(nextBehavior);
    if (duration <= 0) return;
    behaviorTimer.current = window.setTimeout(() => {
      if (behaviorRef.current === nextBehavior) {
        behaviorRef.current = 'idle';
        setBehavior('idle');
      }
      behaviorTimer.current = null;
    }, duration);
  }, [setBehaviorNow]);

  const highlightFocus = useCallback((target: string) => {
    if (highlightTimer.current !== null) window.clearTimeout(highlightTimer.current);
    onHighlight(target);
    highlightTimer.current = window.setTimeout(() => {
      onHighlight(null);
      highlightTimer.current = null;
    }, 2800);
  }, [onHighlight]);

  useEffect(() => {
    setSpeechAvailable(
      typeof window !== 'undefined'
      && 'speechSynthesis' in window
      && typeof SpeechSynthesisUtterance !== 'undefined',
    );
    animateBehavior('enter', 900);
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        activeUtterance.current = null;
        window.speechSynthesis.cancel();
      }
      if (behaviorTimer.current !== null) window.clearTimeout(behaviorTimer.current);
      if (highlightTimer.current !== null) window.clearTimeout(highlightTimer.current);
      if (captionTimer.current !== null) window.clearTimeout(captionTimer.current);
      onHighlight(null);
    };
  }, [animateBehavior, onHighlight]);

  useEffect(() => {
    let frame = 0;
    let startTimer: number | null = null;
    const updatePosition = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const nextPosition = findMentorPosition(guidedFocus, isOpen);
        const previous = positionRef.current;
        if (Math.abs(previous.left - nextPosition.left) < 3 && Math.abs(previous.top - nextPosition.top) < 3) return;
        positionRef.current = nextPosition;
        setPosition(nextPosition);
        const nextBehavior = topic?.startsWith('outpost-event:')
          ? 'caution'
          : Date.now() < celebrationUntil.current
            ? 'celebrate'
            : isSpeaking
              ? 'explain'
              : behaviorRef.current === 'point' ? 'point' : 'travel';
        animateBehavior(nextBehavior, nextBehavior === 'celebrate' ? 1800 : 850);
      });
    };
    if (firstPositionPending.current) {
      firstPositionPending.current = false;
      startTimer = window.setTimeout(updatePosition, 900);
    } else {
      updatePosition();
    }
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const scene = document.querySelector<HTMLElement>('.main-container');
    const observer = typeof ResizeObserver !== 'undefined' && scene
      ? new ResizeObserver(updatePosition)
      : null;
    if (observer && scene) observer.observe(scene);
    return () => {
      if (startTimer !== null) window.clearTimeout(startTimer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      observer?.disconnect();
    };
  }, [animateBehavior, guidedFocus, isOpen, isSpeaking, stage, topic]);

  useEffect(() => {
    if (topic?.startsWith('outpost-event:')) animateBehavior('caution', 1600);
  }, [animateBehavior, topic]);

  useEffect(() => {
    if (landingComplete && !previousLandingComplete.current) {
      celebrationUntil.current = Date.now() + 1800;
      animateBehavior('celebrate', 1800);
    }
    previousLandingComplete.current = landingComplete;
  }, [animateBehavior, landingComplete]);

  const showCaptionFallback = useCallback((text: string) => {
    if (captionTimer.current !== null) window.clearTimeout(captionTimer.current);
    setActiveCaption(text);
    setIsSpeaking(false);
    captionTimer.current = window.setTimeout(() => {
      setActiveCaption('');
      captionTimer.current = null;
    }, Math.min(8000, Math.max(3000, text.length * 65)));
  }, []);

  const speak = useCallback((text: string, focus = lesson.focus) => {
    if (captionTimer.current !== null) {
      window.clearTimeout(captionTimer.current);
      captionTimer.current = null;
    }
    setGuidedFocus(focus);
    animateBehavior('point', 1300);
    highlightFocus(focus);
    if (!speechAvailable) {
      setVoiceStatus('Voice playback is not available in this browser. You can still read the explanation.');
      showCaptionFallback(text);
      return;
    }
    if (muted) {
      setVoiceStatus('Voice is muted. Unmute it to hear the explanation.');
      showCaptionFallback(text);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance.current = utterance;
    utterance.lang = 'en-US';
    utterance.rate = 0.94;
    utterance.pitch = 1.08;
    utterance.volume = volume;
    const englishVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
    utterance.onstart = () => {
      if (activeUtterance.current !== utterance) return;
      if (captionTimer.current !== null) {
        window.clearTimeout(captionTimer.current);
        captionTimer.current = null;
      }
      setIsSpeaking(true);
      setActiveCaption(text);
      setVoiceStatus('');
      setBehaviorNow('explain');
    };
    utterance.onend = () => {
      if (activeUtterance.current !== utterance) return;
      activeUtterance.current = null;
      if (captionTimer.current !== null) {
        window.clearTimeout(captionTimer.current);
        captionTimer.current = null;
      }
      setIsSpeaking(false);
      setActiveCaption('');
      setBehaviorNow('idle');
    };
    utterance.onerror = (event) => {
      if (activeUtterance.current !== utterance) return;
      activeUtterance.current = null;
      setBehaviorNow('idle');
      if (event.error === 'canceled' || event.error === 'interrupted') {
        setIsSpeaking(false);
        setActiveCaption('');
      } else {
        setVoiceStatus('Voice could not play just now. The written explanation is still here.');
        showCaptionFallback(text);
      }
    };
    setIsSpeaking(true);
    setActiveCaption(text);
    setVoiceStatus('');
    window.speechSynthesis.speak(utterance);
  }, [animateBehavior, highlightFocus, lesson.focus, muted, setBehaviorNow, showCaptionFallback, speechAvailable, volume]);

  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  useEffect(() => {
    setReply(null);
    setReplyFocus(null);
    setVoiceStatus('');
    if (captionTimer.current !== null) {
      window.clearTimeout(captionTimer.current);
      captionTimer.current = null;
    }
    setActiveCaption('');
    setIsSpeaking(false);
    if (behaviorRef.current === 'explain') setBehaviorNow('travel');
    activeUtterance.current = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const delay = firstAnnouncementPending.current ? 950 : 350;
    const timer = window.setTimeout(() => {
      firstAnnouncementPending.current = false;
      speakRef.current(lesson.message, lesson.focus);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [lesson.focus, lesson.message, setBehaviorNow, speechAvailable]);

  const showHint = () => {
    setReply(lesson.hint);
    setReplyFocus(lesson.focus);
    speak(lesson.hint);
  };

  const closePanel = () => {
    setIsOpen(false);
    activeUtterance.current = null;
    if (speechAvailable) window.speechSynthesis.cancel();
    if (captionTimer.current !== null) {
      window.clearTimeout(captionTimer.current);
      captionTimer.current = null;
    }
    setIsSpeaking(false);
    setActiveCaption('');
    animateBehavior('exit', 600);
  };

  const showHighlight = () => {
    setGuidedFocus(replyFocus ?? lesson.focus);
    animateBehavior('point', 1300);
    highlightFocus(replyFocus ?? lesson.focus);
  };

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;
    const answer = getAnswer(trimmedQuestion, lesson);
    setReply(answer.text);
    setReplyFocus(answer.focus);
    setQuestion('');
    speak(answer.text, answer.focus);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (nextMuted && 'speechSynthesis' in window) {
      activeUtterance.current = null;
      window.speechSynthesis.cancel();
      if (captionTimer.current !== null) {
        window.clearTimeout(captionTimer.current);
        captionTimer.current = null;
      }
      setIsSpeaking(false);
      setActiveCaption('');
      setVoiceStatus('Voice is muted. Captions and written explanations are still available.');
      setBehaviorNow('idle');
    } else {
      setVoiceStatus('Voice is unmuted. Tap “Hear explanation” whenever you want to listen.');
    }
  };

  return (
    <aside
      className={`mission-mentor ${isOpen ? 'mentor-open' : ''}`}
      aria-label="Mission Mentor"
      data-behavior={behavior}
      data-placement={position.side}
      style={{ left: `${position.left}px`, top: `${position.top}px` }}
    >
      {captionsEnabled && activeCaption && (
        <p className="mission-mentor-caption" aria-live="polite"><strong>CAPTIONS</strong>{activeCaption}</p>
      )}
      {isOpen && (
        <section
          ref={panelRef}
          className="mission-mentor-panel"
          aria-label="Mission Mentor controls"
          style={{
            left: `${panelPosition.left}px`,
            top: `${panelPosition.top}px`,
            maxHeight: `${panelPosition.maxHeight}px`,
          }}
        >
          <div className="mission-mentor-heading">
            <div className="mission-mentor-heading-portrait"><MentorAstronaut /></div>
            <div>
              <p className="mission-mentor-eyebrow">YOUR SPACE GUIDE</p>
              <h2>Mission Mentor</h2>
              <span>{STAGE_NAMES[stage]}</span>
            </div>
            <button type="button" className="mission-mentor-close" onClick={closePanel} aria-label="Close Mission Mentor">×</button>
          </div>

          <p className="mission-mentor-message" aria-live="polite">{displayedMessage}</p>

          <div className="mission-mentor-actions">
            <button type="button" onClick={() => speak(displayedMessage)} disabled={!speechAvailable || muted}>
              {isSpeaking ? 'Replay explanation' : 'Hear explanation'}
            </button>
            <button type="button" onClick={showHint}>Get a hint</button>
            <button type="button" onClick={showHighlight}>Show me</button>
          </div>

          <div className="mission-mentor-settings">
            <button type="button" onClick={toggleMute} aria-pressed={muted} disabled={!speechAvailable}>
              {muted ? 'Unmute voice' : 'Mute voice'}
            </button>
            <button type="button" onClick={() => setCaptionsEnabled((enabled) => !enabled)} aria-pressed={captionsEnabled}>
              Captions {captionsEnabled ? 'on' : 'off'}
            </button>
          </div>
          <label className="mission-mentor-volume">
            <span>Voice volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(event) => {
                const nextVolume = Number(event.currentTarget.value);
                setVolume(nextVolume);
                if (activeUtterance.current) activeUtterance.current.volume = nextVolume;
              }}
              disabled={!speechAvailable}
              aria-label="Mission Mentor voice volume"
            />
          </label>

          <form className="mission-mentor-question" onSubmit={submitQuestion}>
            <label htmlFor="mission-mentor-question">Ask about this mission</label>
            <div>
              <input
                id="mission-mentor-question"
                value={question}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setQuestion(value);
                  setBehaviorNow(value ? 'think' : 'idle');
                }}
                placeholder="Try “What is TLI?”"
                maxLength={120}
              />
              <button type="submit">Ask</button>
            </div>
            <small>I can explain mission terms and give a hint for this activity.</small>
          </form>

          {!speechAvailable && <p className="mission-mentor-status" role="status">Voice playback is not available here. Written explanations and hints still work.</p>}
          {speechAvailable && voiceStatus && <p className="mission-mentor-status" role="status">{voiceStatus}</p>}
          <p className="mission-mentor-status" aria-live="polite">{isSpeaking ? 'Mission Mentor is speaking.' : ''}</p>
        </section>
      )}

      <button
        type="button"
        className="mission-mentor-toggle"
        onClick={() => speak(displayedMessage)}
        aria-label="Replay the current Mission Mentor explanation"
      >
        <span className="mission-mentor-toggle-portrait"><MentorAstronaut /></span>
        <span className="mission-mentor-point-arrow" aria-hidden="true">➤</span>
        <span className="mission-mentor-toggle-spark" aria-hidden="true">✦</span>
      </button>
      {!isOpen && (
        <button
          type="button"
          className="mission-mentor-panel-toggle"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-label="Open Mission Mentor controls and ask a question"
        >
          ?
        </button>
      )}
    </aside>
  );
};
