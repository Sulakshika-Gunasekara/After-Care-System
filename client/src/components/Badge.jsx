const VARIANTS = {
  red: 'badge-red',
  green: 'badge-green',
  blue: 'badge-blue',
  amber: 'badge-amber',
  purple: 'badge-purple',
  gold: 'badge-gold',
};

export default function Badge({ variant = 'blue', children, style }) {
  return (
    <span className={`badge ${VARIANTS[variant] || VARIANTS.blue}`} style={style}>
      {children}
    </span>
  );
}

export function TierBadge({ tier }) {
  if (!tier || tier === 'None') return <span className="tier-badge tier-none">⚪ Regular</span>;
  if (tier.includes('Sapphire')) return <span className="tier-badge tier-sapphire">🥇 {tier}</span>;
  if (tier.includes('Ruby')) return <span className="tier-badge tier-ruby">🥈 {tier}</span>;
  return <span className="tier-badge tier-silver">🥉 {tier}</span>;
}
