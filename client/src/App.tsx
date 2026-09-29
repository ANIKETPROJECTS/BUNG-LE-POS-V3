import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useWebSocket } from "@/hooks/use-websocket";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect } from "react";
import LoginPage from "@/pages/login";

const NotFound = lazy(() => import("@/pages/not-found"));
const DbErrorPage = lazy(() => import("@/pages/db-error"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const BillingPage = lazy(() => import("@/pages/billing"));
const TablesPage = lazy(() => import("@/pages/tables"));
const TableManagementPage = lazy(() => import("@/pages/table-management"));
const KitchenPage = lazy(() => import("@/pages/kitchen"));
const MenuPage = lazy(() => import("@/pages/menu"));
const ReportsPage = lazy(() => import("@/pages/reports"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const DeliveryPage = lazy(() => import("@/pages/delivery"));
const OnlineOrdersPage = lazy(() => import("@/pages/online-orders"));
const CustomersPage = lazy(() => import("@/pages/customers"));
const LoyaltyPage = lazy(() => import("@/pages/loyalty"));
const InventoryPage = lazy(() => import("@/pages/inventory"));
const InventoryHistoryPage = lazy(() => import("@/pages/inventory-history"));
const PurchaseOrdersPage = lazy(() => import("@/pages/purchase-orders"));
const SuppliersPage = lazy(() => import("@/pages/suppliers"));
const StaffPage = lazy(() => import("@/pages/staff"));
const AttendancePage = lazy(() => import("@/pages/attendance"));
const ReservationsPage = lazy(() => import("@/pages/reservations"));
const ExpensesPage = lazy(() => import("@/pages/expenses"));
const PaymentSettlementPage = lazy(() => import("@/pages/payment-settlement"));
const AccountingPage = lazy(() => import("@/pages/accounting"));
const TaxReportsPage = lazy(() => import("@/pages/tax-reports"));
const InvoicesPage = lazy(() => import("@/pages/invoices"));
const DayEndSettlementPage = lazy(() => import("@/pages/day-end-settlement"));
const OffersPage = lazy(() => import("@/pages/offers"));
const CouponsPage = lazy(() => import("@/pages/coupons"));
const FeedbackPage = lazy(() => import("@/pages/feedback"));
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const SalesDetailedPage = lazy(() => import("@/pages/sales-detailed"));
const ItemPerformancePage = lazy(() => import("@/pages/item-performance"));
const KitchenPerformancePage = lazy(() => import("@/pages/kitchen-performance"));
const WastagePage = lazy(() => import("@/pages/wastage"));
const MultiLocationPage = lazy(() => import("@/pages/multi-location"));
const UserRolesPage = lazy(() => import("@/pages/user-roles"));
const AuditLogsPage = lazy(() => import("@/pages/audit-logs"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const BackupPage = lazy(() => import("@/pages/backup"));
const QRCodesPage = lazy(() => import("@/pages/qr-codes"));
const WaitingListPage = lazy(() => import("@/pages/waiting-list"));
const EventsPage = lazy(() => import("@/pages/events"));
const GiftCardsPage = lazy(() => import("@/pages/gift-cards"));
const CommissionPage = lazy(() => import("@/pages/commission"));
const PrinterConfigPage = lazy(() => import("@/pages/printer-config"));
const EmailTemplatesPage = lazy(() => import("@/pages/email-templates"));
const MarketingPage = lazy(() => import("@/pages/marketing"));
const IntegrationsPage = lazy(() => import("@/pages/integrations"));
const DatabasePage = lazy(() => import("@/pages/database"));
const DigitalMenuOrdersPage = lazy(() => import("@/pages/digital-menu-orders"));
const KOTPage = lazy(() => import("@/pages/kot"));
import PrintWorker from "@/components/print-worker";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location !== "/login" && location !== "/db-error") {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/db-error" component={DbErrorPage} />
        <Route path="/">{() => <ProtectedRoute component={DashboardPage} />}</Route>
        <Route path="/billing">{() => <ProtectedRoute component={BillingPage} />}</Route>
        <Route path="/tables">{() => <ProtectedRoute component={TablesPage} />}</Route>
        <Route path="/table-management">{() => <ProtectedRoute component={TableManagementPage} />}</Route>
        <Route path="/kitchen">{() => <ProtectedRoute component={KitchenPage} />}</Route>
        <Route path="/menu">{() => <ProtectedRoute component={MenuPage} />}</Route>
        <Route path="/reports">{() => <ProtectedRoute component={ReportsPage} />}</Route>
        <Route path="/settings">{() => <ProtectedRoute component={SettingsPage} />}</Route>
        <Route path="/delivery">{() => <ProtectedRoute component={DeliveryPage} />}</Route>
        <Route path="/online-orders">{() => <ProtectedRoute component={OnlineOrdersPage} />}</Route>
        <Route path="/customers">{() => <ProtectedRoute component={CustomersPage} />}</Route>
        <Route path="/loyalty">{() => <ProtectedRoute component={LoyaltyPage} />}</Route>
        <Route path="/inventory">{() => <ProtectedRoute component={InventoryPage} />}</Route>
        <Route path="/inventory-history">{() => <ProtectedRoute component={InventoryHistoryPage} />}</Route>
        <Route path="/purchase-orders">{() => <ProtectedRoute component={PurchaseOrdersPage} />}</Route>
        <Route path="/suppliers">{() => <ProtectedRoute component={SuppliersPage} />}</Route>
        <Route path="/staff">{() => <ProtectedRoute component={StaffPage} />}</Route>
        <Route path="/attendance">{() => <ProtectedRoute component={AttendancePage} />}</Route>
        <Route path="/reservations">{() => <ProtectedRoute component={ReservationsPage} />}</Route>
        <Route path="/expenses">{() => <ProtectedRoute component={ExpensesPage} />}</Route>
        <Route path="/payment-settlement">{() => <ProtectedRoute component={PaymentSettlementPage} />}</Route>
        <Route path="/accounting">{() => <ProtectedRoute component={AccountingPage} />}</Route>
        <Route path="/tax-reports">{() => <ProtectedRoute component={TaxReportsPage} />}</Route>
        <Route path="/invoices">{() => <ProtectedRoute component={InvoicesPage} />}</Route>
        <Route path="/day-end-settlement">{() => <ProtectedRoute component={DayEndSettlementPage} />}</Route>
        <Route path="/offers">{() => <ProtectedRoute component={OffersPage} />}</Route>
        <Route path="/coupons">{() => <ProtectedRoute component={CouponsPage} />}</Route>
        <Route path="/feedback">{() => <ProtectedRoute component={FeedbackPage} />}</Route>
        <Route path="/analytics">{() => <ProtectedRoute component={AnalyticsPage} />}</Route>
        <Route path="/sales-detailed">{() => <ProtectedRoute component={SalesDetailedPage} />}</Route>
        <Route path="/item-performance">{() => <ProtectedRoute component={ItemPerformancePage} />}</Route>
        <Route path="/kitchen-performance">{() => <ProtectedRoute component={KitchenPerformancePage} />}</Route>
        <Route path="/wastage">{() => <ProtectedRoute component={WastagePage} />}</Route>
        <Route path="/multi-location">{() => <ProtectedRoute component={MultiLocationPage} />}</Route>
        <Route path="/user-roles">{() => <ProtectedRoute component={UserRolesPage} />}</Route>
        <Route path="/audit-logs">{() => <ProtectedRoute component={AuditLogsPage} />}</Route>
        <Route path="/notifications">{() => <ProtectedRoute component={NotificationsPage} />}</Route>
        <Route path="/profile">{() => <ProtectedRoute component={ProfilePage} />}</Route>
        <Route path="/backup">{() => <ProtectedRoute component={BackupPage} />}</Route>
        <Route path="/qr-codes">{() => <ProtectedRoute component={QRCodesPage} />}</Route>
        <Route path="/waiting-list">{() => <ProtectedRoute component={WaitingListPage} />}</Route>
        <Route path="/events">{() => <ProtectedRoute component={EventsPage} />}</Route>
        <Route path="/gift-cards">{() => <ProtectedRoute component={GiftCardsPage} />}</Route>
        <Route path="/commission">{() => <ProtectedRoute component={CommissionPage} />}</Route>
        <Route path="/printer-config">{() => <ProtectedRoute component={PrinterConfigPage} />}</Route>
        <Route path="/email-templates">{() => <ProtectedRoute component={EmailTemplatesPage} />}</Route>
        <Route path="/marketing">{() => <ProtectedRoute component={MarketingPage} />}</Route>
        <Route path="/integrations">{() => <ProtectedRoute component={IntegrationsPage} />}</Route>
        <Route path="/database">{() => <ProtectedRoute component={DatabasePage} />}</Route>
        <Route path="/digital-menu-orders">{() => <ProtectedRoute component={DigitalMenuOrdersPage} />}</Route>
        <Route path="/kot">{() => <ProtectedRoute component={KOTPage} />}</Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  const isPublicRoute = location === "/login" || location === "/db-error";
  
  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isPublicRoute || !isAuthenticated) {
    return <>{children}</>;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties} defaultOpen={false}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-hidden flex flex-col w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  useWebSocket();
  
  return (
    <AuthenticatedLayout>
      <PrintWorker />
      <Router />
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
