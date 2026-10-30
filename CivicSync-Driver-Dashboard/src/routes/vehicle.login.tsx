import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, ShieldCheck, User, Lock, ArrowRight } from "lucide-react";
import { useVehicleAuthority, API_BASE_URL } from "@/lib/vehicle-authority-store";

export const Route = createFileRoute("/vehicle/login")({
  head: () => ({
    meta: [
      { title: "Vehicle Operator Login | CivicSync" },
      { name: "description", content: "Secure login portal for vehicle operators." },
    ],
  }),
  component: VehicleLoginPage,
});

function VehicleLoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useVehicleAuthority();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const response = await fetch(`${baseUrl}/auth/vehicle/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          identifier: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem("civicsync_vehicle_token", data.access_token);
        localStorage.setItem("civicsync_vehicle_data", JSON.stringify(data.vehicle));
        window.location.href = "/driver/territory";
      } else {
        setError(data.error || "Login failed. Please check credentials.");
      }
    } catch (err: any) {
      console.error("Vehicle login frontend error:", err);
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="driver-login-page">
      <section className="driver-login-brand-panel">
        <div className="driver-login-brand"><span><Truck size={19} /></span><div><strong>CivicSync</strong><small>Municipal operations</small></div></div>
        <div className="driver-login-intro"><span className="driver-login-kicker"><ShieldCheck size={15} /> SECURE DRIVER ACCESS</span><h1>Every route starts with a clear plan.</h1><p>Sign in to review your assigned vehicle, collection territory, and daily route.</p></div>
        <div className="driver-login-footnote">CivicSync · Waste collection operations</div>
      </section>
      <section className="driver-login-form-panel">
        <div className="driver-login-form-wrap">
          <span className="driver-eyebrow">DRIVER PORTAL</span>
          <h2>Sign in</h2>
          <p className="driver-login-description">Use your official driver or vehicle credentials.</p>
          {error && <div className="driver-login-error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="driver-login-form">
            <label htmlFor="username">Email or vehicle registration</label>
            <div className="driver-login-input"><User size={17} /><input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="name@civicsync.gov or MH-15-EX-4021" disabled={loading} /></div>
            <label htmlFor="password">Password</label>
            <div className="driver-login-input"><Lock size={17} /><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" disabled={loading} /></div>
            <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in to driver portal"}<ArrowRight size={16} /></button>
          </form>
          <div className="driver-login-help">Need access or a password reset? Contact your regional system administrator.</div>
        </div>
      </section>
    </main>
  );
}