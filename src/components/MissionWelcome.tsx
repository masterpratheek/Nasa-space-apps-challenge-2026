import React from 'react';
import { HISTORICAL_CREW } from '../data/missionData';

interface MissionWelcomeProps {
  onStart: () => void;
}

export const MissionWelcome: React.FC<MissionWelcomeProps> = ({ onStart }) => {
  return (
    <div className="welcome-container" style={{ textAlign: 'center' }}>
      <div className="card-glass" style={{ padding: '3rem 2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: '2.5rem', color: '#60A5FA', marginBottom: '1rem', letterSpacing: '2px' }}>
          HELLO, ASTRONAUT!
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 1.5rem', color: '#E2E8F0' }}>
          On July 16, 1969, three astronauts began Luna 11—the first mission to land people on the Moon.
        </p>

        <div style={{ background: 'rgba(37, 99, 235, 0.15)', border: '1px solid #3B82F6', borderRadius: '8px', padding: '1.2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
          <h3 style={{ fontFamily: 'Orbitron', color: '#F59E0B', marginBottom: '0.5rem' }}>YOUR ROLE: JUNIOR MISSION CONTROLLER</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
            You’re at Mission Control in Houston. Check the rocket, start the countdown, guide Luna 11 on its journey, and help Eagle land on the Moon!
          </p>
        </div>

        <aside className="mission-history-note" aria-label="Historical mission context">
          <strong>THE REAL MISSION BEHIND THE GAME</strong>
          <p>
            NASA’s Apollo 11 launched on July 16, 1969. Columbia and Eagle traveled to the Moon, and Eagle landed at the Sea of Tranquility on July 20.
            This game retells parts of that real mission as a simplified Luna 11 adventure; its choices and results are simulated.
          </p>
          <a href="https://www.nasa.gov/missions/apollo/apollo-11/apollo-11-mission-overview/" target="_blank" rel="noopener noreferrer">
            NASA’s Apollo 11 Mission Overview
          </a>
        </aside>

        <button className="btn-primary" onClick={onStart} style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}>
          🚀 GET READY FOR LAUNCH
        </button>
      </div>

      <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', marginBottom: '1.5rem', color: '#94A3B8' }}>
        MEET THE LUNA 11 CREW
      </h2>

      <div className="grid-3" data-mentor-focus="crew">
        {HISTORICAL_CREW.map((member) => (
          <div 
            key={member.name} 
            className="card-glass" 
            style={{ 
              textAlign: 'left', 
              borderTop: `4px solid ${member.imageColor}`,
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                background: member.imageColor, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontFamily: 'Orbitron',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                {member.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem' }}>{member.name}</h3>
                <span style={{ color: member.imageColor, fontWeight: 'bold', fontSize: '0.85rem' }}>{member.role}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginBottom: '1rem', minHeight: '60px' }}>
              {member.description}
            </p>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase', fontFamily: 'Orbitron' }}>
                DID YOU KNOW?
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#94A3B8' }}>
                {member.facts.map((fact, idx) => (
                  <li key={idx} style={{ marginBottom: '0.3rem' }}>{fact}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};