import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { leadFormSchema, leadStatusOptions, type LeadFormValues } from "../schema";
import { useCreateLead } from "../hooks";
import { CustomerPicker } from "@/components/shared/CustomerPicker";

export function LeadFormDrawer({
  open,
  onClose,
  initialCustomerId,
  initialCustomerLabel,
}: {
  open: boolean;
  onClose: () => void;
  /** Pre-fill the customer, e.g. when creating a lead from a customer's detail view. */
  initialCustomerId?: string;
  initialCustomerLabel?: string;
}) {
  const createLead = useCreateLead();
  const [customerLabel, setCustomerLabel] = useState(initialCustomerLabel ?? "");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { customerId: "", source: "", status: "NEW", score: 10 },
  });

  useEffect(() => {
    if (open) {
      reset({
        customerId: initialCustomerId ?? "",
        source: "",
        status: "NEW",
        score: 10,
      });
      setCustomerLabel(initialCustomerLabel ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (values: LeadFormValues) => {
    createLead.mutate(values, { onSuccess: onClose });
  };

  const score = watch("score");

  return (
    <Drawer open={open} onClose={onClose} title="New lead" subtitle="Capture a new opportunity for a customer">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Controller
          control={control}
          name="customerId"
          render={({ field }) => (
            <CustomerPicker
              value={field.value}
              label={customerLabel}
              onChange={(id, label) => {
                field.onChange(id);
                setCustomerLabel(label);
              }}
              error={errors.customerId?.message}
            />
          )}
        />

        <Input label="Source" placeholder="Referral, Website, Cold Call…" {...register("source")} error={errors.source?.message} />

        <div className="space-y-1">
          <label className="block text-[13px] font-medium text-ink">Status</label>
          <Select {...register("status")} className="w-full">
            {leadStatusOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[13px] font-medium text-ink">Score</label>
            <span className="text-xs text-muted tabular-nums">{score}</span>
          </div>
          <input type="range" min={0} max={100} {...register("score", { valueAsNumber: true })} className="w-full accent-primary" />
        </div>

        {createLead.isError && (
          <div className="flex items-start gap-1.5 rounded-md bg-danger/10 px-2.5 py-2 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Something went wrong. Please try again.</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={createLead.isPending}>
            {createLead.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Create lead
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
