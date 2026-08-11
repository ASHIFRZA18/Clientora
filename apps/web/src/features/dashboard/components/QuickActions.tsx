import { Handshake, Target, UserPlus, CheckSquare } from "lucide-react";
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

  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-ink">Quick actions</span>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-2">
        {actions.map(({ label, icon: Icon, onClick, disabled }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            className="justify-start"
            disabled={disabled}
            onClick={onClick}
            title={disabled ? "Available once that module ships" : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </CardBody>
    </Card>
  );
}
