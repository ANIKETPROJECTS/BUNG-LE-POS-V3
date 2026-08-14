import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface KDSOrderItem {
  name: string;
  quantity: number;
  ready: boolean;
}

interface KDSOrderCardProps {
  orderId: string;
  tableNumber: string;
  items: KDSOrderItem[];
  status: "new" | "preparing" | "ready";
  orderTime: Date;
  onStatusChange: (orderId: string, status: "new" | "preparing" | "ready") => void;
}

const statusConfig = {
  new: { color: "bg-danger border-danger", label: "New Order", textColor: "text-danger" },
  preparing: { color: "bg-warning border-warning", label: "Preparing", textColor: "text-warning" },
  ready: { color: "bg-success border-success", label: "Ready", textColor: "text-success" },
};

export default function KDSOrderCard({
  orderId,
  tableNumber,
  items,
  status,
  orderTime,
  onStatusChange,
}: KDSOrderCardProps) {

  return (
    <div
      className={cn(
        "bg-card rounded-lg border-2 overflow-hidden",
        statusConfig[status].color
      )}
      data-testid={`kds-order-${orderId}`}
    >
      <div className={cn("p-3 text-white", statusConfig[status].color)}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">Order #{orderId}</h3>
            <p className="text-sm opacity-90">Table {tableNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-card">
        <div className="space-y-2 mb-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {item.quantity}x
                </Badge>
                <span className={cn("font-medium", item.ready && "line-through text-muted-foreground")}>
                  {item.name}
                </span>
              </div>
              {item.ready && <Check className="h-4 w-4 text-success" />}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {status === "new" && (
            <Button
              className="flex-1"
              onClick={() => onStatusChange(orderId, "preparing")}
              data-testid={`button-start-${orderId}`}
            >
              Start Preparing
            </Button>
          )}
          {status === "preparing" && (
            <Button
              className="flex-1"
              variant="default"
              onClick={() => onStatusChange(orderId, "ready")}
              data-testid={`button-ready-${orderId}`}
            >
              Mark Ready
            </Button>
          )}
          {status === "ready" && (
            <div className="flex-1 text-center py-2 font-semibold text-success">
              ✓ Ready for Pickup
            </div>
          )}
        </div>
      </div>
    </div>
  );
}