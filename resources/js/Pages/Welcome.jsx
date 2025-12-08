import { Link, Head } from '@inertiajs/react';

/**
 * Cinematic, dark landing page — SineAI Hub
 * Applies the new deep-maroon and gold accent design system.
 */
export default function Welcome(props) {
    return (
        <>
            <Head title="Welcome" />

            <div className="relative min-h-screen bg-slate-950 text-white selection:bg-amber-500/30 selection:text-white">
                {/* Atmospheric blurred blobs */}
                <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-red-900/20 rounded-full blur-3xl opacity-30" />
                <div className="pointer-events-none absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-red-900/20 rounded-full blur-3xl opacity-25" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                    <header className="flex items-center justify-between sticky top-6 z-30">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="inline-flex items-baseline gap-1 text-white no-underline">
                                <span className="text-2xl font-semibold tracking-tight">SineAI</span>
                                <span className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-amber-500">Hub</span>
                            </Link>
                        </div>

                        <div className="space-x-3">
                            {props.auth?.user ? (
                                <Link href={route('dashboard')} className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg shadow-red-900/30">Dashboard</Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg shadow-red-900/30">Log in</Link>
                                    <Link href={route('register')} className="inline-flex items-center px-4 py-2 rounded-xl border border-white/20 text-white bg-transparent hover:bg-white/10">Register</Link>
                                </>
                            )}
                        </div>
                    </header>

                    <main className="mt-20">
                        {/* Hero */}
                        <section className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div>
                                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">Create cinematic scripts with AI — welcome to SineAI Hub</h1>
                                <p className="mt-6 text-slate-400 text-lg max-w-xl">A premium AI-first platform built for writers, directors and creatives who want polished, cinematic output. Fast, private, and production-ready.</p>

                                <div className="mt-8 flex items-center gap-4">
                                    <Link href={route('register')} className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg shadow-red-900/30">Get Started</Link>
                                    <Link href={route('ai.assistant')} className="inline-flex items-center px-5 py-3 rounded-xl border border-white/20 text-white bg-transparent hover:bg-white/5">Explore Assistant</Link>
                                </div>

                                <div className="mt-10 flex gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500">★</div>
                                        <div>
                                            <div className="text-white font-semibold">Cinematic Output</div>
                                            <div className="text-slate-400 text-sm">Export scene-ready scripts with structure and tone.</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500">⚡</div>
                                        <div>
                                            <div className="text-white font-semibold">Fast Iteration</div>
                                            <div className="text-slate-400 text-sm">Rapidly refine dialogue, action, and beats.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 p-6">
                                    <h3 className="text-xl font-semibold text-white">Live Preview</h3>
                                    <p className="mt-3 text-slate-400 text-sm">Type or paste a scene and receive structured script suggestions instantly.</p>

                                    <div className="mt-4 bg-gradient-to-br from-red-900/20 to-transparent p-4 rounded-lg">
                                        <pre className="text-sm text-slate-300 leading-relaxed">INT. RED CARPET - NIGHT
    A camera tracks the silhouette of an actor as flashbulbs pop. The crowd murmurs.</pre>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Feature grid */}
                        <section className="mt-20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { title: 'Smart Rewrite', body: 'Polish lines for impact and pacing.' },
                                    { title: 'Scene Composer', body: 'Structure scenes with beats and transitions.' },
                                    { title: 'Character Lab', body: 'Deepen character voice and relationships.' },
                                ].map((f) => (
                                    <div key={f.title} className="p-6 rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/10">
                                        <h4 className="text-lg font-semibold text-white tracking-tight">{f.title}</h4>
                                        <p className="mt-3 text-slate-400 text-sm">{f.body}</p>
                                        <div className="mt-4">
                                            <Link href="#" className="inline-flex items-center px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5">Learn more</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Footer */}
                        <footer className="mt-24">
                            <div className="rounded-lg p-6 bg-slate-900/50 backdrop-blur-md border border-white/10 flex items-center justify-between">
                                <div className="text-slate-400 text-sm">© {new Date().getFullYear()} SineAI Hub — Made for storytellers.</div>
                                <div className="text-slate-400 text-sm">Laravel v{props.laravelVersion} (PHP v{props.phpVersion})</div>
                            </div>
                        </footer>
                    </main>
                </div>
            </div>
        </>
    );
}
