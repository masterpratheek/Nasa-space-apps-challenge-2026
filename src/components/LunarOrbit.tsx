import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

export const LunarOrbit: React.FC<Props> = ({ onComplete }) => {
  const [isInserted, setIsInserted] = useState(false);

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="stage-header">
        <h2 className="stage-title">STAGE 9: ENTER LUNAR ORBIT</h2>
        <p className="stage-subtitle">July 19, 1969 · 13:21 EDT · Apollo 11's service module engine fires behind the Moon to slow down and enter orbit. Eagle is still joined to Columbia.</p>
      </div>

      <div className="card-glass" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, #E2E8F0 60%, #94A3B8)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontFamily: 'Orbitron', fontWeight: 'bold', boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)' }}>MOON</div>
            {!isInserted ? (
              <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                <p>Apollo 11 is nearing the Moon</p>
                <p style={{ fontSize: '0.9rem' }}>Start the engine burn to enter lunar orbit.</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#10B981' }}>
                <p style={{ fontFamily: 'Orbitron', fontSize: '1.2rem' }}>APOLLO 11 IS IN LUNAR ORBIT!</p>
                <p style={{ fontSize: '0.9rem' }}>Apollo 11 now circles the Moon about 60 miles above it.</p>
              </div>
            )}
          </div>

          <div className="card-glass" style={{ height: '350px', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: '#94A3B8', marginBottom: '1rem' }}>WHY ENTER LUNAR ORBIT?</h3>
            <ul style={{ paddingLeft: '1.2rem', marginBottom: '1.5rem', color: '#CBD5E1', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Entering orbit:</strong> Apollo 11 had to slow down so the Moon's gravity could hold it in orbit instead of letting it fly past.</li>
              <li><strong>Engine burn:</strong> The engine pushed backward, against the direction of travel, to slow the spacecraft.</li>
              <li><strong>Coasting:</strong> After TLI (Translunar Injection), Apollo 11 traveled for 3 days before LOI (Lunar Orbit Insertion).</li>
              <li><strong>Finding a landing site:</strong> From orbit, Collins could look for a place for Eagle to land.</li>
            </ul>

            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
              <h4 style={{ fontFamily: 'Orbitron', color: '#F59E0B', marginBottom: '0.3rem' }}>APOLLO 11 FACT:</h4>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>After the 3-day trip, the service module engine fired for about 4 minutes to slow Apollo 11 into a steady orbit around the Moon.</p>
            </div>

            {!isInserted && (
              <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} onClick={() => setIsInserted(true)}>🔥 START LUNAR ORBIT INSERTION (LOI)</button>
            )}
            {isInserted && (
              <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} onClick={onComplete}>NEXT: LAND ON THE MOON ➔</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};