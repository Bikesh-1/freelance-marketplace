import { cn } from "@/lib/utils" 
export default function Card({ 
    children, className, 
}: { 
    children: React.ReactNode 
    className?: string 
}) { 
    return ( 
    <div className={cn( 
        "rounded-md font-mono border border-white bg-[#0B0B0F] p-6 shadow-lg", 
        className 
    )} 
    > 
    {children} 
    </div> 
    ) 
}