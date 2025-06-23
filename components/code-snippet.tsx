"use client";
import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CopyButton } from "./copy-button";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
const CardSnippet = ({ title, code, children }: { title: string, code: string, children: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    const toggle = () => {
        setShow(!show);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                {title && (
                    <CardTitle className="flex-1 leading-normal"> {title}</CardTitle>
                )}
                {code && (
                    <div className="flex-none ">
                        <Switch id="airplane-mode" onClick={toggle} />

                    </div>
                )}
            </CardHeader>
            <CardContent>
                {children}
                <Collapsible open={show}>
                    <CollapsibleContent className="CollapsibleContent relative" >
                        <div className="absolute end-2 top-2">
                            <CopyButton
                                event="copy_chart_code"
                                name={title}
                                code={code}
                                className="[&_svg]-h-3 h-6 w-6 rounded-[6px] bg-background hover:bg-background hover:text-foreground text-foreground shadow-none  [&_svg]:w-3"

                            /></div>
                        <SyntaxHighlighter
                            language="javascript"
                            className=" rounded-md  text-sm mt-6 "
                            style={atomOneDark}
                            customStyle={{
                                padding: "24px",
                            }}
                        >
                            {`${code}`}
                        </SyntaxHighlighter>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
};

export default CardSnippet;