import { useState } from "react";
import { useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTaxSettings } from "@/hooks/use-tax-settings";
import { useEffect } from "react";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [restaurantName, setRestaurantName] = useState("My Restaurant");
  const [email, setEmail] = useState("contact@restaurant.com");
  const [phone, setPhone] = useState("+91 9876543210");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: taxSettings } = useTaxSettings();
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstNumber, setGstNumber] = useState("");
  const [taxRate, setTaxRate] = useState(18);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [isSavingTax, setIsSavingTax] = useState(false);

  useEffect(() => {
    setGstEnabled(taxSettings.gstEnabled);
    setGstNumber(taxSettings.gstNumber);
    setTaxRate(taxSettings.taxRate);
    setServiceCharge(taxSettings.serviceCharge);
  }, [taxSettings]);

  const handleSaveTaxSettings = async () => {
    setIsSavingTax(true);
    try {
      await apiRequest("POST", "/api/settings/tax", {
        taxRate,
        serviceCharge,
        gstEnabled,
        gstNumber,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/tax"] });
      toast({
        title: "Tax settings saved",
        description: "The new tax configuration will apply to new bills.",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "Could not save tax settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingTax(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <AppHeader title="Settings" showSearch={false} />

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
            <TabsTrigger value="tax" data-testid="tab-tax">Tax & Billing</TabsTrigger>
            <TabsTrigger value="printer" data-testid="tab-printer">Printer</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="bg-card rounded-lg border border-card-border p-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Restaurant Profile</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="restaurant-name">Restaurant Name</Label>
                  <Input
                    id="restaurant-name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    data-testid="input-restaurant-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter restaurant address"
                    data-testid="input-address"
                  />
                </div>
                <Separator className="my-6" />
                <div className="space-y-3">
                  <h4 className="font-medium">Business Hours</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Opening Time</Label>
                      <Input type="time" defaultValue="09:00" data-testid="input-opening-time" />
                    </div>
                    <div>
                      <Label>Closing Time</Label>
                      <Input type="time" defaultValue="22:00" data-testid="input-closing-time" />
                    </div>
                  </div>
                </div>
                <Button className="mt-6" data-testid="button-save-general">Save Changes</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tax">
            <div className="bg-card rounded-lg border border-card-border p-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Tax Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable GST</Label>
                    <p className="text-sm text-muted-foreground">Apply GST to all orders</p>
                  </div>
                  <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} data-testid="switch-gst" />
                </div>
                <div>
                  <Label>GST Number</Label>
                  <Input
                    placeholder="22AAAAA0000A1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    data-testid="input-gst-number"
                  />
                </div>
                <div>
                  <Label>Default Tax Rate (%)</Label>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total GST charged on bills, split evenly into CGST + SGST
                  </p>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    data-testid="input-tax-rate"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    CGST: {(taxRate / 2).toFixed(1)}% + SGST: {(taxRate / 2).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <Label>Service Charge (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                    data-testid="input-service-charge"
                  />
                </div>
                <Button
                  className="mt-6"
                  onClick={handleSaveTaxSettings}
                  disabled={isSavingTax}
                  data-testid="button-save-tax"
                >
                  {isSavingTax ? "Saving..." : "Save Tax Settings"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="printer">
            <div className="bg-card rounded-lg border border-card-border p-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Printer Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>KOT Printer</Label>
                    <p className="text-sm text-muted-foreground">Kitchen Order Ticket printer</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-kot-printer" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bill Printer</Label>
                    <p className="text-sm text-muted-foreground">Customer bill printer</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-bill-printer" />
                </div>
                <div>
                  <Label>Receipt Header</Label>
                  <Input placeholder="Welcome to Restaurant Name" data-testid="input-receipt-header" />
                </div>
                <div>
                  <Label>Receipt Footer</Label>
                  <Input placeholder="Thank you for your visit!" data-testid="input-receipt-footer" />
                </div>
                <Button variant="outline" className="w-full" data-testid="button-test-print">
                  Test Print
                </Button>
                <Button className="mt-6" data-testid="button-save-printer">Save Printer Settings</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-card rounded-lg border border-card-border p-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Order Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified for new orders</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-order-alerts" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when items are low in stock</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-stock-alerts" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates</p>
                  </div>
                  <Switch data-testid="switch-email-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive SMS updates</p>
                  </div>
                  <Switch data-testid="switch-sms-notifications" />
                </div>
                <Button className="mt-6" data-testid="button-save-notifications">Save Notification Settings</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <div className="bg-card rounded-lg border border-card-border p-6 max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">Account</h3>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Logout</p>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}