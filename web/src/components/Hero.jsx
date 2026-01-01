import React from 'react';
import { Smartphone, Wifi, ShieldCheck } from 'lucide-react';

const Hero = () => {
    return (
        <section className="flex-center" style={{ flexDirection: 'column', marginTop: '1rem' }}>
            <div style={{
                position: 'relative',
                width: '180px',
                height: '200px', // Approximating hex aspect ratio
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {/* Hexagon shape using CSS clip-path */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'var(--secondary-blue)',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    boxShadow: '0 10px 20px rgba(0,35,71,0.3)'
                }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <Smartphone size={24} />
                        <Wifi size={24} />
                    </div>
                    {/* Replaced 'Siren' or 'Police' specific icon with Shield as a generic police symbol available in lucide-react if needed, 
              but user asked for 'Police icon'. ShieldCheck fits well. */}
                    <ShieldCheck size={48} />
                    <h2 style={{ marginTop: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>Allo حماية</h2>
                </div>
            </div>
        </section>
    );
};

export default Hero;
