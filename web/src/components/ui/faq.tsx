import { forwardRef, type HTMLAttributes } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps extends HTMLAttributes<HTMLDivElement> {
  items: FAQItem[]
  title?: string
}

const FAQ = forwardRef<HTMLDivElement, FAQProps>(({ className, items, title, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('', className)} {...props}>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <AccordionPrimitive.Root type="single" collapsible className="space-y-3">
        {items.map((item, index) => (
          <AccordionPrimitive.Item
            key={index}
            value={`item-${index}`}
            className="bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between p-4 font-bold text-left transition-all hover:bg-secondary/50 [&[data-state=open]>svg]:rotate-180">
                {item.question}
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="p-4 pt-0 text-muted-foreground border-t-2 border-foreground/20">
                {item.answer}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </div>
  )
})
FAQ.displayName = 'FAQ'

export { FAQ }
export type { FAQProps, FAQItem }
