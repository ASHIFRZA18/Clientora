import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { customerFormSchema, type CustomerFormValues } from "../schema";
import { useCreateCustomer, useUpdateCustomer } from "../hooks";
import type { Customer } from "../types";

export function CustomerFormDrawer({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  /** When set, the drawer edits this customer instead of creating a new one. */
  customer?: Customer | null;
}) {
  const isEdit = !!customer;
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(customer?.id ?? "");
  const mutation = isEdit ? updateCustomer : createCustomer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { status: "active" },
  });

  useEffect(() => {
    if (open) {
      reset(
        customer
          ? {
              name: customer.name,
              company: customer.company ?? "",
              email: customer.email ?? "",
              phone: customer.phone ?? "",
              status: customer.status,
            }
          : { name: "", company: "", email: "", phone: "", status: "active" }
      );
    }
  }, [open, customer, reset]);

  const onSubmit = (values: CustomerFormValues) => {
    mutation.mutate(values, { onSuccess: onClose });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit customer" : "New customer"}
      subtitle={isEdit ? customer?.name : "Add a company or contact to your book of business"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Input label="Name" {...register("name")} error={errors.name?.message} />
        <Input label="Company" {...register("company")} error={errors.company?.message} />
        <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
        <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
        <div className="space-y-1">
          <label className="block text-[13px] font-medium text-ink">Status</label>
          <Select {...register("status")} className="w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        {mutation.isError && (
          <div className="flex items-start gap-1.5 rounded-md bg-danger/10 px-2.5 py-2 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Something went wrong. Please try again.</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Save changes" : "Create customer"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
