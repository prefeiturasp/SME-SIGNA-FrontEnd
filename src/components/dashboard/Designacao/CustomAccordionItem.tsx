import {    
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Card } from "antd";
type ColorVariant = "gold" | "purple" | "green" | "blue";

type CustomAccordionItemProps = {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly value: string;
  readonly color?: ColorVariant;
};
const colorVariants: Record<
  ColorVariant,
  {
    border: string;
    text: string;
    bg: string;
  }
> = {
  gold: {
    border: "border-l-[#EBB466]",
    text: "text-[#E09326]",    
    bg: "bg-[#F9F9F9]",
  },
  purple: {    
    border: "border-l-[#D89DDB]",
    text: "text-[#A936AF]",    
    bg: "bg-[#F9F9F9]",
  },
  green: {
    border: "border-l-green-500",
    text: "text-green-600",
    bg: "bg-[#F9F9F9]",
  },
  blue: {
    border: "border-l-[#6F8CC7]",
    text: "text-[#274D9B]",
    bg: "bg-[#F9F9F9]",
  },
};
export function CustomAccordionItem({
  title,
  children,
  value,
  color = "gold",
}: CustomAccordionItemProps) {
  const variant = colorVariants[color];

  return (
    <AccordionItem value={value} className="border-b-0 mb-5">
      <AccordionTrigger
        className={`mb-0 pr-4 ${variant.bg} rounded-md border-l-4 ${variant.border}`}
      >
        <div className="flex items-center justify-between w-full">
          <span className={`pl-4 text-lg ${variant.text}`}>
            {title}
          </span>
          <span className="mr-2 text-[16px] text-muted-foreground">
            Ver
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="mt-0 m-0">
        <Card
          className={`m-0 border-l-4 ${variant.bg} ${variant.border}`}
        >
          {children}
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
