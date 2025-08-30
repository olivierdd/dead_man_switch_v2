import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    icon?: React.ReactNode
    error?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, icon, error, children, ...props }, ref) => {
        return (
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10">
                        {icon}
                    </div>
                )}
                <select
                    className={cn(
                        "flex h-10 w-full rounded-md border bg-white/5 backdrop-blur-md px-3 py-2 text-sm text-white transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "appearance-none cursor-pointer",
                        icon && "pl-10",
                        error
                            ? "border-red-500 focus:ring-red-500"
                            : "border-white/10 focus:border-transparent",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }
