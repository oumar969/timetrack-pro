import { useBackend } from '../context/BackendContext';

const styles = {
  banner: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
    background: '#d97706', color: '#fff',
    padding: '12px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    fontSize: '1rem', fontWeight: 800, fontFamily: 'Nunito, sans-serif',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  },
  icon: { fontSize: '1.2rem' },
};

export default function OfflineBanner() {
  const online = useBackend();
  if (online) return null;

  return (
    <div style={styles.banner}>
      <span style={styles.icon}>⚠️</span>
      Demo-tilstand — ingen forbindelse til serveren. Log ind og tidsregistrering virker ikke.
    </div>
  );
}
