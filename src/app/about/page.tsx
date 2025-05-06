'use client';

import { About } from "@/components/common/About";



export default function Page() {

    return (
        <div className="flex justify-center px-4 py-8">
            <div className="w-full max-w-prose space-y-8">
                <About />
            </div>
        </div >
    );
}
