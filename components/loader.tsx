
'use client'
import React from "react";
import { Loader2 } from "lucide-react";
import DashCodeLogo from "./dascode-logo";
import { useMounted } from "@/hooks/use-mounted";
const Loader = () => {
    const mounted = useMounted()
    return (
        mounted ? null : <div className=" h-screen flex items-center justify-center flex-col space-y-2">
            <div className="flex gap-2 items-center ">
                <DashCodeLogo className="  text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background" />
                <h1 className="text-xl font-semibold text-default-900 ">
                    DashCode
                </h1>
            </div>
            <span className=" inline-flex gap-1  items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </span>
        </div>
    );
};

export default Loader;

