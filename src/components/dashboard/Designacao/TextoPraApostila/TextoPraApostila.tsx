"use client";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import FormItem from "antd/es/form/FormItem";
import { Textarea } from "@/components/ui/textarea";
 
interface TextoPraApostilaProps {
  form: UseFormReturn<FieldValues>;
  disableFields: boolean;
  className?: string;
  }


export default function TextoPraApostila({ className = "", disableFields = false, form }: Readonly<TextoPraApostilaProps>) {

  return (
      <div className={`w-full ${className}`}>
        <FormField
          {...form.register("texto_para_apostila")}
          control={form.control}
          name="texto_para_apostila"
          render={({ field }) => (
            <FormItem className="mb-0">
              <div className="mb-4 mt-4">
                <FormLabel className="required font-[400]">
                Insira as informações que devem ser levadas em consideração no apostilamento da designação.
                </FormLabel>
              </div>
              <FormControl className="space-y-4">
                <Textarea
                  disabled={disableFields}
                  rows={8}
                  placeholder=""
                  value={field.value}
                  onChange={(e) => {
                    return field.onChange(e.target.value);
                  }}
                  data-testid="input-texto-para-apostila"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>




  )
}