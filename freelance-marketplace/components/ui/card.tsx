import { cn } from "@/lib/utils" 
export default function Card({ 
    children, className, 
}: { 
    children: React.ReactNode 
    className?: string 
}) { 
    return ( 
    <div className={cn( 
        "rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg", 
        className 
    )} 
    > 
    {children} 
    </div> 
    ) 
}