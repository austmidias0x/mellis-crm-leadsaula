import { LucideIcon } from 'lucide-react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatsCard({ title, value, icon: Icon, color = 'primary' }: StatsCardProps) {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card-icon">
        <Icon size={24} />
      </div>
      <div className="stats-card-content">
        <p className="stats-card-title">{title}</p>
        <p className="stats-card-value">{value}</p>
      </div>
    </div>
  );
}

