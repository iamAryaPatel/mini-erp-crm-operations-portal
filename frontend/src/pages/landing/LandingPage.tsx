import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Zap, ArrowRight, ShieldCheck, Box, Users, FileText,
  BarChart3, CheckCircle2, Moon, Sun
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-container nav-container">
          <div className="landing-brand">
            <div className="brand-logo"><Zap size={24} /></div>
            <span className="brand-name">Mini ERP</span>
          </div>
          
          <div className="nav-actions">
            <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            ) : (
              <Link to="/login" className="btn btn-primary">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="landing-container hero-container">
            <div className="hero-content">
              <div className="hero-badge">v1.0 Now Available</div>
              <h1 className="hero-title">
                The smart operating system for your <span className="text-gradient">distribution business</span>.
              </h1>
              <p className="hero-subtitle">
                Manage inventory, customers, sales challans, and business analytics in one unified platform built for speed and precision.
              </p>
              <div className="hero-actions">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    Go to Dashboard <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Sign In to Portal <ArrowRight size={18} />
                  </Link>
                )}
                <a href="#features" className="btn btn-secondary btn-lg">Explore Features</a>
              </div>
            </div>
            
            <div className="hero-image-wrapper">
              <div className="hero-image-glow" />
              <div className="hero-image-mockup">
                {/* Simulated dashboard UI for visual effect */}
                <div className="mockup-header">
                  <div className="mockup-dots"><span/><span/><span/></div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-sidebar">
                    <div className="m-line" style={{width: '60%'}}/>
                    <div className="m-line" style={{width: '80%'}}/>
                    <div className="m-line" style={{width: '70%'}}/>
                    <div className="m-line" style={{width: '90%'}}/>
                  </div>
                  <div className="mockup-content">
                    <div className="m-cards">
                      <div className="m-card" />
                      <div className="m-card" />
                      <div className="m-card" />
                      <div className="m-card" />
                    </div>
                    <div className="m-chart" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="landing-container">
            <div className="section-header">
              <h2>Everything you need to run your operations</h2>
              <p>Designed specifically for wholesale and distribution workflows.</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon"><Box size={24} /></div>
                <h3>Inventory Control</h3>
                <p>Track stock levels in real-time, get low-stock alerts, and maintain a complete history of stock movements.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><FileText size={24} /></div>
                <h3>Sales Challans</h3>
                <p>Create draft challans, confirm deliveries, and automatically sync with inventory levels.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><Users size={24} /></div>
                <h3>Customer CRM</h3>
                <p>Manage retail and wholesale clients, track leads, and log follow-up notes in a centralized database.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><ShieldCheck size={24} /></div>
                <h3>Role-Based Access</h3>
                <p>Secure operations with dedicated roles for Admin, Sales, Warehouse, and Accounts teams.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon"><BarChart3 size={24} /></div>
                <h3>Business Analytics</h3>
                <p>Get instant insights into operations with the centralized operations dashboard.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon"><CheckCircle2 size={24} /></div>
                <h3>High Performance</h3>
                <p>Built on modern tech stack ensuring lightning-fast searches, filtering, and data pagination.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo"><Zap size={20} /></div>
              <span className="brand-name">Mini ERP</span>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} Mini ERP Systems. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
