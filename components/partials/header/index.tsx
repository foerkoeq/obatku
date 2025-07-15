'use client'
import React from 'react'
import HeaderContent from './header-content'
import HeaderSearch from './header-search'
import ProfileInfo from './profile-info'
import Notifications from './notifications'
import ThemeSwitcher from './theme-switcher'
import { SidebarToggle } from '@/components/partials/sidebar/sidebar-toggle'
import HorizontalMenu from "./horizontal-menu"
import HeaderLogo from "./header-logo"
import { useMediaQuery } from '@/hooks/use-media-query'

const FoerKoeqHeader = () => {
    const isMobile = useMediaQuery("(max-width: 768px)")
    
    return (
        <>
            <HeaderContent>
                <div className='flex gap-3 items-center'>
                    <HeaderLogo />
                    {!isMobile && <SidebarToggle />}
                    {!isMobile && <HeaderSearch />}
                </div>
                <div className="nav-tools flex items-center md:gap-4 gap-3">
                    <ThemeSwitcher />
                    {!isMobile && <Notifications />}
                    <ProfileInfo />
                </div>
            </HeaderContent>
            <HorizontalMenu />
        </>
    )
}

export default FoerKoeqHeader