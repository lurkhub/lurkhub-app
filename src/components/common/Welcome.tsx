'use client';

import { Anchor } from 'react-feather';
import { About } from './About';
import { Login } from './Login';

export default function Welcome() {
    return (
        <div className="flex justify-center px-4 py-8">
            <div className="w-full max-w-prose space-y-8">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-2">
                        <Anchor size={48} className="text-blue-800" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-center text-blue-800">
                        LurkHub
                    </h1>

                    <p className="text-gray-600 text-sm sm:text-base">
                        Stores <em>bookmarks</em>, <em>articles</em>, <em>feeds</em> and <em>posts</em> in your GitHub account
                    </p>
                    <Login />
                </div>

                <About />
            </div>
        </div>
    );
}
