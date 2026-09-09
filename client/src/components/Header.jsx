import './Header.css';

export function Header({ onNewRental }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-mark">B</span>
          <div className="brand-text">
            <span className="brand-name">
              BARTLING <span className="brand-accent">PERFORMANCE</span>
            </span>
            <span className="brand-sub">Sportwagenvermietung</span>
          </div>
        </div>
        <button className="btn btn-primary header-cta" onClick={onNewRental}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Neue Vermietung
        </button>
      </div>
    </header>
  );
}
