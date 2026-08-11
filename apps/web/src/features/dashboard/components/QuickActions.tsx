import { Handshake, Target, UserPlus, CheckSquare } from "lucide-react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: "New customer", icon: UserPlus, onClick: () => navigate("/customers?new=1") },
    { label: "New lead", icon: Target, onClick: () => navigate("/leads?new=1") },
    { label: "New deal", icon: Handshake, disabled: true },
    { label: "New task", icon: CheckSquare, disabled: true },
  ];

=======
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const actions = [
  { label: "New customer", icon: UserPlus },
  { label: "New lead", icon: Target },
  { label: "New deal", icon: Handshake },
  { label: "New task", icon: CheckSquare },
];

export function QuickActions() {
>>>>>>> 3584043af0c48b61060f01fbc6bdfa6d9fc4cb46
  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-ink">Quick actions</span>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-2">
<<<<<<< HEAD
        {actions.map(({ label, icon: Icon, onClick, disabled }) => (
=======
        {actions.map(({ label, icon: Icon }) => (
>>>>>>> 3584043af0c48b61060f01fbc6bdfa6d9fc4cb46
          <Button
            key={label}
            variant="outline"
            size="sm"
            className="justify-start"
<<<<<<< HEAD
            disabled={disabled}
            onClick={onClick}
            title={disabled ? "Available once that module ships" : undefined}
=======
            disabled
            title="Available once Customers/Leads/Deals/Tasks modules ship"
>>>>>>> 3584043af0c48b61060f01fbc6bdfa6d9fc4cb46
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </CardBody>
    </Card>
  );
}
