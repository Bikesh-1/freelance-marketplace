import { ButtonHTMLAttributes } from "react" 
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { 
    variant?: "default" | "outline" 
}

export default function Button({ 
    variant = "default", 
    className, 
    ...props 
}: ButtonProps) {
     return ( 
     <button className={cn( 
        "px-4 py-2 rounded-xl font-medium transition-all duration-200", 
        variant === "default" && "bg-violet-600 hover:bg-violet-700 text-white", 
        variant === "outline" && "border border-slate-700 hover:border-violet-500 text-white", 
        className )} 
        {...props} 
        /> 
    ) 
}