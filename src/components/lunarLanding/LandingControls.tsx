import React from 'react';

export type LandingControl = 'left' | 'right' | 'stabilize' | 'descend';

interface LandingControlsProps {
  activeControls: ReadonlySet<LandingControl>;
  disabled?: boolean;
  onControlStart: (control: LandingControl, pointerId: number) => void;
  onControlEnd: (pointerId: number) => void;
}

const CONTROLS: { id: LandingControl; label: string; detail: string }[] = [
  { id: 'left', label: 'LEFT', detail: 'Steer Eagle left' },
  { id: 'right', label: 'RIGHT', detail: 'Steer Eagle right' },
  { id: 'stabilize', label: 'STEADY', detail: 'Stop sideways drift' },
  { id: 'descend', label: 'DESCEND', detail: 'Move Eagle down gently' },
];

export const LandingControls: React.FC<LandingControlsProps> = ({
  activeControls,
  disabled = false,
  onControlStart,
  onControlEnd,
}) => (
  <section className="landing-panel landing-controls-panel" aria-label="Landing controls">
    <h3>LANDING CONTROLS</h3>
    <p className="landing-panel-note">Hold a button to guide Eagle. You can also use a mouse or touch screen.</p>
    <div className="landing-controls-grid">
      {CONTROLS.map((control) => (
        <button
          key={control.id}
          type="button"
          className={`landing-control landing-control-${control.id} ${activeControls.has(control.id) ? 'control-active' : ''}`}
          aria-label={`${control.label}: ${control.detail}`}
          aria-pressed={activeControls.has(control.id)}
          disabled={disabled}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            onControlStart(control.id, event.pointerId);
          }}
          onPointerUp={(event) => onControlEnd(event.pointerId)}
          onPointerCancel={(event) => onControlEnd(event.pointerId)}
          onLostPointerCapture={(event) => onControlEnd(event.pointerId)}
        >
          <span>{control.label}</span>
          <small>{control.detail}</small>
        </button>
      ))}
    </div>
    <p className="landing-key-help">
      Keyboard: ← / → steer · ↓ descend · Space steady Eagle
    </p>
  </section>
);
