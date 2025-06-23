"use client";

import React from 'react'


import { useConfig } from "@/hooks/use-config";
import { MenuClassic } from './menu-classic';
import { useMediaQuery } from '@/hooks/use-media-query';

export function Menu() {

    const [config, setConfig] = useConfig()


console.log(config.sidebar);


    return (
        <MenuClassic />
    );
}
