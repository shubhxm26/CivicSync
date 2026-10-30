import { Link } from "@tanstack/react-router";
import {
  Home, Map, User, QrCode, FileText, Navigation, Truck,
  LogOut, Maximize2, Minimize2, Menu, X, CheckCircle2, ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";

const NAV = [
  { to: "/driver/home", label: "Dashboard", icon: Home, badge: "Live" },
  { to: "/driver/territory", label: "My Territory Map", icon: Map, badge: "GPS" },
  { to: "/driver/navigation", label: "Route Navigation", icon: Navigation, badge: "Optimized" },
  { to: "/driver/live-reports", label: "Incident Reports", icon: FileText },
  { to: "/driver/qr-generator", label: "QR Code Pass", icon: QrCode },
  { to: "/driver/profile", label: "Driver Profile", icon: User },
] as const;

export function DriverShell({
  title,
  subtitle,
  children,
  nextBinId,
  flush,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  nextBinId?: string | null;
  flush?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  // Retrieve Driver Session Data
  const storedVehicleData = typeof window !== 'undefined' ? localStorage.getItem('civicsync_vehicle_data') : null;
  const vehicleObj = storedVehicleData ? JSON.parse(storedVehicleData) : null;
  const driverName = vehicleObj?.driver_name || vehicleObj?.driverName || "Driver";
  const licensePlate = vehicleObj?.license_plate || "MH-15-EX-4021";
  const territoryZone = vehicleObj?.territory_name || vehicleObj?.ward || "Zone A - North Nashik";

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Fullscreen request failed: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('civicsync_vehicle_token');
      localStorage.removeItem('civicsync_vehicle_data');
      window.location.href = '/vehicle/login';
    }
  };

  return (
    <div ref={shellRef} className="driver-shell">
      {mobileNavOpen && <button className="driver-backdrop" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
      <aside className={`driver-sidebar ${mobileNavOpen ? "is-open" : ""} ${sidebarOpen ? "" : "is-collapsed"}`}>
        <div className="driver-brand">
          <div className="driver-brand-mark"><Truck size={19} /></div>
          <div className="driver-brand-copy">
            <strong>CivicSync</strong>
            <span>Driver operations</span>
          </div>
          <button className="driver-collapse" onClick={() => setSidebarOpen(!sidebarOpen)} title={sidebarOpen ? "Collapse navigation" : "Expand navigation"} aria-label={sidebarOpen ? "Collapse navigation" : "Expand navigation"}>
            <ChevronRight size={16} />
          </button>
          <button className="driver-mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="driver-identity">
          <div className="driver-avatar">{driverName.charAt(0).toUpperCase()}</div>
          <div className="driver-identity-copy">
            <strong>{driverName}</strong>
            <span>{licensePlate}</span>
            <small>{territoryZone}</small>
          </div>
        </div>

        <div className="driver-nav-label">WORKSPACE</div>
        <nav className="driver-nav" aria-label="Driver workspace">
          {NAV.map(({ to, label, icon: Icon }) => {
            const targetTo = to === "/driver/collect/$binId" ? "/driver/territory" : to;
            return (
              <Link
                key={to}
                to={targetTo}
                activeProps={{ className: "is-active" }}
                className="driver-nav-link"
                title={!sidebarOpen ? label : undefined}
                onClick={() => setMobileNavOpen(false)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="driver-sidebar-footer">
          <div className="driver-duty-indicator"><span />Shift status is managed from dashboard</div>
          <button onClick={handleLogout} className="driver-signout"><LogOut size={16} /><span>Sign out</span></button>
        </div>
      </aside>

      <div className="driver-main">
        <header className="driver-topbar">
          <div className="driver-heading-group">
            <button className="driver-menu-button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}><Menu size={19} /></button>
            <div>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <div className="driver-topbar-actions">
            <span className="driver-live-status"><CheckCircle2 size={14} /> System connected</span>
            <button onClick={toggleFullscreen} className="driver-icon-button" title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          </div>
        </header>
        <main className={`driver-content ${flush ? "is-flush" : ""}`}>{children}</main>
      </div>
    </div>
  );
}
