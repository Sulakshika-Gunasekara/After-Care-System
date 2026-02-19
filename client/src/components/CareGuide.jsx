const CARE_TIPS = {
  Silver: {
    icon: '🪙',
    tips: [
      'Store in anti-tarnish bags or cloth pouches',
      'Clean regularly with a soft polishing cloth',
      'Remove before swimming or using cleaning products',
      'Apply lotions and perfumes before putting on silver jewellery',
    ],
  },
  Emerald: {
    icon: '💚',
    tips: [
      'Avoid ultrasonic and steam cleaners',
      'Clean gently with warm soapy water and a soft brush',
      'Keep away from harsh chemicals and extreme heat',
      'Oil treatments may be needed over time — consult a jeweller',
    ],
  },
  Ruby: {
    icon: '❤️',
    tips: [
      'Clean with warm soapy water and a soft cloth',
      'Ultrasonic cleaning is generally safe',
      'Avoid extreme temperature changes',
      'Store separately to prevent scratching other gems',
    ],
  },
  Sapphire: {
    icon: '💙',
    tips: [
      'Clean with warm water, mild soap, and a soft brush',
      'Safe for ultrasonic cleaners in most cases',
      'Avoid hard impacts despite high hardness rating',
      'Store in a soft pouch away from diamonds',
    ],
  },
  Pearl: {
    icon: '🤍',
    tips: [
      'Wipe gently with a damp soft cloth after each wear',
      'Never use ultrasonic cleaners or steam',
      'Keep away from perfume, hairspray, and cosmetics',
      'Store flat in a soft-lined box — not hanging',
    ],
  },
  Diamond: {
    icon: '💎',
    tips: [
      'Soak in warm water with mild dish soap',
      'Brush gently with a soft toothbrush',
      'Ultrasonic cleaners are safe for most settings',
      'Have prongs checked annually by a jeweller',
    ],
  },
  Amethyst: {
    icon: '💜',
    tips: [
      'Keep away from prolonged sunlight to prevent colour fading',
      'Clean with lukewarm soapy water',
      'Avoid steam cleaners and sudden temperature changes',
      'Store in a dark, cool place',
    ],
  },
  Garnet: {
    icon: '🔴',
    tips: [
      'Clean with warm soapy water and a soft brush',
      'Avoid ultrasonic cleaners for fracture-filled stones',
      'Remove before vigorous activities',
      'Store separately from harder gemstones',
    ],
  },
  Topaz: {
    icon: '🧡',
    tips: [
      'Clean with mild soapy water',
      'Avoid ultrasonic cleaners — topaz can crack along internal planes',
      'Protect from hard knocks and sudden temperature changes',
      'Avoid prolonged exposure to heat or sunlight',
    ],
  },
  Opal: {
    icon: '⚪',
    tips: [
      'Never use ultrasonic or steam cleaners',
      'Clean with a damp soft cloth only',
      'Opals contain water — avoid extreme heat and dryness',
      'Store in a moist cloth to prevent cracking',
    ],
  },
  Tanzanite: {
    icon: '🔵',
    tips: [
      'Handle with extra care — tanzanite is relatively soft',
      'Clean only with lukewarm soapy water',
      'Avoid ultrasonic and steam cleaners',
      'Remove before any physical activity',
    ],
  },
  Peridot: {
    icon: '💛',
    tips: [
      'Clean with lukewarm soapy water and a soft brush',
      'Never use ultrasonic cleaners',
      'Avoid prolonged exposure to acid and high heat',
      'Store separately to avoid scratches',
    ],
  },
};

const GENERAL_SILVER_CARE = [
  'Clean your silver jewellery every 2–4 weeks',
  'Use a microfibre or dedicated silver polishing cloth',
  'Store pieces individually to prevent scratching',
  'Keep in a cool, dry environment to slow tarnishing',
];

export default function CareGuide({ stoneType }) {
  const stone = CARE_TIPS[stoneType];

  return (
    <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '20px' }}>
      <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🧹 Care Guide
      </h4>

      {/* Silver Care — always shown */}
      <div style={{ marginBottom: '16px' }}>
        <h5 style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '8px', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🪙 Silver Care
        </h5>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {GENERAL_SILVER_CARE.map(tip => (
            <li key={tip} style={{ padding: '4px 0', fontSize: '0.85rem', color: 'var(--gray-700)', display: 'flex', alignItems: 'start', gap: '8px' }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Stone-specific care */}
      {stone && (
        <div>
          <h5 style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '8px', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {stone.icon} {stoneType} Care
          </h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {stone.tips.map(tip => (
              <li key={tip} style={{ padding: '4px 0', fontSize: '0.85rem', color: 'var(--gray-700)', display: 'flex', alignItems: 'start', gap: '8px' }}>
                <span style={{ color: 'var(--gold)', flexShrink: 0 }}>✓</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
