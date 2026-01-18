import { forwardRef, type HTMLAttributes } from 'react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'
import { cn } from '@lib/utils'
import { MarkdownRenderer } from '@components/ui/markdown-renderer'

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
      <Accordion type="single" collapsible className="space-y-3">
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent className="bg-card">
              <MarkdownRenderer content={item.answer} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
})
FAQ.displayName = 'FAQ'

export { FAQ }
export type { FAQProps, FAQItem }
