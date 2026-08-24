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
        "rounded-full px-5 py-2 text-sm tracking-wide font-medium", 
        variant === "default" && "bg-red-500 hover:bg-red-700 text-white", 
        variant === "outline" && "border border-slate-700 hover:border-red-500 text-black", 
        className )} 
        {...props} 
        /> 
    ) 
}