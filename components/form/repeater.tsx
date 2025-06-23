"use client";
import React from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { Link } from '@/i18n/routing';

interface FormValues {
  test: {
    firstName: string;
    lastName: string;
    phone: string;
  }[];
}

const Repeater = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    defaultValues: {
      test: [{ firstName: "Bill", lastName: "Luo", phone: "123456" }],
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => console.log(data);

  console.log(watch("test"));

  const { fields, append, remove } = useFieldArray({
    control,
    name: "test",
  });

  return (
    <div>
      <div className="bg-default-50 -mx-6 px-6 py-6">
        <div className="mb-6 text-default-600 text-xs font-medium uppercase">
          Items info-500
        </div>

        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((item, index) => (
              <div
                className="lg:grid-cols-3 md:grid-cols-2 grid-cols-1 grid gap-5 mb-5 last:mb-0"
                key={item.id}
              >
                <div className="space-y-2">
                  <Label htmlFor={`firstName-${index}`}>First Name</Label>
                  <Input
                    type="text"
                    id={`firstName-${index}`}
                    placeholder="First Name"
                    {...register(`test.${index}.firstName`, { required: true })}
                  />
                  {errors.test?.[index]?.firstName && (
                    <span>This field is required</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                  <Input
                    type="text"
                    id={`lastName-${index}`}
                    placeholder="Last Name"
                    {...register(`test.${index}.lastName`, { required: true })}
                  />
                  {errors.test?.[index]?.lastName && (
                    <span>This field is required</span>
                  )}
                </div>

                <div className="flex justify-between items-end space-x-5">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`phone-${index}`}>Phone</Label>
                    <Input
                      type="text"
                      id={`phone-${index}`}
                      placeholder="Phone"
                      {...register(`test.${index}.phone`, { required: true })}
                    />
                    {errors.test?.[index]?.phone && (
                      <span>This field is required</span>
                    )}
                  </div>
                  {index > 0 && (
                    <div className="flex-none relative">
                      <button
                        onClick={() => remove(index)}
                        type="button"
                        className="inline-flex items-center justify-center h-10 w-10 bg-danger-500 text-lg border rounded border-danger-500 text-white"
                      >
                        <Icon icon="heroicons-outline:trash" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </form>
          <div className="mt-4">
            <Link
              href="#"
              className="text-default-800 p-0 flex gap-2 text-sm font-medium items-center"
              onClick={() => append({ firstName: "", lastName: "", phone: "" })}
            >
              <Icon icon="heroicons-outline:plus" className="w-4 h-4" /> Add New
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Repeater;
