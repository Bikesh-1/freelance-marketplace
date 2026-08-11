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
        "px-2 py-1 rounded-md font-light font-mono transition-all duration-200 text-md cursor-pointer", 
        variant === "default" && "bg-red-500 hover:bg-red-700 text-white", 
        variant === "outline" && "border border-slate-700 hover:border-red-500 text-white", 
        className )} 
        {...props} 
        /> 
    ) 
}