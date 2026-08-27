import type { Lead, CrmSettings } from "@/types/lead";

export function DailyGoal({ leads, settings, onChange }: { leads: Lead[]; settings: CrmSettings; onChange: (value: number) => void }) {
  const completed = leads.filter((lead) => lead.approachedAt?.slice(0, 10) === settings.dailyGoal.date).length;
  const target = settings.dailyGoal.target;
  const progress = Math.min(100, target ? (completed / target) * 100 : 0);
  return <section className="goal-card">
    <div className="section-heading"><div><p className="eyebrow">RITMO DO DIA</p><h2>Meta de hoje</h2></div>
      <label className="goal-input"><input type="number" min="1" max="999" value={target} onChange={(event) => onChange(Number(event.target.value) || 1)} /><span>abordagens</span></label>
    </div>
    <div className="goal-progress"><div style={{ width: `${progress}%` }} /></div>
    <p><strong>{completed}</strong> / {target} concluídas <span>{Math.round(progress)}%</span></p>
  </section>;
}
