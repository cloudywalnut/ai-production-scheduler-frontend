'use client'

import Image from "next/image";
import { useRouter } from 'next/navigation';

interface ProjectHomeProps {
    selectedProjectId: number;
}

export function ProjectHome({selectedProjectId}: ProjectHomeProps){

    const router = useRouter();

    function goToScripts() {
        router.push(`/home?projectId=${selectedProjectId}`);
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-4">
            <div
                className="group border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all duration-200 bg-white"
                onClick={goToScripts}
            >
                {/* Thumbnail */}
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    <Image
                        src="/schedule.png"
                        alt="Script Scheduler"
                        width={360}
                        height={192}
                        priority
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Content */}
                <div className="p-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Tool</p>
                    <h2 className="text-base font-bold text-gray-900 mt-0.5">Script Scheduler</h2>
                    <p className="text-sm text-gray-600 mt-1">Plan and schedule your film scripts.</p>
                </div>

            </div>
        </div>
    )
}