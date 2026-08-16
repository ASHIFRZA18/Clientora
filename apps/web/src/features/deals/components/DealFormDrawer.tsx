import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CustomerPicker } from "@/components/shared/CustomerPicker";
import { dealFormSchema, type DealFormValues } from "../schema";
import { useCreateDeal } from "../hooks";

export function DealFormDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createDeal = useCreateDeal();
  const [customerLabel, setCustomerLabel] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: { title: "", customerId: "", value: 0, currency: "USD", expectedCloseDate: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ title: "", customerId: "", value: 0, currency: "USD", expectedCloseDate: "" });
      setCustomerLabel("");
    }
  }, [open, reset]);

  const onSubmit = (values: DealFormValues) => {
    createDeal.mutate(values, { onSuccess: onClose });
  };

  return (
    <Drawer open={open} onClose={onClose} title="New deal" subtitle="Starts in the New Lead column">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Input label="Deal title" {...register("title")} error={errors.title?.message} />

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

        <Input
          label="Deal value (USD)"
          type="number"
          min={0}
          step="0.01"
          {...register("value")}
          error={errors.value?.message}
        />

        <Input
          label="Expected close date"
          type="date"
          {...register("expectedCloseDate")}
          error={errors.expectedCloseDate?.message}
        />

        {createDeal.isError && (
          <div className="flex items-start gap-1.5 rounded-md bg-danger/10 px-2.5 py-2 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Something went wrong. Please try again.</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={createDeal.isPending}>
            {createDeal.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Create deal
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
