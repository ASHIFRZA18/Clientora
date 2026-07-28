import { Handshake, Target, UserPlus, CheckSquare } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const actions = [
  { label: "New customer", icon: UserPlus },
  { label: "New lead", icon: Target },
  { label: "New deal", icon: Handshake },
  { label: "New task", icon: CheckSquare },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-ink">Quick actions</span>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-2">
        {actions.map(({ label, icon: Icon }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            className="justify-start"
            disabled
            title="Available once Customers/Leads/Deals/Tasks modules ship"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </CardBody>
    </Card>
  );
}
