import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* AUTH */
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

/* DASHBOARD */
import { Dashboard } from "./pages/Dashboard";
import { VacancyDashboard } from "./pages/VacancyDashboard";
import { RevenueDashboard } from "./pages/RevenueDashboard";

/* PROPERTIES */
import { Properties } from "./pages/Properties";
import Buildings from "./pages/Buildings";
import { Units } from "./pages/Units";
import { PropertyDetail } from "./pages/PropertyDetail";
import { UnitDetail } from "./pages/UnitDetail";
import { BedroomSetup } from "./pages/BedroomSetup";
import { RentalModeSwitch } from "./pages/RentalModeSwitch";

/* TENANTS */
import { Tenants } from "./pages/Tenants";
import { InsuranceAlerts } from "./pages/InsuranceAlerts";

/* LEASES */
import { LeaseForm } from "./pages/LeaseForm";
import { LeaseFormBedroom } from "./pages/LeaseFormBedroom";
import { LeaseHistory } from "./pages/LeaseHistory";

/* PAYMENTS */
import { Invoices } from "./pages/Invoices";
import PaymentsReceived from "./pages/PaymentsReceived";
import OutstandingDues from "./pages/OutstandingDues";
import RefundsAdjustments from "./pages/RefundsAdjustments";
import { PaymentForm } from "./pages/PaymentForm";

/* ACCOUNTING */
import { Accounting } from "./pages/Accounting";
import { ChartOfAccounts } from "./pages/ChartOfAccounts";
import { TaxSettings } from "./pages/TaxSettings";
import { QuickBooksSettings } from "./pages/QuickBooksSettings";

/* REPORTS & SETTINGS */
import Reports from "./pages/Reports";
import { Maintenance } from "./pages/Maintenance";
import { Tickets } from "./pages/Tickets";
import Communication from "./pages/Communication"; // Added
import Settings from "./pages/Settings";
import { Owners } from "./pages/Owners";

/* TENANT PORTAL */
import { TenantProtectedRoute } from "./components/TenantProtectedRoute";
import {
  TenantDashboard,
  TenantLease,
  TenantInvoices,
  TenantPayments,
  TenantDocuments,
  TenantInsurance,
  TenantTickets,
  TenantChat // Added
} from "./pages/tenant";

/* OWNER PORTAL */
import { OwnerProtectedRoute } from "./components/OwnerProtectedRoute";
import { OwnerDashboard } from "./pages/owner/OwnerDashboard";
import { OwnerProperties } from "./pages/owner/OwnerProperties";
import { OwnerFinancials } from "./pages/owner/OwnerFinancials";
import { OwnerReports } from "./pages/owner/OwnerReports";
import { OwnerChat } from "./pages/owner/OwnerChat"; // Added

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 ROOT → LOGIN */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 🔐 LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 PROTECTED AREA */}
        <Route element={<ProtectedRoute />}>
          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vacancy" element={<VacancyDashboard />} />
          <Route path="/revenue" element={<RevenueDashboard />} />

          {/* PROPERTIES */}
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/buildings" element={<Buildings />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />

          {/* UNITS */}
          <Route path="/units" element={<Units />} />
          <Route path="/units/:id" element={<UnitDetail />} />
          <Route path="/units/:id/bedrooms" element={<BedroomSetup />} />
          <Route path="/units/:id/switch-mode" element={<RentalModeSwitch />} />

          {/* TENANTS */}
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/tenants/:id" element={<Tenants />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/insurance-alerts" element={<InsuranceAlerts />} />

          {/* LEASES */}
          <Route path="/leases" element={<LeaseHistory />} />
          <Route path="/leases/new" element={<LeaseForm />} />
          <Route path="/leases/new-bedroom" element={<LeaseFormBedroom />} />

          {/* PAYMENTS */}
          <Route path="/payments/invoices" element={<Invoices />} />
          <Route path="/payments/received" element={<PaymentsReceived />} />
          <Route path="/payments/outstanding" element={<OutstandingDues />} />
          <Route path="/payments/refunds" element={<RefundsAdjustments />} />
          <Route path="/payments/new" element={<PaymentForm />} />

          {/* ACCOUNTING */}
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/accounting/chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="/accounting/tax-settings" element={<TaxSettings />} />
          <Route path="/settings/quickbooks" element={<QuickBooksSettings />} />

          {/* REPORTS & SETTINGS */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 🏢 TENANT PORTAL */}
        <Route path="/tenant/login" element={<Navigate to="/login" replace />} />
        <Route element={<TenantProtectedRoute />}>
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          <Route path="/tenant/lease" element={<TenantLease />} />
          <Route path="/tenant/invoices" element={<TenantInvoices />} />
          <Route path="/tenant/payments" element={<TenantPayments />} />
          <Route path="/tenant/documents" element={<TenantDocuments />} />
          <Route path="/tenant/insurance" element={<TenantInsurance />} />
          <Route path="/tenant/tickets" element={<TenantTickets />} />
          <Route path="/tenant/communication" element={<TenantChat />} /> {/* Added */}
        </Route>

        {/* 🗝️ OWNER PORTAL */}
        <Route path="/owner/login" element={<Navigate to="/login" replace />} />
        <Route element={<OwnerProtectedRoute />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/properties" element={<OwnerProperties />} />
          <Route path="/owner/financials" element={<OwnerFinancials />} />
          <Route path="/owner/reports" element={<OwnerReports />} />
          <Route path="/owner/communication" element={<OwnerChat />} /> {/* Added */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
