import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Zap, Navigation, ArrowRight, PackageCheck, Clock3, Weight, Route as RouteIcon } from "lucide-react";
import { DriverShell } from "@/components/driver/DriverShell";
import { useDriver } from "@/lib/driver-store";
import { BINS, VEHICLE } from "@/lib/driver-data";

export const Route = createFileRoute("/driver/home")({
  head: () => ({
    meta: [
      { title: "Driver Duty Dashboard | CivicSync" },
      {
        name: "description",
        content:
          "Start your shift, check vehicle load and view your assigned waste collection route.",
      },
    ],
  }),
  component: DriverHome,
});

function DriverHome() {
  const { state, setOnDuty, startRoute, collectedCount, nextBinId } = useDriver();
  const navigate = useNavigate();
  const pct = Math.round((state.loadKg / VEHICLE.maxCapacityKg) * 100);

  // Retrieve Driver Session Data
  const storedVehicleData = typeof window !== 'undefined' ? localStorage.getItem('civicsync_vehicle_data') : null;
  const vehicleObj = storedVehicleData ? JSON.parse(storedVehicleData) : null;
  const driverName = vehicleObj?.driver_name || vehicleObj?.driverName || "Driver";
  const licensePlate = vehicleObj?.license_plate || "MH-15-EX-4021";
  const territoryZone = vehicleObj?.territory_name || vehicleObj?.ward || "Zone A - North Nashik";
  const nextBin = BINS.find((bin) => bin.id === nextBinId);
  const remainingStops = BINS.length - collectedCount;

  return (
    <DriverShell title="Driver Operations Center" subtitle={`Active Shift Control • ${territoryZone}`}>
      <div className="driver-dashboard">
        <section className="driver-page-intro">
          <div>
            <div className="driver-eyebrow">DAILY OPERATIONS / {territoryZone}</div>
            <h2>Good shift, {driverName}</h2>
            <p>Review your collection route and vehicle status before heading out.</p>
          </div>
          <div className="driver-actions">
            <button onClick={() => setOnDuty(!state.onDuty)} className={`driver-button ${state.onDuty ? "driver-button-secondary" : "driver-button-primary"}`}>
              <Zap size={16} /> {state.onDuty ? "End shift" : "Start shift"}
            </button>
            <button onClick={() => { startRoute(); navigate({ to: "/driver/territory" as any }); }} className="driver-button driver-button-primary">
              <Navigation size={16} /> Open route map <ArrowRight size={15} />
            </button>
          </div>
        </section>

        <section className="driver-kpi-grid" aria-label="Shift summary">
          <article className="driver-kpi"><span className="driver-kpi-label"><Zap size={15} /> Shift status</span><strong>{state.onDuty ? "On duty" : "Off duty"}</strong><small>{state.onDuty ? "Shift in progress" : "Ready to start"}</small><span className={`driver-kpi-indicator ${state.onDuty ? "is-green" : "is-neutral"}`} /></article>
          <article className="driver-kpi"><span className="driver-kpi-label"><Weight size={15} /> Vehicle load</span><strong>{state.loadKg}<small> kg</small></strong><small>{VEHICLE.maxCapacityKg - state.loadKg} kg remaining · {pct}% capacity</small><div className="driver-progress"><span style={{ width: `${Math.min(pct, 100)}%` }} /></div></article>
          <article className="driver-kpi"><span className="driver-kpi-label"><PackageCheck size={15} /> Stops completed</span><strong>{collectedCount}<small> / {BINS.length}</small></strong><small>{remainingStops} collection {remainingStops === 1 ? "stop" : "stops"} remaining</small></article>
          <article className="driver-kpi"><span className="driver-kpi-label"><RouteIcon size={15} /> Route distance</span><strong>{VEHICLE.routeDistanceKm}<small> km</small></strong><small>{state.routeStarted ? "Route started" : "Route not started"} · {territoryZone}</small></article>
        </section>

        <section className="driver-work-grid">
          <article className="driver-panel route-panel">
            <header className="driver-panel-header"><div><span className="driver-eyebrow">ASSIGNED COLLECTION</span><h3>Route overview</h3></div><button className="driver-text-button" onClick={() => navigate({ to: "/driver/territory" as any })}>View map <ArrowRight size={14} /></button></header>
            <div className="route-summary"><div><span>Vehicle</span><strong>{licensePlate}</strong></div><div><span>Territory</span><strong>{territoryZone}</strong></div><div><span>Stops</span><strong>{collectedCount} of {BINS.length}</strong></div></div>
            <div className="route-progress-line"><span style={{ width: `${BINS.length ? (collectedCount / BINS.length) * 100 : 0}%` }} /></div>
            <div className="route-progress-label"><span>Route completion</span><strong>{BINS.length ? Math.round((collectedCount / BINS.length) * 100) : 0}%</strong></div>
            <div className="next-stop">
              <div className="next-stop-icon"><MapPin size={18} /></div>
              <div className="next-stop-copy"><span>NEXT COLLECTION</span><strong>{nextBin?.address ?? "All assigned stops completed"}</strong><small>{nextBin ? `${nextBin.id} · ${nextBin.area} · ${nextBin.fill}% full` : "No pending collections"}</small></div>
              {nextBin && <button className="driver-icon-button" onClick={() => navigate({ to: "/driver/navigation" as any })} aria-label="Navigate to next collection"><ArrowRight size={17} /></button>}
            </div>
          </article>

          <article className="driver-panel stops-panel">
            <header className="driver-panel-header"><div><span className="driver-eyebrow">TODAY'S WORK</span><h3>Upcoming stops</h3></div><span className="driver-count">{remainingStops} remaining</span></header>
            <div className="stop-list">
              {BINS.filter((bin) => !state.collected[bin.id]).slice(0, 4).map((bin, index) => (
                <div className="stop-row" key={bin.id}>
                  <div className={`stop-index ${index === 0 ? "is-current" : ""}`}>{index === 0 ? <MapPin size={15} /> : index + collectedCount + 1}</div>
                  <div className="stop-details"><strong>{bin.address}</strong><span>{bin.id} · {bin.area}</span></div>
                  <span className={`stop-priority is-${bin.priority}`}>{bin.priority}</span>
                </div>
              ))}
              {remainingStops === 0 && <div className="driver-empty-state"><CheckCircle2 size={20} /> All collection stops are complete.</div>}
            </div>
            <button className="driver-panel-footer" onClick={() => navigate({ to: "/driver/navigation" as any })}><Clock3 size={15} /> Continue to route navigation <ArrowRight size={15} /></button>
          </article>
        </section>

        <section className="driver-shortcuts" aria-label="Driver tools">
          <button onClick={() => navigate({ to: "/driver/territory" as any })}><MapPin size={17} /><span><strong>Territory map</strong><small>View assigned collection area</small></span><ArrowRight size={16} /></button>
          <button onClick={() => navigate({ to: "/driver/navigation" as any })}><RouteIcon size={17} /><span><strong>Route navigation</strong><small>Continue the optimized route</small></span><ArrowRight size={16} /></button>
        </section>
      </div>
    </DriverShell>
  );
}
