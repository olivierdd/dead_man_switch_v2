import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    type="checkbox"
                    className={cn(
                        "peer h-4 w-4 shrink-0 rounded border border-white/10 bg-white/5 backdrop-blur-md",
                        "focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-0",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "checked:bg-blue-600 checked:border-blue-600",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <Check className="absolute left-0 top-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
