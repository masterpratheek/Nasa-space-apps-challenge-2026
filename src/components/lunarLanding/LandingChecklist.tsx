import React from 'react';

export interface LandingChecklistItem {
  id: string;
  label: string;
  complete: boolean;
}

interface LandingChecklistProps {
  items: LandingChecklistItem[];
}

export const LandingChecklist: React.FC<LandingChecklistProps> = ({ items }) => (
  <section className="landing-panel landing-checklist" aria-label="Landing safety checklist">
    <h3>LANDING CHECKLIST</h3>
    <p className="landing-panel-note">Game safety checks—not the real Luna checklist.</p>
    <ol>
      {items.map((item, index) => (
        <li key={item.id} className={item.complete ? 'check-complete' : ''}>
          <span className="landing-check-number" aria-hidden="true">
            {item.complete ? '✓' : index + 1}
          </span>
          <span>{item.label}</span>
          <span className="landing-check-status">{item.complete ? 'READY' : 'NOT YET'}</span>
        </li>
      ))}
    </ol>
    <p className="landing-checklist-footnote">
      Astronauts follow careful steps and checks to make each landing safer.
    </p>
  </section>
);
