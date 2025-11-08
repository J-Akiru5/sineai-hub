import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import Hero from '@/Components/Public/Hero';
import AboutUs from '@/Components/Public/AboutUs';
import CoreFeatures from '@/Components/Public/CoreFeatures';
import MeetTheTeam from '@/Components/Public/MeetTheTeam';
import CallToAction from '@/Components/Public/CallToAction';

export default function Index() {
    return (
        <PublicLayout title="SineAI Hub — Home">
            <Hero />
            <AboutUs />
            <CoreFeatures />
            <MeetTheTeam />
            <CallToAction />
        </PublicLayout>
    );
}
